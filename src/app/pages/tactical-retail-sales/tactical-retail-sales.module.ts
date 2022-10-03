import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PageGuard } from 'app/classes/auth.guard';
import { NgxMaskModule } from "ngx-mask";
import { TranslateModule } from '@ngx-translate/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';

import { MatButtonModule, 
  MatCheckboxModule, 
  MatIconModule, 
  MatFormFieldModule, 
  MatInputModule, 
  MatSelectModule, 
  MatStepperModule, 
  MatProgressBarModule, 
  MatProgressSpinnerModule, 
  MatTabsModule, 
  MatRadioModule,
  MatTooltipModule, 
  MatDatepickerModule,
  MatToolbarModule, 
  MatDialogModule, 
  MatSlideToggleModule,
  MatExpansionPanel, 
  MatExpansionModule, 
  MatMenuModule } from '@angular/material';

import { TacticalRetailSalesRoutingModule } from './tactical-retail-sales-routing.module';
import { TrsProposalComponent } from './trs-proposal/index/trs-proposal.component';
import { TrsProposalCreateComponent } from './trs-proposal/create/trs-proposal-create.component';
import { TrsProposalEditComponent } from './trs-proposal/edit/trs-proposal-edit.component';
import { TrsSystemVariableComponent } from './trs-system-variable/trs-system-variable.component';
import { TrsProposalExecutorComponent } from './trs-proposal/component/trs-proposal-executor.component';
import { TrsProposalKecamatanComponent } from './trs-proposal/component/trs-proposal-kecamatan.component';
import { TrsProposalProductComponent } from './trs-proposal/component/trs-proposal-product.component';
import { TrsCancelReasonComponent } from './trs-proposal/component/trs-cancel-reason.component';
import { ConfirmationDialogComponent } from './trs-system-variable/confirmation-dialog/confirmation-dialog.component';

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
    FuseSharedModule,
    SharedModule,
    TacticalRetailSalesRoutingModule,
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
    MatSlideToggleModule,
    MatRadioModule,
    ngfModule,
    NgxMatSelectSearchModule,
    NgxMaskModule.forRoot(),
    MatExpansionModule,
    MatMenuModule,
    TranslateModule.forChild(),
  ],
  declarations: [TrsProposalComponent, TrsProposalCreateComponent, TrsProposalEditComponent, TrsSystemVariableComponent, TrsProposalExecutorComponent, TrsProposalKecamatanComponent, TrsProposalProductComponent, TrsCancelReasonComponent, ConfirmationDialogComponent],
  providers: [
    TrsProposalExecutorComponent,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    PageGuard
  ],
  entryComponents: [
    TrsProposalExecutorComponent,
    TrsProposalKecamatanComponent,
    TrsProposalProductComponent,
    TrsCancelReasonComponent,
    ConfirmationDialogComponent
  ],
})

export class TacticalRetailSalesModule { }
