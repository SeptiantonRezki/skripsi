import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CallobjRoutingModule } from './call-objective.routing';
import { PendingChangesGuard } from 'app/pages/call-objective/call-objective.guard';

import {
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatOptionModule,
  MatCheckboxModule,
  MatSelectModule,
  MatTabsModule,
  MatTooltipModule,
  MatButtonModule,
  MatSlideToggleModule,
  MatMenuModule,
  MatToolbarModule,
  MatDialogModule,
  MatDatepickerModule,
  MatAutocompleteModule,
  MatRadioModule,
  MatProgressBarModule,
  MatDividerModule,
  MatProgressSpinnerModule,
  MatChipsModule,
  MatBadgeModule,
  MatTableModule,
  MatCardModule,
  MatGridListModule
} from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { ngfModule } from 'angular-file';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { PageGuard } from 'app/classes/auth.guard';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { NgxMatSelectSearchModule } from '../../../../node_modules/ngx-mat-select-search';
import { NgxCurrencyModule } from 'ngx-currency';
import { RupiahFormaterPipe } from '@fuse/pipes/rupiah-formater';
import { LightboxModule } from 'ngx-lightbox';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { CreateCallObjectiveComponent } from './component/create-call-objective.component';
import {CallObjectiveListComponent} from './component/list-call-objective.component';
import { ImportObjectiveDialogComponent } from './import-component/import-objective-dialog.component';
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
  nullable: false,
};

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CallobjRoutingModule,
    FuseSharedModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatTooltipModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatToolbarModule,
    MatDialogModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatRadioModule,
    ngfModule,
    NgxDatatableModule,
    MatDatepickerModule,
    MatProgressBarModule,
    NgxMatSelectSearchModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTableModule,
    MatCardModule,
    MatGridListModule,
    NgxMaterialTimepickerModule,
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
    LightboxModule,
    NgxGraphModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    CreateCallObjectiveComponent,
    CallObjectiveListComponent,
    ImportObjectiveDialogComponent
  ],
  exports: [
  ],
  providers: [
    RupiahFormaterPipe,
    PendingChangesGuard,
    CreateCallObjectiveComponent,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    PageGuard,
  ],
  entryComponents: [
    ImportObjectiveDialogComponent
  ],
})
export class CallobjectiveModule {}
