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

} from "@angular/material";

import { CustomerCareRoutingModule } from "./customer-care-routing.module";
import { PertanyaanVerifikasiAgentComponent } from './pertanyaan-verifikasi-agent/pertanyaan-verifikasi-agent.component';
import { PertanyaanVerifikasiAgentDetailComponent } from './pertanyaan-verifikasi-agent/pertanyaan-verifikasi-agent-detail/pertanyaan-verifikasi-agent-detail.component';
import { UserManagementModule } from '../user-management/user-management.module';
import { RupiahFormaterPipe } from '@fuse/pipes/rupiah-formater';
import { DeviceRecoverComponent } from './device-recover/device-recover.component';
import { DeviceRecoveredComponent } from './device-recovered/device-recovered.component';
import { DeviceRecoveredSettingsComponent } from './device-recovered/device-recovered-settings/device-recovered-settings.component';
@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
    FuseSharedModule,
    SharedModule,
    CustomerCareRoutingModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatTabsModule,
    UserManagementModule,
  ],
  declarations: [
    PertanyaanVerifikasiAgentComponent,
    PertanyaanVerifikasiAgentDetailComponent,
    DeviceRecoverComponent,
    DeviceRecoveredComponent,
    DeviceRecoveredSettingsComponent,
  ],
  providers: [
    PageGuard,
    RupiahFormaterPipe,
  ],
  exports: [
    DeviceRecoverComponent
  ]
})
export class CustomerCareModule { }
