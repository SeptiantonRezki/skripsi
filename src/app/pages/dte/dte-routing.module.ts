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
import { ScheduleProgramDetailComponent } from "./schedule-program/detail/schedule-program-detail.component";
import { ScheduleProgramCreateComponent } from "./schedule-program/create/schedule-program-create.component";
import { ScheduleProgramIndexComponent } from "./schedule-program/index/schedule-program-index.component";
import { ListTradeProgramResolver, ListTemplateResolver, ListSchedulerResolver, ListRetailerResolver } from "../../resolver/dte.resolver";
import { PendingChangesGuard } from "app/pages/dte/dte.guard";
import { PageGuard } from "app/classes/auth.guard";
import { ScheduleProgramEditComponent } from "./schedule-program/edit/schedule-program-edit.component";
import { AudienceTradeProgramComponent } from "./automation/create/audience-trade-program.component";
import { AudienceTradeProgramIndexComponent } from "./automation/index/audience-trade-program-index.component";
import { AudienceTradeProgramEditComponent } from "./automation/edit/audience-trade-program-edit.component";
import { GroupTradeProgramComponent } from "./group-trade-program/index/group-trade-program.component";
import { GroupTradeProgramCreateComponent } from "./group-trade-program/create/group-trade-program-create.component";
import { GroupTradeProgramEditComponent } from "./group-trade-program/edit/group-trade-program-edit.component";

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
    },
    canActivate: [PageGuard]
  },
  {
    path: "template-task/create",
    component: TemplateCreateComponent,
    data: {
      breadcrumbs: brConfig.dte.template.create
    },
    canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "template-task/edit",
    component: TemplateEditComponent,
    data: {
      breadcrumbs: brConfig.dte.template.edit
    },
    canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "template-task/detail",
    component: TemplateEditComponent,
    data: {
      breadcrumbs: brConfig.dte.template.detail
    },
    canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "trade-program",
    component: TradeIndexComponent,
    data: {
      breadcrumbs: brConfig.dte.trade.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "trade-program/create",
    component: TradeCreateComponent,
    data: {
      breadcrumbs: brConfig.dte.trade.create
    },
    canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "trade-program/edit",
    component: TradeEditComponent,
    data: {
      breadcrumbs: brConfig.dte.trade.edit
    },
    canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "trade-program/detail",
    component: TradeEditComponent,
    data: {
      breadcrumbs: brConfig.dte.trade.detail
    },
    canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "schedule-trade-program",
    component: ScheduleProgramIndexComponent,
    data: {
      breadcrumbs: brConfig.dte.scheduleProgram.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "schedule-trade-program/create",
    component: ScheduleProgramCreateComponent,
    data: {
      breadcrumbs: brConfig.dte.scheduleProgram.create
    },
    resolve: {
      listTradeProgram: ListTradeProgramResolver,
      listTemplate: ListTemplateResolver
    },
    canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "schedule-trade-program/edit/:id",
    component: ScheduleProgramEditComponent,
    data: {
      breadcrumbs: brConfig.dte.scheduleProgram.edit
    },
    resolve: {
      listTradeProgram: ListTradeProgramResolver,
      listTemplate: ListTemplateResolver
    },
    canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "schedule-trade-program/detail/:id",
    component: ScheduleProgramDetailComponent,
    data: {
      breadcrumbs: brConfig.dte.scheduleProgram.edit
    },
    resolve: {
      listTradeProgram: ListTradeProgramResolver,
      listTemplate: ListTemplateResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "audience",
    component: AudienceIndexComponent,
    data: {
      breadcrumbs: brConfig.dte.audience.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "audience/create",
    component: AudienceCreateComponent,
    data: {
      breadcrumbs: brConfig.dte.audience.create
    },
    resolve: {
      // listScheduler: ListSchedulerResolver,
      // listRetailer: ListRetailerResolver
    },
    canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "audience/edit",
    component: AudienceEditComponent,
    data: {
      breadcrumbs: brConfig.dte.audience.edit
    },
    resolve: {
      // listScheduler: ListSchedulerResolver,
      // listRetailer: ListRetailerResolver
    },
    canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "audience/detail",
    component: AudienceEditComponent,
    data: {
      breadcrumbs: brConfig.dte.audience.detail
    },
    resolve: {
      listScheduler: ListSchedulerResolver,
      // listRetailer: ListRetailerResolver
    },
    canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "automation",
    component: AudienceTradeProgramIndexComponent,
    data: {
      breadcrumbs: brConfig.dte.automation.index
    },
    // canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "automation/create",
    component: AudienceTradeProgramComponent,
    data: {
      breadcrumbs: brConfig.dte.automation.create
    },
    // canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "automation/edit",
    component: AudienceTradeProgramEditComponent,
    data: {
      breadcrumbs: brConfig.dte.automation.edit
    },
    // canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "automation/detail",
    component: AudienceTradeProgramEditComponent,
    data: {
      breadcrumbs: brConfig.dte.automation.detail
    },
    // canDeactivate: [PendingChangesGuard],
    canActivate: [PageGuard]
  },
  {
    path: "group-trade-program",
    component: GroupTradeProgramComponent,
    data: {
      breadcrumbs: brConfig.dte.group_trade_program.index
    },
    // canDeactivate: [PendingChangesGuard],
    // canActivate: [PageGuard]
  },
  {
    path: "group-trade-program/create",
    component: GroupTradeProgramCreateComponent,
    data: {
      breadcrumbs: brConfig.dte.group_trade_program.create
    },
    // canDeactivate: [PendingChangesGuard],
    // canActivate: [PageGuard]
  },
  {
    path: "group-trade-program/edit",
    component: GroupTradeProgramEditComponent,
    data: {
      breadcrumbs: brConfig.dte.group_trade_program.edit
    },
    // canDeactivate: [PendingChangesGuard],
    // canActivate: [PageGuard]
  },
  {
    path: "group-trade-program/detail",
    component: GroupTradeProgramEditComponent,
    data: {
      breadcrumbs: brConfig.dte.group_trade_program.detail
    },
    // canDeactivate: [PendingChangesGuard],
    // canActivate: [PageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DteRoutingModule { }
