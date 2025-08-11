import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationComponent } from '../../components/notification/notification.component';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    NotificationComponent,
  ],
  template: `
    <div class="main-layout" [class.sidebar-open]="sidebarOpen" [class.mobile]="isMobile">
      <!-- Navbar -->
      <app-navbar 
        (sidebarToggle)="toggleSidebar()"
        [sidebarOpen]="sidebarOpen">
      </app-navbar>

      <!-- Sidebar -->
      <app-sidebar 
        [isOpen]="sidebarOpen"
        [isMobile]="isMobile"
        (close)="closeSidebar()">
      </app-sidebar>

      <!-- Main Content -->
      <main class="main-content" [class.with-sidebar]="sidebarOpen && !isMobile">
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
        
        <!-- Footer -->
        <app-footer></app-footer>
      </main>

      <!-- Mobile Backdrop -->
      <div 
        class="mobile-backdrop" 
        [class.active]="sidebarOpen && isMobile"
        (click)="closeSidebar()">
      </div>
    </div>

    <!-- Global Notifications -->
    <app-notification></app-notification>
  `,
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  sidebarOpen = false;
  isMobile = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadCurrentUser();
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Toggle sidebar with Ctrl/Cmd + B
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
      event.preventDefault();
      this.toggleSidebar();
    }

    // Close sidebar with Escape
    if (event.key === 'Escape' && this.sidebarOpen) {
      this.closeSidebar();
    }
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 1024;
    if (this.isMobile && this.sidebarOpen) {
      // Auto-close sidebar on mobile when resizing
      this.sidebarOpen = false;
    }
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private setupKeyboardShortcuts(): void {
    // Additional keyboard shortcuts can be added here
    this.notificationService.info(
      'Raccourcis clavier',
      'Utilisez Ctrl+B pour basculer la barre latérale'
    );
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    
    if (this.sidebarOpen) {
      this.notificationService.info('Navigation', 'Barre latérale ouverte');
    } else {
      this.notificationService.info('Navigation', 'Barre latérale fermée');
    }
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}