import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PayLaterCompanyTabComponent } from "./pay-later-company/pay-later-company-tab.component";
import { PageGuard } from "app/classes/auth.guard";
import { PayLaterCompanyCreateComponent } from "./pay-later-company/create/pay-later-company-create.component";
import { PayLaterCompanyEditComponent } from "./pay-later-company/edit/pay-later-company-edit.component";
import { brConfig } from "app/classes/breadcrumbs.config";
import { PayLaterDeactivateTabComponent } from "./pay-later-deactivate/pay-later-deactivate-tab.component";
import { PayLaterPanelTabComponent } from "./pay-later-panel/pay-later-panel-tab.component";
import { PayLaterPanelEditComponent } from "./pay-later-panel/edit/pay-later-panel-edit.component";
import { PayLaterPanelCreateComponent } from "./pay-later-panel/create/pay-later-panel-create.component";
import { PayLaterActivationTabComponent } from "./pay-later-activation/pay-later-activation-tab.component";
import { PaylaterListCompanyResolver } from "app/resolver/paylater.resolver";
import { PayLaterDistributionListComponent } from "./pay-later-distribution-list/pay-later-distribution-list.component";
import { PayLaterTemplateFinancingTabComponent } from "./pay-later-template-financing/pay-later-template-financing-tab.component";
import { PayLaterTemplateFinancingCreateComponent } from './pay-later-template-financing/pay-later-template-financing/create/pay-later-template-financing-create.component';
import { PayLaterTemplateFinancingEditComponent } from './pay-later-template-financing/pay-later-template-financing/edit/pay-later-template-financing-edit.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: "companies",
    pathMatch: "full"
  },
  {
    path: "companies",
    component: PayLaterCompanyTabComponent,
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
    component: PayLaterActivationTabComponent,
    data: {
      breadcrumbs: brConfig.paylater.activate.index
    }
  },
  {
    path: "deactivate",
    component: PayLaterDeactivateTabComponent,
    data: {
      breadcrumbs: brConfig.paylater.deactivate.index
    }
  },
  {
    path: "panel",
    component: PayLaterPanelTabComponent,
    data: {
      breadcrumbs: brConfig.paylater.panel.index
    }
  },
  {
    path: "panel/create",
    component: PayLaterPanelCreateComponent,
    data: {
      breadcrumbs: brConfig.paylater.panel.create,
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
  {
    path: "distribution",
    component: PayLaterDistributionListComponent,
    data: {
      breadcrumbs: brConfig.paylater.distributionlist.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "template",
    component: PayLaterTemplateFinancingTabComponent,
    data: {
      breadcrumbs: brConfig.paylater.templatefinancing.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "template/create",
    component: PayLaterTemplateFinancingCreateComponent,
    data: {
      breadcrumbs: brConfig.paylater.templatefinancing.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "template/edit",
    component: PayLaterTemplateFinancingEditComponent,
    data: {
      breadcrumbs: brConfig.paylater.templatefinancing.edit
    },
    // canActivate: [PageGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayLaterRoutingModule { }