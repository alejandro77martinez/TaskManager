import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { LandingPageComponent } from './features/public/pages/landing-page/landing-page.component';
import { LoginPageComponent } from './features/public/pages/login-page/login-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    component: LoginPageComponent
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/public/pages/register-page/register-page').then(
        (m) => m.RegisterPage,
      ),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/pages/home-page/home-page.component').then(
        (m) => m.HomePageComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'project',
      },
      {
        path: 'project',
        loadComponent: () =>
          import('./features/home/pages/project-page/project.component').then(
            (m) => m.ProjectComponent,
          ),
      },
      {
        path: 'team',
        loadComponent: () =>
          import('./features/home/pages/team-page/team.component').then(
            (m) => m.TeamComponent,
          ),
      },
      {
        path: 'kanban',
        loadComponent: () =>
          import('./features/home/pages/kanban-page/kanban.component').then(
            (m) => m.KanbanComponent,
          ),
      }
    ],
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/public/pages/about-page/about-page').then(
        (m) => m.AboutPage,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'info',
      },
      {
        path: 'info',
        loadComponent: () =>
          import('./features/public/pages/about-page/components/info-page/info.component').then(
            (m) => m.InfoComponent,
          ),
      },
      {
        path: 'privacy',
        loadComponent: () =>
          import('./features/public/pages/about-page/components/privacy-page/privacy.component').then(
            (m) => m.PrivacyComponent,
          ),
      },
      {
        path: 'terms',
        loadComponent: () =>
          import('./features/public/pages/about-page/components/terms-page/terms.component').then(
            (m) => m.TermsComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/public/pages/notFound-page/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];
