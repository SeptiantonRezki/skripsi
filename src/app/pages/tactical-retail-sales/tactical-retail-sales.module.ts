import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule, MatCheckboxModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatStepperModule, MatProgressBarModule, MatProgressSpinnerModule, MatTabsModule, MatTooltipModule, MatToolbarModule, MatDialogModule, MatExpansionPanel, MatExpansionModule, MatMenuModule } from '@angular/material';
import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PageGuard } from 'app/classes/auth.guard';
import { NgxCurrencyModule } from 'ngx-currency';
import { NgxMaskModule } from "ngx-mask";
import { TranslateModule } from '@ngx-translate/core';

import { TacticalRetailSalesRoutingModule } from './tactical-retail-sales-routing.module';
import { TrsProposalComponent } from './trs-proposal/index/trs-proposal.component';
import { TrsProposalEditComponent } from './trs-proposal/edit/trs-proposal-edit.component';
import { TrsProposalCreateComponent } from './trs-proposal/create/trs-proposal-create.component';
import { TrsSystemVariableComponent } from './trs-system-variable/trs-system-variable.component';

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
    ngfModule,
    NgxMatSelectSearchModule,
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
    NgxMaskModule.forRoot(),
    MatExpansionModule,
    MatMenuModule,
    TranslateModule.forChild(),
  ],
  declarations: [TrsProposalComponent, TrsProposalEditComponent, TrsProposalCreateComponent, TrsSystemVariableComponent],
  providers: [
    PageGuard
  ]
})

export class TacticalRetailSalesModule { }
