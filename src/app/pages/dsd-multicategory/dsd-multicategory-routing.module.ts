import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PengaturanDsdComponent } from "./pengaturan-dsd/index/pengaturan-dsd.component";
import { PageGuard } from "app/classes/auth.guard";
import { brConfig } from "app/classes/breadcrumbs.config";
import { PengaturanDsdCreateComponent } from "./pengaturan-dsd/create/pengaturan-dsd-create.component";
import { PengaturanDsdEditComponent } from "./pengaturan-dsd/edit/pengaturan-dsd-edit.component";
import { PengaturanDsdDetailComponent } from "./pengaturan-dsd/detail/pengaturan-dsd-detail.component";
import { TrsSystemVariableComponent } from "./dsd-system-variable/trs-system-variable.component";
import { TrsReportComponent } from './dsd-report/trs-report.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: "pengaturan-dsd",
    pathMatch: "full"
  },
  {
    path: "trs-system-variable",
    component: TrsSystemVariableComponent,
    data: {
      breadcrumbs: brConfig.tactical_retail_sales.trs_system_variable
    },
  },
  {
    path: "pengaturan-dsd",
    component: PengaturanDsdComponent,
    data: {
      breadcrumbs: brConfig.tactical_retail_sales.trs_proposal.index
    },
  },
  {
    path: "pengaturan-dsd/create",
    component: PengaturanDsdCreateComponent,
    data: {
      breadcrumbs: brConfig.tactical_retail_sales.trs_proposal.create
    },
  },
  {
    path: "pengaturan-dsd/edit/:id",
    component: PengaturanDsdEditComponent,
    data: {
      breadcrumbs: brConfig.tactical_retail_sales.trs_proposal.edit
    },
  },
  {
    path: "pengaturan-dsd/detail/:id",
    component: PengaturanDsdDetailComponent,
    data: {
      breadcrumbs: brConfig.tactical_retail_sales.trs_proposal.detail
    },
  },
  {
    path: "trs-report",
    component: TrsReportComponent,
    data: {
      breadcrumbs: brConfig.tactical_retail_sales.trs_report
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DSDMulticategoryRoutingModule { }
