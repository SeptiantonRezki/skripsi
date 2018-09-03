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

@NgModule({
  imports: [CommonModule, ContentManagementRoutingModule],
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
