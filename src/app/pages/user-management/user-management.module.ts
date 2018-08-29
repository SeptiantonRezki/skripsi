import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { AdminPrincipalIndexComponent } from './admin-principal/index/admin-principal-index.component';
import { FieldForceIndexComponent } from './field-force/index/field-force-index.component';
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
	exports     : [
	    FieldForceIndexComponent,
	    AdminPrincipalIndexComponent
	],
  	declarations: [AdminPrincipalIndexComponent, FieldForceIndexComponent]
})
export class UserManagementModule { }
