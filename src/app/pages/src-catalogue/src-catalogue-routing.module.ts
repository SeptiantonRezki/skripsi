import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PageGuard } from "app/classes/auth.guard";
import { brConfig } from "../../classes/breadcrumbs.config";
import { VendorsIndexComponent } from './vendors/index/vendors-index.component';
import { StoreLayoutTemplateComponent } from "./store-layout-template/index/store-layout-template.component";
import { StoreLayoutTemplateCreateComponent } from "./store-layout-template/create/store-layout-template-create.component";
import { StoreLayoutTemplateEditComponent } from "./store-layout-template/edit/store-layout-template-edit.component";
import { UserSrcCatalogueComponent } from "./user-src-catalogue/index/user-src-catalogue.component";
import { UserSrcCatalogueCreateComponent } from "./user-src-catalogue/create/user-src-catalogue-create.component";
import { UserSrcCatalogueEditComponent } from "./user-src-catalogue/edit/user-src-catalogue-edit.component";
import { ListRoleAdminResolver } from "app/resolver/user-management.resolver";
import { VendorsCreateComponent } from "./vendors/create/vendors-create.component";
import { VendorsEditComponent } from "./vendors/edit/vendors-edit.component";
import { ProductCatalogueComponent } from "./product-catalogue/index/product-catalogue.component";
import { ProductCatalogueCreateComponent } from "./product-catalogue/create/product-catalogue-create.component";
import { ProductCatalogueEditComponent } from "./product-catalogue/edit/product-catalogue-edit.component";
import { OrderCatalogueComponent } from "./order-catalogue/index/order-catalogue.component";
import { OrderCatalogueDetailComponent } from "./order-catalogue/detail/order-catalogue-detail.component";


const routes: Routes = [
  {
    path: "",
    redirectTo: "vendors",
    pathMatch: "full"
  },
  {
    path: "vendors",
    component: VendorsIndexComponent,
    data: {
      breadcrumbs: brConfig.vendors.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "vendors/create",
    component: VendorsCreateComponent,
    data: {
      breadcrumbs: brConfig.vendors.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "vendors/edit",
    component: VendorsEditComponent,
    data: {
      breadcrumbs: brConfig.vendors.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "vendors/detail",
    component: VendorsEditComponent,
    data: {
      breadcrumbs: brConfig.vendors.detail
    },
    // canActivate: [PageGuard]
  },
  {
    path: "store-layout-template",
    component: StoreLayoutTemplateComponent,
    data: {
      breadcrumbs: brConfig.store_layout_template.index
    }
  },
  {
    path: "store-layout-template/create",
    component: StoreLayoutTemplateCreateComponent,
    data: {
      breadcrumbs: brConfig.store_layout_template.create
    }
  },
  {
    path: "store-layout-template/edit",
    component: StoreLayoutTemplateEditComponent,
    data: {
      breadcrumbs: brConfig.store_layout_template.edit
    }
  },
  {
    path: "store-layout-template/detail",
    component: StoreLayoutTemplateEditComponent,
    data: {
      breadcrumbs: brConfig.store_layout_template.detail
    }
  },
  {
    path: "users",
    component: UserSrcCatalogueComponent,
    data: {
      breadcrumbs: brConfig.user_catalogue.index
    }
  },
  {
    path: "users/create",
    component: UserSrcCatalogueCreateComponent,
    data: {
      breadcrumbs: brConfig.user_catalogue.create
    },
    resolve: {
      listRole: ListRoleAdminResolver
    }
  },
  {
    path: "users/edit",
    component: UserSrcCatalogueEditComponent,
    data: {
      breadcrumbs: brConfig.user_catalogue.edit
    },
    resolve: {
      listRole: ListRoleAdminResolver
    }
  },
  {
    path: "users/detail",
    component: UserSrcCatalogueEditComponent,
    data: {
      breadcrumbs: brConfig.user_catalogue.detail
    },
    resolve: {
      listRole: ListRoleAdminResolver
    }
  },
  {
    path: "products",
    component: ProductCatalogueComponent,
    data: {
      breadcrumbs: brConfig.product_catalogue.index
    }
  },
  {
    path: "products/create",
    component: ProductCatalogueCreateComponent,
    data: {
      breadcrumbs: brConfig.product_catalogue.create
    }
  },
  {
    path: "products/edit",
    component: ProductCatalogueEditComponent,
    data: {
      breadcrumbs: brConfig.product_catalogue.edit
    }
  },
  {
    path: "products/detail",
    component: ProductCatalogueEditComponent,
    data: {
      breadcrumbs: brConfig.product_catalogue.detail
    }
  },
  {
    path: "orders",
    component: OrderCatalogueComponent,
    data: {
      breadcrumbs: brConfig.product_catalogue.index
    }
  },
  {
    path: "orders/detail/:id",
    component: OrderCatalogueDetailComponent,
    data: {
      breadcrumbs: brConfig.product_catalogue.index
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SrcCatalogueRoutingModule { }
