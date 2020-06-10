import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { MatDialogModule, MatSnackBarModule } from "@angular/material";
import "hammerjs";

import { FuseModule } from "@fuse/fuse.module";
import { FuseSharedModule } from "@fuse/shared.module";

import { fuseConfig } from "./fuse-config";

import { AppComponent } from "./app.component";
import { FuseMainModule } from "./main/main.module";

// add app route module
import { AppRoutingModule } from "./app-routing.module";
import { FuseFakeDbService } from "./fuse-fake-db/fuse-fake-db.service";
import { InMemoryWebApiModule } from "angular-in-memory-web-api";
import { SharedModule } from "./shared/shared.module";

// internal guard
import { AuthGuard } from "./classes/auth.guard";
import { NonAuthGuard } from "./classes/non-auth.guard";

// entry component
import { ErrorDialogComponent } from "./shared/error-dialog/error-dialog.component";
import { ConfirmationDialogComponent } from "./shared/confirmation-dialog/confirmation-dialog.component";
import { ToastInformationComponent } from "./shared/toast-information-dialog/toast-information.component";

// internal service
import { NgProgressModule, NgProgressInterceptor } from 'ngx-progressbar';
import { BaseInterceptor } from "./services/interceptor.module";
import { AuthenticationService } from "./services/authentication.service";
import { DataService } from "./services/data.service";
import { DialogService } from "./services/dialog.service";
import { AdminPrincipalService } from "./services/user-management/admin-principal.service";
import { VendorsService } from "./services/src-catalogue/vendors.service";
import { FieldForceService } from "./services/user-management/field-force.service";
import { PaguyubanService } from "./services/user-management/paguyuban.service";
import { WholesalerService } from "./services/user-management/wholesaler.service";
import { RetailerService } from "./services/user-management/retailer.service";
import { BannerService } from "./services/inapp-marketing/banner.service";
import { LandingPageService } from "./services/inapp-marketing/landing-page.service";
import { ProductService } from "./services/sku-management/product.service";
import { RewardService } from "./services/sku-management/reward.service";
import { RewardHistoryService } from "./services/sku-management/reward-history.service";
import { CoinService } from "./services/sku-management/coin.service";
import { TemplateTaskService } from "./services/dte/template-task.service";
import { TradeProgramService } from "./services/dte/trade-program.service";
import { ScheduleTradeProgramService } from "./services/dte/schedule-trade-program.service";
import { AudienceService } from "./services/dte/audience.service";
import { NotificationService } from "./services/notification.service";
import { TncService } from "./services/content-management/tnc.service";
import { PrivacyService } from "./services/content-management/privacy.service";
import { HelpService } from "./services/content-management/help.service";
import { CategoryService } from "./services/newsfeed-management/category.service";
import { NewsService } from "./services/newsfeed-management/news.service";
import { AccessService } from "./services/settings/access.service";
import { AccountService } from "./services/settings/account.service";
import { GoogleAnalyticsService } from "./services/google-analytics.service";
import { NavigationService } from "./services/navigation.service";
import { CustomerService } from "./services/user-management/customer.service";
import { GeneralService } from "./services/general.service";
import { SupportService } from "./services/settings/support.service";
import { TemplateMessageService } from "./services/template-message-management/template-message.service";
import { SupplierCompanyService } from "./services/user-management/private-label/supplier-company.service";
import { UserSupplierService } from "./services/user-management/private-label/user-supplier.service";
import { PanelMitraService } from "./services/user-management/private-label/panel-mitra.service";
import { OrdertoSupplierService } from "./services/user-management/private-label/orderto-supplier.service";
import { PayMethodService } from "./services/user-management/private-label/pay-method.service";

import { UserIdleModule } from 'angular-user-idle';
import { IdleService } from "./services/idle.service";
import { GeotreeService } from "./services/geotree.service";
import { PengajuanSrcService } from "./services/user-management/pengajuan-src.service";
import { OTPSettingService } from "./services/otpsetting.service";

// ==== QISCUS ====
import { QiscusService } from "./services/qiscus.service";
import { Emitter } from "./helper/emitter.helper";
import { GroupTradeProgramService } from "./services/dte/group-trade-program.service";
import { IdbService } from "./services/idb.service";
import { QzTrayService } from "./services/qz-tray.service";
import { UserCatalogueService } from "./services/src-catalogue/user-catalogue.service";
import { ProductCatalogueService } from "./services/src-catalogue/product-catalogue.service";
import { StoreTemplateLayoutService } from "./services/src-catalogue/store-template-layout.service";
import { TaskVerificationService } from "./services/dte/task-verification.service";

@NgModule({
  declarations: [
    AppComponent,
    ErrorDialogComponent,
    ConfirmationDialogComponent,
    ToastInformationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot(),
    // Fuse Main and Shared modules
    FuseModule.forRoot(fuseConfig),
    FuseSharedModule,
    FuseMainModule,
    InMemoryWebApiModule.forRoot(FuseFakeDbService, {
      delay: 0,
      passThruUnknownUrl: true
    }),
    MatDialogModule,
    MatSnackBarModule,
    UserIdleModule.forRoot({ idle: 1140, timeout: 60, ping: 60 }),
    NgProgressModule
  ],
  providers: [
    //===== QISCUS =====
    QiscusService,
    Emitter,

    AuthenticationService,
    DataService,
    DialogService,
    AdminPrincipalService,
    VendorsService,
    FieldForceService,
    PaguyubanService,
    CustomerService,
    WholesalerService,
    RetailerService,
    BannerService,
    LandingPageService,
    ProductService,
    RewardService,
    RewardHistoryService,
    CoinService,
    TemplateTaskService,
    TradeProgramService,
    ScheduleTradeProgramService,
    AudienceService,
    NotificationService,
    TncService,
    PrivacyService,
    HelpService,
    CategoryService,
    NewsService,
    AccessService,
    AccountService,
    AuthGuard,
    GoogleAnalyticsService,
    NonAuthGuard,
    NavigationService,
    GeneralService,
    IdleService,
    SupportService,
    GeotreeService,
    TemplateMessageService,
    PengajuanSrcService,
    OTPSettingService,
    GroupTradeProgramService,
    IdbService,
    SupplierCompanyService,
    UserSupplierService,
    PanelMitraService,
    OrdertoSupplierService,
    QzTrayService,
    IdbService,
    UserCatalogueService,
    ProductCatalogueService,
    StoreTemplateLayoutService,
    PayMethodService,
    TaskVerificationService,
    { provide: HTTP_INTERCEPTORS, useClass: NgProgressInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: BaseInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ErrorDialogComponent,
    ConfirmationDialogComponent,
    ToastInformationComponent
  ]
})
export class AppModule {
  constructor(protected _googleAnalyticsService: GoogleAnalyticsService) { }
}
