import { Component, OnInit } from '@angular/core';
import {
  EvaluationModel,
  EvaluationsService,
} from '../../services/evaluations-service';
import {
  PatientManagementService,
  PatientModel,
} from '../../services/patient-management.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '@core/services/snackbar-service';

@Component({
  selector: 'app-reports',
  templateUrl: './index.html',
  styleUrls: ['./style.css'],
  providers: [EvaluationsService, PatientManagementService,SnackbarService],
  imports: [CommonModule, FormsModule],
})
export class Reports implements OnInit {
  patientSearch = '';
  filteredPatients: PatientModel[] = [];
  selectedPatient: PatientModel | null = null;
  evaluations: EvaluationModel[] = [];
  loading = false;
  emailToSend = '';
  sending = false;

  constructor(
    private evalService: EvaluationsService,
    private patientService: PatientManagementService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {}

  onPatientSearch() {
    const term = this.patientSearch.trim();
    if (term.length < 3) {
      this.filteredPatients = [];
            if (term.length > 0) {
        this.snackbar.show('Escribe al menos 3 caracteres para buscar.', 'warning');
      }
      
      return;
    }
    const isDni = /^\d+$/.test(term);
    const filter = isDni ? { dni: term } : { full_name: term };
    this.patientService.getPatientsFiltered(filter).subscribe((patients) => {
      this.filteredPatients = patients || [];
    });
  }

  selectPatient(patient: PatientModel) {
    this.selectedPatient = patient;
    this.patientSearch = `${patient.name} ${patient.last_name} (${patient.dni})`;
    this.filteredPatients = [];
    this.loadEvaluations();
  }

  clearSelectedPatient() {
    this.selectedPatient = null;
    this.patientSearch = '';
    this.evaluations = [];
    this.filteredPatients = [];
  }

  loadEvaluations() {
    if (!this.selectedPatient) return;
    this.loading = true;
    this.evalService
      .getEvaluationsFiltered({ dni: this.selectedPatient.dni })
      .subscribe({
        next: (res: any) => {
          this.evaluations = res.items || res;
          this.loading = false;
        },
        error: () => {
          this.evaluations = [];
          this.loading = false;
        },
      });
  }

  downloadAll() {
    if (!this.selectedPatient) return;
    this.evalService
      .downloadPatientEvaluationPdf(this.selectedPatient.id!)
      .subscribe((blob) => {
        this.saveBlob(
          blob,
          `historial_paciente_${this.selectedPatient?.dni}.pdf`
        );
      });
  }

  downloadOne(evaluation: EvaluationModel) {
    if (!this.selectedPatient || !evaluation.id) return;
    this.evalService
      .downloadPatientEvaluationPdf(this.selectedPatient.id!, evaluation.id)
      .subscribe((blob) => {
        this.saveBlob(blob, `evaluacion_${evaluation.id}.pdf`);
      });
  }

 sendAllByEmail() {
    if (!this.selectedPatient) {
      this.snackbar.show('Selecciona un paciente.', 'error');
      return;
    }
    if (!this.emailToSend ) {
      this.snackbar.show('Introduce un correo válido.', 'error');
      return;
    }
    if (!this.evaluations.length) {
      this.snackbar.show('No hay evaluaciones para enviar.', 'info');
      return;
    }
    this.sending = true;
    this.evalService
      .sendPatientEvaluationPdfByEmail(
        this.selectedPatient.id!,
        null,
        this.emailToSend
      )
      .subscribe({
        next: () => {
          this.snackbar.show('PDF enviado correctamente.', 'success');
          this.sending = false;
        },
        error: () => {
          this.snackbar.show('Error al enviar PDF.', 'error');
          this.sending = false;
        },
      });
  }

  sendOneByEmail(evaluation: EvaluationModel) {
    if (!this.selectedPatient || !evaluation.id) {
      this.snackbar.show('Selecciona un paciente y evaluación.', 'error');
      return;
    }
    if (!this.emailToSend ) {
      this.snackbar.show('Introduce un correo válido.', 'error');
      return;
    }
    this.sending = true;
    this.evalService
      .sendPatientEvaluationPdfByEmail(
        this.selectedPatient.id!,
        evaluation.id,
        this.emailToSend
      )
      .subscribe({
        next: () => {
          this.snackbar.show('PDF enviado correctamente.', 'success');
          this.sending = false;
        },
        error: () => {
          this.snackbar.show('Error al enviar PDF.', 'error');
          this.sending = false;
        },
      });
  }

  saveBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
    
}
