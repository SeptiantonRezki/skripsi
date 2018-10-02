import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NotificationRoutingModule } from "./notification-routing.module";
import { NotificationIndexComponent } from "./index/notification-index.component";
import { NotificationCreateComponent } from "./create/notification-create.component";
import { NotificationEditComponent } from "./edit/notification-edit.component";
import { PageGuard } from "app/classes/auth.guard";

@NgModule({
  imports: [CommonModule, NotificationRoutingModule],
  declarations: [
    NotificationIndexComponent,
    NotificationCreateComponent,
    NotificationEditComponent
  ],
  exports: [
    NotificationIndexComponent,
    NotificationCreateComponent,
    NotificationEditComponent
  ],
  providers: [PageGuard]
})
export class NotificationModule {}
