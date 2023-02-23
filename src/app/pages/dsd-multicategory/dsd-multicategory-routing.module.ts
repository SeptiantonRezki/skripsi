import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PengaturanDsdComponent } from "./pengaturan-dsd/index/pengaturan-dsd.component";
import { PageGuard } from "app/classes/auth.guard";
import { brConfig } from "app/classes/breadcrumbs.config";
import { PengaturanDsdCreateComponent } from "./pengaturan-dsd/create/pengaturan-dsd-create.component";
import { PengaturanDsdEditComponent } from "./pengaturan-dsd/edit/pengaturan-dsd-edit.component";
import { PengaturanDsdDetailComponent } from "./pengaturan-dsd/detail/pengaturan-dsd-detail.component";
import { DsdReportComponent } from './dsd-report/dsd-report.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: "dsd-multicategory",
    pathMatch: "full"
  },
  {
    path: "pengaturan-dsd",
    component: PengaturanDsdComponent,
    data: {
      breadcrumbs: brConfig.dsd_multicategory.pengaturan_dsd
    },
  },
  {
    path: "pengaturan-dsd/edit/:id",
    component: PengaturanDsdEditComponent,
    data: {
      breadcrumbs: brConfig.dsd_multicategory.pengaturan_dsd
    },
  },
  {
    path: "dsd-report",
    component: DsdReportComponent,
    data: {
      breadcrumbs: brConfig.dsd_multicategory.dsd_report
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DSDMulticategoryRoutingModule { }
