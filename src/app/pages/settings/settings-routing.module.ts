import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from "../../classes/breadcrumbs.config";
import { RoleIndexComponent } from "./role/index/role-index.component";
import { RoleCreateComponent } from "./role/create/role-create.component";
import { RoleEditComponent } from "./role/edit/role-edit.component";
import { ChangePasswordIndexComponent } from "./change-password/index/change-password-index.component";
import { ListMenuResolver } from "../../resolver/settings.resolver";

const routes: Routes = [
  {
    path: "",
    redirectTo: "access",
    pathMatch: "full"
  },
  {
    path: "access",
    component: RoleIndexComponent,
    data: {
      breadcrumbs: brConfig.settings.access.index
    }
  },
  {
    path: "access/create",
    component: RoleCreateComponent,
    data: {
      breadcrumbs: brConfig.settings.access.create
    },
    resolve: {
      menu: ListMenuResolver
    }
  },
  {
    path: "access/edit/:id",
    component: RoleEditComponent,
    data: {
      breadcrumbs: brConfig.settings.access.edit
    },
    resolve: {
      menu: ListMenuResolver
    }
  },
  {
    path: "account",
    component: ChangePasswordIndexComponent,
    data: {
      breadcrumbs: brConfig.settings.account.index
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule {}
