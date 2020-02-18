import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CourierManagementComponent } from "./courier-management/index/courier-management.component";
import { PageGuard } from "app/classes/auth.guard";
import { brConfig } from "app/classes/breadcrumbs.config";
import { CourierCreateManagamentComponent } from "./courier-management/create/courier-create-managament.component";
import { CourierEditManagementComponent } from "./courier-management/edit/courier-edit-management.component";
import { MitraDeliveryPanelComponent } from "./mitra-delivery-panel/index/mitra-delivery-panel.component";
import { MitraDeliveryPanelCreateComponent } from "./mitra-delivery-panel/create/mitra-delivery-panel-create.component";
import { MitraDeliveryPanelEditComponent } from "./mitra-delivery-panel/edit/mitra-delivery-panel-edit.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "courier-management",
    pathMatch: "full"
  },
  {
    path: "courier",
    component: CourierManagementComponent,
    data: {
      breadcrumbs: brConfig.deliveryManagement.courier_management.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "courier/create",
    component: CourierCreateManagamentComponent,
    data: {
      breadcrumbs: brConfig.deliveryManagement.courier_management.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "courier/edit/:id",
    component: CourierEditManagementComponent,
    data: {
      breadcrumbs: brConfig.deliveryManagement.courier_management.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "courier/detail/:id",
    component: CourierEditManagementComponent,
    data: {
      breadcrumbs: brConfig.deliveryManagement.courier_management.detail
    },
    // canActivate: [PageGuard]
  },
  {
    path: "panel-mitra",
    component: MitraDeliveryPanelComponent,
    data: {
      breadcrumbs: brConfig.deliveryManagement.panel_mitra.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "panel-mitra/create",
    component: MitraDeliveryPanelCreateComponent,
    data: {
      breadcrumbs: brConfig.deliveryManagement.panel_mitra.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "panel-mitra/edit/:id",
    component: MitraDeliveryPanelEditComponent,
    data: {
      breadcrumbs: brConfig.deliveryManagement.panel_mitra.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "panel-mitra/detail/:id",
    component: MitraDeliveryPanelEditComponent,
    data: {
      breadcrumbs: brConfig.deliveryManagement.panel_mitra.detail
    },
    // canActivate: [PageGuard]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class DeliveryManagementRoutingModule { }