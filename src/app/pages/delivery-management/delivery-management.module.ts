import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourierManagementComponent } from './courier-management/index/courier-management.component';
import { CourierCreateManagamentComponent } from './courier-management/create/courier-create-managament.component';
import { CourierEditManagementComponent } from './courier-management/edit/courier-edit-management.component';
import { MitraDeliveryPanelComponent } from './mitra-delivery-panel/index/mitra-delivery-panel.component';
import { MitraDeliveryPanelCreateComponent } from './mitra-delivery-panel/create/mitra-delivery-panel-create.component';
import { MitraDeliveryPanelEditComponent } from './mitra-delivery-panel/edit/mitra-delivery-panel-edit.component';
import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule, MatCheckboxModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatStepperModule, MatProgressBarModule, MatProgressSpinnerModule, MatTabsModule, MatTooltipModule, MatToolbarModule, MatDialogModule, MatExpansionPanel, MatExpansionModule } from '@angular/material';
import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PageGuard } from 'app/classes/auth.guard';
import { DeliveryManagementRoutingModule } from './delivery-management-routing.module';
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

@NgModule({
  imports: [
    CommonModule,
    FuseSharedModule,
    SharedModule,
    DeliveryManagementRoutingModule,
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
    MatExpansionModule
  ],
  declarations: [CourierManagementComponent, CourierCreateManagamentComponent, CourierEditManagementComponent, MitraDeliveryPanelComponent, MitraDeliveryPanelCreateComponent, MitraDeliveryPanelEditComponent],
  providers: [
    PageGuard
  ]
})
export class DeliveryManagementModule { }
