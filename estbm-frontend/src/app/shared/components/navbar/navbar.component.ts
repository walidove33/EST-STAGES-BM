// import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { AuthService } from '../../../services/auth.service';
// import { User } from '../../../models/user.model';

// @Component({
//   selector: 'app-navbar',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './navbar.component.html',
//   styleUrls: ['./navbar.component.scss']
// })
// export class NavbarComponent implements OnInit {
//   @ViewChild('navbar', { static: true }) navbar!: ElementRef;
  
//   currentUser: User | null = null;
//   mobileMenuOpen = false;
//   userMenuOpen = false;
//   isScrolled = false;

//   constructor(
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.authService.currentUser$.subscribe((user: User | null) => {
//       this.currentUser = user;
//     });
//   }

//   @HostListener('window:scroll', ['$event'])
//   onWindowScroll(): void {
//     this.isScrolled = window.pageYOffset > 10;
//   }

//   @HostListener('document:click', ['$event'])
//   onDocumentClick(event: Event): void {
//     const target = event.target as HTMLElement;
//     if (!target.closest('.navbar-user') && !target.closest('.navbar-nav')) {
//       this.closeMenus();
//     }
//   }

//   toggleMobileMenu(): void {
//     this.mobileMenuOpen = !this.mobileMenuOpen;
//     if (this.mobileMenuOpen) {
//       this.userMenuOpen = false;
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//   }

//   toggleUserMenu(): void {
//     this.userMenuOpen = !this.userMenuOpen;
//     if (this.userMenuOpen) {
//       this.mobileMenuOpen = false;
//     }
//   }

//   closeMenus(): void {
//     this.mobileMenuOpen = false;
//     this.userMenuOpen = false;
//     document.body.style.overflow = '';
//   }

//   getRoleLabel(role?: string): string {
//     const roleLabels: { [key: string]: string } = {
//       'ETUDIANT': 'Étudiant',
//       'ENCADRANT': 'Encadrant',
//       'ADMIN': 'Administrateur'
//     };
//     return roleLabels[role || ''] || '';
//   }

//   getRoleBadgeColor(role?: string): string {
//     const colors: { [key: string]: string } = {
//       'ETUDIANT': 'student',
//       'ENCADRANT': 'supervisor',
//       'ADMIN': 'admin'
//     };
//     return colors[role || ''] || 'student';
//   }

//   getDashboardRoute(): string {
//     switch (this.currentUser?.role) {
//       case 'ADMIN':
//         return '/admin/dashboard';
//       case 'ENCADRANT':
//         return '/encadrant/dashboard';
//       case 'ETUDIANT':
//       default:
//         return '/student/dashboard';
//     }
//   }

//   getInitials(user: User | null): string {
//     if (!user) return '';
//     const firstInitial = user.prenom?.[0]?.toUpperCase() || '';
//     const lastInitial = user.nom?.[0]?.toUpperCase() || '';
//     return `${firstInitial}${lastInitial}`;
//   }

//   logout(event: Event): void {
//     event.preventDefault();
//     this.closeMenus();
//     this.authService.logout();
//     this.router.navigate(['/login']);
//   }
// }


import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit {
  @ViewChild('navbar', { static: true }) navbar!: ElementRef;
  @ViewChild('userDropdown', { static: false }) userDropdown!: ElementRef;
  
  currentUser: User | null = null;
  mobileMenuOpen = false;
  userMenuOpen = false;
  isScrolled = false;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });
  }

  ngAfterViewInit(): void {
    // Add smooth scroll behavior
    this.addScrollBehavior();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset;
    this.isScrolled = scrollPosition > 20;
    
    // Add parallax effect to navbar
    if (this.navbar?.nativeElement) {
      const navbar = this.navbar.nativeElement;
      navbar.style.transform = `translateY(${scrollPosition * 0.1}px)`;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar-user') && !target.closest('.navbar-navigation')) {
      this.closeMenus();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    if (window.innerWidth > 768) {
      this.mobileMenuOpen = false;
      document.body.style.overflow = '';
    }
  }

  private addScrollBehavior(): void {
    // Smooth scroll for navigation links
    const links = this.navbar?.nativeElement?.querySelectorAll('a[href^="#"]');
    links?.forEach((link: HTMLElement) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href') || '');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.userMenuOpen = false;
      document.body.style.overflow = 'hidden';
      // Add staggered animation to menu items
      this.animateMenuItems();
    } else {
      document.body.style.overflow = '';
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.mobileMenuOpen = false;
      // Add entrance animation to dropdown
      if (this.userDropdown?.nativeElement) {
        this.userDropdown.nativeElement.style.animation = 'dropdownSlideIn 0.3s ease-out';
      }
    }
  }

  closeMenus(): void {
    this.mobileMenuOpen = false;
    this.userMenuOpen = false;
    document.body.style.overflow = '';
  }

  private animateMenuItems(): void {
    const menuItems = document.querySelectorAll('.nav-link');
    menuItems.forEach((item, index) => {
      (item as HTMLElement).style.animationDelay = `${index * 0.1}s`;
      item.classList.add('animate-slide-in');
    });
  }

  getRoleLabel(role?: string): string {
    const roleLabels: { [key: string]: string } = {
      'ETUDIANT': 'Étudiant',
      'ENCADRANT': 'Encadrant',
      'ADMIN': 'Administrateur'
    };
    return roleLabels[role || ''] || '';
  }

  getRoleBadgeColor(role?: string): string {
    const colors: { [key: string]: string } = {
      'ETUDIANT': 'student',
      'ENCADRANT': 'supervisor',
      'ADMIN': 'admin'
    };
    return colors[role || ''] || 'student';
  }

  getDashboardRoute(): string {
    switch (this.currentUser?.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'ENCADRANT':
        return '/encadrant/dashboard';
      case 'ETUDIANT':
      default:
        return '/student/dashboard';
    }
  }

  getInitials(user: User | null): string {
    if (!user) return '';
    const firstInitial = user.prenom?.[0]?.toUpperCase() || '';
    const lastInitial = user.nom?.[0]?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  }

  getFullName(user: User | null): string {
    if (!user) return '';
    return `${user.prenom || ''} ${user.nom || ''}`.trim();
  }

  logout(event: Event): void {
    event.preventDefault();
    this.isLoading = true;
    this.closeMenus();
    
    // Add loading animation
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
      this.isLoading = false;
    }, 800);
  }

  // Navigation helpers
  navigateWithAnimation(route: string): void {
    this.closeMenus();
    // Add page transition effect
    document.body.style.opacity = '0.8';
    setTimeout(() => {
      this.router.navigate([route]);
      document.body.style.opacity = '1';
    }, 200);
  }
}