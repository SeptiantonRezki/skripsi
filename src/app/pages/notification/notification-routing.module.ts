import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from "../../classes/breadcrumbs.config";

import { NotificationIndexComponent } from "./index/notification-index.component";
import { NotificationCreateComponent } from "./create/notification-create.component";

import { PageGuard } from "app/classes/auth.guard";

const routes: Routes = [
  // {
  //   path: "",
  //   redirectTo: "notifications",
  //   pathMatch: "full"
  // },
  {
    path: "",
    component: NotificationIndexComponent,
    pathMatch: "full",
    data: {
      breadcrumbs: brConfig.notification.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "create",
    component: NotificationCreateComponent,
    data: {
      breadcrumbs: brConfig.notification.create
    },
    canActivate: [PageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationRoutingModule {}
