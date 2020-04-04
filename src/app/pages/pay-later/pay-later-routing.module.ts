import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PayLaterCompanyComponent } from "./pay-later-company/index/pay-later-company.component";
import { PageGuard } from "app/classes/auth.guard";
import { PayLaterCompanyCreateComponent } from "./pay-later-company/create/pay-later-company-create.component";
import { PayLaterCompanyEditComponent } from "./pay-later-company/edit/pay-later-company-edit.component";
import { brConfig } from "app/classes/breadcrumbs.config";


const routes: Routes = [
  {
    path: "",
    redirectTo: "companies",
    pathMatch: "full"
  },
  {
    path: "companies",
    component: PayLaterCompanyComponent,
    data: {
      breadcrumbs: brConfig.settings.access.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "companies/create",
    component: PayLaterCompanyCreateComponent,
    data: {
      breadcrumbs: brConfig.settings.access.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "companies/edit/:id",
    component: PayLaterCompanyEditComponent,
    data: {
      breadcrumbs: brConfig.settings.access.edit
    },
    // canActivate: [PageGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayLaterRoutingModule { }