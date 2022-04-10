import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VirtualAccountCompanyComponent } from './virtual-account-company/index/virtual-account-company.component';
import { VirtualAccountNumberBinComponent } from './virtual-account-company/index/number-bin/virtual-account-number-bin.component';
import { VirtualAccountCompanyCreateComponent } from './virtual-account-company/create/virtual-account-company-create.component';
import { VirtualAccountCompanyEditComponent } from './virtual-account-company/edit/virtual-account-company-edit.component';
import { VirtualAccountBinCreateComponent } from './virtual-account-bin/create/virtual-account-bin-create.component';
import { VirtualAccountBinEditComponent } from './virtual-account-bin/edit/virtual-account-bin-edit.component';
import { VirtualAccountPanelComponent } from './virtual-account-panel/index/virtual-account-panel.component';
import { VirtualAccountPanelCreateComponent } from './virtual-account-panel/create/virtual-account-panel-create.component';
import { VirtualAccountPanelEditComponent } from './virtual-account-panel/edit/virtual-account-panel-edit.component';
import { VirtualAccountTncComponent } from './virtual-account-tnc/index/virtual-account-tnc.component';
import { VirtualAccountTncCreateComponent } from './virtual-account-tnc/create/virtual-account-tnc-create.component';
import { VirtualAccountTncEditComponent } from './virtual-account-tnc/edit/virtual-account-tnc-edit.component';

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
import { VirtualAccountRoutingModule } from "./virtual-account-routing.module";
import { PageGuard } from 'app/classes/auth.guard';
import { FroalaEditorModule, FroalaViewModule } from "angular-froala-wysiwyg";
import { VirtualAccountPanelMitraComponent } from './virtual-account-panel/create/virtual-account-panel-mitra/virtual-account-panel-mitra.component';
import { VirtualAccountPanelSrcComponent } from './virtual-account-panel/create/virtual-account-panel-src/virtual-account-panel-src.component';
import { VirtualAccountPanelSrcEditComponent } from './virtual-account-panel/edit/virtual-account-panel-src-edit/virtual-account-panel-src-edit.component';
import { VirtualAccountPanelMitraEditComponent } from './virtual-account-panel/edit/virtual-account-panel-mitra-edit/virtual-account-panel-mitra-edit.component';
import { VirtualAccountPanelImportDialogComponent } from './virtual-account-panel/virtual-account-panel-import-dialog/virtual-account-panel-import-dialog.component';
import { RupiahFormaterPipe } from '@fuse/pipes/rupiah-formater';
import { NgxCurrencyModule } from 'ngx-currency';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { VirtualAccountListResolver } from 'app/resolver/virtual-account.resolver';
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
console.log('test'); 
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
    VirtualAccountRoutingModule,
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
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    TranslateModule.forChild(),
  ],
  declarations: [
      VirtualAccountCompanyComponent,
      VirtualAccountNumberBinComponent,
      VirtualAccountCompanyCreateComponent,
      VirtualAccountCompanyEditComponent,
      VirtualAccountBinCreateComponent,
      VirtualAccountBinEditComponent,
      VirtualAccountPanelComponent,
      VirtualAccountPanelCreateComponent,
      VirtualAccountPanelEditComponent,
      VirtualAccountPanelMitraComponent,
      VirtualAccountPanelSrcComponent,
      VirtualAccountPanelSrcEditComponent,
      VirtualAccountPanelMitraEditComponent,
      VirtualAccountPanelImportDialogComponent,
      VirtualAccountTncComponent,
      VirtualAccountTncCreateComponent,
      VirtualAccountTncEditComponent,
    ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    RupiahFormaterPipe, PageGuard,
    VirtualAccountListResolver,
  ],
  exports: [
    VirtualAccountPanelMitraComponent,
    VirtualAccountPanelMitraEditComponent,
    VirtualAccountPanelSrcComponent,
    VirtualAccountPanelSrcEditComponent
  ],
  entryComponents: [
    VirtualAccountPanelImportDialogComponent,
    VirtualAccountNumberBinComponent
  ]
})
export class VirtualAccountModule { }
