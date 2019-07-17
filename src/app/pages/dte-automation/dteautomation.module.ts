import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EOrderComponent } from './e-order/e-order.component';
import { AudienceTradeProgramComponent } from './audience-trade-program.component';
import { Routes, RouterModule } from '@angular/router';
import { brConfig } from "../../classes/breadcrumbs.config";
import { PageGuard } from "app/classes/auth.guard";

import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "../../shared/shared.module";
import { ngfModule } from "angular-file";

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatTabsModule,
  MatChipsModule,
  MatSelectModule,
  MatDatepickerModule,
  MatRadioModule,
  MatTooltipModule,
  MatAutocompleteModule,
  MatSnackBarModule,
  MatProgressBarModule,
  MatMenuModule,
  MatToolbarModule,
  MatDialogModule,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatProgressSpinnerModule
} from "@angular/material";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RupiahFormaterPipe } from '@fuse/pipes/rupiah-formater';
import { ImportAudienceDialogComponent } from '../dte/audience/import/import-audience-dialog.component';
import { ListSchedulerResolver } from 'app/resolver/dte.resolver';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../inapp-marketing/inapp-marketing.module';


const routes: Routes = [
  {
    path: "",
    redirectTo: "audience-trade-program",
    pathMatch: "full"
  },
  {
    path: "audience-trade-program",
    component: AudienceTradeProgramComponent,
    data: {
      breadcrumbs: brConfig.dte_automation.index
    },
    resolve: {
      listScheduler: ListSchedulerResolver
    }
    // canActivate: [PageGuard]
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FuseSharedModule,
    SharedModule,
    NgxDatatableModule,
    NgxMatSelectSearchModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatChipsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatDialogModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    ngfModule,
  ],
  declarations: [EOrderComponent, AudienceTradeProgramComponent, ImportAudienceDialogComponent],
  entryComponents: [ImportAudienceDialogComponent],
  providers: [
    RupiahFormaterPipe,
    ListSchedulerResolver,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class DTEAutomationModule { }
