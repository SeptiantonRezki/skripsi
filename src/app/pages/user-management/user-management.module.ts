import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";

import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "../../shared/shared.module";

import { UserManagementRoutingModule } from "./user-management-routing.module";
import { AdminPrincipalIndexComponent } from "./admin-principal/index/admin-principal-index.component";
import { AdminPrincipalCreateComponent } from "./admin-principal/create/admin-principal-create.component";
import { FieldForceIndexComponent } from "./field-force/index/field-force-index.component";
import { TranslateModule } from "@ngx-translate/core";

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
  MatMenuModule,
  MatCardModule,
  MatTableModule,
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
import { StockEditComponent } from './private-label/supplier-settings/edit/stock-edit.component';
import { SupplierSettingsIndexComponent } from './private-label/supplier-settings/index/supplier-settings-index.component';

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
import { DokumenDialogComponent } from './wholesaler/dokumen-dialog/dokumen-dialog.component';
import { ImportListWholesalerComponent } from './wholesaler/import-list-wholesaler/import-list-wholesaler.component';
// import { RcaAgentComponent } from './rca-agent/rca-agent.component';
// import { RcaAgentCreateComponent } from './rca-agent/create/rca-agent-create.component';
// import { RcaAgentEditComponent } from './rca-agent/edit/rca-agent-edit.component';
import { VoucherPrincipalDetailTabComponent } from "./supplier-vouchers/detail/voucher-principal-detail-tab/voucher-principal-detail-tab.component";
import { VoucherPrincipalDetailComponent } from "./supplier-vouchers/detail/voucher-principal-detail.component";
import { OrderToMitraHubComponent } from './private-label/order-to-mitra-hub/order-to-mitra-hub.component';
import { PembayaranBenefitProgramComponent } from './private-label/pembayaran-benefit-program/pembayaran-benefit-program.component';
import { SupplierVouchersComponent } from './supplier-vouchers/supplier-vouchers.component';
import { PopUpImageBlobComponent } from "../../components/popup-image-blob/popup-image-blob.component";
import { CountrySetupComponent } from './country-setup/country-setup.component';
import { LanguageSetupComponent } from './language-setup/language-setup.component';
import { CountrySetupEditComponent } from './country-setup/country-setup-edit/country-setup-edit.component';
import { CountrySetupCreateComponent } from './country-setup/country-setup-create/country-setup-create.component';
import { RecursiveSlideToggleComponent } from './country-setup/recursive-slide-toggle/recursive-slide-toggle.component';
import { LanguageSetupCreateComponent } from './language-setup/language-setup-create/language-setup-create.component';
import { LanguageSetupEditComponent } from './language-setup/language-setup-edit/language-setup-edit.component';
import { DialogUploadLanguageComponent } from './language-setup/dialog-upload-language/dialog-upload-language.component';
import { CTAExternalWebComponent } from "./cta/external-web/external-web.component";
import { ImportAudiencePersonalizeInfoBoardComponent } from "./info-board/import/personalize/import-audience-personalize.component";
import { InfoBoardComponent } from "./info-board/index/info-board.component";
import { InfoBoardCreateComponent } from "./info-board/create/info-board-create.component";
import { InfoBoardEditComponent } from "./info-board/edit/info-board-edit.component";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { DialogProcessComponentIB } from "./info-board/dialog/dialog-process/dialog-process.component";
import { DialogProcessSaveIBComponent } from "./info-board/dialog/dialog-process-save-ib/dialog-process-save-ib.component";
import { OrdersRrpComponent } from './retailer/orders-rrp/index/orders-rrp.component';
import { TranslateInterpolatePipe } from "@fuse/pipes/translateInterpolate.pipe";
import { OrdersRrpDetailComponent } from './retailer/orders-rrp/detail/orders-rrp-detail.component';
import { TierPriceDialogComponent } from './retailer/orders-rrp/detail/tier-price-dialog/tier-price-dialog.component';
import { CancelConfirmationDialogComponent } from './retailer/orders-rrp/detail/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { NgxMaterialTimepicker24HoursFaceComponent } from "ngx-material-timepicker/src/app/material-timepicker/components/timepicker-24-hours-face/ngx-material-timepicker-24-hours-face.component";
import { PreviewImagePaymentComponent } from './retailer/orders-rrp/detail/preview-image-payment/preview-image-payment.component';
import { StorePhotoVerificationComponent } from './retailer/store-photo-verification/store-photo-verification.component';
import { PopupImageComponent } from "app/components/popup-image/popup-image.component";
import { DialogRejectReasonComponent } from './retailer/store-photo-verification/components/dialog-reject-reason/dialog-reject-reason.component';
import { WidgetStorePhotoCounterComponent } from './retailer/store-photo-verification/components/widget-store-photo-counter/widget-store-photo-counter.component';
import { StorePhotoTypesComponent } from './retailer/store-photo-types/store-photo-types.component';
import { DndModule } from "ngx-drag-drop";
import { NgxDnDModule } from '@swimlane/ngx-dnd'
import { StorePhotoTypeFormComponent } from "./retailer/store-photo-types/store-photo-type-form/store-photo-type-form.component";
import { DataTablePagerComponent } from "./retailer/index/pager-datatable/pager.component"

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
    TranslateModule.forChild(),
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    MatRadioModule,
    MatMenuModule,
    NgxMaterialTimepickerModule,
    MatCardModule,
    DndModule,
    MatTableModule,
    NgxDnDModule,
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
    StockEditComponent,
    SupplierSettingsIndexComponent,
    PanelPartnershipIndexComponent,
    PanelPartnershipCreateComponent,
    PanelPartnershipEditComponent,
    ImportAudienceDialogComponent,

    MedalBadgeComponent,
    OrderToMitraHubComponent

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
    StockEditComponent,
    SupplierSettingsIndexComponent,

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
    ImportAudienceDialogComponent,
    ImportListWholesalerComponent,
    DokumenDialogComponent,
    VoucherPrincipalDetailTabComponent,
    VoucherPrincipalDetailComponent,
    OrderToMitraHubComponent,
    PembayaranBenefitProgramComponent,
    SupplierVouchersComponent,

    PopUpImageBlobComponent,

    CountrySetupComponent,

    LanguageSetupComponent,

    CountrySetupEditComponent,

    CountrySetupCreateComponent,

    RecursiveSlideToggleComponent,

    LanguageSetupCreateComponent,

    LanguageSetupEditComponent,

    DialogUploadLanguageComponent,
    CTAExternalWebComponent,
    ImportAudiencePersonalizeInfoBoardComponent,
    InfoBoardComponent,
    InfoBoardCreateComponent,
    InfoBoardEditComponent,
    DialogProcessComponentIB,
    DialogProcessSaveIBComponent,
    StorePhotoTypeFormComponent,
    OrdersRrpComponent,
    OrdersRrpDetailComponent,
    TierPriceDialogComponent,
    CancelConfirmationDialogComponent,
    PreviewImagePaymentComponent,
    StorePhotoVerificationComponent,
    PopupImageComponent,
    DialogRejectReasonComponent,
    WidgetStorePhotoCounterComponent,
    StorePhotoTypesComponent,
    DataTablePagerComponent
  ],
  entryComponents: [
    ImportAccessCashierDialogComponent,
    ImportPanelMitraDialogComponent,
    ReasonDialogComponent,
    ImportRetailerListDialogComponent,
    PanelPartnershipIndexComponent,
    PanelPartnershipCreateComponent,
    PanelPartnershipEditComponent,
    ImportAudienceDialogComponent,
    ImportListWholesalerComponent,
    DokumenDialogComponent,
    PayMethodIndexComponent,
    ImportListWholesalerComponent,
    PopUpImageBlobComponent,
    DialogUploadLanguageComponent,
    ImportAudiencePersonalizeInfoBoardComponent,
    DialogProcessComponentIB,
    DialogProcessSaveIBComponent,
    PreviewImagePaymentComponent,
    PopupImageComponent,
    DialogRejectReasonComponent,

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
    TranslateInterpolatePipe
  ],
})
export class UserManagementModule { }
