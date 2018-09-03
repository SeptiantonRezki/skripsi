import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from "../../classes/breadcrumbs.config";

import { NotificationIndexComponent } from "./index/notification-index.component";
import { NotificationCreateComponent } from "./create/notification-create.component";
import { NotificationEditComponent } from "./edit/notification-edit.component";

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
    }
  },
  {
    path: "notifications/create",
    component: NotificationCreateComponent,
    data: {
      breadcrumbs: brConfig.notification.create
    }
  },
  {
    path: "notifications/edit",
    component: NotificationEditComponent,
    data: {
      breadcrumbs: brConfig.notification.edit
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationRoutingModule {}
