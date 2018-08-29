import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { AdminPrincipalIndexComponent } from './admin-principal/index/admin-principal-index.component';
import { FieldForceIndexComponent } from './field-force/index/field-force-index.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule, MatCheckboxModule, MatIconModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    NgxDatatableModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  declarations: [AdminPrincipalIndexComponent, FieldForceIndexComponent],
  
   exports     : [
        AdminPrincipalIndexComponent, FieldForceIndexComponent
    ]
})
export class UserManagementModule { }
