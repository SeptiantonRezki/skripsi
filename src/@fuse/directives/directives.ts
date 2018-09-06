import { NgModule } from "@angular/core";

import { FuseIfOnDomDirective } from "./fuse-if-on-dom/fuse-if-on-dom.directive";
import { FusePerfectScrollbarDirective } from "./fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive";
import {
  FuseMatSidenavHelperDirective,
  FuseMatSidenavTogglerDirective
} from "./fuse-mat-sidenav/fuse-mat-sidenav.directive";
import { NumericOnlyDirective } from "./numeric-only";

@NgModule({
  declarations: [
    FuseIfOnDomDirective,
    FuseMatSidenavHelperDirective,
    FuseMatSidenavTogglerDirective,
    FusePerfectScrollbarDirective,
    NumericOnlyDirective
  ],
  imports: [],
  exports: [
    FuseIfOnDomDirective,
    FuseMatSidenavHelperDirective,
    FuseMatSidenavTogglerDirective,
    FusePerfectScrollbarDirective,
    NumericOnlyDirective
  ]
})
export class FuseDirectivesModule {}
