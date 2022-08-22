import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TrsProposalComponent } from "./trs-proposal/index/trs-proposal.component";
import { PageGuard } from "app/classes/auth.guard";
import { brConfig } from "app/classes/breadcrumbs.config";
import { TrsProposalCreateComponent } from "./trs-proposal/create/trs-proposal-create.component";
import { TrsProposalEditComponent } from "./trs-proposal/edit/trs-proposal-edit.component";
import { TrsSystemVariableComponent } from "./trs-system-variable/trs-system-variable.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "trs-proposal",
    pathMatch: "full"
  },
  {
    path: "trs-system-variable",
    component: TrsSystemVariableComponent,
  },
  {
    path: "trs-proposal",
    component: TrsProposalComponent,
  },
  {
    path: "trs-proposal/create",
    component: TrsProposalCreateComponent,
  },
  {
    path: "trs-proposal/edit/:id",
    component: TrsProposalEditComponent,
  },
  {
    path: "trs-proposal/detail/:id",
    component: TrsProposalEditComponent,
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TacticalRetailSalesRoutingModule { }
