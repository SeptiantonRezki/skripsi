import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  MatDialogModule,
  MatSnackBarModule,
  MatRadioModule,
  MatInputModule,
  MatFormFieldModule,
} from '@angular/material';
import 'hammerjs';

import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';

import { fuseConfig } from './fuse-config';

import { AppComponent } from './app.component';
import { FuseMainModule } from './main/main.module';

// add app route module
import { AppRoutingModule } from './app-routing.module';
import { FuseFakeDbService } from './fuse-fake-db/fuse-fake-db.service';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { SharedModule } from './shared/shared.module';

// internal guard
import { AuthGuard } from './classes/auth.guard';
import { NonAuthGuard } from './classes/non-auth.guard';

// entry component
import { ErrorDialogComponent } from './shared/error-dialog/error-dialog.component';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { ToastInformationComponent } from './shared/toast-information-dialog/toast-information.component';

// internal service
import { NgProgressModule, NgProgressInterceptor } from 'ngx-progressbar';
import { BaseInterceptor } from './services/interceptor.module';
import { AuthenticationService } from './services/authentication.service';
import { DataService } from './services/data.service';
import { CallObjectiveSerive } from './services/call-objective/call-objective.service';
import { NotesRetailerService } from './services/notes-retailer/notes-retailer.service';
import { KPISettingService } from './services/kpi-setting/kpi-setting.service';
import { MasterKPIService } from './services/kpi-setting/master-kpi.service';
import { DialogService } from './services/dialog.service';
import { AdminPrincipalService } from './services/user-management/admin-principal.service';
import { CountrySetupService } from './services/user-management/country-setup.service';
import { LanguageSetupService } from './services/user-management/language-setup.service';

import { VendorsService } from './services/src-catalogue/vendors.service';
import { FieldForceService } from './services/user-management/field-force.service';
import { PaguyubanService } from './services/user-management/paguyuban.service';
import { WholesalerService } from './services/user-management/wholesaler.service';
import { WholesalerSpecialPriceService } from './services/sku-management/wholesaler-special-price.service';
import { RetailerService } from './services/user-management/retailer.service';
import { BannerService } from './services/inapp-marketing/banner.service';
import { LandingPageService } from './services/inapp-marketing/landing-page.service';
import { ProductService } from './services/sku-management/product.service';
import { ProductCashierService } from './services/sku-management/product-cashier.service';
import { RewardService } from './services/sku-management/reward.service';
import { RewardHistoryService } from './services/sku-management/reward-history.service';
import { CoinService } from './services/sku-management/coin.service';
import { TemplateTaskService } from './services/dte/template-task.service';
import { TradeProgramService } from './services/dte/trade-program.service';
import { ScheduleTradeProgramService } from './services/dte/schedule-trade-program.service';
import { AudienceService } from './services/dte/audience.service';
import { NotificationService } from './services/notification.service';
import { TncService } from './services/content-management/tnc.service';
import { PrivacyService } from './services/content-management/privacy.service';
import { HelpService } from './services/content-management/help.service';
import { CategoryService } from './services/newsfeed-management/category.service';
import { NewsService } from './services/newsfeed-management/news.service';
import { AccessService } from './services/settings/access.service';
import { FeatureLevelService } from './services/settings/feature-level.service';
import { AccountService } from './services/settings/account.service';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { NavigationService } from './services/navigation.service';
import { CustomerService } from './services/user-management/customer.service';
import { GeneralService } from './services/general.service';
import { SupportService } from './services/settings/support.service';
import { TemplateMessageService } from './services/template-message-management/template-message.service';
import { SupplierCompanyService } from './services/user-management/private-label/supplier-company.service';
import { UserSupplierService } from './services/user-management/private-label/user-supplier.service';
import { PanelMitraService } from './services/user-management/private-label/panel-mitra.service';
import { OrdertoSupplierService } from './services/user-management/private-label/orderto-supplier.service';
import { PayMethodService } from './services/user-management/private-label/pay-method.service';
import { PLStockService } from './services/user-management/private-label/stock.service';
import { LotteryService } from './services/dte/lottery.service';

import { UserIdleModule } from 'angular-user-idle';
import { IdleService } from './services/idle.service';
import { GeotreeService } from './services/geotree.service';
import { PengajuanSrcService } from './services/user-management/pengajuan-src.service';
import { OTPSettingService } from './services/otpsetting.service';

// ==== QISCUS ====
import { QiscusService } from './services/qiscus.service';
import { Emitter } from './helper/emitter.helper';
import { GroupTradeProgramService } from './services/dte/group-trade-program.service';
import { IdbService } from './services/idb.service';
import { QzTrayService } from './services/qz-tray.service';
import { UserCatalogueService } from './services/src-catalogue/user-catalogue.service';
import { ProductCatalogueService } from './services/src-catalogue/product-catalogue.service';
import { StoreTemplateLayoutService } from './services/src-catalogue/store-template-layout.service';
import { TaskVerificationService } from './services/dte/task-verification.service';
import { PayLaterCompanyService } from './services/pay-later/pay-later-company.service';
import { PayLaterPanelService } from './services/pay-later/pay-later-panel.service';
import { PayLaterDeactivateService } from './services/pay-later/pay-later-deactivate.service';
import { VirtualAccountCompanyService } from './services/virtual-account/virtual-account-company.service';
import { VirtualAccountBinService } from './services/virtual-account/virtual-account-bin.service';
import { VirtualAccountPanelService } from './services/virtual-account/virtual-account-panel.service';
import { VirtualAccountTncService } from './services/virtual-account/virtual-account-tnc.service';
import { MedalBadgeService } from './services/user-management/retailer/medal-badge.service';

// firebase notification
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { PopupNotifComponent } from './shared/popup-notif/popup-notif.component';
import { StorageHelper } from './helper/storage.helper';
import { CoinAdjustmentApprovalService } from './services/dte/coin-adjustment-approval.service';
import { CoinDisburstmentService } from './services/dte/coin-disburstment.service';
import { PayLaterDistributionListService } from './services/pay-later/pay-later-distribution-list.service';
import { ProductSubmissionService } from './services/sku-management/product-submission.service';
import { AreaService } from './services/area.service';
import { LanguagesService } from './services/languages/languages.service';
import { NotificationCoinAdjustmentDialogComponent } from "./shared/notification-coin-adjustment-dialog/notification-coin-adjustment-dialog.component";
import { VoucherPrivateLabelService } from "./services/voucher-private-label.service";
import { OrderToMitraHubService } from './services/user-management/private-label/order-to-mitra-hub.service';
import { Observable } from 'rxjs';
import { GeneralBackendService } from './services/general-backend.service';

// const config = {
//   apiKey: "AIzaSyD5x3GziNKf6WHwbDGwpMkqWbCsAIeK5Qc",
//   authDomain: "ayosrc-android-consumer.firebaseapp.com",
//   databaseURL: "https://ayosrc-android-consumer.firebaseio.com",
//   projectId: "ayosrc-android-consumer",
//   storageBucket: "ayosrc-android-consumer.appspot.com",
//   messagingSenderId: "651041534914"
// };

const config = {
  apiKey: 'AIzaSyD5x3GziNKf6WHwbDGwpMkqWbCsAIeK5Qc',
  authDomain: 'ayosrc-android-consumer.firebaseapp.com',
  databaseURL: 'https://ayosrc-android-consumer.firebaseio.com',
  projectId: 'ayosrc-android-consumer',
  storageBucket: 'ayosrc-android-consumer.appspot.com',
  messagingSenderId: '651041534914',
  appId: '1:651041534914:web:be573accf451ec608e1c5b'
};

export function HttpLoaderFactory(http: HttpClient, languageSetupService: LanguageSetupService) {
  // return new TranslateHttpLoader(http, '../assets/languages/', '.json');

  return new CustomLoader(languageSetupService, http);

}

class CustomLoader implements TranslateLoader {

  constructor(private service: LanguageSetupService, private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.service.getTranslation({type: 'principal'}).map(({data}) => {
      return data.json_format;
    })

  }
}

@NgModule({
  declarations: [
    AppComponent,
    ErrorDialogComponent,
    ConfirmationDialogComponent,
    ToastInformationComponent,
    PopupNotifComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient, LanguageSetupService]
      }
    }),
    // Fuse Main and Shared modules
    FuseModule.forRoot(fuseConfig),
    FuseSharedModule,
    FuseMainModule,
    InMemoryWebApiModule.forRoot(FuseFakeDbService, {
      delay: 0,
      passThruUnknownUrl: true,
    }),
    MatRadioModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    UserIdleModule.forRoot({ idle: 1140, timeout: 60, ping: 60 }),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireModule.initializeApp(config),
    NgProgressModule,
  ],
  providers: [
    // ===== QISCUS =====
    QiscusService,
    Emitter,
    StorageHelper,
    LanguagesService,
    TranslateService,

    AuthenticationService,
    DataService,
    DialogService,
    AdminPrincipalService,
    VendorsService,
    FieldForceService,
    PaguyubanService,
    CustomerService,
    WholesalerService,
    WholesalerSpecialPriceService,
    RetailerService,
    BannerService,
    LandingPageService,
    ProductService,
    ProductCashierService,
    ProductSubmissionService,
    RewardService,
    RewardHistoryService,
    CoinService,
    TemplateTaskService,
    CallObjectiveSerive,
    NotesRetailerService,
    KPISettingService,
    MasterKPIService,
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
    FeatureLevelService,
    AccountService,
    AuthGuard,
    GoogleAnalyticsService,
    NonAuthGuard,
    NavigationService,
    GeneralService,
    GeneralBackendService,
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
    PLStockService,
    TaskVerificationService,
    PayLaterCompanyService,
    PayLaterPanelService,
    PayLaterDeactivateService,
    PayLaterDistributionListService,
    VirtualAccountCompanyService,
    VirtualAccountBinService,
    VirtualAccountPanelService,
    VirtualAccountTncService,
    MedalBadgeService,
    CoinAdjustmentApprovalService,
    CoinDisburstmentService,
    AreaService,
    LanguagesService,
    VoucherPrivateLabelService,
    OrderToMitraHubService,
    CountrySetupService,
    LanguageSetupService,
    LotteryService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NgProgressInterceptor,
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: BaseInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: initLanguage,
      multi: true,
      deps: [LanguagesService]
    },
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ErrorDialogComponent,
    ConfirmationDialogComponent,
    ToastInformationComponent,
    PopupNotifComponent,
  ],
})
export class AppModule {
  constructor(protected _googleAnalyticsService: GoogleAnalyticsService) { }
}

export function initLanguage(lang: LanguagesService) {
  return (): Promise<any> => {
    return lang.initLang();
  };
}