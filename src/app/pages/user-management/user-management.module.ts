import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { AdminPrincipalIndexComponent } from './admin-principal/index/admin-principal-index.component';

@NgModule({
  imports: [
    CommonModule,
    UserManagementRoutingModule
  ],
  declarations: [AdminPrincipalIndexComponent]
})
export class UserManagementModule { }
