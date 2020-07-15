import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from "../../classes/breadcrumbs.config";
import { RoleIndexComponent } from "./role/index/role-index.component";
import { RoleCreateComponent } from "./role/create/role-create.component";
import { RoleEditComponent } from "./role/edit/role-edit.component";
import { ChangePasswordIndexComponent } from "./change-password/index/change-password-index.component";
import { ListMenuResolver } from "../../resolver/settings.resolver";
import { PageGuard } from "app/classes/auth.guard";
import { ForceUpdateAppsComponent } from "./force-update-apps/force-update-apps.component";
import { SupportComponent } from "./support/support.component";
import { OTPSettingsComponent } from "./otpsettings/otpsettings.component";
import { NewSignComponent } from "./new-sign/new-sign.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "access/index",
    pathMatch: "full"
  },
  {
    path: "access",
    component: RoleIndexComponent,
    data: {
      breadcrumbs: brConfig.settings.access.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "access/create",
    component: RoleCreateComponent,
    data: {
      breadcrumbs: brConfig.settings.access.create
    },
    resolve: {
      menu: ListMenuResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "access/edit/:id",
    component: RoleEditComponent,
    data: {
      breadcrumbs: brConfig.settings.access.edit
    },
    canActivate: [PageGuard]
  },
  {
    path: "access/detail/:id",
    component: RoleEditComponent,
    data: {
      breadcrumbs: brConfig.settings.access.detail
    },
    canActivate: [PageGuard]
  },
  {
    path: "account",
    component: ChangePasswordIndexComponent,
    data: {
      breadcrumbs: brConfig.settings.account.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "force-update-apps",
    component: ForceUpdateAppsComponent,
    data: {
      breadcrumbs: brConfig.settings.force_update
    },
    canActivate: [PageGuard]
  },
  {
    path: "support",
    component: SupportComponent,
    data: {
      breadcrumbs: brConfig.settings.support
    }
  },
  {
    path: "otp",
    component: OTPSettingsComponent,
    data: {
      breadcrumbs: brConfig.settings.otp
    }
  },
  {
    path: "newsignmenu",
    component: NewSignComponent,
    data: {
      breadcrumbs: brConfig.settings.otp
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
