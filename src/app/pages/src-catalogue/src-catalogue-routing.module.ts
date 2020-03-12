import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PageGuard } from "app/classes/auth.guard";
import { brConfig } from "../../classes/breadcrumbs.config";
import { VendorsIndexComponent } from './vendors/index/vendors-index.component';
import { StoreLayoutTemplateComponent } from "./store-layout-template/index/store-layout-template.component";
import { StoreLayoutTemplateCreateComponent } from "./store-layout-template/create/store-layout-template-create.component";
import { StoreLayoutTemplateEditComponent } from "./store-layout-template/edit/store-layout-template-edit.component";


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
      breadcrumbs: brConfig.adminprincipal.index
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SrcCatalogueRoutingModule { }
