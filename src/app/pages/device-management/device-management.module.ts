import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "../../shared/shared.module";
import { PageGuard } from "app/classes/auth.guard";
import {
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatCheckboxModule,
  MatTabsModule,
  MatTableModule,
  MatButtonModule,
  MatDatepickerModule,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,

} from "@angular/material";
import { DeviceRecoveredComponent } from './device-recovered/device-recovered.component';
import { RupiahFormaterPipe } from '@fuse/pipes/rupiah-formater';
import { RouterModule, Routes } from '@angular/router';
import { brConfig } from 'app/classes/breadcrumbs.config';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../b2-bvoucher/b2-bvoucher.module';

const routes: Routes = [
  {
    path: "recovery",
    component: DeviceRecoveredComponent,
    data: {
      breadcrumbs: brConfig.device_management.index
    },
  },
]

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
    FuseSharedModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatDatepickerModule
  ],
  declarations: [
    DeviceRecoveredComponent,
  ],
  providers: [
    PageGuard,
    RupiahFormaterPipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DeviceManagementModule { }
