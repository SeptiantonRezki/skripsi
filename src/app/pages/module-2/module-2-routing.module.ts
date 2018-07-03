import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Module2Component } from './module-2.component';

 const routes:Routes = [
       
       {
        path     : '',
        component: Module2Component
       }
    ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Module2RoutingModule { }