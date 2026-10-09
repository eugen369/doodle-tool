import { Routes } from '@angular/router'

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'create',
        loadComponent: () =>
            import('./pages/create-poll/create-poll.component').then(m => m.CreatePollComponent)
    },
    {
        path: 'poll/:id',
        loadComponent: () =>
            import('./pages/view-poll/view-poll.component').then(m => m.ViewPollComponent)
    }
]
