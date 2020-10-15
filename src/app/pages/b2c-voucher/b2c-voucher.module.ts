import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  MatMenuModule,
  MatDatepickerModule,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  DateAdapter,
  MatAutocompleteModule,
  MatChipsModule,
  MatRadioModule,
} from '@angular/material';
import { FroalaEditorModule, FroalaViewModule } from "angular-froala-wysiwyg";
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxCurrencyModule } from 'ngx-currency';
import { NgxMaskModule } from 'ngx-mask';
import { PageGuard } from 'app/classes/auth.guard';
import { B2CVoucherRoutingModule } from './b2c-voucher-routing.module';
import { B2CVoucherIndexComponent } from './index/b2c-voucher-index.component';
import { B2CVoucherCreateComponent } from './create/b2c-voucher-create.component';
import { B2CVoucherEditComponent } from './edit/b2c-voucher-edit.component';
import { PanelConsumerVoucherComponent } from './edit/tab/panel-consumer/panel-consumer-voucher.component';
import { PanelRetailerVoucherComponent } from './edit/tab/panel-retailer/panel-retailer-voucher.component';
import { PenukaranVoucherComponent } from './edit/tab/penukaran-voucher/penukaran-voucher.component';
import { DesignVoucherComponent } from './edit/tab/design-voucher/design-voucher.component';
import { ListDetailVoucherComponent } from './edit/tab/list-detail-voucher/list-detail-voucher.component';
import { ImportAudienceDialogComponent } from './edit/tab/import-audience-dialog/import-audience-dialog.component';
import { ListVoucherReimbursementComponent } from './index/list-voucher-reimbursement/list-voucher-reimbursement.component';

export const customCurrencyMaskConfig = {
  align: 'left',
  allowNegative: false,
  allowZero: true,
  decimal: ',',
  precision: 0,
  prefix: '',
  suffix: '',
  thousands: '.',
  nullable: false
};

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL'
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@NgModule({
  imports: [
    CommonModule,
    FuseSharedModule,
    SharedModule,
    B2CVoucherRoutingModule,
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
    MatAutocompleteModule,
    MatChipsModule,
    MatRadioModule,
    ngfModule,
    NgxMatSelectSearchModule,
    MatMenuModule,
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
    NgxMaskModule.forRoot(),
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
  ],
  declarations: [
    B2CVoucherIndexComponent,
    B2CVoucherCreateComponent,
    B2CVoucherEditComponent,
    PanelRetailerVoucherComponent,
    PanelConsumerVoucherComponent,
    PenukaranVoucherComponent,
    DesignVoucherComponent,
    ListDetailVoucherComponent,
    ListVoucherReimbursementComponent,
    ImportAudienceDialogComponent,
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { 
      provide: MAT_DATE_FORMATS,
      useValue: MY_FORMATS
    },
    PageGuard
  ],
  entryComponents: [
    PanelRetailerVoucherComponent,
    PanelConsumerVoucherComponent,
    PenukaranVoucherComponent,
    DesignVoucherComponent,
    ListDetailVoucherComponent,
    ListVoucherReimbursementComponent,
    ImportAudienceDialogComponent,
  ],
})
export class B2CVoucherModule { }
