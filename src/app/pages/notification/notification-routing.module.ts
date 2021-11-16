import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from "../../classes/breadcrumbs.config";

import { NotificationIndexComponent } from "./index/notification-index.component";
import { NotificationCreateComponent } from "./create/notification-create.component";
import { CustomNotificationCreateComponent } from "./create/custom-notification/custom-notification-create.component";

import { PageGuard } from "app/classes/auth.guard";
import { PopupNotificationIndexComponent } from "../popup-notification/index/popup-notification-index.component";
import { PopupNotificationCreateComponent } from "../popup-notification/create/popup-notification-create.component";
import { PopupNotificationEditComponent } from "../popup-notification/edit/popup-notification-edit.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "push-notification",
    pathMatch: "full"
  },
  {
    path: "push-notification",
    component: NotificationIndexComponent,
    pathMatch: "full",
    data: {
      breadcrumbs: brConfig.notification.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "push-notification/create",
    component: NotificationCreateComponent,
    data: {
      breadcrumbs: brConfig.notification.create
    },
    canActivate: [PageGuard]
  },
  {
    path: "push-notification/create-custom",
    component: CustomNotificationCreateComponent,
    data: {
      breadcrumbs: brConfig.notification.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "push-notification/detail/:id",
    component: NotificationCreateComponent,
    data: {
      breadcrumbs: brConfig.notification.detail
    },
    canActivate: [PageGuard]
  },
  {
    path: "push-notification/detail-custom/:id",
    component: CustomNotificationCreateComponent,
    data: {
      breadcrumbs: brConfig.notification.detail
    },
    // canActivate: [PageGuard]
  },
  {
    path: "popup-notification",
    component: PopupNotificationIndexComponent,
    data: {
      breadcrumbs: brConfig.notification.popup.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "popup-notification/create",
    component: PopupNotificationCreateComponent,
    data: {
      breadcrumbs: brConfig.notification.popup.create
    },
    canActivate: [PageGuard]
  },
  {
    path: "popup-notification/edit/:id",
    component: PopupNotificationEditComponent,
    data: {
      breadcrumbs: brConfig.notification.popup.edit
    },
    canActivate: [PageGuard]
  },
  {
    path: "popup-notification/detail/:id",
    component: PopupNotificationEditComponent,
    data: {
      breadcrumbs: brConfig.notification.popup.edit
    },
    canActivate: [PageGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationRoutingModule {}
