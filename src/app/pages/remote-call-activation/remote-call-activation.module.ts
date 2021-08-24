import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupingPelangganIndexComponent } from './grouping-pelanggan/index/grouping-pelanggan-index.component';
import { GroupingPelangganCreateComponent } from './grouping-pelanggan/create/grouping-pelanggan-create.component';
import { GroupingPelangganeditComponent } from './grouping-pelanggan/edit/grouping-pelangganedit.component';
import { GroupingPelangganSummaryComponent } from './grouping-pelanggan/summary/grouping-pelanggan-summary.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [GroupingPelangganIndexComponent, GroupingPelangganCreateComponent, GroupingPelangganeditComponent, GroupingPelangganSummaryComponent]
})
export class RemoteCallActivationModule { }
