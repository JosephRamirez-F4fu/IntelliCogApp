import { Route } from '@angular/router';
import { Dashboard } from './dashboard';
import { Home } from './pages/home/home';
import { PatientManagement } from './pages/patient-management/patient-management';
import { ClinicalData } from './pages/clinical-data/clinical-data';
import { Classification } from './pages/classification/classification';
import { Reports } from './pages/reports/reports';
import { UsageGuide } from './pages/usage-guide/usage-guide';
import { TechnicalSupport } from './pages/technical-support/technical-support';

export const routes: Route[] = [
  {
    path: '',
    component: Dashboard,
    children: [
      { path: '', component: Home, pathMatch: 'full' },
      { path: 'gestion-pacientes', component: PatientManagement, pathMatch: 'full' },
      { path: 'datos-clinicos', component: ClinicalData, pathMatch: 'full' },
      { path: 'clasificacion', component: Classification, pathMatch: 'full' },
      { path: 'reportes', component: Reports, pathMatch: 'full' },
      { path: 'guia-de-uso', component: UsageGuide, pathMatch: 'full' },
      { path: 'soporte', component: TechnicalSupport, pathMatch: 'full' },
      { path: '**', redirectTo: '' },
    ]
  }
];

export default routes;
