import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-create-evaluation-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./create-evaluation.css'],
  template: `
    <div class="modal-form">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="modal-header">
          <div class="modal-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 3h6l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm6 3v3h3"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 11v6m-3-3h6"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div>
            <h3>Crear evaluación</h3>
            <p class="modal-subtitle">
              Completa los datos para registrar una nueva evaluación.
            </p>
          </div>
        </div>

        <div class="form-field">
          <label for="dniInput">DNI del paciente</label>
          <div class="dni-row input-icon-group" *ngIf="!searchByName">
            <input
              id="dniInput"
              formControlName="dni"
              placeholder="Ingresa el DNI"
              class="input-with-icon"
              autocomplete="off"
            />
            <button
              type="button"
              class="icon-btn"
              (click)="toggleNameSearch()"
              title="Buscar por nombre"
              tabindex="-1"
              aria-label="Buscar paciente por nombre"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="6"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
                <path
                  d="m16.5 16.5 3.5 3.5"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
          <div *ngIf="searchByName" class="name-search">
            <div [formGroup]="formNameSearch" class="name-search-form">
              <input
                formControlName="full_name"
                placeholder="Nombre completo"
                autocomplete="off"
              />
              <button
                type="button"
                class="btn chip"
                (click)="toggleNameSearch()"
              >
                Cerrar búsqueda
              </button>
            </div>
            <p class="hint">
              Selecciona un paciente para completar el DNI automáticamente.
            </p>
            <div *ngIf="patients.length > 0" class="patients-list">
              <div
                class="patient-item"
                *ngFor="let patient of patients"
                (click)="selectPatient(patient)"
                [class.selected]="patientSelected?.dni === patient.dni"
              >
                <span class="patient-name"
                  >{{ patient.name }} {{ patient.last_name }}</span
                >
                <span class="patient-dni">{{ patient.dni }}</span>
              </div>
            </div>
            <p
              class="empty"
              *ngIf="
                patients.length === 0 &&
                (formNameSearch.get('full_name')?.value || '').length < 3
              "
            >
              Ingresa al menos tres letras para buscar coincidencias.
            </p>
            <p
              class="empty"
              *ngIf="
                patients.length === 0 &&
                (formNameSearch.get('full_name')?.value || '').length >= 3
              "
            >
              No se encontraron pacientes con ese nombre.
            </p>
          </div>
        </div>

        <div class="form-field">
          <label for="modalitySelect">Modalidad</label>
          <select id="modalitySelect" formControlName="modality">
            <option value="RF">Datos Clínicos</option>
            <option value="CNN">Resonancia Magnética</option>
          </select>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn ghost" (click)="cancel()">
            Cancelar
          </button>
          <button type="submit" class="btn primary" [disabled]="form.invalid">
            Crear evaluación
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CreateEvaluationModalComponent implements OnDestroy {
  @Output() created = new EventEmitter<{ dni: string; modality: string }>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  formNameSearch: FormGroup;
  patients: PatientModel[] = [];
  patientSelected: PatientModel | null = null;
  searchByName = false;
  private nameSearchSubscription?: Subscription;

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

    this.nameSearchSubscription?.unsubscribe();

    if (this.searchByName) {
      this.form.get('dni')?.disable();
      this.nameSearchSubscription = this.formNameSearch
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
    this.nameSearchSubscription?.unsubscribe();
    this.snackbar.show(
      'Paciente seleccionado: ' + patient.name + ' ' + patient.last_name,
      'info',
      2000
    );
  }

  submit() {
    const dniControl = this.form.get('dni');
    const dni = (dniControl?.value || '').trim();
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
        this.created.emit(this.form.getRawValue());
      },
      error: () => {
        this.snackbar.show('Error al buscar el paciente.', 'error', 3000);
      },
    });
  }

  searchByPatientName(fullName: string) {
    fullName = (fullName || '').trim();
    if (fullName.length < 3) {
      this.patients = [];
      return;
    }
    this.patiente_service
      .getPatientsFiltered({ full_name: fullName })
      .subscribe({
        next: (patients) => {
          this.patients = patients || [];
        },
        error: () => {
          this.snackbar.show('Error al buscar pacientes.', 'error', 3000);
        },
      });
  }

  cancel() {
    this.nameSearchSubscription?.unsubscribe();
    this.form.get('dni')?.enable();
    this.searchByName = false;
    this.cancelled.emit();
  }

  ngOnDestroy(): void {
    this.nameSearchSubscription?.unsubscribe();
  }
}
