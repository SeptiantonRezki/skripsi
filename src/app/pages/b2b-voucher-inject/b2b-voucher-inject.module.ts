import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { B2BVoucherInjectComponent } from './index/b2b-voucher-inject.component';
import { B2BVoucherInjectCreateComponent } from './create/b2b-voucher-inject-create.component';
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
import { NgxMaskModule } from 'ngx-mask';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { PanelMitraVoucherComponent } from './panel-mitra-voucher/panel-mitra-voucher.component';
import { ImportPanelDialogComponent } from './import-panel-dialog/import-panel-dialog.component';
import { ImportRedeemDialogComponent } from './redeem-list/import-redeem-dialog/import-redeem-dialog.component';
import { RedeemListComponent } from './redeem-list/redeem-list.component';
import { TranslateModule } from '@ngx-translate/core';

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


const routes: Routes = [
  {
    path: '',
    component: B2BVoucherInjectComponent,
    data: {
      breadcrumbs: brConfig.b2b_voucher_inject.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: 'create',
    component: B2BVoucherInjectCreateComponent,
    data: {
      breadcrumbs: brConfig.b2b_voucher_inject.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: 'edit',
    component: B2BVoucherInjectCreateComponent,
    data: {
      breadcrumbs: brConfig.b2b_voucher_inject.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: 'detail',
    component: B2BVoucherInjectCreateComponent,
    data: {
      breadcrumbs: brConfig.b2b_voucher_inject.detail
    },
    // canActivate: [PageGuard]
  },
]

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
    B2BVoucherInjectComponent,
    B2BVoucherInjectCreateComponent,
    PanelMitraVoucherComponent,
    RedeemListComponent,
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
    PanelMitraVoucherComponent,
    RedeemListComponent,
    ImportPanelDialogComponent,
    ImportRedeemDialogComponent,
  ],
  exports: [PanelMitraVoucherComponent]
})
export class B2BVoucherInjectModule { }
