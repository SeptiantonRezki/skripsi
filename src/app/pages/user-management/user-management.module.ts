import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";

import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "../../shared/shared.module";

import { UserManagementRoutingModule } from "./user-management-routing.module";
import { AdminPrincipalIndexComponent } from "./admin-principal/index/admin-principal-index.component";
import { AdminPrincipalCreateComponent } from "./admin-principal/create/admin-principal-create.component";
import { FieldForceIndexComponent } from "./field-force/index/field-force-index.component";

import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatStepperModule,
  MatProgressBarModule,
  MatProgressSpinnerModule
} from "@angular/material";

import { AdminPrincipalEditComponent } from "./admin-principal/edit/admin-principal-edit.component";
import { FieldForceCreateComponent } from "./field-force/create/field-force-create.component";
import { FieldForceEditComponent } from "./field-force/edit/field-force-edit.component";
import { PaguyubanIndexComponent } from "./paguyuban/index/paguyuban-index.component";
import { PaguyubanCreateComponent } from "./paguyuban/create/paguyuban-create.component";
import { PaguyubanEditComponent } from "./paguyuban/edit/paguyuban-edit.component";
import { WholesalerIndexComponent } from "./wholesaler/index/wholesaler-index.component";
import { WholesalerCreateComponent } from "./wholesaler/create/wholesaler-create.component";
import { WholesalerEditComponent } from "./wholesaler/edit/wholesaler-edit.component";
import { RetailerIndexComponent } from "./retailer/index/retailer-index.component";
import { RetailerCreateComponent } from "./retailer/create/retailer-create.component";
import { RetailerEditComponent } from "./retailer/edit/retailer-edit.component";

import {
  ListRoleAdminResolver,
  ListLevelFFResolver
} from "../../resolver/user-management.resolver";

@NgModule({
  imports: [
    CommonModule,
    FuseSharedModule,
    SharedModule,
    UserManagementRoutingModule,
    NgxDatatableModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  exports: [
    FieldForceIndexComponent,
    FieldForceCreateComponent,
    FieldForceEditComponent,
    AdminPrincipalIndexComponent,
    AdminPrincipalCreateComponent,
    AdminPrincipalEditComponent,
    PaguyubanIndexComponent,
    PaguyubanCreateComponent,
    PaguyubanEditComponent,
    WholesalerIndexComponent,
    WholesalerCreateComponent,
    WholesalerEditComponent,
    RetailerIndexComponent,
    RetailerCreateComponent,
    RetailerEditComponent
  ],
  declarations: [
    AdminPrincipalIndexComponent,
    AdminPrincipalCreateComponent,
    AdminPrincipalEditComponent,
    FieldForceIndexComponent,
    FieldForceCreateComponent,
    FieldForceEditComponent,
    PaguyubanIndexComponent,
    PaguyubanCreateComponent,
    PaguyubanEditComponent,
    WholesalerIndexComponent,
    WholesalerCreateComponent,
    WholesalerEditComponent,
    RetailerIndexComponent,
    RetailerCreateComponent,
    RetailerEditComponent
  ],
  providers: [ListRoleAdminResolver, ListLevelFFResolver]
})
export class UserManagementModule {}
