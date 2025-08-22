import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'emailbuilder',
    pathMatch: 'full',
  },
  {
    path: 'emailbuilder',
    loadComponent: () => import('./app.component').then((c) => c.AppComponent),
  },
];
