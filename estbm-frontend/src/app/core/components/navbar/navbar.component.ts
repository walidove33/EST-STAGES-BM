import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled">
      <div class="navbar-container">
        <!-- Brand Section -->
        <div class="navbar-brand">
          <button 
            class="sidebar-toggle"
            (click)="onSidebarToggle()"
            [attr.aria-label]="sidebarOpen ? 'Fermer la navigation' : 'Ouvrir la navigation'">
            <span class="hamburger-line" [class.active]="sidebarOpen"></span>
            <span class="hamburger-line" [class.active]="sidebarOpen"></span>
            <span class="hamburger-line" [class.active]="sidebarOpen"></span>
          </button>

          <a routerLink="/" class="brand-link">
            <div class="brand-logo">
              <img src="/assets/logo.png" alt="EST Béni Mellal" class="logo-img" />
              <div class="logo-fallback">
                <i class="bi bi-mortarboard-fill"></i>
              </div>
            </div>
            <div class="brand-text">
              <h1>EST Béni Mellal</h1>
              <span>Gestion des Stages</span>
            </div>
          </a>
        </div>

        <!-- Quick Actions -->
        <div class="navbar-actions">
          <div class="quick-search" *ngIf="currentUser">
            <button class="search-trigger" (click)="openQuickSearch()">
              <i class="bi bi-search"></i>
              <span>Rechercher...</span>
              <kbd>Ctrl+K</kbd>
            </button>
          </div>

          <!-- Notifications -->
          <div class="notification-center" *ngIf="currentUser">
            <button 
              class="notification-trigger"
              (click)="toggleNotifications()"
              [class.has-notifications]="hasUnreadNotifications">
              <i class="bi bi-bell"></i>
              <span class="notification-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
            </button>
          </div>
        </div>

        <!-- User Menu -->
        <div class="navbar-user" *ngIf="currentUser">
          <div class="user-profile" (click)="toggleUserMenu()">
            <div class="user-avatar">
              <span>{{ getInitials(currentUser) }}</span>
              <div class="status-indicator" [class]="getUserStatus()"></div>
            </div>
            <div class="user-info">
              <span class="user-name">{{ getFullName(currentUser) }}</span>
              <span class="user-role">{{ getRoleLabel(currentUser.role) }}</span>
            </div>
            <i class="bi bi-chevron-down dropdown-arrow" [class.rotated]="userMenuOpen"></i>
          </div>

          <!-- User Dropdown -->
          <div class="user-dropdown" [class.active]="userMenuOpen">
            <div class="dropdown-header">
              <div class="dropdown-avatar">
                <span>{{ getInitials(currentUser) }}</span>
              </div>
              <div class="dropdown-info">
                <div class="dropdown-name">{{ getFullName(currentUser) }}</div>
                <div class="dropdown-email">{{ currentUser.email }}</div>
                <div class="dropdown-role">{{ getRoleLabel(currentUser.role) }}</div>
              </div>
            </div>
            
            <div class="dropdown-menu">
              <a routerLink="/profile" class="dropdown-item">
                <i class="bi bi-person"></i>
                <span>Mon Profil</span>
              </a>
              <a routerLink="/settings" class="dropdown-item">
                <i class="bi bi-gear"></i>
                <span>Paramètres</span>
              </a>
              <a routerLink="/help" class="dropdown-item">
                <i class="bi bi-question-circle"></i>
                <span>Aide & Support</span>
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout-item" (click)="logout($event)">
                <i class="bi bi-box-arrow-right"></i>
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Login Button for guests -->
        <div class="navbar-guest" *ngIf="!currentUser">
          <a routerLink="/login" class="btn btn-primary">
            <i class="bi bi-box-arrow-in-right"></i>
            <span>Se connecter</span>
          </a>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() sidebarToggle = new EventEmitter<void>();
  @Input() sidebarOpen = false;

  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  userMenuOpen = false;
  notificationsOpen = false;
  isScrolled = false;
  hasUnreadNotifications = false;
  unreadCount = 0;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.trackRouteChanges();
    this.loadNotificationStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar-user')) {
      this.userMenuOpen = false;
    }
    if (!target.closest('.notification-center')) {
      this.notificationsOpen = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Quick search with Ctrl/Cmd + K
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.openQuickSearch();
    }

    // Close dropdowns with Escape
    if (event.key === 'Escape') {
      this.userMenuOpen = false;
      this.notificationsOpen = false;
    }
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private trackRouteChanges(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // Close dropdowns on route change
        this.userMenuOpen = false;
        this.notificationsOpen = false;
      });
  }

  private loadNotificationStatus(): void {
    // Mock notification status - replace with real service
    this.hasUnreadNotifications = true;
    this.unreadCount = 3;
  }

  onSidebarToggle(): void {
    this.sidebarToggle.emit();
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    this.notificationsOpen = false; // Close other dropdowns
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    this.userMenuOpen = false; // Close other dropdowns
  }

  openQuickSearch(): void {
    this.notificationService.info(
      'Recherche rapide',
      'Fonctionnalité de recherche en cours de développement'
    );
  }

  getInitials(user: User | null): string {
    if (!user) return '?';
    return `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase();
  }

  getFullName(user: User | null): string {
    if (!user) return 'Utilisateur';
    return `${user.prenom} ${user.nom}`;
  }

  getRoleLabel(role: string | undefined): string {
    const roleLabels: { [key: string]: string } = {
      'ETUDIANT': 'Étudiant',
      'ENCADRANT': 'Encadrant',
      'ADMIN': 'Administrateur'
    };
    return roleLabels[role || ''] || 'Utilisateur';
  }

  getUserStatus(): string {
    // Mock user status - replace with real logic
    return 'online'; // online, away, busy, offline
  }

  async logout(event: Event): Promise<void> {
    event.preventDefault();
    
    this.notificationService.warning(
      'Confirmer la déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      0,
      [
        {
          label: 'Annuler',
          style: 'secondary',
          action: () => {
            this.notificationService.info('Déconnexion annulée', 'Vous restez connecté');
          }
        },
        {
          label: 'Se déconnecter',
          style: 'danger',
          action: () => {
            this.performLogout();
          }
        }
      ]
    );
  }

  private async performLogout(): Promise<void> {
    try {
      this.authService.logout();
      this.userMenuOpen = false;
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      this.notificationService.error(
        'Erreur de déconnexion',
        'Une erreur est survenue lors de la déconnexion'
      );
    }
  }
}