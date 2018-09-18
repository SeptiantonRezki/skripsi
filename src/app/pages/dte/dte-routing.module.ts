import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from "../../classes/breadcrumbs.config";
import { TemplateIndexComponent } from "./template/index/template-index.component";
import { TemplateCreateComponent } from "./template/create/template-create.component";
import { TemplateEditComponent } from "./template/edit/template-edit.component";
import { TradeIndexComponent } from "./trade/index/trade-index.component";
import { TradeCreateComponent } from "./trade/create/trade-create.component";
import { TradeEditComponent } from "./trade/edit/trade-edit.component";
import { AudienceEditComponent } from "./audience/edit/audience-edit.component";
import { AudienceCreateComponent } from "./audience/create/audience-create.component";
import { AudienceIndexComponent } from "./audience/index/audience-index.component";
import { ScheduleProgramEditComponent } from "./schedule-program/edit/schedule-program-edit.component";
import { ScheduleProgramCreateComponent } from "./schedule-program/create/schedule-program-create.component";
import { ScheduleProgramIndexComponent } from "./schedule-program/index/schedule-program-index.component";
import { ListTradeProgramResolver, ListTemplateResolver, ListSchedulerResolver, ListRetailerResolver } from "../../resolver/dte.resolver";
import { PendingChangesGuard } from "app/pages/dte/dte.guard";

const routes: Routes = [
  {
    path: "",
    redirectTo: "template-task",
    pathMatch: "full"
  },
  {
    path: "template-task",
    component: TemplateIndexComponent,
    data: {
      breadcrumbs: brConfig.dte.template.index
    }
  },
  {
    path: "template-task/create",
    component: TemplateCreateComponent,
    data: {
      breadcrumbs: brConfig.dte.template.create
    },
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: "template-task/edit",
    component: TemplateEditComponent,
    data: {
      breadcrumbs: brConfig.dte.template.edit
    },
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: "trade-program",
    component: TradeIndexComponent,
    data: {
      breadcrumbs: brConfig.dte.trade.index
    }
  },
  {
    path: "trade-program/create",
    component: TradeCreateComponent,
    data: {
      breadcrumbs: brConfig.dte.trade.create
    },
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: "trade-program/edit",
    component: TradeEditComponent,
    data: {
      breadcrumbs: brConfig.dte.trade.edit
    },
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: "schedule-trade-program",
    component: ScheduleProgramIndexComponent,
    data: {
      breadcrumbs: brConfig.dte.scheduleProgram.index
    }
  },
  {
    path: "schedule-trade-program/create",
    component: ScheduleProgramCreateComponent,
    data: {
      breadcrumbs: brConfig.dte.scheduleProgram.create
    },
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: "schedule-trade-program/detail/:id",
    component: ScheduleProgramEditComponent,
    data: {
      breadcrumbs: brConfig.dte.scheduleProgram.edit
    },
    resolve: {
      listTradeProgram: ListTradeProgramResolver,
      listTemplate: ListTemplateResolver
    }
  },
  {
    path: "audience",
    component: AudienceIndexComponent,
    data: {
      breadcrumbs: brConfig.dte.audience.index
    }
  },
  {
    path: "audience/create",
    component: AudienceCreateComponent,
    data: {
      breadcrumbs: brConfig.dte.audience.create
    },
    resolve: {
      listScheduler: ListSchedulerResolver,
      listRetailer: ListRetailerResolver
    },
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: "audience/edit",
    component: AudienceEditComponent,
    data: {
      breadcrumbs: brConfig.dte.audience.edit
    },
    resolve: {
      listScheduler: ListSchedulerResolver,
      listRetailer: ListRetailerResolver
    },
    canDeactivate: [PendingChangesGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DteRoutingModule {}
