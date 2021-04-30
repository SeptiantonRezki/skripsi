import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PageGuard } from "app/classes/auth.guard";
import { VirtualAccountCompanyComponent } from "./virtual-account-company/index/virtual-account-company.component";
import { VirtualAccountCompanyCreateComponent } from "./virtual-account-company/create/virtual-account-company-create.component";
import { VirtualAccountCompanyEditComponent } from "./virtual-account-company/edit/virtual-account-company-edit.component";
import { VirtualAccountBinCreateComponent } from './virtual-account-bin/create/virtual-account-bin-create.component';
import { VirtualAccountBinEditComponent } from './virtual-account-bin/edit/virtual-account-bin-edit.component';
import { VirtualAccountPanelComponent } from "./virtual-account-panel/index/virtual-account-panel.component";
import { VirtualAccountPanelEditComponent } from "./virtual-account-panel/edit/virtual-account-panel-edit.component";
import { VirtualAccountPanelCreateComponent } from "./virtual-account-panel/create/virtual-account-panel-create.component";
import { VirtualAccountTncComponent } from "./virtual-account-tnc/index/virtual-account-tnc.component";
import { VirtualAccountTncCreateComponent } from "./virtual-account-tnc/create/virtual-account-tnc-create.component";
import { VirtualAccountTncEditComponent } from "./virtual-account-tnc/edit/virtual-account-tnc-edit.component";
import { brConfig } from "app/classes/breadcrumbs.config";


const routes: Routes = [
  {
    path: "",
    redirectTo: "companies",
    pathMatch: "full"
  },
  {
    path: "companies",
    component: VirtualAccountCompanyComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.company.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "companies/create",
    component: VirtualAccountCompanyCreateComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.company.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "companies/edit",
    component: VirtualAccountCompanyEditComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.company.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "companies/detail",
    component: VirtualAccountCompanyEditComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.company.detail
    },
    // canActivate: [PageGuard]
  },
  {
    path: "bin/create",
    component: VirtualAccountBinCreateComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.bin.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "bin/edit",
    component: VirtualAccountBinEditComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.bin.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "panel",
    component: VirtualAccountPanelComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.panel.index
    }
  },
  {
    path: "panel/create",
    component: VirtualAccountPanelCreateComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.panel.create,
    }
  },
  {
    path: "panel/edit",
    component: VirtualAccountPanelEditComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.panel.edit
    }
  },
  {
    path: "panel/detail",
    component: VirtualAccountPanelEditComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.panel.detail
    }
  },
  {
    path: "terms-and-condition",
    component: VirtualAccountTncComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.tnc.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "terms-and-condition/create",
    component: VirtualAccountTncCreateComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.tnc.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "terms-and-condition/edit",
    component: VirtualAccountTncEditComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.tnc.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "terms-and-condition/detail",
    component: VirtualAccountTncEditComponent,
    data: {
      breadcrumbs: brConfig.virtualaccount.tnc.detail
    },
    // canActivate: [PageGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VirtualAccountRoutingModule { }