import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupingPelangganIndexComponent } from './grouping-pelanggan/index/grouping-pelanggan-index.component';
import { GroupingPelangganCreateComponent } from './grouping-pelanggan/create/grouping-pelanggan-create.component';
import { GroupingPelangganeditComponent } from './grouping-pelanggan/edit/grouping-pelangganedit.component';
import { GroupingPelangganSummaryComponent } from './grouping-pelanggan/summary/grouping-pelanggan-summary.component';
import { FuseSharedModule } from '@fuse/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatAutocompleteModule, MatButtonModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatProgressBarModule, MatProgressSpinnerModule, MatSelectModule, MatStepperModule, MatTabsModule, MatToolbarModule, MatTooltipModule } from '@angular/material';
import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { brConfig } from 'app/classes/breadcrumbs.config';
import { RoutePlanComponent } from './route-plan/route-plan.component';

const routes: Routes = [
  {
    path: "grouping-pelanggan",
    component: GroupingPelangganIndexComponent,
    data: {
      breadcrumbs: brConfig.b2b_voucher.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "rute-kunjungan",
    component: RoutePlanComponent,
    data: {
      breadcrumbs: brConfig.b2b_voucher.index
    },
  }
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
    MatChipsModule
  ],
  declarations: [GroupingPelangganIndexComponent, GroupingPelangganCreateComponent, GroupingPelangganeditComponent, GroupingPelangganSummaryComponent, RoutePlanComponent]
})
export class RemoteCallActivationModule { }
