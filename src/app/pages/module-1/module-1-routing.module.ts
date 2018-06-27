import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Module1Component } from './module-1.component';

 const routes:Routes = [
       
       {
        path     : '',
        component: Module1Component
       }
    ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Module1RoutingModule { }