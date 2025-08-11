import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-group" [ngClass]="inputGroupClasses">
      <!-- Label -->
      <label *ngIf="label" class="input-label" [for]="inputId">
        <i *ngIf="labelIcon" class="bi" [ngClass]="labelIcon"></i>
        {{ label }}
        <span *ngIf="required" class="required-indicator">*</span>
      </label>

      <!-- Input Container -->
      <div class="input-container" [ngClass]="containerClasses">
        <!-- Left Icon -->
        <div *ngIf="iconLeft" class="input-icon input-icon-left">
          <i class="bi" [ngClass]="iconLeft"></i>
        </div>

        <!-- Input Element -->
        <input
          [id]="inputId"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [value]="value"
          [class]="inputClasses"
          (input)="onInput($event)"
          (blur)="onBlur($event)"
          (focus)="onFocus($event)"
          (keydown)="onKeyDown($event)"
          #inputElement>

        <!-- Right Icon -->
        <div *ngIf="iconRight" class="input-icon input-icon-right">
          <i class="bi" [ngClass]="iconRight"></i>
        </div>

        <!-- Password Toggle -->
        <button 
          *ngIf="type === 'password'" 
          type="button"
          class="password-toggle"
          (click)="togglePasswordVisibility()">
          <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
        </button>

        <!-- Clear Button -->
        <button 
          *ngIf="clearable && value && !disabled" 
          type="button"
          class="clear-button"
          (click)="clearValue()">
          <i class="bi bi-x"></i>
        </button>

        <!-- Loading Spinner -->
        <div *ngIf="loading" class="input-spinner">
          <div class="spinner-ring"></div>
        </div>
      </div>

      <!-- Helper Text -->
      <div *ngIf="helperText || errorMessage" class="input-helper">
        <div *ngIf="errorMessage" class="error-message">
          <i class="bi bi-exclamation-triangle"></i>
          {{ errorMessage }}
        </div>
        <div *ngIf="helperText && !errorMessage" class="helper-text">
          {{ helperText }}
        </div>
      </div>

      <!-- Character Count -->
      <div *ngIf="maxLength && showCharCount" class="char-count">
        {{ value?.length || 0 }}/{{ maxLength }}
      </div>
    </div>
  `,
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() labelIcon?: string;
  @Input() placeholder = '';
  @Input() type: InputType = 'text';
  @Input() variant: InputVariant = 'default';
  @Input() size: InputSize = 'md';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() loading = false;
  @Input() clearable = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;
  @Input() helperText?: string;
  @Input() errorMessage?: string;
  @Input() maxLength?: number;
  @Input() showCharCount = false;
  @Input() autoFocus = false;

  @Output() inputChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<Event>();
  @Output() inputBlur = new EventEmitter<Event>();
  @Output() keyDown = new EventEmitter<KeyboardEvent>();

  value = '';
  showPassword = false;
  focused = false;
  inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  get inputGroupClasses(): string {
    const classes = ['input-group-modern'];
    
    if (this.variant !== 'default') classes.push(`input-group-${this.variant}`);
    if (this.size !== 'md') classes.push(`input-group-${this.size}`);
    if (this.focused) classes.push('input-group-focused');
    if (this.disabled) classes.push('input-group-disabled');
    if (this.errorMessage) classes.push('input-group-error');
    if (this.loading) classes.push('input-group-loading');

    return classes.join(' ');
  }

  get containerClasses(): string {
    const classes = ['input-container-modern'];
    
    if (this.iconLeft) classes.push('has-icon-left');
    if (this.iconRight) classes.push('has-icon-right');
    if (this.type === 'password') classes.push('has-password-toggle');
    if (this.clearable && this.value) classes.push('has-clear-button');

    return classes.join(' ');
  }

  get inputClasses(): string {
    return 'input-modern';
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onFocus(event: Event): void {
    this.focused = true;
    this.onTouched();
    this.inputFocus.emit(event);
  }

  onBlur(event: Event): void {
    this.focused = false;
    this.inputBlur.emit(event);
  }

  onKeyDown(event: KeyboardEvent): void {
    this.keyDown.emit(event);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const input = document.getElementById(this.inputId) as HTMLInputElement;
    if (input) {
      input.type = this.showPassword ? 'text' : 'password';
    }
  }

  clearValue(): void {
    this.value = '';
    this.onChange(this.value);
    this.inputChange.emit(this.value);
    
    const input = document.getElementById(this.inputId) as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}