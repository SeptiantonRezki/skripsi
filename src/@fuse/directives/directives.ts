import { NgModule } from "@angular/core";

import { FuseIfOnDomDirective } from "./fuse-if-on-dom/fuse-if-on-dom.directive";
import { FusePerfectScrollbarDirective } from "./fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive";
import {
  FuseMatSidenavHelperDirective,
  FuseMatSidenavTogglerDirective
} from "./fuse-mat-sidenav/fuse-mat-sidenav.directive";
import { NumericOnlyDirective } from "./numeric-only";
import { DecimalNumberDirective } from "./decimal-number";

@NgModule({
  declarations: [
    FuseIfOnDomDirective,
    FuseMatSidenavHelperDirective,
    FuseMatSidenavTogglerDirective,
    FusePerfectScrollbarDirective,
    NumericOnlyDirective,
    DecimalNumberDirective
  ],
  imports: [],
  exports: [
    FuseIfOnDomDirective,
    FuseMatSidenavHelperDirective,
    FuseMatSidenavTogglerDirective,
    FusePerfectScrollbarDirective,
    NumericOnlyDirective,
    DecimalNumberDirective
  ]
})
export class FuseDirectivesModule {}
