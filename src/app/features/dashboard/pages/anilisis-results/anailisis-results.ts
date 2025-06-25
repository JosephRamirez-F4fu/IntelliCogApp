import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  EvaluationsService,
  EvaluationModel,
} from '../../services/evaluations-service';
import {
  PatientManagementService,
  PatientModel,
} from '../../services/patient-management.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { SnackbarService } from '@core/services/snackbar-service';
import { debounceTime, Subject } from 'rxjs';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-analisis-results',
  templateUrl: './anailisis-results.html',
  styleUrls: ['./anailisis-results.css'],
  standalone: true,
  imports: [BaseChartDirective, CommonModule, FormsModule],
  providers: [EvaluationsService, PatientManagementService, SnackbarService],
})
export class AnailisisResults implements OnInit {
  patients: PatientModel[] = [];
  evaluations: EvaluationModel[] = [];

  selectedPatient: PatientModel | null = null;
  patientSearch: string = '';
  filteredPatients: PatientModel[] = [];

  sex: string = '';
  modality: string = '';
  minAge: number | null = null;
  maxAge: number | null = null;

  private searchSubject = new Subject<string>();

  barChartOptions: ChartConfiguration['options'] = { responsive: true };
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  pieChartData: ChartData<'pie', number[], string> = { labels: [], datasets: [] };
  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };

  constructor(
    private evalService: EvaluationsService,
    private patientService: PatientManagementService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.setupSearchListener();
    this.loadEvaluations();
  }

  private setupSearchListener() {
    this.searchSubject.pipe(debounceTime(300)).subscribe((term) => {
      this.searchPatients(term);
    });
  }

  onPatientSearch() {
    const term = this.patientSearch.trim();
    if (term.length < 3) {
      this.filteredPatients = [];
      if (term.length > 0) {
        this.snackbar.show('Escribe al menos 3 caracteres para buscar.', 'warning');
      }
      return;
    }
    this.searchSubject.next(term);
  }

  private searchPatients(term: string) {
    const isDni = /^\d+$/.test(term);
    const filter = isDni ? { dni: term } : { full_name: term };
    this.patientService.getPatientsFiltered(filter).subscribe((patients) => {
      this.filteredPatients = patients || [];
      if (this.filteredPatients.length === 0) {
        this.snackbar.show('No se encontraron pacientes.', 'info');
      }
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
    this.loadEvaluations();
  }

  loadPatients() {
    this.patientService.getPatients().subscribe((res) => {
      this.patients = res;
    });
  }

  loadEvaluations() {
    const params: any = {};
    if (this.selectedPatient) params.dni = this.selectedPatient.dni;
    if (this.sex) params.sex = this.sex;
    if (this.modality) params.modality = this.modality;

    this.evalService.getEvaluationsFiltered(params).subscribe({
      next: (res: any) => {
        this.evaluations = (res.items || res).filter((ev: EvaluationModel) => this.ageFilter(ev));
        this.updateCharts();
      },
      error: () => {
        this.snackbar.show('Error al cargar evaluaciones.', 'error');
      },
    });
  }

  private ageFilter(ev: EvaluationModel): boolean {
    const age = ev.patient?.age;
    if (age === undefined) return false;
    if (this.minAge !== null && age < this.minAge) return false;
    if (this.maxAge !== null && age > this.maxAge) return false;
    return true;
  }

  onFilterChange() {
    this.loadEvaluations();
  }

  private updateCharts() {
    const resultCount: { [key: string]: number } = {};
    const dateCount: { [date: string]: number } = {};

    for (const ev of this.evaluations) {
      const key = ev.model_classification || 'Sin clasificar';
      resultCount[key] = (resultCount[key] || 0) + 1;

      const date = ev.created_at ? ev.created_at.slice(0, 10) : 'Sin fecha';
      dateCount[date] = (dateCount[date] || 0) + 1;
    }

    const barLabels = Object.keys(resultCount);
    const barData = Object.values(resultCount);

    this.barChartData = {
      labels: barLabels,
      datasets: [
        {
          data: barData,
          label: 'Cantidad de Evaluaciones',
          backgroundColor: '#5a67d8',
        },
      ],
    };

    this.pieChartData = {
      labels: barLabels,
      datasets: [
        {
          data: barData,
          backgroundColor: [
            '#5a67d8',
            '#48bb78',
            '#f6ad55',
            '#e53e3e',
            '#a0aec0',
          ],
        },
      ],
    };

    const lineLabels = Object.keys(dateCount).sort();
    const lineData = lineLabels.map((l) => dateCount[l]);
    this.lineChartData = {
      labels: lineLabels,
      datasets: [
        {
          data: lineData,
          label: 'Evaluaciones en el tiempo',
          fill: false,
          borderColor: '#5a67d8',
          tension: 0.3,
        },
      ],
    };
  }

  trackByDni(index: number, item: PatientModel) {
    return item.dni;
  }
}
