import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { AdminPrincipalIndexComponent } from './admin-principal/index/admin-principal-index.component';
import { FieldForceIndexComponent } from './field-force/index/field-force-index.component';

@NgModule({
  imports: [
    CommonModule,
    UserManagementRoutingModule
  ],
  declarations: [AdminPrincipalIndexComponent, FieldForceIndexComponent]
})
export class UserManagementModule { }
