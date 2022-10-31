import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { brConfig } from "../../classes/breadcrumbs.config";
import { AdminPrincipalIndexComponent } from "./admin-principal/index/admin-principal-index.component";
import { AdminPrincipalCreateComponent } from "./admin-principal/create/admin-principal-create.component";
import { AdminPrincipalEditComponent } from "./admin-principal/edit/admin-principal-edit.component";
import { FieldForceCreateComponent } from "./field-force/create/field-force-create.component";
import { FieldForceIndexComponent } from "./field-force/index/field-force-index.component";
import { FieldForceEditComponent } from "./field-force/edit/field-force-edit.component";
import { PaguyubanEditComponent } from "./paguyuban/edit/paguyuban-edit.component";
import { PaguyubanIndexComponent } from "./paguyuban/index/paguyuban-index.component";
import { PaguyubanCreateComponent } from "./paguyuban/create/paguyuban-create.component";
import { WholesalerIndexComponent } from "./wholesaler/index/wholesaler-index.component";
import { WholesalerCreateComponent } from "./wholesaler/create/wholesaler-create.component";
import { WholesalerEditComponent } from "./wholesaler/edit/wholesaler-edit.component";
import { RetailerCreateComponent } from "./retailer/create/retailer-create.component";
import { RetailerIndexComponent } from "./retailer/index/retailer-index.component";
import { RetailerEditComponent } from "./retailer/edit/retailer-edit.component";
import { PageGuard } from "app/classes/auth.guard";
import {
  ListRoleAdminResolver,
  ListLevelFFResolver,
  ListLevelAreaResolver,
  ListAdminPrincipalResolver,
  ListCategoryProdukResolver,
  ListSupplierCompanyResolver,
  ListAllCategoryProdukResolver,
} from "app/resolver/user-management.resolver";
import { CustomerIndexComponent } from "./customer/index/customer-index.component";
import { CustomerDetailComponent } from "./customer/detail/customer-detail.component";
import { PartnershipIndexComponent } from "./principal-partnership/index/partnership-index.component";
import { PartnershipCreateComponent } from "./principal-partnership/create/partnership-create.component";
import { PartnershipEditComponent } from "./principal-partnership/edit/partnership-edit.component";
import { ImportAccessCashierDialogComponent } from "./retailer/import-access-cashier-dialog/import-access-cashier-dialog.component";
import { PengajuanSrcComponent } from "./pengajuan-src/index/pengajuan-src.component";
import { CreatePengajuanSrcComponent } from "./pengajuan-src/create/create-pengajuan-src.component";
import { DetailPengajuanSrcComponent } from "./pengajuan-src/detail/detail-pengajuan-src.component";
import { PengajuanSrcEditComponent } from "./pengajuan-src/edit/pengajuan-src-edit.component";

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
import { StockEditComponent } from "./private-label/supplier-settings/edit/stock-edit.component";
import { SupplierSettingsIndexComponent } from './private-label/supplier-settings/index/supplier-settings-index.component';
import { MedalBadgeComponent } from "./retailer/medal-badge/medal-badge-component";
// import { PendingChangesGuard } from "../dte/dte.guard";
import { PanelPartnershipIndexComponent } from "./private-label/panel-partnership/index/panel-partnership-index.component";
import { PanelPartnershipCreateComponent } from "./private-label/panel-partnership/create/panel-partnership-create.component";
import { PanelPartnershipEditComponent } from "./private-label/panel-partnership/edit/panel-partnership-edit.component";
import { VoucherPrincipalDetailTabComponent } from "./supplier-vouchers/detail/voucher-principal-detail-tab/voucher-principal-detail-tab.component";
import { PembayaranBenefitProgramComponent } from "./private-label/pembayaran-benefit-program/pembayaran-benefit-program.component";
import { SupplierVouchersComponent } from "./supplier-vouchers/supplier-vouchers.component";
import { CountrySetupComponent } from "./country-setup/country-setup.component";
import { CountrySetupEditComponent } from "./country-setup/country-setup-edit/country-setup-edit.component";
import { CountrySetupCreateComponent } from "./country-setup/country-setup-create/country-setup-create.component";
import { LanguageSetupComponent } from "./language-setup/language-setup.component";
import { LanguageSetupCreateComponent } from "./language-setup/language-setup-create/language-setup-create.component";
import { LanguageSetupEditComponent } from "./language-setup/language-setup-edit/language-setup-edit.component";
import { CTAExternalWebComponent } from "./cta/external-web/external-web.component";
import { InfoBoardComponent } from "./info-board/index/info-board.component";
import { InfoBoardCreateComponent } from "./info-board/create/info-board-create.component";
import { InfoBoardEditComponent } from "./info-board/edit/info-board-edit.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "admin-principal",
    pathMatch: "full"
  },
  {
    path: "admin-principal",
    component: AdminPrincipalIndexComponent,
    data: {
      breadcrumbs: brConfig.adminprincipal.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "admin-principal/create",
    component: AdminPrincipalCreateComponent,
    data: {
      breadcrumbs: brConfig.adminprincipal.create
    },
    resolve: {
      listRole: ListRoleAdminResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "admin-principal/edit/:id",
    component: AdminPrincipalEditComponent,
    data: {
      breadcrumbs: brConfig.adminprincipal.edit
    },
    resolve: {
      listRole: ListRoleAdminResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "admin-principal/detail/:id",
    component: AdminPrincipalEditComponent,
    data: {
      breadcrumbs: brConfig.adminprincipal.detail
    },
    resolve: {
      listRole: ListRoleAdminResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "field-force",
    component: FieldForceIndexComponent,
    data: {
      breadcrumbs: brConfig.fieldforce.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "field-force/create",
    component: FieldForceCreateComponent,
    data: {
      breadcrumbs: brConfig.fieldforce.create
    },
    resolve: {
      listLevel: ListLevelFFResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "field-force/edit/:id",
    component: FieldForceEditComponent,
    data: {
      breadcrumbs: brConfig.fieldforce.edit
    },
    resolve: {
      listLevel: ListLevelFFResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "field-force/detail/:id",
    component: FieldForceEditComponent,
    data: {
      breadcrumbs: brConfig.fieldforce.detail
    },
    resolve: {
      listLevel: ListLevelFFResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "paguyuban",
    component: PaguyubanIndexComponent,
    data: {
      breadcrumbs: brConfig.paguyuban.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "paguyuban/create",
    component: PaguyubanCreateComponent,
    data: {
      breadcrumbs: brConfig.paguyuban.edit
    },
    resolve: {
      // listAdminPrincipal: ListAdminPrincipalResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "paguyuban/edit",
    component: PaguyubanEditComponent,
    data: {
      breadcrumbs: brConfig.paguyuban.edit
    },
    resolve: {
      // listAdminPrincipal: ListAdminPrincipalResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "paguyuban/detail",
    component: PaguyubanEditComponent,
    data: {
      breadcrumbs: brConfig.paguyuban.detail
    },
    resolve: {
      // listAdminPrincipal: ListAdminPrincipalResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "wholesaler",
    component: WholesalerIndexComponent,
    data: {
      breadcrumbs: brConfig.wholesaler.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "wholesaler/create",
    component: WholesalerCreateComponent,
    data: {
      breadcrumbs: brConfig.wholesaler.create
    },
    canActivate: [PageGuard]
    // resolve: {
    //   listLevel: ListLevelAreaResolver
    // }
  },
  {
    path: "wholesaler/edit",
    component: WholesalerEditComponent,
    data: {
      breadcrumbs: brConfig.wholesaler.edit
    },
    canActivate: [PageGuard]
  },
  {
    path: "wholesaler/detail",
    component: WholesalerEditComponent,
    data: {
      breadcrumbs: brConfig.wholesaler.detail
    },
    canActivate: [PageGuard]
  },
  {
    path: "retailer",
    component: RetailerIndexComponent,
    data: {
      breadcrumbs: brConfig.retailer.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "retailer/create",
    component: RetailerCreateComponent,
    data: {
      breadcrumbs: brConfig.retailer.create
    },
    canActivate: [PageGuard]
  },
  {
    path: "retailer/edit",
    component: RetailerEditComponent,
    data: {
      breadcrumbs: brConfig.retailer.edit
    },
    canActivate: [PageGuard]
  },
  {
    path: "retailer/detail",
    component: RetailerEditComponent,
    data: {
      breadcrumbs: brConfig.retailer.detail
    },
    canActivate: [PageGuard]
  },
  {
    path: "customer",
    component: CustomerIndexComponent,
    data: {
      breadcrumbs: brConfig.customer.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "customer/detail/:id",
    component: CustomerDetailComponent,
    data: {
      breadcrumbs: brConfig.customer.detail
    },
    canActivate: [PageGuard]
  },
  {
    path: "principal-partnership",
    component: PartnershipIndexComponent,
    data: {
      breadcrumbs: brConfig.partnership.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "principal-partnership/create",
    component: PartnershipCreateComponent,
    data: {
      breadcrumbs: brConfig.partnership.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "principal-partnership/edit",
    component: PartnershipEditComponent,
    data: {
      breadcrumbs: brConfig.partnership.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "principal-partnership/detail",
    component: PartnershipEditComponent,
    data: {
      breadcrumbs: brConfig.partnership.detail
    },
    // canActivate: [PageGuard]
  },
  {
    path: "pengajuan-src",
    component: PengajuanSrcComponent,
    data: {
      breadcrumbs: brConfig.pengajuanSRC.index
    }
  },
  {
    path: "pengajuan-src/create",
    component: CreatePengajuanSrcComponent,
    data: {
      breadcrumbs: brConfig.pengajuanSRC.create
    }
  },
  {
    path: "pengajuan-src/detail",
    component: DetailPengajuanSrcComponent,
    data: {
      breadcrumbs: brConfig.pengajuanSRC.detail
    }
  },
  {
    path: "pengajuan-src/edit",
    component: PengajuanSrcEditComponent,
    data: {
      breadcrumbs: brConfig.pengajuanSRC.edit
    }
  },

  {
    path: "supplier-order",
    component: OrdertoSupplierIndexComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.ordertosupplier.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-order/detail/:id",
    component: OrdertoSupplierDetailComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.ordertosupplier.detail
    },
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-panel-mitra",
    component: PanelMitraIndexComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.panelmitra.index
    },
    resolve: {
      listCategory: ListCategoryProdukResolver
    }
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-panel-mitra/create",
    component: PanelMitraCreateComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.panelmitra.create
    },
    resolve: {
      listCategory: ListAllCategoryProdukResolver,
      // listSupplierCompany: ListSupplierCompanyResolver,
    },
    // canDeactivate: [PendingChangesGuard],
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-panel-mitra/edit/:id",
    component: PanelMitraEditComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.panelmitra.edit,
      actionType: 'edit',
    },
    resolve: {
      listCategory: ListAllCategoryProdukResolver,
      // listSupplierCompany: ListSupplierCompanyResolver,
    },
    // canDeactivate: [PendingChangesGuard],
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-panel-mitra/detail/:id",
    component: PanelMitraEditComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.panelmitra.detail,
      actionType: 'detail',
    },
    resolve: {
      listCategory: ListAllCategoryProdukResolver,
      // listSupplierCompany: ListSupplierCompanyResolver,
    },
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-company",
    component: SupplierCompanyIndexComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.suppliercompany.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-company/create",
    component: SupplierCompanyCreateComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.suppliercompany.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-company/edit/:id",
    component: SupplierCompanyEditComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.suppliercompany.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-company/detail/:id",
    component: SupplierCompanyEditComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.suppliercompany.detail
    },
    // canActivate: [PageGuard]
  },
  {
    path: "private-label",
    component: SupplierCompanyIndexComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.suppliercompany.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "private-label/create",
    component: SupplierCompanyCreateComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.suppliercompany.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "private-label/edit/:id",
    component: SupplierCompanyEditComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.suppliercompany.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "private-label/detail/:id",
    component: SupplierCompanyEditComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.suppliercompany.detail
    },
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-user",
    component: UserSupplierIndexComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.usersupplier.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-user/create",
    component: UserSupplierCreateComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.usersupplier.create
    },
    resolve: {
      listRole: ListRoleAdminResolver
    },
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-user/edit/:id",
    component: UserSupplierEditComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.usersupplier.edit
    },
    resolve: {
      listRole: ListRoleAdminResolver
    },
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-user/detail/:id",
    component: UserSupplierEditComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.usersupplier.detail
    },
    resolve: {
      listRole: ListRoleAdminResolver
    },
    // canActivate: [PageGuard]
  },
  {
    path: 'supplier-settings',
    component: SupplierSettingsIndexComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.supplierSettings.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: 'supplier-settings/edit/:id',
    component: StockEditComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.supplierSettings.stockEdit
    },
    // canActivate: [PageGuard]
  },
  {
    path: 'supplier-settings/metode-pembayaran/edit/:id',
    component: PayMethodEditComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.supplierSettings.paymentMethodEdit
    },
    // canActivate: [PageGuard]
  },
  {
    path: 'medal-badge',
    component: MedalBadgeComponent,
    data: {
      breadcrumbs: brConfig.retailer.medalBadge
    },
  },
  {
    path: "panel-partnership",
    component: PanelPartnershipIndexComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.panelpartnership.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "panel-partnership/create",
    component: PanelPartnershipCreateComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.panelpartnership.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "panel-partnership/edit",
    component: PanelPartnershipEditComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.panelpartnership.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "partnership-benefit",
    component: PembayaranBenefitProgramComponent,
  },
  {
    path: "supplier-vouchers",
    component: SupplierVouchersComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.supplierVouchers.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "supplier-vouchers/detail",
    component: VoucherPrincipalDetailTabComponent,
    data: {
      breadcrumbs: brConfig.privatelabel.supplierVouchers.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "partnership-benefit",
    component: PembayaranBenefitProgramComponent,
  },
  {
    path: "countries",
    component: CountrySetupComponent,
    data: {
      breadcrumbs: brConfig.country_setup.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "countries/create",
    component: CountrySetupCreateComponent,
    data: {
      breadcrumbs: brConfig.country_setup.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "countries/edit/:id",
    component: CountrySetupEditComponent,
    data: {
      breadcrumbs: brConfig.country_setup.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "countries/detail/:id",
    component: CountrySetupEditComponent,
    data: {
      breadcrumbs: brConfig.country_setup.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "languages",
    component: LanguageSetupComponent,
    data: {
      breadcrumbs: brConfig.language_setup.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "languages/create",
    component: LanguageSetupCreateComponent,
    data: {
      breadcrumbs: brConfig.language_setup.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "languages/edit/:id",
    component: LanguageSetupEditComponent,
    data: {
      breadcrumbs: brConfig.language_setup.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "languages/detail/:id",
    component: LanguageSetupEditComponent,
    data: {
      breadcrumbs: brConfig.language_setup.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "call-to-action",
    component: CTAExternalWebComponent,
    canActivate: [PageGuard]
  },
  {
    path: 'info-board',
    component: InfoBoardComponent,
    data: {
      breadcrumbs: brConfig.infoBoard.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: 'info-board/create',
    component: InfoBoardCreateComponent,
    data: {
      breadcrumbs: brConfig.infoBoard.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: 'info-board/edit',
    component: InfoBoardEditComponent,
    data: {
      breadcrumbs: brConfig.infoBoard.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "info-board/detail",
    component: InfoBoardEditComponent,
    data: {
      breadcrumbs: brConfig.infoBoard.detail
    },
    //canActivate: [PageGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
