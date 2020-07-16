import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PayLaterCompanyComponent } from "./pay-later-company/index/pay-later-company.component";
import { PageGuard } from "app/classes/auth.guard";
import { PayLaterCompanyCreateComponent } from "./pay-later-company/create/pay-later-company-create.component";
import { PayLaterCompanyEditComponent } from "./pay-later-company/edit/pay-later-company-edit.component";
import { brConfig } from "app/classes/breadcrumbs.config";
import { PayLaterDeactivateComponent } from "./pay-later-deactivate/paylater-deactivate.component";
import { PayLaterPanelComponent } from "./pay-later-panel/index/pay-later-panel.component";
import { PayLaterPanelEditComponent } from "./pay-later-panel/edit/pay-later-panel-edit.component";
import { PayLaterPanelCreateComponent } from "./pay-later-panel/create/pay-later-panel-create.component";
import { PayLaterActivationComponent } from "./pay-later-activation/pay-later-activation.component";


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
      breadcrumbs: brConfig.paylater.company.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "companies/create",
    component: PayLaterCompanyCreateComponent,
    data: {
      breadcrumbs: brConfig.paylater.company.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "companies/edit",
    component: PayLaterCompanyEditComponent,
    data: {
      breadcrumbs: brConfig.paylater.company.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "companies/detail",
    component: PayLaterCompanyEditComponent,
    data: {
      breadcrumbs: brConfig.paylater.company.detail
    },
    // canActivate: [PageGuard]
  },
  {
    path: "activate",
    component: PayLaterActivationComponent,
    data: {
      breadcrumbs: brConfig.paylater.deactivate.index
    }
  },
  {
    path: "deactivate",
    component: PayLaterDeactivateComponent,
    data: {
      breadcrumbs: brConfig.paylater.deactivate.index
    }
  },
  {
    path: "panel",
    component: PayLaterPanelComponent,
    data: {
      breadcrumbs: brConfig.paylater.panel.index
    }
  },
  {
    path: "panel/create",
    component: PayLaterPanelCreateComponent,
    data: {
      breadcrumbs: brConfig.paylater.panel.create
    }
  },
  {
    path: "panel/edit",
    component: PayLaterPanelEditComponent,
    data: {
      breadcrumbs: brConfig.paylater.panel.edit
    }
  },
  {
    path: "panel/detail",
    component: PayLaterPanelEditComponent,
    data: {
      breadcrumbs: brConfig.paylater.panel.detail
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayLaterRoutingModule { }