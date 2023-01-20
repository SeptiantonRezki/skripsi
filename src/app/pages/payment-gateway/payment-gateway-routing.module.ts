import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PageGuard } from "app/classes/auth.guard";
import { ExternalWebComponent } from "./external-web/external-web.component";

const routes: Routes = [
  {
    path: "qris",
    component: ExternalWebComponent,
    canActivate: [PageGuard]
  },
  {
    path: "cashier",
    component: ExternalWebComponent,
    canActivate: [PageGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentGatewayRoutingModule {}
