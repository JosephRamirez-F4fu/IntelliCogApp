import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  EvaluationsService,
  EvaluationModel,
  ClinicDataModel,
  ClinicResultsModel,
} from '../../services/evaluations-service';
import { ModelService } from '../../services/model-service';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '@core/services/snackbar-service';
import {
  PatientManagementService,
  PatientModel,
} from '../../services/patient-management.service';

@Component({
  selector: 'app-evaluation-detail-page',
  templateUrl: 'evaluationDetailPage.component.html',
  styleUrls: ['evaluationDetail.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [EvaluationsService, ModelService, PatientManagementService],
})
export class EvaluationDetailPageComponent implements OnInit {
  evaluacionId!: number;
  evaluacion!: EvaluationModel;
  notaClinica!: ClinicResultsModel;
  patient!: PatientModel;
  imagenUrl?: string;
  tieneImagenMRI = false;
  loading = false;
  errorMsg = '';

  manualForm!: FormGroup;
  clinicForm!: FormGroup;
  notaForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private service: EvaluationsService,
    private modelService: ModelService,
    private patientService: PatientManagementService,
    private router: Router,
    private snackbar: SnackbarService
  ) {}

  ngOnInit() {
    this.evaluacionId = +this.route.snapshot.paramMap.get('id')!;

    this.manualForm = this.fb.group({
      manual_classification: [''],
    });

    this.clinicForm = this.fb.group({
      adl: [null],
      potassium: [null],
      berg: [null],
      vitamin_d: [null],
      vit_b12: [null],
      stress: [false],
    });

    this.notaForm = this.fb.group({
      description: [''],
    });

    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.errorMsg = '';

    this.service.getEvaluation(this.evaluacionId).subscribe({
      next: (res) => {
        this.evaluacion = res;
        this.manualForm.patchValue({
          manual_classification: res.manual_classification,
        });

        if (res.modality == 'CNN') {
          this.service.getMriImageByEvaluation(this.evaluacionId).subscribe({
            next: (image) => {
              if (image) {
                this.imagenUrl = image.url;
                this.tieneImagenMRI = true;
                this.snackbar.show('Imagen MRI cargada', 'success', 3000);
              } else {
                this.imagenUrl = undefined;
                this.tieneImagenMRI = false;
              }
            },
          });
        } else {
          this.imagenUrl = undefined;
          this.tieneImagenMRI = false;
        }
        if (res.modality == 'RF') {
          this.service.getClinicDataByEvaluation(this.evaluacionId).subscribe({
            next: (data: ClinicDataModel) => {
              if (data) {
                this.clinicForm.patchValue({
                  adl: data.adl,
                  vit_b12: data.vit_b12,
                  berg: data.berg,
                  vitamin_d: data.vitamin_d,
                  potassium: data.potassium,
                  stress: data.stress,
                });
                this.snackbar.show('Datos clínicos cargados', 'success', 3000);
              } else {
                this.clinicForm.reset();
              }
            },
            error: () => {},
          });
        }
        this.patientService
          .getPatient(this.evaluacion.patient_id || 0)
          .subscribe({
            next: (patient) => {
              this.patient = patient;
            },
            error: () => {},
          });
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'No se pudo cargar la evaluación.';
        this.loading = false;
      },
    });

    this.service.getClinicResultsByEvaluation(this.evaluacionId).subscribe({
      next: (data) => {
        if (data) {
          this.notaClinica = data;
          this.notaForm.patchValue({
            description: data.description,
          });
        } else {
          this.notaForm.reset();
        }
      },
      error: () => {},
    });
  }

  guardarCambios() {
    if (!this.evaluacion) return;
    const data: EvaluationModel = {
      ...this.evaluacion,
      manual_classification: this.manualForm.value.manual_classification,
    };
    this.loading = true;
    this.service.updateEvalution(this.evaluacionId, data).subscribe({
      next: () => {
        this.loading = false;
        this.snackbar.show('Evaluación actualizada', 'success', 3000);
      },
      error: () => {
        this.loading = false;
        this.snackbar.show('Error al actualizar evaluación', 'error', 3000);
      },
    });
  }

  cargarImagen(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.loading = true;

    const obs = this.tieneImagenMRI
      ? this.service.updateMriImage(this.evaluacionId, file)
      : this.service.createMriImage(this.evaluacionId, file);

    obs.subscribe({
      next: () => {
        this.imagenUrl = URL.createObjectURL(file);
        this.tieneImagenMRI = true;
        this.loading = false;
        this.snackbar.show('Imagen MRI guardada', 'success', 3000);
      },
      error: () => {
        this.loading = false;
        this.snackbar.show('Error al guardar imagen MRI', 'error', 3000);
      },
    });
  }

  guardarDatosClinicos() {
    this.loading = true;
    // Primero intentamos obtener los datos clínicos
    this.service.getClinicDataByEvaluation(this.evaluacionId).subscribe({
      next: (data) => {
        if (data) {
          // Si existen, actualizamos
          this.service
            .updateClinicData(this.evaluacionId, this.clinicForm.value)
            .subscribe({
              next: () => {
                this.loading = false;
                this.snackbar.show(
                  'Datos clínicos actualizados',
                  'success',
                  3000
                );
              },
              error: () => {
                this.loading = false;
                this.snackbar.show(
                  'Error al actualizar datos clínicos',
                  'error',
                  3000
                );
              },
            });
        } else {
          // Si no existen, los creamos
          this.service
            .createClinicData(this.evaluacionId, this.clinicForm.value)
            .subscribe({
              next: () => {
                this.loading = false;
                this.snackbar.show('Datos clínicos guardados', 'success', 3000);
              },
              error: () => {
                this.loading = false;
                this.snackbar.show(
                  'Error al guardar datos clínicos',
                  'error',
                  3000
                );
              },
            });
        }
      },
      error: () => {},
    });
  }

  guardarNota() {
    this.loading = true;
    if (this.notaClinica) {
      // Si ya existe una nota clínica, la actualizamos
      console.log(this.notaForm.value);
      this.service
        .updateClinicResults(this.evaluacionId, this.notaForm.value)
        .subscribe({
          next: () => {
            this.loading = false;
            this.snackbar.show('Nota clínica actualizada', 'success', 3000);
          },
          error: () => {
            this.loading = false;
            this.snackbar.show(
              'Error al actualizar nota clínica',
              'error',
              3000
            );
          },
        });
      return;
    }
    this.service
      .createClinicResults(this.evaluacionId, this.notaForm.value)
      .subscribe({
        next: () => {
          this.loading = false;
          this.snackbar.show('Nota clínica guardada', 'success', 3000);
        },
        error: () => {
          this.loading = false;
          this.snackbar.show('Error al guardar nota clínica', 'error', 3000);
        },
      });
  }

  ejecutarModelo() {
    const datos = this.evaluacionId;
    this.loading = true;
    const obs =
      this.evaluacion.modality?.toLowerCase() === 'cnn'
        ? this.modelService.runCnnEvaluation(datos)
        : this.modelService.runRandomForestEvaluation(datos);

    obs.subscribe({
      next: (res) => {
        this.evaluacion.model_classification = res.model_classification;
        this.evaluacion.model_probability = res.model_probability;
        this.loading = false;
        this.snackbar.show('Modelo ejecutado correctamente', 'success', 3000);
      },
      error: () => {
        this.loading = false;
        this.snackbar.show('Error al ejecutar el modelo', 'error', 3000);
      },
    });
  }

  mapresult(evalucion: EvaluationModel) {
    if (!evalucion) return '';
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
    return '';
  }
  guardarTodo() {
    this.loading = true;
    const ops: Promise<any>[] = [];

    // Guardar clasificación manual
    if (this.manualForm.value.manual_classification) {
      const data = {
        ...this.evaluacion,
        manual_classification: this.manualForm.value.manual_classification,
      };
      ops.push(
        this.service.updateEvalution(this.evaluacionId, data).toPromise()
      );
    }

    // Guardar datos clínicos si es RF
    if (this.evaluacion.modality === 'RF') {
      console.log('datos clnicos');
      ops.push(
        this.service
          .updateClinicData(this.evaluacionId, this.clinicForm.value)
          .toPromise()
      );
    }

    console.log('nota clinica', this.notaForm.value);
    // Guardar nota clínica
    const notaPromise = new Promise((resolve, reject) => {
      this.loading = true;
      if (this.notaClinica) {
        this.service
          .updateClinicResults(this.evaluacionId, this.notaForm.value)
          .subscribe({
            next: () => resolve(true),
            error: () => reject(),
          });
      } else {
        this.service
          .createClinicResults(this.evaluacionId, this.notaForm.value)
          .subscribe({
            next: () => resolve(true),
            error: () => reject(),
          });
      }
    });
    ops.push(notaPromise);

    Promise.all(ops)
      .then(() => {
        this.loading = false;
        this.snackbar.show('Datos guardados correctamente', 'success', 3000);
      })
      .catch(() => {
        this.loading = false;
        this.snackbar.show('Error al guardar datos', 'error', 3000);
      });
  }

  salir() {
    // Redirige a la página de información del paciente
    this.router.navigate(['/dashboard/pacientes']);
  }
}
