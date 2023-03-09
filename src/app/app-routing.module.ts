import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './classes/auth.guard';
import { NonAuthGuard } from './classes/non-auth.guard';

// routes
const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: './pages/dashboard/dashboard.module#DashboardModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'user-management',
    loadChildren:
      './pages/user-management/user-management.module#UserManagementModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'src-catalogue',
    loadChildren:
      './pages/src-catalogue/src-catalogue.module#SrcCatalogueModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'advertisement',
    loadChildren:
      './pages/inapp-marketing/inapp-marketing.module#InappMarketingModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'my-profile',
    loadChildren: './pages/profile/profile.module#ProfileModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'sku-management',
    loadChildren:
      './pages/sku-management/sku-management.module#SkuManagementModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'loyalty-keping',
    loadChildren: './pages/loyalty-keping/loyalty-keping.module#LoyaltyKepingModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'dte',
    loadChildren: './pages/dte/dte.module#DteModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'callobj',
    loadChildren: './pages/call-objective/call-objective.module#CallobjectiveModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'notesretailer',
    loadChildren: './pages/notes-retailer/notes-retailer.module#NotesRetailerModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'notifications',
    loadChildren: './pages/notification/notification.module#NotificationModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'delivery',
    loadChildren: './pages/delivery-management/delivery-management.module#DeliveryManagementModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'content-management',
    loadChildren:
      './pages/content-management/content-management.module#ContentManagementModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'manajemen-template-pesan',
    loadChildren:
      './pages/template-message-management/template-message-management.module#TemplateMessageManagementModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'newsfeed-management',
    loadChildren:
      './pages/newsfeed-management/newsfeed-management.module#NewsfeedManagementModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadChildren: './pages/settings/settings.module#SettingsModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'task-sequencing',
    loadChildren: './pages/task-sequencing/task-sequencing.module#TaskSequencingModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadChildren: './pages/login/login.module#LoginModule',
    canActivate: [NonAuthGuard]
  },
  {
    path: 'forgot-password',
    loadChildren:
      './pages/forgot-password/forgot-password.module#ForgotPasswordModule',
    canActivate: [NonAuthGuard]
  },
  {
    path: 'reset-password/:token',
    loadChildren:
      './pages/reset-password/reset-password.module#ResetPasswordModule',
    canActivate: [NonAuthGuard]
  },
  {
    path: 'access-denied',
    loadChildren: './pages/500/access-denied.module#AccessDeniedModule',
    canActivate: [AuthGuard]
  },
  {
    path: "device",
    loadChildren: "./pages/device-authentication/device-authentication.module#DeviceAuthenticationModule",
    canActivate: [NonAuthGuard]
  },
  {
    path: "paylater",
    loadChildren: "./pages/pay-later/pay-later.module#PayLaterModule",
    canActivate: [AuthGuard]
  },
  {
    path: "pojok-untung",
    loadChildren: "./pages/pojok-untung/pojok-untung.module#PojokUntungModule",
    canActivate: [AuthGuard]
  },
  {
    path: "virtual-account",
    loadChildren: "./pages/virtual-account/virtual-account.module#VirtualAccountModule",
    canActivate: [AuthGuard]
  },
  {
    path: 'b2b-voucher',
    loadChildren: './pages/b2-bvoucher/b2-bvoucher.module#B2BVoucherModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'discount-coins-order',
    loadChildren: './pages/shoping-discount-coins/shoping-discount-coins.module#ShopingDiscountCoinsModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'inject-b2b-voucher',
    loadChildren: './pages/b2b-voucher-inject/b2b-voucher-inject.module#B2BVoucherInjectModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'syarat-ketentuan',
    loadChildren: './pages/syarat-ketentuan/syarat-ketentuan.module#SyaratKetentuanModule',
    canActivate: [AuthGuard]
  },
  {
    path: "b2c-voucher",
    loadChildren: "./pages/b2c-voucher/b2c-voucher.module#B2CVoucherModule",
    canActivate: [AuthGuard]
  },
  {
    path: "src-katalog-koin",
    loadChildren: "./pages/src-katalog-koin/src-katalog-koin.module#SrcKatalogKoinModule",
    canActivate: [AuthGuard]
  },
  // {
  //   path: "admin",
  //   loadChildren: "./pages/admin/admin.module#AdminModule",
  //   canActivate: [AuthGuard]
  // },
  {
    path: 'customer-care',
    loadChildren:
      './pages/customer-care/customer-care.module#CustomerCareModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'kpisetting',
    loadChildren: './pages/kpi-setting/kpi-setting.module#KPISettingModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'device-management',
    loadChildren:
      './pages/device-management/device-management.module#DeviceManagementModule',
    canActivate: [AuthGuard]
  },
  {
    path: "rca",
    loadChildren: "./pages/remote-call-activation/remote-call-activation.module#RemoteCallActivationModule",
    canActivate: [AuthGuard]
  },
  {
    path: 'tactical-retail-sales',
    loadChildren: './pages/tactical-retail-sales/tactical-retail-sales.module#TacticalRetailSalesModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'dsd-multicategory',
    loadChildren: './pages/dsd-multicategory/dsd-multicategory.module#DSDMulticategoryModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'payment-gateway',
    loadChildren: './pages/payment-gateway/payment-gateway.module#PaymentGatewayModule',
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    loadChildren: './pages/404/error-404.module#Error404Module'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      // preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
