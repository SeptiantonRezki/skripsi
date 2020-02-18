import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SettingsRoutingModule } from "./settings-routing.module";
import { RoleIndexComponent } from "./role/index/role-index.component";
import { RoleCreateComponent } from "./role/create/role-create.component";
import { RoleEditComponent } from "./role/edit/role-edit.component";
import { ChangePasswordIndexComponent } from "./change-password/index/change-password-index.component";
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
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "app/shared/shared.module";
import { ListMenuResolver } from "../../resolver/settings.resolver";
import { PageGuard } from "app/classes/auth.guard";
import { ForceUpdateAppsComponent } from './force-update-apps/force-update-apps.component';
import { SupportComponent } from './support/support.component';
import { PesanBantuan, } from "./support/content/pesan-bantuan/pesan-bantuan";
import { DialogOtherHelp } from "./support/content/dialog/dialog-other-help";
import { PipesModule } from "app/pipe/pipes.module";
import { OTPSettingsComponent } from './otpsettings/otpsettings.component';
import { UploadImageComponent } from "./support/content/pesan-bantuan/dialog/upload-image/upload-image.component";
import { EllipsisModule } from 'ngx-ellipsis';
import { ngfModule } from "angular-file";

@NgModule({
  imports: [
    CommonModule,
    SettingsRoutingModule,
    FuseSharedModule,
    SharedModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    NgxDatatableModule,
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
    PipesModule,

    EllipsisModule,
    ngfModule,
  ],
  declarations: [
    RoleIndexComponent,
    RoleCreateComponent,
    RoleEditComponent,
    ChangePasswordIndexComponent,
    ForceUpdateAppsComponent,
    SupportComponent,
    PesanBantuan,
    DialogOtherHelp,
    OTPSettingsComponent,
    UploadImageComponent
  ],
  exports: [
    RoleIndexComponent,
    RoleCreateComponent,
    RoleEditComponent,
    ChangePasswordIndexComponent,
    ForceUpdateAppsComponent,
    SupportComponent,
    PesanBantuan
  ],
  providers: [ListMenuResolver, PageGuard],
  entryComponents: [DialogOtherHelp, UploadImageComponent]
})
export class SettingsModule { }
