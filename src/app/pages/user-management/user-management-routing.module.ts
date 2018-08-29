import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminPrincipalIndexComponent } from './admin-principal/index/admin-principal-index.component';
import { FieldForceIndexComponent } from './field-force/index/field-force-index.component';

import { brConfig } from '../../classes/breadcrumbs.config';

const routes: Routes = [
	{
          path:'',
          redirectTo:'admin-principal',
          pathMatch:'full'
       },
       {
        path     : 'admin-principal',
        component: AdminPrincipalIndexComponent,
        data:{
        	breadcrumbs:brConfig.adminprincipal.index
        }
       },
       {
        path     : 'field-force',
        component: FieldForceIndexComponent,
        data:{
          breadcrumbs:brConfig.fieldforce.index
        }
       }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
