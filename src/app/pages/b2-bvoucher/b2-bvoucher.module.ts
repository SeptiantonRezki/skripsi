import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { B2BVoucherComponent } from './index/b2-b-voucher.component';
import { B2BVoucherCreateComponent } from './create/b2-b-voucher-create.component';
import { B2BVoucherEditComponent } from './edit/b2-b-voucher-edit.component';
import { Routes, RouterModule } from '@angular/router';
import { brConfig } from 'app/classes/breadcrumbs.config';
import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule, MatCheckboxModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatStepperModule, MatProgressBarModule, MatProgressSpinnerModule, MatTabsModule, MatTooltipModule, MatToolbarModule, MatDialogModule, MatExpansionPanel, MatExpansionModule, MatMenuModule, MatDatepickerModule, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatAutocompleteModule, MatChipsModule } from '@angular/material';
import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PageGuard } from 'app/classes/auth.guard';
import { NgxCurrencyModule } from 'ngx-currency';
import { NgxMaskModule } from "ngx-mask";
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { RedeemListComponent } from './redeem-list/redeem-list.component';
import { PanelMitraVoucherComponent } from './panel-mitra-voucher/panel-mitra-voucher.component';
import { ImportPanelDialogComponent } from './import-panel-dialog/import-panel-dialog.component';

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
    component: B2BVoucherComponent,
    data: {
      breadcrumbs: brConfig.b2b_voucher.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "create",
    component: B2BVoucherCreateComponent,
    data: {
      breadcrumbs: brConfig.b2b_voucher.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "edit",
    component: B2BVoucherEditComponent,
    data: {
      breadcrumbs: brConfig.deliveryManagement.courier_management.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "detail",
    component: B2BVoucherCreateComponent,
    data: {
      breadcrumbs: brConfig.b2b_voucher.detail
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
    MatChipsModule
  ],
  declarations: [B2BVoucherComponent, B2BVoucherCreateComponent, B2BVoucherEditComponent, RedeemListComponent, PanelMitraVoucherComponent, ImportPanelDialogComponent],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    PageGuard
  ],
  entryComponents: [RedeemListComponent, PanelMitraVoucherComponent, ImportPanelDialogComponent],
  exports: [RedeemListComponent, PanelMitraVoucherComponent]
})
export class B2BVoucherModule { }
