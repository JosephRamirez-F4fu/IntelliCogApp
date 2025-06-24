import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { SnackbarService } from '@core/services/snackbar-service';
import {
  PatientManagementService,
  PatientModel,
} from '../../services/patient-management.service';
import { User, UserService } from '../../services/user-service';
import { Router, RouterModule } from '@angular/router';
import { UserLinkComponent } from '@components/user-link/user-link.component';
import { OverlayModalService } from '@components/overlay/overlay.service';
import { CreatePatientModalComponent } from './create-patient-overlay/component';

@Component({
  selector: 'app-patient-management',
  templateUrl: './patient-management.html',
  styleUrls: ['./patient-management.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    UserLinkComponent,
  ],
  providers: [PatientManagementService, UserService],
})
export class PatientManagement implements OnInit {
  patients: PatientModel[] = [];
  filteredPatientsList: PatientModel[] = [];
  filterName = '';
  filterDni = '';
  editingPatient: PatientModel | null = null;
  user!: User;

  constructor(
    private patientService: PatientManagementService,
    private snackbar: SnackbarService,
    private overlay: OverlayModalService,
    private router: Router // <-- Añade esto
  ) {}

  ngOnInit() {
    this.loadPatients();
  }

  goToHistorial(patient: PatientModel) {
    sessionStorage.setItem('selectedPatient', JSON.stringify(patient));
    this.router.navigate(['/dashboard/evaluaciones']);
  }

  editPatient(patient: PatientModel) {
    const ref = this.overlay.open(CreatePatientModalComponent);
    const instance = ref.instance as CreatePatientModalComponent;
    instance.patient = patient;

    instance.created.subscribe((patientData) => {
      this.patientService.updatePatient(patient.id!, patientData).subscribe({
        next: () => {
          this.snackbar.show('Paciente actualizado', 'success');
          this.overlay.close();
          this.loadPatients();
        },
        error: () => {
          this.snackbar.show('Error al actualizar paciente', 'error');
        },
      });
    });
    instance.cancelled.subscribe(() => this.overlay.close());
  }

  deletePatient(patient: PatientModel) {
    if (confirm('¿Seguro que deseas eliminar este paciente?')) {
      this.patientService.deletePatient(patient.id!).subscribe(() => {
        this.loadPatients();
      });
    }
  }

  page = 1;
  pageSize = 10;
  totalPatients = 0;

  applyFilters() {
    this.page = 1;
    this.loadPatients();
  }

  clearFilters() {
    this.filterName = '';
    this.filterDni = '';
    this.page = 1;
    this.loadPatients();
  }

  loadPatients() {
    const params = {
      full_name: this.filterName || undefined,
      dni: this.filterDni || undefined,
      skip: (this.page - 1) * this.pageSize,
      limit: this.pageSize,
    };
    this.patientService
      .getPatientsFiltered(params)
      .subscribe((patients: any) => {
        // Si tu backend retorna {items: [...], total: N}
        this.filteredPatientsList = patients.items || patients;
        this.totalPatients = patients.total || this.filteredPatientsList.length;
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadPatients();
  }

  totalPages() {
    return Math.ceil(this.totalPatients / this.pageSize) || 1;
  }

  openCreatePatientOverlay() {
    const ref = this.overlay.open(CreatePatientModalComponent);
    const instance = ref.instance as CreatePatientModalComponent;
    instance.created.subscribe((patientData) => {
      this.validatePatientForm(patientData);
      this.patientService.createPatient(patientData).subscribe({
        next: () => {
          this.snackbar.show('Paciente creado', 'success');
          this.overlay.close();
          this.loadPatients();
        },
        error: () => {
          this.snackbar.show('Error al crear paciente', 'error');
        },
      });
    });
    instance.cancelled.subscribe(() => this.overlay.close());
  }
  validatePatientForm(patient: any) {
    if (
      !patient.dni ||
      !patient.name ||
      !patient.last_name ||
      !patient.sex ||
      !patient.age ||
      !patient.age_education
    ) {
      this.snackbar.show('Todos los campos son requeridos.', 'error', 3000);
      return;
    }

    if (patient.dni.length != 8) {
      console.log('DNI válido:', patient.dni.length);
      this.snackbar.show(
        'El DNI es requerido y debe tener 8 caracteres.',
        'error',
        3000
      );
      return;
    }

    if (!patient.name || !patient.last_name) {
      this.snackbar.show('El nombre y apellido son requeridos.', 'error', 3000);
      return;
    }

    if (patient.age < 0 || patient.age > 105) {
      this.snackbar.show('La edad debe ser un valor válido.', 'error', 3000);
      return;
    }

    if (patient.age_education < 0 || patient.age_education > 105) {
      this.snackbar.show(
        'La edad de educación debe ser un valor válido.',
        'error',
        3000
      );
      return;
    }

    if (patient.sex !== 'MALE' && patient.sex !== 'FEMALE') {
      this.snackbar.show('El sexo debe ser definido', 'error', 3000);
      return;
    }
  }
}
