import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupingPelangganIndexComponent } from './grouping-pelanggan/index/grouping-pelanggan-index.component';
import { FuseSharedModule } from '@fuse/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatAutocompleteModule, MatButtonModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatProgressBarModule, MatProgressSpinnerModule, MatSelectModule, MatSlideToggleModule, MatStepperModule, MatTabsModule, MatToolbarModule, MatTooltipModule } from '@angular/material';
import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { brConfig } from 'app/classes/breadcrumbs.config';
import { RoutePlanComponent } from './route-plan/route-plan.component';
import { RcaAgentComponent } from '../user-management/rca-agent/rca-agent.component';
import { RcaAgentCreateComponent } from '../user-management/rca-agent/create/rca-agent-create.component';
import { RcaAgentEditComponent } from '../user-management/rca-agent/edit/rca-agent-edit.component';
import { PositionCodeDialogComponent } from './position-code-dialog/position-code-dialog.component';
import { RoutePlanDaysDialogComponent } from './route-plan-days-dialog/route-plan-days-dialog.component';

const routes: Routes = [
  {
    path: "grouping-pelanggan",
    component: GroupingPelangganIndexComponent,
    data: {
      breadcrumbs: brConfig.remote_call_activation.grouping_pelanggan
    },
    // canActivate: [PageGuard]
  },
  {
    path: "rute-kunjungan",
    component: RoutePlanComponent,
    data: {
      breadcrumbs: brConfig.remote_call_activation.route_plan
    },
  },
  {
    path: "agent-pengguna",
    component: RcaAgentComponent,
    data: {
      breadcrumbs: brConfig.rca_agent.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "agent-pengguna/create",
    component: RcaAgentCreateComponent,
    data: {
      breadcrumbs: brConfig.rca_agent.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "agent-pengguna/edit",
    component: RcaAgentEditComponent,
    data: {
      breadcrumbs: brConfig.rca_agent.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "agent-pengguna/detail",
    component: RcaAgentEditComponent,
    data: {
      breadcrumbs: brConfig.rca_agent.detail
    },
    // canActivate: [PageGuard]
  },

]
@NgModule({
  imports: [
    CommonModule,
    FuseSharedModule,
    RouterModule.forChild(routes),
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
    MatDatepickerModule,
    ngfModule,
    NgxMatSelectSearchModule,
    MatExpansionModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatSlideToggleModule
  ],
  declarations: [GroupingPelangganIndexComponent, RoutePlanComponent, RcaAgentComponent, RcaAgentCreateComponent, RcaAgentEditComponent, PositionCodeDialogComponent, RoutePlanDaysDialogComponent],
  exports: [PositionCodeDialogComponent, RoutePlanDaysDialogComponent],
  entryComponents: [PositionCodeDialogComponent, RoutePlanDaysDialogComponent]
})
export class RemoteCallActivationModule { }
