import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module';

import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from '../../shared/shared.module';

import { AdminUserIndexComponent } from './user/index/admin-user-index.component';
import { AdminUserCreateComponent } from './user/create/admin-user-create.component';
import { AdminUserEditComponent } from './user/edit/admin-user-edit.component';

import { AdminRoleIndexComponent } from './role/index/admin-role-index.component';
import { AdminRoleCreateComponent } from './role/create/admin-role-create.component';
import { AdminRoleEditComponent } from './role/edit/admin-role-edit.component';

import { MatButtonModule, 
         MatCheckboxModule, 
         MatIconModule, 
         MatFormFieldModule,
         MatInputModule, 
         MatSelectModule, 
         MatStepperModule,
         MatProgressBarModule
       } from '@angular/material';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
    declarations: [
        AdminUserIndexComponent,
        AdminUserCreateComponent,
        AdminUserEditComponent,
        AdminRoleIndexComponent,
        AdminRoleCreateComponent,
        AdminRoleEditComponent
    ],
    imports     : [
        AdminRoutingModule,
        FuseSharedModule,
        NgxDatatableModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatStepperModule,
        MatProgressBarModule,
        SharedModule

    ],
    exports     : [
        AdminUserIndexComponent,
        AdminUserCreateComponent,
        AdminUserEditComponent,
        AdminRoleIndexComponent,
        AdminRoleCreateComponent,
        AdminRoleEditComponent
    ]
})

export class AdminModule
{
}
