import { Routes } from '@angular/router';
import { loginGuard } from './core/guards/login.guard';
import { requireOnboardingGuard } from './core/guards/require-onboarding.guard';


export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tabs',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [loginGuard, requireOnboardingGuard]
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
    path: 'onboarding',
    loadComponent: () => import('./singlePages/onboarding/onboarding.component').then((m) => m.OnboardingComponent),
  },
  {
    path: 'tracking/:activityId',
    loadComponent: () =>
      import('./singlePages/tracking/tracking.component').then((m) => m.TrackingComponent),
  },
];
