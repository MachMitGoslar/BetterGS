import { Routes } from '@angular/router';
import { loginGuard } from './core/guards/login.guard';


export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tabs',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [loginGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./singlePages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./singlePages/signup/signup.component').then((m) => m.SignupComponent),
  },
          {
        path: 'tracking/:activityId',
        loadComponent: () =>
          import('./singlePages/tracking/tracking.component').then((m) => m.TrackingComponent),
      },
];
