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

import ChartDataLabels from 'chartjs-plugin-datalabels';

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
  Legend,
  ChartDataLabels
);

@Component({
  selector: 'app-anailisis-results',
  templateUrl: 'anailisis-results.html',
  styleUrls: ['anailisis-results.css'],
  standalone: true,
  imports: [BaseChartDirective, CommonModule, FormsModule],
  providers: [EvaluationsService, PatientManagementService],
})
export class AnailisisResults implements OnInit {
  // Filtros
  patients: PatientModel[] = [];
  selectedPatient: PatientModel | null = null;
  sex: string = '';
  modality: string = '';
  minAge: number | null = null;
  maxAge: number | null = null;

  // Datos para el gráfico
  evaluations: EvaluationModel[] = [];

  // Configuración Chart.js
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };
  barChartLabels: string[] = [];
  barChartType: ChartType = 'bar';
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Cantidad de Evaluaciones',
        backgroundColor: '#5a67d8',
      },
    ],
  };

  pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
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

  pieChartOptions = {
    responsive: true,
    plugins: {
      datalabels: {
        color: '#222',
        font: { weight: 'bold' as 'bold', size: 15 },
        formatter: (value: number, context: any) => {
          const data = context.chart.data.datasets[0].data;
          const total = data.reduce((a: number, b: number) => a + b, 0);
          const percentage = total ? (value / total) * 100 : 0;
          return percentage ? percentage.toFixed(1) + '%' : '';
        },
      },
      legend: {
        display: true,
        position: 'top' as 'top',
      },
    },
  };
  ChartDataLabels = ChartDataLabels;

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Evaluaciones en el tiempo',
        fill: false,
        borderColor: '#5a67d8',
        tension: 0.3,
      },
    ],
  };
  constructor(
    private evalService: EvaluationsService,
    private patientService: PatientManagementService
  ) {}

  ngOnInit(): void {
    const saved = sessionStorage.getItem('selectedPatient');
    if (saved) {
      this.selectedPatient = JSON.parse(saved);
      if (!this.selectedPatient || !this.selectedPatient.dni) {
        this.clearSelectedPatient();
      } else {
        this.patientSearch = `${this.selectedPatient.name} ${this.selectedPatient.last_name} (${this.selectedPatient.dni})`;
        this.onFilterChange();
      }
    }
    this.loadPatients();
    this.loadEvaluations();
  }

  loadPatients() {
    this.patientService.getPatients().subscribe((patients) => {
      this.patients = patients;
    });
  }

  loadEvaluations() {
    // Construir filtros
    const params: any = {};
    if (this.selectedPatient) params.dni = this.selectedPatient.dni;
    if (this.sex) params.sex = this.sex;
    if (this.modality) params.modality = this.modality;

    this.evalService.getEvaluationsFiltered(params).subscribe((res: any) => {
      this.evaluations = res.items || res;
      // Filtrar por edad si corresponde
      if (this.minAge !== null || this.maxAge !== null) {
        this.evaluations = this.evaluations.filter((ev) => {
          const age = ev.patient?.age;
          if (age === undefined) return false;
          if (this.minAge !== null && age < this.minAge) return false;
          if (this.maxAge !== null && age > this.maxAge) return false;

          return true;
        });
      }
      if (this.sex) {
        this.evaluations = this.evaluations.filter(
          (ev) => ev.patient?.sex === this.sex
        );
      }
      this.updateChart();
    });
  }

  updateChart() {
    // Barras y Pie: cantidad de evaluaciones por tipo de resultado
    const resultCount: { [key: string]: number } = {};
    for (const ev of this.evaluations) {
      const key = ev.model_classification || 'Sin clasificar';
      resultCount[key] = (resultCount[key] || 0) + 1;
    }
    const labels = Object.keys(resultCount);
    const data = Object.values(resultCount);

    this.barChartData = {
      labels,
      datasets: [
        { data, label: 'Cantidad de Evaluaciones', backgroundColor: '#5a67d8' },
      ],
    };

    this.pieChartData = {
      labels,
      datasets: [
        {
          data,
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

    // Línea: evaluaciones por fecha (ejemplo simple)
    const dateCount: { [date: string]: number } = {};
    for (const ev of this.evaluations) {
      const date = ev.created_at ? ev.created_at.slice(0, 10) : 'Sin fecha';
      dateCount[date] = (dateCount[date] || 0) + 1;
    }
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

  onFilterChange() {
    this.loadEvaluations();
  }

  patientSearch: string = '';
  filteredPatients: PatientModel[] = [];

  // Buscar pacientes por nombre o DNI
  onPatientSearch() {
    const term = this.patientSearch.trim();
    if (term.length < 3) {
      this.filteredPatients = [];
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
    sessionStorage.setItem('selectedPatient', JSON.stringify(patient));
    this.loadEvaluations();
  }

  clearSelectedPatient() {
    this.selectedPatient = null;
    this.patientSearch = '';
    this.evaluations = [];
    this.filteredPatients = [];
    sessionStorage.removeItem('selectedPatient');
    this.loadEvaluations();
  }
}
