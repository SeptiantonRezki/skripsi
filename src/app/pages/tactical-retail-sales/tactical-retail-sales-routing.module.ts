import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TrsProposalComponent } from "./trs-proposal/index/trs-proposal.component";
import { PageGuard } from "app/classes/auth.guard";
import { brConfig } from "app/classes/breadcrumbs.config";
import { TrsProposalCreateComponent } from "./trs-proposal/create/trs-proposal-create.component";
import { TrsProposalEditComponent } from "./trs-proposal/edit/trs-proposal-edit.component";
import { TrsProposalDetailComponent } from "./trs-proposal/detail/trs-proposal-detail.component";
import { TrsSystemVariableComponent } from "./trs-system-variable/trs-system-variable.component";
import { TrsReportComponent } from './trs-report/trs-report.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: "trs-proposal",
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
    path: "trs-proposal",
    component: TrsProposalComponent,
    data: {
      breadcrumbs: brConfig.tactical_retail_sales.trs_proposal.index
    },
  },
  {
    path: "trs-proposal/create",
    component: TrsProposalCreateComponent,
    data: {
      breadcrumbs: brConfig.tactical_retail_sales.trs_proposal.create
    },
  },
  {
    path: "trs-proposal/edit/:id",
    component: TrsProposalEditComponent,
    data: {
      breadcrumbs: brConfig.tactical_retail_sales.trs_proposal.edit
    },
  },
  {
    path: "trs-proposal/detail/:id",
    component: TrsProposalDetailComponent,
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
export class TacticalRetailSalesRoutingModule { }
