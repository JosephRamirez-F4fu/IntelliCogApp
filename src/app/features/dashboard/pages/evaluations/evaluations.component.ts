import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  EvaluationsService,
  EvaluationModel,
} from '../../services/evaluations-service';
import { SnackbarService } from '@core/services/snackbar-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateEvaluationModalComponent } from './create-evaluation-overlay/EvaluationsPageComponent';
import { OverlayModalService } from '@components/overlay/overlay.service';
import {
  PatientManagementService,
  PatientModel,
} from '../../services/patient-management.service';
import { UserLinkComponent } from '@components/user-link/user-link.component';

@Component({
  selector: 'app-evaluations-page',
  templateUrl: './evaluations-page.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    UserLinkComponent,
  ],
  styleUrls: ['./evaluations-page.component.css'],
  providers: [
    EvaluationsService,
    OverlayModalService,
    PatientManagementService,
  ],
})
export class EvaluationsPageComponent implements OnInit {
  evaluaciones: EvaluationModel[] = [];
  patients: PatientModel[] = [];
  selectedPatient: PatientModel | null = null;
  searchTerm = '';
  loading = false;
  page = 1;
  pageSize = 10;
  total = 0;

  constructor(
    private service: EvaluationsService,
    private snackbar: SnackbarService,
    private overlay: OverlayModalService,
    private patientService: PatientManagementService
  ) {}

  ngOnInit() {
    const saved = sessionStorage.getItem('selectedPatient');
    if (saved) {
      this.selectedPatient = JSON.parse(saved);
      if (!this.selectedPatient || !this.selectedPatient.dni) {
        this.clearSelectedPatient();
        return;
      }
      this.searchTerm = `${this.selectedPatient.dni}`;
      this.loadEvaluaciones();
    }
  }
  onSearchPatient() {
    const term = this.searchTerm.trim();
    if (term.length < 3) {
      this.patients = [];
      return;
    }

    // Si es solo dígitos, busca por DNI; si no, por nombre
    const isDni = /^\d+$/.test(term);
    const filter = isDni ? { dni: term } : { full_name: term };

    this.patientService.getPatientsFiltered(filter).subscribe({
      next: (patients) => {
        this.patients = patients || [];
      },
      error: () => {
        this.patients = [];
      },
    });
  }

  selectPatient(patient: PatientModel) {
    this.selectedPatient = patient;

    this.searchTerm = `${patient.name} ${patient.last_name} (${patient.dni})`;
    this.patients = [];
    sessionStorage.setItem('selectedPatient', JSON.stringify(patient)); // <-- Guardar
    this.loadEvaluaciones();
  }

  clearSelectedPatient() {
    this.selectedPatient = null;
    this.evaluaciones = [];
    this.searchTerm = '';
    sessionStorage.removeItem('selectedPatient'); // <-- Limpiar
  }

  loadEvaluaciones() {
    if (!this.selectedPatient) return;
    this.loading = true;
    this.service
      .getEvaluationsFiltered({ dni: this.selectedPatient.dni })
      .subscribe({
        next: (res: any) => {
          this.evaluaciones = res.items || res;
          this.loading = false;
        },
        error: () => {
          this.snackbar.show('Error al cargar evaluaciones', 'error');
          this.loading = false;
        },
      });
  }

  openCreateOverlay() {
    const ref = this.overlay.open(CreateEvaluationModalComponent);
    const instance = ref.instance as CreateEvaluationModalComponent;

    // Preselecciona el paciente actual
    if (this.selectedPatient) {
      instance.form.patchValue({ dni: this.selectedPatient.dni });
      instance.patientSelected = this.selectedPatient;
    }

    instance.created.subscribe(({ dni, modality }) => {
      this.loading = true;
      // si mas e una evaluacion en el mismo dia del mismo tipo , lanzar error
      if (
        this.evaluaciones.some(
          (e) =>
            e.modality === modality &&
            e.created_at &&
            new Date(e.created_at).toDateString() === new Date().toDateString()
        )
      ) {
        this.snackbar.show(
          'Ya existe una evaluación de este tipo hoy',
          'error'
        );
        this.overlay.close();
        this.loading = false;
        return;
      }
      this.patientService.getPatientsByDni(dni).subscribe((patient) => {
        if (patient && patient.id) {
          this.service
            .createEvaluationOfPatient(patient.id, { modality })
            .subscribe({
              next: () => {
                this.snackbar.show('Evaluación creada', 'success');
                this.overlay.close();
                this.loadEvaluaciones();
              },
              error: () => {
                this.snackbar.show('Error al crear evaluación', 'error');
                this.overlay.close();
                this.loading = false;
              },
            });
        } else {
          this.snackbar.show('Paciente no encontrado', 'warning');
          this.overlay.close();
          this.loading = false;
        }
      });
    });

    instance.cancelled.subscribe(() => this.overlay.close());
  }

  totalPages() {
    return Math.ceil(this.total / this.pageSize) || 1;
  }

  eliminarEvaluacion(id: number | undefined) {
    if (!id) {
      this.snackbar.show('ID de evaluación no válido', 'error');
      return;
    }
    if (confirm('¿Seguro que deseas eliminar esta evaluación?')) {
      this.service.deleteEvaluation(id).subscribe({
        next: () => {
          this.snackbar.show('Evaluación eliminada correctamente', 'success');
          this.loadEvaluaciones();
        },
        error: () => {
          this.snackbar.show('Error al eliminar la evaluación', 'error');
        },
      });
    }
  }

  mapresult(evalucion: EvaluationModel) {
    if (!evalucion) return;
    if (evalucion.model_classification == 'MCI + DEMENTIA') {
      return 'Deterioro cognitivo leve o demencia';
    }
    if (evalucion.model_classification == 'MCI') {
      return 'Deterioro cognitivo leve';
    }
    if (evalucion.model_classification == 'DEMENTIA') {
      return 'Demencia';
    }
    if (evalucion.model_classification == 'Moderate Dementia') {
      return 'Demencia moderada';
    }
    if (evalucion.model_classification == 'Mild Dementia') {
      return 'Demencia leve';
    }
    if (evalucion.model_classification == 'Severe Dementia') {
      return 'Demencia severa';
    }
    if (evalucion.model_classification == 'Normal') {
      return 'Normal';
    }
    if (
      evalucion.model_classification == null ||
      evalucion.model_classification === undefined
    ) {
      return 'Sin clasificar';
    }
    return '';
  }

  mapModality(modality: string | undefined) {
    if (!modality) return 'Sin modalidad';
    if (modality.toLowerCase() === 'cnn') {
      return 'Resonancia Magnética';
    } else if (modality.toLowerCase() === 'rf') {
      return 'Datos Clínicos';
    }
    return modality;
  }

  isoUtcToLocalString(isoDate: string): string {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    // Opcional: puedes ajustar el formato según tus necesidades
    const local = this.convertUTCDateToLocalDate(date);
    return local.toLocaleString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  convertUTCDateToLocalDate(date: Date): Date {
    var newDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60 * 1000
    );

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
  }
}
