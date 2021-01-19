import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NotificationRoutingModule } from "./notification-routing.module";
import { NotificationIndexComponent } from "./index/notification-index.component";
import { NotificationCreateComponent } from "./create/notification-create.component";
import { PopupNotificationIndexComponent } from "../popup-notification/index/popup-notification-index.component";
import { PopupNotificationCreateComponent } from "../popup-notification/create/popup-notification-create.component";
import { PopupNotificationEditComponent } from "../popup-notification/edit/popup-notification-edit.component";
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
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatDatepickerModule,
  MatTooltipModule,
  MatRadioModule,
  MatDialogModule,
  MatToolbarModule,
  MatSlideToggleModule
} from "@angular/material";

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from "@angular/material/core";

import { ngfModule } from "angular-file";
import { FroalaEditorModule, FroalaViewModule } from "angular-froala-wysiwyg";
import { LightboxModule } from "ngx-lightbox";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { ImportPopUpAudienceComponent } from "../popup-notification/import-pop-up-audience/import-pop-up-audience.component";

export const MY_FORMATS = {
  parse: {
    dateInput: "LL"
  },
  display: {
    dateInput: "LL",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

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
    MatDatepickerModule,
    MatSelectModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTooltipModule,
    ngfModule,
    LightboxModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    NgxMaterialTimepickerModule,
    MatIconModule,
    MatDialogModule,
    MatToolbarModule,
    MatSlideToggleModule
  ],
  declarations: [
    NotificationIndexComponent,
    NotificationCreateComponent,
    PopupNotificationIndexComponent,
    PopupNotificationCreateComponent,
    PopupNotificationEditComponent,
    ImportPopUpAudienceComponent
  ],
  exports: [
    NotificationIndexComponent,
    NotificationCreateComponent,
    PopupNotificationIndexComponent,
    PopupNotificationCreateComponent,
    PopupNotificationEditComponent
  ],
  entryComponents: [ImportPopUpAudienceComponent],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    PageGuard
  ]
})
export class NotificationModule { }
