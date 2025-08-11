import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [ngClass]="cardClasses">
      <!-- Card Header -->
      <div *ngIf="hasHeader" class="card-header" [ngClass]="headerClasses">
        <div class="header-main">
          <div *ngIf="headerIcon" class="header-icon" [ngClass]="'icon-' + variant">
            <i class="bi" [ngClass]="headerIcon"></i>
          </div>
          
          <div class="header-content">
            <h3 *ngIf="title" class="card-title">{{ title }}</h3>
            <p *ngIf="subtitle" class="card-subtitle">{{ subtitle }}</p>
            <ng-content select="[slot=header-content]"></ng-content>
          </div>
        </div>
        
        <div class="header-actions">
          <ng-content select="[slot=header-actions]"></ng-content>
        </div>
      </div>
      
      <!-- Card Body -->
      <div class="card-body" [ngClass]="bodyClasses">
        <ng-content></ng-content>
      </div>
      
      <!-- Card Footer -->
      <div *ngIf="hasFooter" class="card-footer" [ngClass]="footerClasses">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() headerIcon?: string;
  @Input() variant: CardVariant = 'default';
  @Input() size: CardSize = 'md';
  @Input() elevated = true;
  @Input() bordered = false;
  @Input() hoverable = true;
  @Input() loading = false;
  @Input() interactive = false;

  get hasHeader(): boolean {
    return !!(this.title || this.subtitle || this.headerIcon);
  }

  get hasFooter(): boolean {
    // This would be determined by checking if footer content is projected
    return false; // Simplified for now
  }

  get cardClasses(): string {
    const classes = ['card-modern'];

    if (this.size) classes.push(`card-${this.size}`);
    if (this.variant !== 'default') classes.push(`card-${this.variant}`);
    if (this.elevated) classes.push('card-elevated');
    if (this.bordered) classes.push('card-bordered');
    if (this.hoverable) classes.push('card-hoverable');
    if (this.loading) classes.push('card-loading');
    if (this.interactive) classes.push('card-interactive');

    return classes.join(' ');
  }

  get headerClasses(): string {
    return `header-${this.variant}`;
  }

  get bodyClasses(): string {
    return `body-${this.size}`;
  }

  get footerClasses(): string {
    return `footer-${this.variant}`;
  }
}