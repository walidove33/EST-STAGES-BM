import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { StageService } from '../../../core/services/stage.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MainLayoutComponent } from '../../../core/layouts/main-layout/main-layout.component';
import { CardComponent } from '../../../shared/components/ui/card/card.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { EmptyStateComponent, EmptyStateAction } from '../../../shared/components/empty-state/empty-state.component';

import { Stage, EtatStage, Rapport } from '../../../core/models/stage.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MainLayoutComponent,
    CardComponent,
    ButtonComponent,
    LoadingComponent,
    EmptyStateComponent,
  ],
  template: `
    <app-main-layout>
      <div class="dashboard-layout">
        <!-- Dashboard Header -->
        <div class="dashboard-header animate-slideInDown">
          <div class="header-content">
            <div class="header-text">
              <h1>
                <i class="bi bi-speedometer2"></i>
                Tableau de bord étudiant
              </h1>
              <p>Bienvenue {{ currentUser?.prenom }}, gérez vos stages et suivez votre progression</p>
            </div>
            <div class="header-meta">
              <div class="current-date">
                <i class="bi bi-calendar-event"></i>
                <span>{{ currentDate | date:'EEEE d MMMM yyyy':'fr' | titlecase }}</span>
              </div>
              <div class="user-status">
                <div class="status-indicator online"></div>
                <span>En ligne</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <app-loading 
          *ngIf="loading"
          size="lg"
          variant="primary"
          message="Chargement de vos données..."
          description="Récupération de vos stages et rapports">
        </app-loading>

        <!-- Dashboard Content -->
        <div *ngIf="!loading" class="dashboard-content">
          <!-- Statistics Cards -->
          <div class="stats-section animate-slideInLeft">
            <h2 class="section-title">
              <i class="bi bi-bar-chart-line"></i>
              Vos statistiques
            </h2>
            
            <div class="stats-grid">
              <app-card 
                variant="primary"
                size="md"
                [hoverable]="true"
                class="stat-card animate-scaleIn">
                <div class="stat-content">
                  <div class="stat-icon">
                    <i class="bi bi-file-earmark-plus"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ stats.total }}</div>
                    <div class="stat-label">Demandes totales</div>
                    <div class="stat-trend positive">
                      <i class="bi bi-graph-up"></i>
                      <span>Total de vos demandes</span>
                    </div>
                  </div>
                </div>
              </app-card>

              <app-card 
                variant="warning"
                size="md"
                [hoverable]="true"
                class="stat-card animate-scaleIn"
                style="animation-delay: 0.1s">
                <div class="stat-content">
                  <div class="stat-icon">
                    <i class="bi bi-clock-history"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ stats.enAttente }}</div>
                    <div class="stat-label">En attente</div>
                    <div class="stat-progress">
                      <div class="progress-bar" 
                           [style.width.%]="getProgressPercentage('enAttente')">
                      </div>
                    </div>
                  </div>
                </div>
              </app-card>

              <app-card 
                variant="success"
                size="md"
                [hoverable]="true"
                class="stat-card animate-scaleIn"
                style="animation-delay: 0.2s">
                <div class="stat-content">
                  <div class="stat-icon">
                    <i class="bi bi-check-circle"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ stats.valides }}</div>
                    <div class="stat-label">Validés</div>
                    <div class="stat-progress">
                      <div class="progress-bar" 
                           [style.width.%]="getProgressPercentage('valides')">
                      </div>
                    </div>
                  </div>
                </div>
              </app-card>

              <app-card 
                variant="info"
                size="md"
                [hoverable]="true"
                class="stat-card animate-scaleIn"
                style="animation-delay: 0.3s">
                <div class="stat-content">
                  <div class="stat-icon">
                    <i class="bi bi-briefcase"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ stats.enCours }}</div>
                    <div class="stat-label">En cours</div>
                    <div class="stat-progress">
                      <div class="progress-bar" 
                           [style.width.%]="getProgressPercentage('enCours')">
                      </div>
                    </div>
                  </div>
                </div>
              </app-card>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="content-grid">
            <!-- Current Stage -->
            <app-card 
              title="Stage actuel"
              subtitle="Suivez l'état de votre stage en cours"
              headerIcon="bi-briefcase-fill"
              variant="primary"
              [hoverable]="true"
              class="current-stage-card animate-slideInFromLeft">
              
              <div slot="header-actions">
                <app-button 
                  *ngIf="canRequestNewStage()"
                  variant="primary"
                  size="sm"
                  iconLeft="bi-plus-circle"
                  routerLink="/student/new-stage">
                  Nouvelle demande
                </app-button>
              </div>

              <!-- Current Stage Content -->
              <div *ngIf="getCurrentStage()" class="current-stage">
                <div class="stage-overview">
                  <div class="stage-header">
                    <h4>{{ getCurrentStage()?.sujet }}</h4>
                    <span class="status-badge" [ngClass]="getStatusBadgeClass(getCurrentStage()?.etat!)">
                      <i class="bi bi-circle-fill"></i>
                      {{ getStatusText(getCurrentStage()?.etat!) }}
                    </span>
                  </div>

                  <div class="stage-details">
                    <div class="detail-grid">
                      <div class="detail-item">
                        <div class="detail-icon">
                          <i class="bi bi-building"></i>
                        </div>
                        <div class="detail-content">
                          <span class="detail-label">Entreprise</span>
                          <span class="detail-value">{{ getCurrentStage()?.entreprise }}</span>
                        </div>
                      </div>
                      
                      <div class="detail-item">
                        <div class="detail-icon">
                          <i class="bi bi-calendar-range"></i>
                        </div>
                        <div class="detail-content">
                          <span class="detail-label">Période</span>
                          <span class="detail-value">
                            {{ getCurrentStage()?.dateDebut | date:'dd/MM/yyyy' }} - 
                            {{ getCurrentStage()?.dateFin | date:'dd/MM/yyyy' }}
                          </span>
                        </div>
                      </div>

                      <div class="detail-item">
                        <div class="detail-icon">
                          <i class="bi bi-mortarboard"></i>
                        </div>
                        <div class="detail-content">
                          <span class="detail-label">Filière</span>
                          <span class="detail-value">{{ getCurrentStage()?.filiere }}</span>
                        </div>
                      </div>
                      
                      <div class="detail-item" *ngIf="getCurrentStage()?.encadrant">
                        <div class="detail-icon">
                          <i class="bi bi-person-badge"></i>
                        </div>
                        <div class="detail-content">
                          <span class="detail-label">Encadrant</span>
                          <span class="detail-value">
                            {{ getCurrentStage()?.encadrant?.prenom }} {{ getCurrentStage()?.encadrant?.nom }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Stage Note -->
                  <div *ngIf="getCurrentStage()?.note" class="stage-note">
                    <div class="note-icon">
                      <i class="bi bi-chat-left-text"></i>
                    </div>
                    <div class="note-content">
                      <span class="note-label">Note de l'encadrant :</span>
                      <p>{{ getCurrentStage()?.note }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <app-empty-state 
                *ngIf="!getCurrentStage()"
                title="Aucun stage en cours"
                description="Vous n'avez pas de stage actuel. Commencez par créer une nouvelle demande."
                icon="bi-briefcase"
                variant="info"
                [actions]="emptyStageActions">
              </app-empty-state>
            </app-card>

            <!-- Documents Section -->
            <app-card 
              title="Documents"
              subtitle="Téléchargez vos documents officiels"
              headerIcon="bi-file-earmark-pdf"
              variant="success"
              [hoverable]="true"
              class="documents-card animate-slideInFromRight">
              
              <div *ngIf="getCurrentStage()" class="documents-grid">
                <div class="document-item">
                  <div class="document-icon convention">
                    <i class="bi bi-file-earmark-pdf"></i>
                  </div>
                  <div class="document-info">
                    <h5>Convention de stage</h5>
                    <p>Document officiel signé</p>
                  </div>
                  <app-button
                    variant="primary"
                    size="sm"
                    iconLeft="bi-download"
                    [disabled]="!canDownloadDocuments()"
                    (buttonClick)="downloadConvention(getCurrentStage()!.id)">
                    Télécharger
                  </app-button>
                </div>

                <div class="document-item">
                  <div class="document-icon assurance">
                    <i class="bi bi-shield-check"></i>
                  </div>
                  <div class="document-info">
                    <h5>Attestation d'assurance</h5>
                    <p>Couverture assurance stage</p>
                  </div>
                  <app-button
                    variant="secondary"
                    size="sm"
                    iconLeft="bi-download"
                    [disabled]="!canDownloadDocuments()"
                    (buttonClick)="downloadAssurance(getCurrentStage()!.id)">
                    Télécharger
                  </app-button>
                </div>
              </div>

              <app-empty-state 
                *ngIf="!getCurrentStage()"
                title="Documents non disponibles"
                description="Les documents seront accessibles après validation de votre stage"
                icon="bi-file-earmark-x"
                variant="warning"
                size="sm">
              </app-empty-state>
            </app-card>
          </div>

          <!-- Report Management -->
          <app-card 
            title="Gestion du rapport"
            subtitle="Soumettez ou remplacez votre rapport de stage"
            headerIcon="bi-cloud-upload"
            variant="info"
            [hoverable]="true"
            class="report-card animate-fadeIn"
            style="animation-delay: 0.4s">
            
            <!-- Existing Report -->
            <div *ngIf="existingRapport" class="existing-report">
              <div class="report-header">
                <div class="report-icon">
                  <i class="bi bi-file-earmark-pdf-fill"></i>
                </div>
                <div class="report-info">
                  <h5>{{ existingRapport.nom }}</h5>
                  <p>Soumis le {{ existingRapport.dateUpload | date:'dd/MM/yyyy' }}</p>
                </div>
                <app-button
                  variant="outline"
                  size="sm"
                  iconLeft="bi-download"
                  (buttonClick)="downloadExistingReport()">
                  Télécharger
                </app-button>
              </div>
              <p class="replacement-note">
                Vous pouvez remplacer ce rapport en soumettant un nouveau fichier ci-dessous.
              </p>
            </div>

            <!-- Report Submission -->
            <div *ngIf="canSubmitReport()" class="report-submission">
              <div class="submission-status">
                <div class="status-icon success">
                  <i class="bi bi-check-circle"></i>
                </div>
                <div class="status-content">
                  <h5>Stage approuvé</h5>
                  <p>Votre stage a été validé. Vous pouvez maintenant soumettre votre rapport.</p>
                </div>
              </div>
              
              <div class="upload-zone"
                   [class.has-file]="selectedFile"
                   [class.drag-over]="isDragOver"
                   (click)="triggerFileInput()"
                   (dragover)="onDragOver($event)"
                   (dragleave)="onDragLeave($event)"
                   (drop)="onDrop($event)">
                
                <input 
                  #fileInput 
                  type="file" 
                  accept=".pdf" 
                  (change)="onFileSelected($event)" 
                  hidden>
                
                <div *ngIf="!selectedFile" class="upload-content">
                  <div class="upload-icon">
                    <i class="bi bi-cloud-upload"></i>
                  </div>
                  <h4>Glissez votre rapport ici</h4>
                  <p>ou <span class="upload-link">cliquez pour parcourir</span></p>
                  <small>PDF uniquement • Maximum 10 MB</small>
                </div>
                
                <div *ngIf="selectedFile" class="file-preview">
                  <div class="file-icon">
                    <i class="bi bi-file-earmark-check"></i>
                  </div>
                  <div class="file-details">
                    <h5>{{ selectedFile.name }}</h5>
                    <p>{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
                  </div>
                  <app-button
                    variant="error"
                    size="sm"
                    iconLeft="bi-x"
                    (buttonClick)="removeSelectedFile(); $event.stopPropagation()">
                    Supprimer
                  </app-button>
                </div>
              </div>
              
              <div *ngIf="selectedFile" class="submission-actions">
                <app-button
                  variant="success"
                  size="lg"
                  iconLeft="bi-send"
                  [loading]="submittingReport"
                  [fullWidth]="true"
                  (buttonClick)="submitReport()">
                  {{ existingRapport ? 'Remplacer le rapport' : 'Soumettre le rapport' }}
                </app-button>
              </div>
            </div>

            <app-empty-state 
              *ngIf="!canSubmitReport()"
              title="En attente de validation"
              description="La soumission sera disponible une fois votre stage approuvé par l'encadrant"
              icon="bi-hourglass-split"
              variant="warning"
              size="sm">
            </app-empty-state>
          </app-card>

          <!-- Quick Actions -->
          <div class="quick-actions animate-fadeIn" style="animation-delay: 0.6s">
            <h2 class="section-title">
              <i class="bi bi-lightning"></i>
              Actions rapides
            </h2>
            
            <div class="actions-grid">
              <a routerLink="/student/stages" class="action-card">
                <div class="action-icon">
                  <i class="bi bi-list-ul"></i>
                </div>
                <div class="action-content">
                  <h4>Historique des stages</h4>
                  <p>Consultez tous vos stages et leur progression</p>
                </div>
                <div class="action-arrow">
                  <i class="bi bi-arrow-right"></i>
                </div>
              </a>

              <a 
                routerLink="/student/new-stage"
                class="action-card"
                [class.disabled]="!canRequestNewStage()">
                <div class="action-icon">
                  <i class="bi" [ngClass]="canRequestNewStage() ? 'bi-plus-circle' : 'bi-exclamation-triangle'"></i>
                </div>
                <div class="action-content">
                  <h4>{{ canRequestNewStage() ? 'Nouvelle demande' : 'Demande en cours' }}</h4>
                  <p>{{ canRequestNewStage() ? 'Créez une nouvelle demande de stage' : 'Une demande est déjà active' }}</p>
                </div>
                <div class="action-arrow" *ngIf="canRequestNewStage()">
                  <i class="bi bi-arrow-right"></i>
                </div>
              </a>

              <a routerLink="/student/soutenances" class="action-card">
                <div class="action-icon">
                  <i class="bi bi-calendar-check"></i>
                </div>
                <div class="action-content">
                  <h4>Mes Soutenances</h4>
                  <p>Consultez vos créneaux de soutenance programmés</p>
                </div>
                <div class="action-arrow">
                  <i class="bi bi-arrow-right"></i>
                </div>
              </a>

              <div class="action-card info-card">
                <div class="action-icon">
                  <i class="bi bi-info-circle"></i>
                </div>
                <div class="action-content">
                  <h4>Besoin d'aide ?</h4>
                  <p>Consultez le guide ou contactez l'administration</p>
                </div>
                <div class="action-arrow">
                  <i class="bi bi-arrow-right"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-main-layout>
  `,
  styleUrls: ['./student-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  stages: Stage[] = [];
  existingRapport: Rapport | null = null;
  loading = true;
  submittingReport = false;
  selectedFile: File | null = null;
  isDragOver = false;
  currentDate = new Date();

  stats = {
    total: 0,
    enAttente: 0,
    valides: 0,
    refuses: 0,
    enCours: 0,
    termines: 0,
  };

  emptyStageActions: EmptyStateAction[] = [
    {
      label: 'Créer ma première demande',
      icon: 'bi-plus-circle',
      variant: 'primary',
      action: () => {
        this.notificationService.info('Navigation', 'Redirection vers le formulaire de demande...');
      },
    },
  ];

  constructor(
    private authService: AuthService,
    private stageService: StageService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    if (this.currentUser) {
      this.notificationService.info(
        `Bienvenue ${this.currentUser.prenom} !`,
        'Chargement de votre tableau de bord étudiant...'
      );
    }

    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.stageService
      .getMyStages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stages) => {
          this.stages = stages || [];
          this.calculateStats();
          this.loadExistingRapport();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.loading = false;
          this.cdr.markForCheck();
          console.error('Error loading stages:', error);
        },
      });
  }

  private loadExistingRapport(): void {
    const currentStage = this.getCurrentStage();
    if (currentStage) {
      this.stageService
        .getExistingRapport(currentStage.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (rapport) => {
            this.existingRapport = rapport;
            this.cdr.markForCheck();
          },
          error: () => {
            this.existingRapport = null;
            this.cdr.markForCheck();
          },
        });
    }
  }

  private calculateStats(): void {
    this.stats = {
      total: this.stages.length,
      enAttente: this.stages.filter((s) => s.etat === EtatStage.EN_ATTENTE_VALIDATION).length,
      valides: this.stages.filter((s) => s.etat === EtatStage.ACCEPTE || s.etat === EtatStage.RAPPORT_SOUMIS).length,
      refuses: this.stages.filter((s) => s.etat === EtatStage.REFUSE).length,
      enCours: this.stages.filter((s) => s.etat === EtatStage.EN_COURS).length,
      termines: this.stages.filter((s) => s.etat === EtatStage.TERMINE).length,
    };
  }

  getCurrentStage(): Stage | null {
    const activeStages = this.stages.filter((stage) =>
      [EtatStage.EN_ATTENTE_VALIDATION, EtatStage.ACCEPTE, EtatStage.EN_COURS, EtatStage.RAPPORT_SOUMIS].includes(
        stage.etat,
      ),
    );
    return activeStages.length > 0 ? activeStages[0] : null;
  }

  canRequestNewStage(): boolean {
    const activeStages = this.stages.filter((stage) => 
      ["EN_ATTENTE_VALIDATION", "ACCEPTE", "EN_COURS", "RAPPORT_SOUMIS"].includes(stage.etat)
    );
    return activeStages.length === 0;
  }

  canSubmitReport(): boolean {
    const current = this.getCurrentStage();
    if (!current) return false;
    return [EtatStage.ACCEPTE, EtatStage.EN_COURS, EtatStage.RAPPORT_SOUMIS].includes(current.etat);
  }

  canDownloadDocuments(): boolean {
    const currentStage = this.getCurrentStage();
    if (!currentStage) return false;
    return [EtatStage.ACCEPTE, EtatStage.EN_COURS, EtatStage.TERMINE, EtatStage.RAPPORT_SOUMIS].includes(
      currentStage.etat,
    );
  }

  getStatusText(status: EtatStage): string {
    const statusMap: Record<EtatStage, string> = {
      [EtatStage.DEMANDE]: "Demande créée",
      [EtatStage.EN_ATTENTE_VALIDATION]: "En attente de validation",
      [EtatStage.VALIDATION_EN_COURS]: "Validation en cours",
      [EtatStage.ACCEPTE]: "Validé par l'encadrant",
      [EtatStage.REFUSE]: "Refusé",
      [EtatStage.EN_COURS]: "Stage en cours",
      [EtatStage.TERMINE]: "Stage terminé",
      [EtatStage.RAPPORT_SOUMIS]: "Rapport soumis",
    };
    return statusMap[status] || status;
  }

  getStatusBadgeClass(status: EtatStage): string {
    const classMap: Record<EtatStage, string> = {
      [EtatStage.DEMANDE]: "badge-neutral",
      [EtatStage.EN_ATTENTE_VALIDATION]: "badge-warning",
      [EtatStage.VALIDATION_EN_COURS]: "badge-accent",
      [EtatStage.ACCEPTE]: "badge-success",
      [EtatStage.REFUSE]: "badge-danger",
      [EtatStage.EN_COURS]: "badge-primary",
      [EtatStage.TERMINE]: "badge-secondary",
      [EtatStage.RAPPORT_SOUMIS]: "badge-info",
    };
    return classMap[status] || "badge-secondary";
  }

  getProgressPercentage(status: string): number {
    if (this.stats.total === 0) return 0;
    const count = this.stats[status as keyof typeof this.stats] as number;
    return (count / this.stats.total) * 100;
  }

  // File handling methods
  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.notificationService.error('Format non supporté', 'Seuls les fichiers PDF sont acceptés.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.notificationService.error('Fichier trop volumineux', 'Le fichier ne doit pas dépasser 10MB.');
      return;
    }

    this.selectedFile = file;
    this.cdr.markForCheck();
    
    this.notificationService.success(
      'Fichier sélectionné', 
      `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) prêt à être soumis.`
    );
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.onFileSelected({ target: { files: [file] } });
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.cdr.markForCheck();
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    this.notificationService.info('Fichier retiré', 'Sélection annulée');
  }

  submitReport(): void {
    const currentStage = this.getCurrentStage();
    if (!currentStage || !this.selectedFile) {
      this.notificationService.error('Erreur de soumission', 'Aucun fichier sélectionné ou stage non trouvé.');
      return;
    }

    this.submittingReport = true;
    this.cdr.markForCheck();

    this.stageService
      .submitRapport(currentStage.id, this.selectedFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submittingReport = false;
          this.selectedFile = null;
          this.cdr.markForCheck();
          this.loadData();
        },
        error: (error) => {
          this.submittingReport = false;
          this.cdr.markForCheck();
          console.error('Error submitting report:', error);
        },
      });
  }

  downloadConvention(stageId: number): void {
    this.stageService
      .downloadConvention(stageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.downloadFile(blob, `convention_stage_${stageId}.pdf`);
        },
        error: () => {
          this.notificationService.error('Erreur', 'Impossible de télécharger la convention');
        },
      });
  }

  downloadAssurance(stageId: number): void {
    this.stageService
      .downloadAssurance(stageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.downloadFile(blob, `assurance_stage_${stageId}.pdf`);
        },
        error: () => {
          this.notificationService.error('Erreur', 'Impossible de télécharger l\'assurance');
        },
      });
  }

  downloadExistingReport(): void {
    if (this.existingRapport?.cloudinaryUrl) {
      window.open(this.existingRapport.cloudinaryUrl, '_blank');
      this.notificationService.success('Téléchargement', 'Rapport ouvert dans un nouvel onglet');
    } else {
      this.notificationService.error('Rapport indisponible', 'Le lien de téléchargement n\'est pas disponible.');
    }
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}