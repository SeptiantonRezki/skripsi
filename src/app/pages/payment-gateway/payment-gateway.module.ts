import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PageGuard } from "app/classes/auth.guard";
import { PaymentGatewayRoutingModule } from "./payment-gateway-routing.module";
import { MatProgressSpinnerModule } from "@angular/material";
import { ExternalWebComponent } from './external-web/external-web.component';

@NgModule({
  declarations: [ExternalWebComponent],
  providers: [PageGuard],
  imports: [CommonModule, MatProgressSpinnerModule, PaymentGatewayRoutingModule],
  exports: [ExternalWebComponent],
})
export class PaymentGatewayModule {}
