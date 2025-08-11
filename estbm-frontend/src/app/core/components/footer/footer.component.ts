import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <!-- Brand Section -->
          <div class="footer-brand">
            <div class="brand-logo">
              <i class="bi bi-mortarboard-fill"></i>
            </div>
            <div class="brand-info">
              <h4>EST Béni Mellal</h4>
              <p>École Supérieure de Technologie</p>
              <span>Système de Gestion des Stages</span>
            </div>
          </div>

          <!-- Links Section -->
          <div class="footer-links">
            <div class="link-group">
              <h5>Navigation</h5>
              <ul>
                <li><a routerLink="/about">À propos</a></li>
                <li><a routerLink="/contact">Contact</a></li>
                <li><a routerLink="/help">Aide</a></li>
                <li><a routerLink="/faq">FAQ</a></li>
              </ul>
            </div>

            <div class="link-group">
              <h5>Ressources</h5>
              <ul>
                <li><a href="#" target="_blank">Guide Étudiant</a></li>
                <li><a href="#" target="_blank">Guide Encadrant</a></li>
                <li><a href="#" target="_blank">Documentation</a></li>
                <li><a href="#" target="_blank">Support Technique</a></li>
              </ul>
            </div>

            <div class="link-group">
              <h5>Légal</h5>
              <ul>
                <li><a routerLink="/privacy">Confidentialité</a></li>
                <li><a routerLink="/terms">Conditions d'utilisation</a></li>
                <li><a routerLink="/cookies">Politique des cookies</a></li>
              </ul>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="footer-contact">
            <h5>Contact</h5>
            <div class="contact-item">
              <i class="bi bi-geo-alt"></i>
              <span>Avenue Mohammed VI, Béni Mellal</span>
            </div>
            <div class="contact-item">
              <i class="bi bi-telephone"></i>
              <span>+212 523 485 000</span>
            </div>
            <div class="contact-item">
              <i class="bi bi-envelope"></i>
              <span>contact@est.ac.ma</span>
            </div>
            <div class="social-links">
              <a href="#" class="social-link">
                <i class="bi bi-facebook"></i>
              </a>
              <a href="#" class="social-link">
                <i class="bi bi-twitter"></i>
              </a>
              <a href="#" class="social-link">
                <i class="bi bi-linkedin"></i>
              </a>
              <a href="#" class="social-link">
                <i class="bi bi-youtube"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div class="footer-copyright">
            <p>&copy; {{ currentYear }} EST Béni Mellal. Tous droits réservés.</p>
            <p>Développé avec ❤️ pour l'excellence académique</p>
          </div>
          
          <div class="footer-meta">
            <span class="version">v2.0.0</span>
            <span class="status online">
              <i class="bi bi-circle-fill"></i>
              Système opérationnel
            </span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}