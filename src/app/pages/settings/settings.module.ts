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
  MatListModule
} from "@angular/material";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "app/shared/shared.module";
import { ListMenuResolver } from "../../resolver/settings.resolver";
import { PageGuard } from "app/classes/auth.guard";
import { ForceUpdateAppsComponent } from './force-update-apps/force-update-apps.component';
import { SupportComponent } from './support/support.component';

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
    MatListModule
  ],
  declarations: [
    RoleIndexComponent,
    RoleCreateComponent,
    RoleEditComponent,
    ChangePasswordIndexComponent,
    ForceUpdateAppsComponent,
    SupportComponent
  ],
  exports: [
    RoleIndexComponent,
    RoleCreateComponent,
    RoleEditComponent,
    ChangePasswordIndexComponent,
    ForceUpdateAppsComponent,
    SupportComponent
  ],
  providers: [ListMenuResolver, PageGuard]
})
export class SettingsModule {}
