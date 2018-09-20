import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ContentManagementRoutingModule } from "./content-management-routing.module";
import { TncIndexComponent } from "./tnc/index/tnc-index.component";
import { TncCreateComponent } from "./tnc/create/tnc-create.component";
import { TncEditComponent } from "./tnc/edit/tnc-edit.component";
import { PrivacyIndexComponent } from "./privacy/index/privacy-index.component";
import { PrivacyCreateComponent } from "./privacy/create/privacy-create.component";
import { PrivacyEditComponent } from "./privacy/edit/privacy-edit.component";
import { HelpIndexComponent } from "./help/index/help-index.component";
import { HelpCreateComponent } from "./help/create/help-create.component";
import { HelpEditComponent } from "./help/edit/help-edit.component";
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
  MatRadioModule
} from "@angular/material";
import { ngfModule } from "angular-file";
import { FroalaEditorModule, FroalaViewModule } from "angular-froala-wysiwyg";

@NgModule({
  imports: [
    CommonModule, 
    ContentManagementRoutingModule,
    FuseSharedModule,
    SharedModule,
    NgxDatatableModule,
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
    ngfModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot()
  ],
  declarations: [
    TncIndexComponent,
    TncCreateComponent,
    TncEditComponent,
    PrivacyIndexComponent,
    PrivacyCreateComponent,
    PrivacyEditComponent,
    HelpIndexComponent,
    HelpCreateComponent,
    HelpEditComponent
  ],
  exports: [
    TncIndexComponent,
    TncCreateComponent,
    TncEditComponent,
    PrivacyIndexComponent,
    PrivacyCreateComponent,
    PrivacyEditComponent,
    HelpIndexComponent,
    HelpCreateComponent,
    HelpEditComponent
  ],
  providers: []
})
export class ContentManagementModule {}
