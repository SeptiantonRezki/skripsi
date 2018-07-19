import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

// routes
const appRoutes: Routes = [
    {
        path      : '',
        redirectTo: 'login',
        pathMatch:'full'
    },
    {
    	path : 'dashboard',
    	loadChildren:'./pages/dashboard/dashboard.module#DashboardModule'
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
    },
    {
      path:'forgot-password',
      loadChildren:'./pages/forgot-password/forgot-password.module#ForgotPasswordModule'
    },
    {
      path:'reset-password',
      loadChildren:'./pages/reset-password/reset-password.module#ResetPasswordModule'
    },
    {
      path:'admin',
      loadChildren:'./pages/admin/admin.module#AdminModule'
    },
    {
      path:'**',
      loadChildren:'./pages/404/error-404.module#Error404Module'
    }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, {
    // preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }