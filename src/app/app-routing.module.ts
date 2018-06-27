import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

// routes
const appRoutes: Routes = [
    {
        path      : '',
        redirectTo: 'sample',
        pathMatch:'full'
    },
    {
    	path : 'module-1',
    	loadChildren:'./pages/module-1/module-1.module#Module1Module'
    }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }