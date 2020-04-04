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
  MatDialogModule
} from "@angular/material";
import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PayLaterRoutingModule } from "./pay-later-routing.module";
import { PageGuard } from 'app/classes/auth.guard';

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
  ],
  declarations: [PayLaterCompanyComponent, PayLaterCompanyCreateComponent, PayLaterCompanyEditComponent, PayLaterPanelComponent, PayLaterPanelCreateComponent, PayLaterPanelEditComponent, PayLaterDeactivateRequestComponent, PayLaterDeactivateHistoryComponent],
  providers: [PageGuard]
})
export class PayLaterModule { }
