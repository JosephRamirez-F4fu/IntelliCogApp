import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { Landing } from './features/landing/landing';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: 'recover-password',
    loadComponent: () =>
      import('./features/auth/pages/recover-password').then(
        (m) => m.RecoverPassword
      ),
  },
  {
    path: 'send-code',
    loadComponent: () =>
      import('./features/auth/pages/send-code').then((m) => m.SendCode),
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./features/auth/pages/change-password').then(
        (m) => m.ChangePassword
      ),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes'),
  },
  { path: '**', redirectTo: 'login' },
];
