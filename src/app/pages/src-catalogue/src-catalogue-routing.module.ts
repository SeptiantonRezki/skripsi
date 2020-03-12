import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PageGuard } from "app/classes/auth.guard";
import { brConfig } from "../../classes/breadcrumbs.config";
import { VendorsIndexComponent } from './vendors/index/vendors-index.component';


const routes: Routes = [
  {
    path: "",
    redirectTo: "vendors",
    pathMatch: "full"
  },
  {
    path: "vendors",
    component: VendorsIndexComponent,
    data: {
      breadcrumbs: brConfig.adminprincipal.index
    },
    // canActivate: [PageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SrcCatalogueRoutingModule { }
