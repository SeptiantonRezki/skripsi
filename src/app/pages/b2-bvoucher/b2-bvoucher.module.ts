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
import { MatButtonModule, MatCheckboxModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatStepperModule, MatProgressBarModule, MatProgressSpinnerModule, MatTabsModule, MatTooltipModule, MatToolbarModule, MatDialogModule, MatExpansionPanel, MatExpansionModule, MatMenuModule } from '@angular/material';
import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PageGuard } from 'app/classes/auth.guard';
import { NgxCurrencyModule } from 'ngx-currency';
import { NgxMaskModule } from "ngx-mask";

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
      breadcrumbs: brConfig.deliveryManagement.courier_management.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "create",
    component: B2BVoucherCreateComponent,
    data: {
      breadcrumbs: brConfig.deliveryManagement.courier_management.create
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
    component: B2BVoucherEditComponent,
    data: {
      breadcrumbs: brConfig.deliveryManagement.courier_management.detail
    },
    // canActivate: [PageGuard]
  },
]

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
    ngfModule,
    NgxMatSelectSearchModule,
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
    NgxMaskModule.forRoot(),
    MatExpansionModule,
    MatMenuModule
  ],
  declarations: [B2BVoucherComponent, B2BVoucherCreateComponent, B2BVoucherEditComponent],
  providers: [PageGuard]
})
export class B2BVoucherModule { }
