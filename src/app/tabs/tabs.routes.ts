import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { loginGuard } from '../core/guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    canActivateChild: [loginGuard],
    children: [
      {
        path: 'my_activities',
        loadComponent: () =>
          import('./my_activities/my_activities.page').then(
            (m) => m.MyActivitiesPage
          ),
      },
      {
        path: 'ranking',
        loadComponent: () =>
          import('./ranking/ranking.page').then((m) => m.RankingPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./admin-page/admin-page.page').then((m) => m.AdminPagePage),
        canActivate: [
          () => import('../core/guards/admin.guard').then((m) => m.adminGuard),
        ],
      },
      {
        path: '',
        redirectTo: '/tabs/my_activities',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/my_activities',
    pathMatch: 'full',
  },
];
