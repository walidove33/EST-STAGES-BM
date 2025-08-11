import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonStyle = 'solid' | 'outline' | 'ghost' | 'link';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="onClick($event)">
      
      <!-- Loading Spinner -->
      <div *ngIf="loading" class="btn-spinner">
        <div class="spinner-ring"></div>
      </div>

      <!-- Icon (Left) -->
      <i *ngIf="iconLeft && !loading" class="btn-icon btn-icon-left bi" [ngClass]="iconLeft"></i>

      <!-- Content -->
      <span class="btn-content" [class.sr-only]="loading">
        <ng-content></ng-content>
      </span>

      <!-- Icon (Right) -->
      <i *ngIf="iconRight && !loading" class="btn-icon btn-icon-right bi" [ngClass]="iconRight"></i>

      <!-- Badge -->
      <span *ngIf="badge" class="btn-badge">{{ badge }}</span>
    </button>
  `,
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() style: ButtonStyle = 'solid';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;
  @Input() badge?: string | number;
  @Input() rounded = false;
  @Input() elevated = false;

  @Output() buttonClick = new EventEmitter<Event>();

  @HostBinding('class.btn-full-width')
  get isFullWidth(): boolean {
    return this.fullWidth;
  }

  get buttonClasses(): string {
    const classes = [
      'btn',
      `btn-${this.variant}`,
      `btn-${this.size}`,
      `btn-${this.style}`,
    ];

    if (this.rounded) classes.push('btn-rounded');
    if (this.elevated) classes.push('btn-elevated');
    if (this.loading) classes.push('btn-loading');
    if (this.disabled) classes.push('btn-disabled');

    return classes.join(' ');
  }

  onClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }
}