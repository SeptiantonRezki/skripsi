import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayLaterCompanyComponent } from './pay-later-company/index/pay-later-company.component';
import { PayLaterCompanyCreateComponent } from './pay-later-company/create/pay-later-company-create.component';
import { PayLaterCompanyEditComponent } from './pay-later-company/edit/pay-later-company-edit.component';
import { PayLaterPanelComponent } from './pay-later-panel/index/pay-later-panel.component';
import { PayLaterPanelCreateComponent } from './pay-later-panel/create/pay-later-panel-create.component';
import { PayLaterPanelEditComponent } from './pay-later-panel/edit/pay-later-panel-edit.component';
import { PayLaterDeactivateRequestComponent } from './pay-later-deactivate/request/pay-later-deactivate-request.component';
import { PayLaterDeactivateHistoryComponent } from './pay-later-deactivate/history/pay-later-deactivate-history.component';
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
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS
} from "@angular/material";
import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PayLaterRoutingModule } from "./pay-later-routing.module";
import { PageGuard } from 'app/classes/auth.guard';
import { PayLaterDeactivateComponent } from './pay-later-deactivate/paylater-deactivate.component';
import { PayLaterPanelMitraComponent } from './pay-later-panel/create/pay-later-panel-mitra/pay-later-panel-mitra.component';
import { PayLaterPanelSrcComponent } from './pay-later-panel/create/pay-later-panel-src/pay-later-panel-src.component';
import { PayLaterPanelSrcEditComponent } from './pay-later-panel/edit/pay-later-panel-src-edit/pay-later-panel-src-edit.component';
import { PayLaterPanelMitraEditComponent } from './pay-later-panel/edit/pay-later-panel-mitra-edit/pay-later-panel-mitra-edit.component';
import { DeactivateReasonDialogComponent } from './pay-later-deactivate/deactivate-reason-dialog/deactivate-reason-dialog.component';
import { PayLaterPanelImportDialogComponent } from './pay-later-panel/pay-later-panel-import-dialog/pay-later-panel-import-dialog.component';
import { RupiahFormaterPipe } from '@fuse/pipes/rupiah-formater';
import { NgxCurrencyModule } from 'ngx-currency';
import { PayLaterActivationComponent } from './pay-later-activation/pay-later-activation.component';
import { PayLaterActivationSrcComponent } from './pay-later-activation/pay-later-activation-src/pay-later-activation-src.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

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
    FuseSharedModule,
    PayLaterRoutingModule,
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
    MatMenuModule,
    MatDatepickerModule,
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
  ],
  declarations: [PayLaterCompanyComponent, PayLaterCompanyCreateComponent, PayLaterCompanyEditComponent, PayLaterPanelComponent, PayLaterPanelCreateComponent, PayLaterPanelEditComponent, PayLaterDeactivateComponent, PayLaterDeactivateRequestComponent, PayLaterDeactivateHistoryComponent, PayLaterPanelMitraComponent, PayLaterPanelSrcComponent, PayLaterPanelSrcEditComponent, PayLaterPanelMitraEditComponent, DeactivateReasonDialogComponent, PayLaterPanelImportDialogComponent, PayLaterActivationComponent, PayLaterActivationSrcComponent],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    RupiahFormaterPipe, PageGuard],
  exports: [PayLaterDeactivateRequestComponent, PayLaterDeactivateHistoryComponent, PayLaterPanelMitraComponent, PayLaterPanelMitraEditComponent, PayLaterPanelSrcComponent, PayLaterPanelSrcEditComponent],
  entryComponents: [DeactivateReasonDialogComponent, PayLaterPanelImportDialogComponent]
})
export class PayLaterModule { }
