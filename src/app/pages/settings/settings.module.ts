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
  MatSlideToggleModule
} from "@angular/material";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "app/shared/shared.module";
import { ListMenuResolver } from "../../resolver/settings.resolver";

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
    MatFormFieldModule
  ],
  declarations: [
    RoleIndexComponent,
    RoleCreateComponent,
    RoleEditComponent,
    ChangePasswordIndexComponent
  ],
  exports: [
    RoleIndexComponent,
    RoleCreateComponent,
    RoleEditComponent,
    ChangePasswordIndexComponent
  ],
  providers: [ListMenuResolver]
})
export class SettingsModule {}
