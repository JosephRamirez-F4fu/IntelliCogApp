import { Route } from '@angular/router';
import { Dashboard } from './dashboard';
import { Home } from './pages/home/home';
import { PatientManagement } from './pages/patient-management/patient-management';
import { UsageGuide } from './pages/usage-guide/usage-guide';
import { TechnicalSupport } from './pages/technical-support/technical-support';
import { EvaluationsPageComponent } from './pages/evaluations/evaluations.component';
import { EvaluationDetailPageComponent } from './pages/evaluation-detail/EvaluationDetailPage.component';
import { Reports } from './pages/reports';
import { AnailisisResults } from './pages/anilisis-results/anailisis-results';

export const routes: Route[] = [
  {
    path: '',
    component: Dashboard,
    children: [
      { path: '', component: Home, pathMatch: 'full' },
      {
        path: 'gestion-pacientes',
        component: PatientManagement,
        pathMatch: 'full',
      },
      {
        path: 'evaluaciones',
        component: EvaluationsPageComponent,
      },
      {
        path: 'evaluaciones/:id',
        component: EvaluationDetailPageComponent,
      },
      { path: 'guia-de-uso', component: UsageGuide, pathMatch: 'full' },
      { path: 'reportes', pathMatch: 'full', component: Reports },
      {
        path: 'analisis-resultados',
        pathMatch: 'full',
        component: AnailisisResults,
      },
      { path: 'soporte', component: TechnicalSupport, pathMatch: 'full' },
    ],
  },
];

export default routes;
