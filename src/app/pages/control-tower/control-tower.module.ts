import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlTowerRoutingModule } from "./control-tower-routing.module";
import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "app/shared/shared.module";
import { PageGuard } from "app/classes/auth.guard";

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from "@angular/material/core";
import { AreaConfiguration } from "./area-configuration/area-configuration.component";

export const MY_FORMATS = {
  parse: {
    dateInput: "LL"
  },
  display: {
    dateInput: "LL",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

@NgModule({
  imports: [
    CommonModule,
    ControlTowerRoutingModule,
    FuseSharedModule,
    SharedModule
  ],
  declarations: [
    AreaConfiguration
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    PageGuard
  ],
})

export class ControlTowerModule { }
