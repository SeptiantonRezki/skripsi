import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FuseError404Component } from './error-404.component';

 const routes:Routes = [
       
       {
        path     : '',
        component: FuseError404Component
       }
    ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Error404RoutingModule { }