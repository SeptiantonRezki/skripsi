import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "../../shared/shared.module";
import { ngfModule } from "angular-file";

import { SkuManagementRoutingModule } from "./sku-management-routing.module";
import { ProductIndexComponent } from "./product/index/product-index.component";
import { ProductCreateComponent } from "./product/create/product-create.component";
import { ProductEditComponent } from "./product/edit/product-edit.component";
import { RewardIndexComponent } from "./reward/index/reward-index.component";
import { RewardCreateComponent } from "./reward/create/reward-create.component";
import { RewardEditComponent } from "./reward/edit/reward-edit.component";
import { RewardHistoryIndexComponent } from "./reward-history/index/reward-history-index.component";
import { CoinIndexComponent } from "./coin/index/coin-index.component";
import { PageGuard } from "app/classes/auth.guard";
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatTabsModule,
  MatChipsModule,
  MatSelectModule,
  MatDatepickerModule,
  MatRadioModule,
  MatTooltipModule,
  MatAutocompleteModule,
  MatSnackBarModule,
  MatProgressBarModule,
  MatMenuModule,
  MatToolbarModule,
  MatDialogModule,
  MatDatepicker,
  MatProgressSpinnerModule,
} from "@angular/material";
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatDividerModule,
  MatListModule,
} from "@angular/material";

import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { NgxCurrencyModule } from "ngx-currency";

import {
  ListBrandResolver,
  ListCategoryResolver,
  ListPackagingResolver
} from "../../resolver/product.resolver";
import { ScanBarcodeDialogComponent } from "./product/create/dialog/scan-barcode-dialog.component";
import { AutofocusModule } from 'angular-autofocus-fix';
import { DetailTradeProgramComponent } from './coin/detail/detail-trade-program/detail-trade-program.component';
import { DetailRetailerComponent } from './coin/detail/detail-retailer/detail-retailer.component';
import { RupiahFormaterPipe } from "@fuse/pipes/rupiah-formater";
import { RetailerComponent } from './coin/index/retailer/retailer.component';
import { ProgramComponent } from './coin/index/program/program.component';
import { ImportAdjustmentCoinDialogComponent } from './coin/index/import-adjustment-coin-dialog/import-adjustment-coin-dialog.component';
import { ImportFileDialogComponent } from './product/index/import-file-dialog/import-file-dialog.component';
import { NontsmComponent } from './coin/index/nontsm/nontsm.component';
import { TsmComponent } from './coin/index/tsm/tsm.component';
import { RetailertsmComponent } from './coin/index/retailertsm/retailertsm.component';
import { ProgramtsmComponent } from './coin/index/programtsm/programtsm.component';
import { TsmImportAdjustmenCoinDialogComponent } from './coin/index/tsm-import-adjustmen-coin-dialog/tsm-import-adjustmen-coin-dialog.component';
import { CashierIndexComponent } from './product-cashier/index/index.component';
import { CashierCreateComponent } from './product-cashier/create/create.component';
import { CashierEditComponent } from './product-cashier/edit/edit.component';

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
    SkuManagementRoutingModule,
    FuseSharedModule,
    SharedModule,
    NgxDatatableModule,
    NgxMatSelectSearchModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatChipsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatDialogModule,
    MatToolbarModule,
    ngfModule,
    AutofocusModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule,
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
  ],
  declarations: [
    ProductIndexComponent,
    ProductCreateComponent,
    ProductEditComponent,
    RewardIndexComponent,
    RewardCreateComponent,
    RewardEditComponent,
    RewardHistoryIndexComponent,
    CoinIndexComponent,
    ScanBarcodeDialogComponent,
    DetailTradeProgramComponent,
    DetailRetailerComponent,
    RetailerComponent,
    ProgramComponent,
    ImportAdjustmentCoinDialogComponent,
    ImportFileDialogComponent,
    NontsmComponent,
    TsmComponent,
    RetailertsmComponent,
    ProgramtsmComponent,
    TsmImportAdjustmenCoinDialogComponent,
    CashierIndexComponent,
    CashierCreateComponent,
    CashierEditComponent,
  ],
  exports: [
    ProductIndexComponent,
    ProductCreateComponent,
    ProductEditComponent,
    RewardIndexComponent,
    RewardCreateComponent,
    RewardEditComponent,
    RewardHistoryIndexComponent,
    CoinIndexComponent,
    DetailTradeProgramComponent,
    DetailRetailerComponent,
    ImportFileDialogComponent
  ],
  entryComponents: [ScanBarcodeDialogComponent, ImportAdjustmentCoinDialogComponent, ImportFileDialogComponent, TsmImportAdjustmenCoinDialogComponent],
  providers: [
    ListBrandResolver,
    ListCategoryResolver,
    ListPackagingResolver,
    PageGuard,
    RupiahFormaterPipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class SkuManagementModule { }
