import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminUserIndexComponent } from './user/index/admin-user-index.component';
import { AdminUserCreateComponent } from './user/create/admin-user-create.component';
import { AdminUserEditComponent } from './user/edit/admin-user-edit.component';

import { AdminRoleIndexComponent } from './role/index/admin-role-index.component';
import { AdminRoleCreateComponent } from './role/create/admin-role-create.component';
import { AdminRoleEditComponent } from './role/edit/admin-role-edit.component';

import { brConfig } from '../../classes/breadcrumbs.config';

 const routes:Routes = [
       {
          path:'',
          redirectTo:'user',
          pathMatch:'full'
       },
       {
        path     : 'user',
        component: AdminUserIndexComponent,
        data:{
        	breadcrumbs:brConfig.admin.user.index
        }
       },
       {
       	path :'user/create',
       	component: AdminUserCreateComponent,
       	data:{
        	breadcrumbs:brConfig.admin.user.create
        }
       },
       {
       	path :'user/edit/:id',
       	component:AdminUserEditComponent,
       	data:{
        	breadcrumbs:brConfig.admin.user.edit
        }
       },

       
       {
        path     : 'role',
        component: AdminRoleIndexComponent,
        data:{
        	breadcrumbs:brConfig.admin.role.index
        }
       },
       {
       	path :'role/create',
       	component: AdminRoleCreateComponent,
       	data:{
        	breadcrumbs:brConfig.admin.role.create
        }
       },
       {
       	path :'role/edit/:id',
       	component:AdminRoleEditComponent,
       	data:{
        	breadcrumbs:brConfig.admin.role.edit
        }
       }
    ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }