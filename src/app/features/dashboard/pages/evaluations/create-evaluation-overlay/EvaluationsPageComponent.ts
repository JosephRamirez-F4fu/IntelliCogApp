import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '@core/services/snackbar-service';
import {
  PatientManagementService,
  PatientModel,
} from 'app/features/dashboard/services/patient-management.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-create-evaluation-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="modal-form">
      <h3>Crear Evaluación</h3>
      <div class="dni-row input-icon-group" *ngIf="!searchByName">
        <input
          formControlName="dni"
          placeholder="DNI del paciente"
          class="input-with-icon"
          autocomplete="off"
        />
        <button
          type="button"
          class="icon-btn"
          (click)="toggleNameSearch()"
          title="Buscar por nombre"
          tabindex="-1"
        >
          <span class="material-icons">buscar</span>
        </button>
      </div>
      <div *ngIf="searchByName" class="name-search">
        <form
          [formGroup]="formNameSearch"
          class="name-search-form"
          (submit)="$event.preventDefault()"
        >
          <input
            formControlName="full_name"
            placeholder="Nombre completo"
            autocomplete="off"
          />
          <button
            type="button"
            class="btn small cancel"
            (click)="toggleNameSearch()"
          >
            Cerrar
          </button>
        </form>
        <div *ngIf="patients.length > 0" class="patients-list">
          <div
            class="patient-item"
            *ngFor="let patient of patients"
            (click)="selectPatient(patient)"
            [class.selected]="patientSelected?.dni === patient.dni"
          >
            {{ patient.name }} {{ patient.last_name }} ({{ patient.dni }})
          </div>
        </div>
      </div>
      <select formControlName="modality">
        <option value="RF">Datos Clinicos</option>
        <option value="CNN">Resonancia Magnética</option>
      </select>
      <div class="modal-actions">
        <button type="submit" [disabled]="form.invalid">Crear</button>
        <button type="button" (click)="cancel()">Cancelar</button>
      </div>
    </form>
  `,
  styleUrls: ['./create-evaluation.css'],
})
export class CreateEvaluationModalComponent {
  @Output() created = new EventEmitter<{ dni: string; modality: string }>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  formNameSearch: FormGroup;
  patients: PatientModel[] = [];
  patientSelected: PatientModel | null = null;
  searchByName = false;

  constructor(
    private fb: FormBuilder,
    private snackbar: SnackbarService,
    private patiente_service: PatientManagementService
  ) {
    this.form = this.fb.group({
      dni: ['', Validators.required],
      modality: ['RF', Validators.required],
    });
    this.formNameSearch = this.fb.group({
      full_name: [''],
    });
  }

  toggleNameSearch() {
    this.searchByName = !this.searchByName;
    this.patients = [];
    this.patientSelected = null;
    this.formNameSearch.reset();

    // Deshabilita o habilita el input de DNI
    if (this.searchByName) {
      this.form.get('dni')?.disable();
      // Suscribe búsqueda reactiva
      this.formNameSearch
        .get('full_name')
        ?.valueChanges.pipe(debounceTime(350), distinctUntilChanged())
        .subscribe((fullName: string) => {
          this.searchByPatientName(fullName);
        });
    } else {
      this.form.get('dni')?.enable();
    }
  }

  selectPatient(patient: PatientModel) {
    this.patientSelected = patient;
    this.form.patchValue({ dni: patient.dni });
    this.searchByName = false;
    this.form.get('dni')?.enable();
    this.snackbar.show(
      'Paciente seleccionado: ' + patient.name + ' ' + patient.last_name,
      'info',
      2000
    );
  }

  submit() {
    const dni = this.form.value.dni.trim();
    if (dni === '') {
      this.snackbar.show('El DNI no puede estar vacío.', 'error', 3000);
      return;
    }
    this.patiente_service.getPatientsByDni(dni).subscribe({
      next: (patient) => {
        if (!patient) {
          this.snackbar.show('Paciente no encontrado.', 'error', 3000);
          return;
        }
        this.created.emit(this.form.value);
      },
      error: (err) => {
        this.snackbar.show('Error al buscar el paciente.', 'error', 3000);
      },
    });
  }

  // Ahora recibe el valor directamente
  searchByPatientName(fullName: string) {
    fullName = (fullName || '').trim();
    if (fullName === '') {
      this.patients = [];
      return;
    }
    this.patiente_service
      .getPatientsFiltered({ full_name: fullName })
      .subscribe({
        next: (patients) => {
          if (!patients || patients.length === 0) {
            this.patients = [];
            return;
          }
          this.patients = patients;
        },
        error: (err) => {
          this.snackbar.show('Error al buscar pacientes.', 'error', 3000);
        },
      });
  }

  cancel() {
    this.cancelled.emit();
  }
}
