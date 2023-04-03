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
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatAutocompleteModule
} from "@angular/material";
import { ngfModule } from 'angular-file';
import { FroalaEditorModule, FroalaViewModule } from "angular-froala-wysiwyg";
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PageGuard } from 'app/classes/auth.guard';
import { RupiahFormaterPipe } from '@fuse/pipes/rupiah-formater';
import { NgxCurrencyModule } from 'ngx-currency';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { TranslateModule } from '@ngx-translate/core';
import { PojokUntungRoutingModule } from './pojok-untung-routing.module';
import { PojokUntungTemplateComponent } from './pojok-untung-template/pojok-untung-template.component';
import { PojokUntungTemplateCreateComponent } from './pojok-untung-template/create/pojok-untung-template-create.component';
import { PojokUntungTemplateEditComponent } from './pojok-untung-template/edit/pojok-untung-template-edit.component';
import { PojokUntungPartnersListComponent } from './pojok-untung-partners-list/pojok-untung-partners-list.component';
import { PojokUntungPartnersListCreateComponent } from './pojok-untung-partners-list/create/pojok-untung-partners-list-create.component';
import { PojokUntungPartnersListEditComponent } from './pojok-untung-partners-list/edit/pojok-untung-partners-list-edit.component';
import { PojokUntungPartnersTemplateComponent } from './pojok-untung-partners-template/pojok-untung-partners-template.component';
import { PojokUntungPartnersTemplateCreateComponent } from './pojok-untung-partners-template/create/pojok-untung-partners-template-create.component';
import { PojokUntungPartnersTemplateEditComponent } from './pojok-untung-partners-template/edit/pojok-untung-partners-template-edit.component';
import { PojokUntungPartnersRegisteredComponent } from './pojok-untung-partners-registered/index/pojok-untung-partners-registered.component';
import { PartnerRegisteredFilterPipe } from '@fuse/pipes/partner-registered.pipe';
import { PojokUntungPartnersRegisteredImportDialogComponent } from './pojok-untung-partners-registered/pojok-untung-partners-registered-import-dialog/pojok-untung-partners-registered-import-dialog.component';

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
    MatAutocompleteModule,
    TranslateModule.forChild(),
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    PojokUntungRoutingModule
  ],
  declarations: [PojokUntungTemplateComponent, PojokUntungPartnersListComponent, PojokUntungTemplateCreateComponent, PojokUntungTemplateEditComponent, PojokUntungPartnersTemplateComponent, PojokUntungPartnersListCreateComponent, PojokUntungPartnersListEditComponent, PojokUntungPartnersTemplateCreateComponent, PojokUntungPartnersTemplateEditComponent, PojokUntungPartnersRegisteredComponent, PartnerRegisteredFilterPipe, PojokUntungPartnersRegisteredImportDialogComponent],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    RupiahFormaterPipe, PageGuard,
  ],
  exports: [],
  entryComponents: [PojokUntungPartnersRegisteredImportDialogComponent]
})
export class PojokUntungModule { }
