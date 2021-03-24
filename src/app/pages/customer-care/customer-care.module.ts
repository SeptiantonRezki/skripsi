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
  ],
  providers: [
    PageGuard,
    RupiahFormaterPipe,
  ],
})
export class CustomerCareModule { }
