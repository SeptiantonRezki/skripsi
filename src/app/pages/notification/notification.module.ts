import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NotificationRoutingModule } from "./notification-routing.module";
import { NotificationIndexComponent } from "./index/notification-index.component";
import { NotificationCreateComponent } from "./create/notification-create.component";
import { PageGuard } from "app/classes/auth.guard";
import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "app/shared/shared.module";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { 
  MatButtonModule, 
  MatCheckboxModule, 
  MatIconModule, 
  MatFormFieldModule, 
  MatInputModule, 
  MatSelectModule,
  MatStepperModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatTooltipModule
} from "@angular/material";

import { ngfModule } from "angular-file";
import { FroalaEditorModule, FroalaViewModule } from "angular-froala-wysiwyg";
import { LightboxModule } from "ngx-lightbox";

@NgModule({
  imports: [
    CommonModule, 
    NotificationRoutingModule,
    CommonModule,
    FuseSharedModule,
    SharedModule,
    NgxDatatableModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTooltipModule,
    ngfModule,
    LightboxModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot()
  ],
  declarations: [
    NotificationIndexComponent,
    NotificationCreateComponent
  ],
  exports: [
    NotificationIndexComponent,
    NotificationCreateComponent
  ],
  providers: [PageGuard]
})
export class NotificationModule {}
