import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { InappMarketingRoutingModule } from "./inapp-marketing-routing.module";
import { BannerIndexComponent } from "./banner/index/banner-index.component";
import { BannerCreateComponent } from "./banner/create/banner-create.component";
import { BannerEditComponent } from "./banner/edit/banner-edit.component";
import { LandingPageIndexComponent } from "./landing-page/index/landing-page-index.component";
import { LandingPageCreateComponent } from "./landing-page/create/landing-page-create.component";
import { LandingPageEditComponent } from "./landing-page/edit/landing-page-edit.component";

@NgModule({
  imports: [CommonModule, InappMarketingRoutingModule],
  declarations: [
    BannerIndexComponent,
    BannerCreateComponent,
    BannerEditComponent,
    LandingPageIndexComponent,
    LandingPageCreateComponent,
    LandingPageEditComponent
  ],
  exports: [
    BannerIndexComponent,
    BannerCreateComponent,
    BannerEditComponent,
    LandingPageIndexComponent,
    LandingPageCreateComponent,
    LandingPageEditComponent
  ],
  providers: []
})
export class InappMarketingModule {}
