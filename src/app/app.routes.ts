import { Routes } from '@angular/router';
import { Login } from './features/auth/login';
import { Register } from './features/auth/register';

export const routes: Routes = [
  { path: 'login',  component: Login },
  { path: 'register', component: Register },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes'),
  },
  { path: '**', redirectTo: 'login' },
];
