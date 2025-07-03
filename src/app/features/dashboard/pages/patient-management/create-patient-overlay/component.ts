import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientModel } from 'app/features/dashboard/services/patient-management.service';

@Component({
  selector: 'app-create-patient-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-patient-modal.component.html',
  styleUrls: ['./create-patient-modal.component.css'],
})
export class CreatePatientModalComponent {
  @Output() created = new EventEmitter<PatientModel>();
  @Output() cancelled = new EventEmitter<void>();
  @Input() patient?: any; // O usa PatientModel si tienes la interfaz

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      dni: ['', Validators.required],
      name: ['', Validators.required],
      last_name: ['', Validators.required],
      sex: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(0)]],
      age_education: [null, [Validators.min(0)]],
      hipertension: [false],
      // Agrega más comorbilidades aquí si lo necesitas
    });
  }
  ngOnInit() {
    if (this.patient) {
      this.form.patchValue({
        ...this.patient,
        hipertension: this.patient.comorbilites?.hipertension ?? false,
      });
    }
  }

  submit() {
    if (this.form.valid) {
      const { hipertension, ...rest } = this.form.value;
      this.created.emit({
        ...rest,
        comorbilites: { hipertension },
      } as PatientModel);
    }
  }

  cancel() {
    this.cancelled.emit();
  }
}
