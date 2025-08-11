import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  children?: NavigationItem[];
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.open]="isOpen" [class.mobile]="isMobile">
      <div class="sidebar-content">
        <!-- Sidebar Header -->
        <div class="sidebar-header">
          <div class="sidebar-brand">
            <div class="brand-logo">
              <i class="bi bi-mortarboard-fill"></i>
            </div>
            <div class="brand-info">
              <h3>EST Stages</h3>
              <span>{{ getRoleLabel(currentUser?.role) }}</span>
            </div>
          </div>
          
          <button 
            class="sidebar-close"
            (click)="onClose()"
            *ngIf="isMobile">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- User Quick Info -->
        <div class="sidebar-user" *ngIf="currentUser">
          <div class="user-card">
            <div class="user-avatar">
              <span>{{ getInitials(currentUser) }}</span>
              <div class="status-dot online"></div>
            </div>
            <div class="user-details">
              <div class="user-name">{{ getFullName(currentUser) }}</div>
              <div class="user-email">{{ currentUser.email }}</div>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="sidebar-nav">
          <div class="nav-section" *ngFor="let section of getNavigationSections()">
            <div class="nav-section-title" *ngIf="section.title">
              {{ section.title }}
            </div>
            
            <ul class="nav-list">
              <li *ngFor="let item of section.items" class="nav-item">
                <a 
                  [routerLink]="item.route"
                  routerLinkActive="active"
                  class="nav-link"
                  (click)="onNavClick(item)">
                  <div class="nav-icon">
                    <i class="bi" [ngClass]="item.icon"></i>
                  </div>
                  <span class="nav-label">{{ item.label }}</span>
                  <span class="nav-badge" *ngIf="item.badge">{{ item.badge }}</span>
                </a>

                <!-- Submenu -->
                <ul class="nav-submenu" *ngIf="item.children && item.children.length > 0">
                  <li *ngFor="let child of item.children" class="nav-subitem">
                    <a 
                      [routerLink]="child.route"
                      routerLinkActive="active"
                      class="nav-sublink"
                      (click)="onNavClick(child)">
                      <i class="bi" [ngClass]="child.icon"></i>
                      <span>{{ child.label }}</span>
                      <span class="nav-badge" *ngIf="child.badge">{{ child.badge }}</span>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <div class="footer-stats" *ngIf="currentUser">
            <div class="stat-item">
              <i class="bi bi-clock"></i>
              <span>Connecté depuis {{ getConnectionTime() }}</span>
            </div>
          </div>
          
          <div class="footer-actions">
            <button class="footer-btn" (click)="openHelp()">
              <i class="bi bi-question-circle"></i>
              <span>Aide</span>
            </button>
            <button class="footer-btn" (click)="openSettings()">
              <i class="bi bi-gear"></i>
              <span>Paramètres</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() isMobile = false;
  @Output() close = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  activeRoute = '';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.trackActiveRoute();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private trackActiveRoute(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.activeRoute = event.url;
      });
  }

  getNavigationSections(): any[] {
    if (!this.currentUser) return [];

    const role = this.currentUser.role;
    
    switch (role) {
      case 'ETUDIANT':
        return [
          {
            title: 'Principal',
            items: [
              { label: 'Tableau de bord', icon: 'bi-speedometer2', route: '/student/dashboard' },
              { label: 'Mes Stages', icon: 'bi-briefcase', route: '/student/stages' },
              { label: 'Nouvelle Demande', icon: 'bi-plus-circle', route: '/student/new-stage' },
            ]
          },
          {
            title: 'Soutenances',
            items: [
              { label: 'Mes Soutenances', icon: 'bi-calendar-check', route: '/student/soutenances' },
              { label: 'Ma Planification', icon: 'bi-calendar-week', route: '/student/ma-planification' },
            ]
          }
        ];

      case 'ENCADRANT':
        return [
          {
            title: 'Principal',
            items: [
              { label: 'Tableau de bord', icon: 'bi-speedometer2', route: '/encadrant/dashboard' },
              { label: 'Mes Rapports', icon: 'bi-file-earmark-text', route: '/encadrant/rapports' },
            ]
          },
          {
            title: 'Planification',
            items: [
              { label: 'Planifications', icon: 'bi-calendar-week', route: '/encadrant/planifications' },
              { label: 'Soutenances', icon: 'bi-calendar-event', route: '/encadrant/soutenances' },
            ]
          }
        ];

      case 'ADMIN':
        return [
          {
            title: 'Administration',
            items: [
              { label: 'Tableau de bord', icon: 'bi-speedometer2', route: '/admin/dashboard' },
              { label: 'Encadrants', icon: 'bi-people', route: '/admin/encadrants' },
              { label: 'Administrateurs', icon: 'bi-shield-check', route: '/admin/admins' },
            ]
          },
          {
            title: 'Planification',
            items: [
              { label: 'Planifications', icon: 'bi-calendar-week', route: '/admin/planifications' },
            ]
          }
        ];

      default:
        return [];
    }
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

  getConnectionTime(): string {
    // Mock connection time - replace with real logic
    return '2h 30m';
  }

  onClose(): void {
    this.close.emit();
  }

  onNavClick(item: NavigationItem): void {
    this.notificationService.info(
      'Navigation',
      `Accès à ${item.label}`
    );

    // Close sidebar on mobile after navigation
    if (this.isMobile) {
      setTimeout(() => {
        this.onClose();
      }, 300);
    }
  }

  openHelp(): void {
    this.notificationService.info(
      'Aide',
      'Ouverture de la documentation d\'aide'
    );
  }

  openSettings(): void {
    this.notificationService.info(
      'Paramètres',
      'Accès aux paramètres utilisateur'
    );
  }
}