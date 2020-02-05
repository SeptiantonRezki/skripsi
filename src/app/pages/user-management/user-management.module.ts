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
  MatProgressSpinnerModule,
  MatTabsModule,
  MatTooltipModule,
  MatToolbarModule,
  MatDialogModule
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

import { PageGuard } from "app/classes/auth.guard";

import {
  ListRoleAdminResolver,
  ListLevelFFResolver,
  ListLevelAreaResolver,
  ListAdminPrincipalResolver
} from "../../resolver/user-management.resolver";
import { CustomerIndexComponent } from "./customer/index/customer-index.component";
import { CustomerDetailComponent } from "./customer/detail/customer-detail.component";
// import { AdminPrincipalAuditLogComponent } from './admin-principal/edit/admin-principal-audit-log/admin-principal-audit-log.component';
import { PartnershipCreateComponent } from "./principal-partnership/create/partnership-create.component";
import { PartnershipIndexComponent } from "./principal-partnership/index/partnership-index.component";
import { PartnershipEditComponent } from "./principal-partnership/edit/partnership-edit.component";
import { ImportAccessCashierDialogComponent } from './retailer/import-access-cashier-dialog/import-access-cashier-dialog.component';
import { ngfModule } from "angular-file";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { PengajuanSrcComponent } from './pengajuan-src/index/pengajuan-src.component';
import { CreatePengajuanSrcComponent } from './pengajuan-src/create/create-pengajuan-src.component';
import { DetailPengajuanSrcComponent } from './pengajuan-src/detail/detail-pengajuan-src.component';
import { ReasonDialogComponent } from './pengajuan-src/reason-dialog/reason-dialog.component';
import { PengajuanSrcEditComponent } from './pengajuan-src/edit/pengajuan-src-edit.component';

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
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    MatToolbarModule,
    MatDialogModule,
    ngfModule,
    NgxMatSelectSearchModule,
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
    RetailerEditComponent,
    CustomerIndexComponent,
    CustomerDetailComponent
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
    RetailerEditComponent,
    CustomerIndexComponent,
    CustomerDetailComponent,
    // AdminPrincipalAuditLogComponent,
    PartnershipCreateComponent,
    PartnershipIndexComponent,
    PartnershipEditComponent,
    ImportAccessCashierDialogComponent,
    PengajuanSrcComponent,
    CreatePengajuanSrcComponent,
    DetailPengajuanSrcComponent,
    ReasonDialogComponent,
    PengajuanSrcEditComponent
  ],
  entryComponents: [ImportAccessCashierDialogComponent, ReasonDialogComponent],
  providers: [
    ListRoleAdminResolver,
    ListLevelFFResolver,
    ListLevelAreaResolver,
    ListAdminPrincipalResolver,
    PageGuard
  ],
})
export class UserManagementModule { }
