import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SyaratKetentuanComponent } from './syarat-ketentuan.component';

 const routes:Routes = [
       
       {
        path     : '',
        component: SyaratKetentuanComponent
       }
    ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SyaratKetentuanRoutingModule { }