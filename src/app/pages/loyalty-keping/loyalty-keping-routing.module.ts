import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PageGuard } from "app/classes/auth.guard";
import { ExternalWebComponent } from "./external-web/external-web.component";

const routes: Routes = [
  {
    path: "catalogues",
    component: ExternalWebComponent,
    canActivate: [PageGuard]
  },
  {
    path: "redeems",
    component: ExternalWebComponent,
    canActivate: [PageGuard]
  },
  {
    path: "sources",
    component: ExternalWebComponent,
    canActivate: [PageGuard]
  },
  {
    path: "settings/stars",
    component: ExternalWebComponent,
    canActivate: [PageGuard]
  },
  {
    path: "settings/coo",
    component: ExternalWebComponent,
    canActivate: [PageGuard]
  },
  {
    path: "settings/cashier",
    component: ExternalWebComponent,
    canActivate: [PageGuard]
  },
  {
    path: "resets",
    component: ExternalWebComponent,
    canActivate: [PageGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoyaltyKepingRoutingModule {}
