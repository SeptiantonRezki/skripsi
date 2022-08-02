import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopingDiscountCoinsComponent } from './index/shoping-discount-coins.component';
import { ShopingDiscountCoinsCreateComponent } from './create/shoping-discount-coins-create.component';
import { Routes, RouterModule } from '@angular/router';
import { brConfig } from 'app/classes/breadcrumbs.config';
import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
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
  MatExpansionModule,
  MatMenuModule,
  MatDatepickerModule,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatAutocompleteModule,
  MatChipsModule
} from '@angular/material';
import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PageGuard } from 'app/classes/auth.guard';
import { NgxCurrencyModule } from 'ngx-currency';
import { NgxMaskModule } from "ngx-mask";
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { RedeemListComponent } from './redeem-list/redeem-list.component';
import { PanelMitraCoinComponent } from './panel-mitra-coin/panel-mitra-coin.component';
import { ImportPanelDialogComponent } from './import-panel-dialog/import-panel-dialog.component';
import { ImportRedeemDialogComponent } from './redeem-list/import-redeem-dialog/import-redeem-dialog.component';
import { TranslateModule } from '@ngx-translate/core';

export const customCurrencyMaskConfig = {
  align: "left",
  allowNegative: false,
  allowZero: true,
  decimal: ",",
  precision: 0,
  prefix: "",
  suffix: "",
  thousands: ".",
  nullable: false
};


const routes: Routes = [
  {
    path: "",
    component: ShopingDiscountCoinsComponent,
    data: {
      breadcrumbs: brConfig.discount_coins_order.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "create",
    component: ShopingDiscountCoinsCreateComponent,
    data: {
      breadcrumbs: brConfig.discount_coins_order.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "detail",
    component: ShopingDiscountCoinsCreateComponent,
    data: {
      breadcrumbs: brConfig.discount_coins_order.detail
    },
    // canActivate: [PageGuard]
  },
]

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
    RouterModule.forChild(routes),
    SharedModule,
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
    MatDatepickerModule,
    ngfModule,
    NgxMatSelectSearchModule,
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
    NgxMaskModule.forRoot(),
    MatExpansionModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatChipsModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    ShopingDiscountCoinsComponent,
    ShopingDiscountCoinsCreateComponent,
    RedeemListComponent,
    PanelMitraCoinComponent,
    ImportPanelDialogComponent,
    ImportRedeemDialogComponent,
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    PageGuard
  ],
  entryComponents: [
    RedeemListComponent,
    PanelMitraCoinComponent,
    ImportPanelDialogComponent,
    ImportRedeemDialogComponent,
  ],
  exports: [RedeemListComponent, PanelMitraCoinComponent]
})
export class ShopingDiscountCoinsModule { }
