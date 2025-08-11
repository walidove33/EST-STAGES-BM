import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="modal-overlay" 
      [class.active]="isOpen"
      [class]="'modal-' + variant"
      (click)="onBackdropClick($event)">
      
      <div 
        class="modal-container"
        [class]="'modal-' + size"
        (click)="$event.stopPropagation()">
        
        <!-- Modal Header -->
        <div class="modal-header" *ngIf="hasHeader">
          <div class="header-content">
            <div class="header-icon" *ngIf="headerIcon">
              <i class="bi" [ngClass]="headerIcon"></i>
            </div>
            <div class="header-text">
              <h3 *ngIf="title" class="modal-title">{{ title }}</h3>
              <p *ngIf="subtitle" class="modal-subtitle">{{ subtitle }}</p>
            </div>
          </div>
          
          <div class="header-actions">
            <ng-content select="[slot=header-actions]"></ng-content>
            <button 
              *ngIf="closable"
              class="modal-close"
              (click)="close()"
              [attr.aria-label]="'Fermer ' + (title || 'modal')">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="modal-body" [ngClass]="bodyClasses">
          <ng-content></ng-content>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer" *ngIf="hasFooter">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() headerIcon?: string;
  @Input() size: ModalSize = 'md';
  @Input() variant: ModalVariant = 'default';
  @Input() closable = true;
  @Input() closeOnBackdrop = true;
  @Input() closeOnEscape = true;
  @Input() persistent = false;
  @Input() loading = false;

  @Output() modalClose = new EventEmitter<void>();
  @Output() modalOpen = new EventEmitter<void>();
  @Output() backdropClick = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  get hasHeader(): boolean {
    return !!(this.title || this.subtitle || this.headerIcon);
  }

  get hasFooter(): boolean {
    // This would be determined by checking if footer content is projected
    return false; // Simplified for now
  }

  get bodyClasses(): string {
    const classes = [];
    if (this.loading) classes.push('modal-body-loading');
    return classes.join(' ');
  }

  ngOnInit(): void {
    if (this.isOpen) {
      this.onOpen();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.enableBodyScroll();
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.onOpen();
    } else {
      this.onClose();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.closeOnEscape && this.isOpen) {
      this.close();
    }
  }

  private onOpen(): void {
    this.disableBodyScroll();
    this.modalOpen.emit();
    
    // Focus management
    setTimeout(() => {
      const firstFocusable = document.querySelector('.modal-container [tabindex]:not([tabindex="-1"]), .modal-container button:not([disabled]), .modal-container input:not([disabled])') as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }, 100);
  }

  private onClose(): void {
    this.enableBodyScroll();
  }

  close(): void {
    if (!this.persistent) {
      this.modalClose.emit();
    }
  }

  onBackdropClick(event: Event): void {
    this.backdropClick.emit();
    
    if (this.closeOnBackdrop && !this.persistent) {
      this.close();
    }
  }

  private disableBodyScroll(): void {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = this.getScrollbarWidth() + 'px';
  }

  private enableBodyScroll(): void {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  private getScrollbarWidth(): number {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  }
}