import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";

import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "../../shared/shared.module";

import { UserManagementRoutingModule } from "./user-management-routing.module";
import { AdminPrincipalIndexComponent } from "./admin-principal/index/admin-principal-index.component";
import { AdminPrincipalCreateComponent } from "./admin-principal/create/admin-principal-create.component";
import { FieldForceIndexComponent } from "./field-force/index/field-force-index.component";
// import { PendingChangesGuard } from "app/pages/dte/dte.guard";

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
  MatDialogModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatDatepickerModule,
  MatDividerModule,
  MatListModule,
  MatSlideToggleModule,
  MatRadioModule,
} from "@angular/material";

import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from "@angular/material/core";

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

//PRIVATE-LABEL
import { OrdertoSupplierDetailComponent } from "./private-label/orderto-supplier/detail/orderto-supplier-detail.component";
import { OrdertoSupplierIndexComponent } from "./private-label/orderto-supplier/index/orderto-supplier-index.component";

import { PanelMitraCreateComponent } from "./private-label/panel-mitra/create/panel-mitra-create.component";
import { PanelMitraEditComponent } from "./private-label/panel-mitra/edit/panel-mitra-edit.component";
import { PanelMitraIndexComponent } from "./private-label/panel-mitra/index/panel-mitra-index.component";

import { SupplierCompanyCreateComponent } from "./private-label/supplier-company/create/supplier-company-create.component";
import { SupplierCompanyEditComponent } from "./private-label/supplier-company/edit/supplier-company-edit.component";
import { SupplierCompanyIndexComponent } from "./private-label/supplier-company/index/supplier-company-index.component";

import { UserSupplierCreateComponent } from "./private-label/user-supplier/create/user-supplier-create.component";
import { UserSupplierEditComponent } from "./private-label/user-supplier/edit/user-supplier-edit.component";
import { UserSupplierIndexComponent } from "./private-label/user-supplier/index/user-supplier-index.component";

import { PayMethodEditComponent } from "./private-label/pay-method/edit/pay-method-edit.component";
import { PayMethodIndexComponent } from "./private-label/pay-method/index/pay-method-index.component";

import { MedalBadgeComponent } from "./retailer/medal-badge/medal-badge-component";
import { MedalIndexComponent } from "./retailer/medal-badge/medal/index/medal-index-component";
import { MedalCreateComponent } from "./retailer/medal-badge/medal/create/medal-create-component";
import { RetailerListIndexComponent } from "./retailer/medal-badge/retailer-list/retailer-list-index-component";
import { ImportRetailerListDialogComponent } from "./retailer/medal-badge/retailer-list/import-retailer-list-dialog/import-retailer-list-dialog.component"

import { PageGuard } from "app/classes/auth.guard";

import {
  ListRoleAdminResolver,
  ListLevelFFResolver,
  ListLevelAreaResolver,
  ListAdminPrincipalResolver,
  ListCategoryProdukResolver,
  ListSupplierCompanyResolver,
  ListAllCategoryProdukResolver,
} from "../../resolver/user-management.resolver";
import { CustomerIndexComponent } from "./customer/index/customer-index.component";
import { CustomerDetailComponent } from "./customer/detail/customer-detail.component";
// import { AdminPrincipalAuditLogComponent } from './admin-principal/edit/admin-principal-audit-log/admin-principal-audit-log.component';
import { PartnershipCreateComponent } from "./principal-partnership/create/partnership-create.component";
import { PartnershipIndexComponent } from "./principal-partnership/index/partnership-index.component";
import { PartnershipEditComponent } from "./principal-partnership/edit/partnership-edit.component";
import { ImportAccessCashierDialogComponent } from './retailer/import-access-cashier-dialog/import-access-cashier-dialog.component';
import { ImportPanelMitraDialogComponent } from './private-label/panel-mitra/dialog-import/import-panel-mitra-dialog.component';
import { ngfModule } from "angular-file";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { PengajuanSrcComponent } from './pengajuan-src/index/pengajuan-src.component';
import { CreatePengajuanSrcComponent } from './pengajuan-src/create/create-pengajuan-src.component';
import { DetailPengajuanSrcComponent } from './pengajuan-src/detail/detail-pengajuan-src.component';
import { ReasonDialogComponent } from './pengajuan-src/reason-dialog/reason-dialog.component';
import { PengajuanSrcEditComponent } from './pengajuan-src/edit/pengajuan-src-edit.component';
import { RupiahFormaterWithoutRpPipe } from "@fuse/pipes/rupiah-formater";
import { PanelPartnershipIndexComponent } from "./private-label/panel-partnership/index/panel-partnership-index.component";
import { PanelPartnershipCreateComponent } from "./private-label/panel-partnership/create/panel-partnership-create.component";
import { PanelPartnershipEditComponent } from "./private-label/panel-partnership/edit/panel-partnership-edit.component";
import { ImportAudienceDialogComponent } from "./private-label/panel-partnership/import/import-audience-dialog.component";

import { FroalaEditorModule, FroalaViewModule } from "angular-froala-wysiwyg";

export const MY_FORMATS = {
  parse: {
    dateInput: "LL"
  },
  display: {
    dateInput: "LL",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};
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
    MatChipsModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatDividerModule,
    MatListModule,
    MatSlideToggleModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    MatRadioModule,
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
    CustomerDetailComponent,

    OrdertoSupplierDetailComponent,
    OrdertoSupplierIndexComponent,
    PanelMitraCreateComponent,
    PanelMitraEditComponent,
    PanelMitraIndexComponent,
    SupplierCompanyCreateComponent,
    SupplierCompanyEditComponent,
    SupplierCompanyIndexComponent,
    UserSupplierCreateComponent,
    UserSupplierEditComponent,
    UserSupplierIndexComponent,
    PayMethodEditComponent,
    PayMethodIndexComponent,
    PanelPartnershipIndexComponent,
    PanelPartnershipCreateComponent,
    PanelPartnershipEditComponent,
    ImportAudienceDialogComponent,

    MedalBadgeComponent,

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
    PengajuanSrcEditComponent,

    OrdertoSupplierDetailComponent,
    OrdertoSupplierIndexComponent,
    PanelMitraCreateComponent,
    PanelMitraEditComponent,
    PanelMitraIndexComponent,
    SupplierCompanyCreateComponent,
    SupplierCompanyEditComponent,
    SupplierCompanyIndexComponent,
    UserSupplierCreateComponent,
    UserSupplierEditComponent,
    UserSupplierIndexComponent,
    PayMethodEditComponent,
    PayMethodIndexComponent,

    MedalBadgeComponent,
    MedalIndexComponent,
    MedalCreateComponent,
    RetailerListIndexComponent,
    ImportRetailerListDialogComponent,

    ImportAccessCashierDialogComponent,
    ImportPanelMitraDialogComponent,
    ReasonDialogComponent,
    PanelPartnershipIndexComponent,
    PanelPartnershipCreateComponent,
    PanelPartnershipEditComponent,
  ],
  entryComponents: [
    ImportAccessCashierDialogComponent,
    ImportPanelMitraDialogComponent,
    ReasonDialogComponent,
    ImportRetailerListDialogComponent,
    PanelPartnershipIndexComponent,
    PanelPartnershipCreateComponent,
    PanelPartnershipEditComponent,
    ImportAudienceDialogComponent
  ],
  providers: [
    // PendingChangesGuard,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ListRoleAdminResolver,
    ListLevelFFResolver,
    ListLevelAreaResolver,
    ListAdminPrincipalResolver,
    ListCategoryProdukResolver,
    ListSupplierCompanyResolver,
    ListAllCategoryProdukResolver,
    RupiahFormaterWithoutRpPipe,
    PageGuard,
  ],
})
export class UserManagementModule { }
