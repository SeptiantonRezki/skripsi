import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from "../../classes/breadcrumbs.config";
import { PageGuard } from "app/classes/auth.guard";
import { PertanyaanVerifikasiAgentComponent } from './pertanyaan-verifikasi-agent/pertanyaan-verifikasi-agent.component';
import { PertanyaanVerifikasiAgentDetailComponent } from './pertanyaan-verifikasi-agent/pertanyaan-verifikasi-agent-detail/pertanyaan-verifikasi-agent-detail.component';
import { DeviceRecoveredComponent } from './device-recovered/device-recovered.component';
const routes: Routes = [
  {
    path: "",
    redirectTo: "pertanyaan-verifikasi-agent",
    pathMatch: "full"
  },
  {
    path: "pertanyaan-verifikasi-agent",
    component: PertanyaanVerifikasiAgentComponent,
    data: {
      breadcrumbs: brConfig.customer_care.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "pertanyaan-verifikasi-agent/detail",
    component: PertanyaanVerifikasiAgentDetailComponent,
    data: {
      breadcrumbs: brConfig.customer_care.detail
    },
    canActivate: [PageGuard]
  },
  {
    path: "device-recovered",
    component: DeviceRecoveredComponent,
    data: {
      breadcrumbs: brConfig.customer_care.device_recovered
    },
    // canActivate: [PageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerCareRoutingModule { }
