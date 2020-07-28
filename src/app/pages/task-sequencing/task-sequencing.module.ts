import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from "@swimlane/ngx-datatable";

import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "../../shared/shared.module";

import { TaskSequencingRoutingModule } from './task-sequencing-routing.module';
import { TaskSequencingComponent } from './task-sequencing/index/task-sequencing.component';
import { TaskSequencingCreateComponent } from './task-sequencing/create/task-sequencing-create.component';

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
  MatChipsModule,
  MatAutocompleteModule,
  MatDatepickerModule,
  MatDividerModule,
  MatListModule,
} from "@angular/material";

import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from "@angular/material/core";

import { PageGuard } from "app/classes/auth.guard";

import { RupiahFormaterWithoutRpPipe } from "@fuse/pipes/rupiah-formater";
import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

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
    TaskSequencingRoutingModule,
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
    MatChipsModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatDividerModule,
    MatListModule,
  ],
  declarations: [TaskSequencingComponent, TaskSequencingCreateComponent],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    RupiahFormaterWithoutRpPipe,
    PageGuard,
  ],
})
export class TaskSequencingModule { }
