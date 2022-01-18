import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PageGuard } from "app/classes/auth.guard";
import { LoyaltyKepingRoutingModule } from "./loyalty-keping-routing.module";
import { MatProgressSpinnerModule } from "@angular/material";
import { ExternalWebComponent } from './external-web/external-web.component';

@NgModule({
  declarations: [ExternalWebComponent, ExternalWebComponent],
  providers: [PageGuard],
  imports: [CommonModule, MatProgressSpinnerModule, LoyaltyKepingRoutingModule],
  exports: [ExternalWebComponent],
})
export class LoyaltyKepingModule {}
