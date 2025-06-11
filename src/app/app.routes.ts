import { Routes } from '@angular/router';
import { Login } from './features/auth/login';
import { Register } from './features/auth/register';
import { Landing } from './features/landing/landing';

export const routes: Routes = [
  { path: '',  component: Landing },
  { path: 'login',  component: Login },
  { path: 'register', component: Register },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes'),
  },
  { path: '**', redirectTo: 'login' }
];
