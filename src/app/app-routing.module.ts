import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

// routes
const appRoutes: Routes = [
    {
        path      : '',
        redirectTo: 'dashboard',
        pathMatch:'full'
    },
    {
    	path : 'module-1',
    	loadChildren:'./pages/module-1/module-1.module#Module1Module'
    },
    {
      path : 'module-2',
      loadChildren:'./pages/module-2/module-2.module#Module2Module'
    },
    {
      path:'login',
      loadChildren:'./pages/login/login.module#LoginModule'
    }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }