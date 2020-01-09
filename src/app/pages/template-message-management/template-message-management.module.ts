import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TemplateMessageManagementRoutingModule } from "./template-message-management-routing.module";
import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "app/shared/shared.module";
import {
  MatIconModule,
  MatCheckboxModule,
  MatButtonModule,
  MatSliderModule,
  MatProgressBarModule,
  MatSelectModule,
  MatInputModule,
  MatFormFieldModule,
  MatSlideToggleModule,
  MatDividerModule,
  MatRadioModule,
  MatListModule,
  MatCardModule,
  MatDialogModule,
  MatToolbarModule,
  MatProgressSpinnerModule,
  MatTabsModule,
  MatAutocompleteModule,
} from "@angular/material";
import { ngfModule } from "angular-file";
import { FroalaEditorModule, FroalaViewModule } from "angular-froala-wysiwyg";

import { TemplateMessageComponent } from "./template-message/index/template-message.component";

@NgModule({
  imports: [
    CommonModule,
    TemplateMessageManagementRoutingModule,
    FuseSharedModule,
    SharedModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatRadioModule,
    MatListModule,
    MatCardModule,
    MatDialogModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatAutocompleteModule,
    ngfModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot()
  ],
  declarations: [
    TemplateMessageComponent,
  ],
  exports: [
    TemplateMessageComponent
  ],
})
export class TemplateMessageManagementModule { }
