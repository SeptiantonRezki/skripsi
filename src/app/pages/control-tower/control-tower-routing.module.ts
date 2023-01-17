import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from "../../classes/breadcrumbs.config";
import { PageGuard } from "app/classes/auth.guard";
import { AreaConfiguration } from './area-configuration/area-configuration.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: "area-configuration",
    pathMatch: "full"
  },
  {
    path: "area-configuration",
    component: AreaConfiguration,
    data: {
      breadcrumbs: brConfig.area_configuration.index
    },
    // canActivate: [PageGuard]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControlTowerRoutingModule {}
