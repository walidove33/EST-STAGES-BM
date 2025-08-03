import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { errorInterceptor } from './app/interceptors/error.interceptor';
import { ToastComponent } from './app/shared/components/toast/toast.component';
import { NotificationComponent } from './app/shared/components/notification/notification.component';

import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, RouterOutlet, ToastComponent, NotificationComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
    <app-notification></app-notification>
  `
})
export class App {
  title = 'EST Béni Mellal - Gestion des Stages';
}

bootstrapApplication(App, {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),
    provideRouter(routes),
    provideAnimations() // Enable animations
  ]
}).catch(err => console.error(err));