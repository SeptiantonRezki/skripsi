import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { brConfig } from "../../classes/breadcrumbs.config";
import { AdminPrincipalIndexComponent } from "./admin-principal/index/admin-principal-index.component";
import { AdminPrincipalCreateComponent } from "./admin-principal/create/admin-principal-create.component";
import { AdminPrincipalEditComponent } from "./admin-principal/edit/admin-principal-edit.component";
import { FieldForceCreateComponent } from "./field-force/create/field-force-create.component";
import { FieldForceIndexComponent } from "./field-force/index/field-force-index.component";
import { FieldForceEditComponent } from "./field-force/edit/field-force-edit.component";
import { PaguyubanEditComponent } from "./paguyuban/edit/paguyuban-edit.component";
import { PaguyubanIndexComponent } from "./paguyuban/index/paguyuban-index.component";
import { PaguyubanCreateComponent } from "./paguyuban/create/paguyuban-create.component";
import { WholesalerIndexComponent } from "./wholesaler/index/wholesaler-index.component";
import { WholesalerCreateComponent } from "./wholesaler/create/wholesaler-create.component";
import { WholesalerEditComponent } from "./wholesaler/edit/wholesaler-edit.component";
import { RetailerCreateComponent } from "./retailer/create/retailer-create.component";
import { RetailerIndexComponent } from "./retailer/index/retailer-index.component";
import { RetailerEditComponent } from "./retailer/edit/retailer-edit.component";
import { PageGuard } from "app/classes/auth.guard";
import {
  ListRoleAdminResolver,
  ListLevelFFResolver,
  ListLevelAreaResolver,
  ListAdminPrincipalResolver
} from "app/resolver/user-management.resolver";

const routes: Routes = [
  {
    path: "",
    redirectTo: "admin-principal",
    pathMatch: "full"
  },
  {
    path: "admin-principal",
    component: AdminPrincipalIndexComponent,
    data: {
      breadcrumbs: brConfig.adminprincipal.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "admin-principal/create",
    component: AdminPrincipalCreateComponent,
    data: {
      breadcrumbs: brConfig.adminprincipal.create
    },
    resolve: {
      listRole: ListRoleAdminResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "admin-principal/edit",
    component: AdminPrincipalEditComponent,
    data: {
      breadcrumbs: brConfig.adminprincipal.edit
    },
    resolve: {
      listRole: ListRoleAdminResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "field-force",
    component: FieldForceIndexComponent,
    data: {
      breadcrumbs: brConfig.fieldforce.index
    },
    canActivate: [PageGuard]
  },
  // {
  //   path: "field-force/create",
  //   component: FieldForceCreateComponent,
  //   data: {
  //     breadcrumbs: brConfig.fieldforce.create
  //   },
  //   resolve: {
  //     listLevel: ListLevelFFResolver
  //   },
  //   canActivate: [PageGuard]
  // },
  {
    path: "field-force/edit",
    component: FieldForceEditComponent,
    data: {
      breadcrumbs: brConfig.fieldforce.edit
    },
    resolve: {
      listLevel: ListLevelFFResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "paguyuban",
    component: PaguyubanIndexComponent,
    data: {
      breadcrumbs: brConfig.paguyuban.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "paguyuban/create",
    component: PaguyubanCreateComponent,
    data: {
      breadcrumbs: brConfig.paguyuban.edit
    },
    resolve: {
      listAdminPrincipal: ListAdminPrincipalResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "paguyuban/edit",
    component: PaguyubanEditComponent,
    data: {
      breadcrumbs: brConfig.paguyuban.edit
    },
    resolve: {
      listAdminPrincipal: ListAdminPrincipalResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "wholesaler",
    component: WholesalerIndexComponent,
    data: {
      breadcrumbs: brConfig.wholesaler.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "wholesaler/create",
    component: WholesalerCreateComponent,
    data: {
      breadcrumbs: brConfig.wholesaler.create
    },
    canActivate: [PageGuard]
    // resolve: {
    //   listLevel: ListLevelAreaResolver
    // }
  },
  {
    path: "wholesaler/edit",
    component: WholesalerEditComponent,
    data: {
      breadcrumbs: brConfig.wholesaler.edit
    },
    canActivate: [PageGuard]
  },
  {
    path: "retailer",
    component: RetailerIndexComponent,
    data: {
      breadcrumbs: brConfig.retailer.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "retailer/create",
    component: RetailerCreateComponent,
    data: {
      breadcrumbs: brConfig.retailer.create
    },
    canActivate: [PageGuard]
  },
  {
    path: "retailer/edit",
    component: RetailerEditComponent,
    data: {
      breadcrumbs: brConfig.retailer.edit
    },
    canActivate: [PageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule {}
