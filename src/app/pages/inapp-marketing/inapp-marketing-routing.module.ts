import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from "../../classes/breadcrumbs.config";
import { BannerIndexComponent } from "./banner/index/banner-index.component";
import { BannerCreateComponent } from "./banner/create/banner-create.component";
import { BannerEditComponent } from "./banner/edit/banner-edit.component";
import { LandingPageIndexComponent } from "./landing-page/index/landing-page-index.component";
import { LandingPageCreateComponent } from "./landing-page/create/landing-page-create.component";
import { LandingPageEditComponent } from "./landing-page/edit/landing-page-edit.component";
import { ListLevelAreaResolver } from "app/resolver/inapp-marketing.resolver";

const routes: Routes = [
  {
    path: "",
    redirectTo: "banner",
    pathMatch: "full"
  },
  {
    path: "banner",
    component: BannerIndexComponent,
    data: {
      breadcrumbs: brConfig.inappMarketing.banner.index
    }
  },
  {
    path: "banner/create",
    component: BannerCreateComponent,
    data: {
      breadcrumbs: brConfig.inappMarketing.banner.create
    }, 
    resolve: {
      listLevelArea: ListLevelAreaResolver
    }
  },
  {
    path: "banner/edit",
    component: BannerEditComponent,
    data: {
      breadcrumbs: brConfig.inappMarketing.banner.edit
    }, 
    resolve: {
      listLevelArea: ListLevelAreaResolver
    }
  },
  {
    path: "landing-page",
    component: LandingPageIndexComponent,
    data: {
      breadcrumbs: brConfig.inappMarketing.landingPage.index
    }
  },
  {
    path: "landing-page/create",
    component: LandingPageCreateComponent,
    data: {
      breadcrumbs: brConfig.inappMarketing.landingPage.create
    }
  },
  {
    path: "landing-page/edit",
    component: LandingPageEditComponent,
    data: {
      breadcrumbs: brConfig.inappMarketing.landingPage.edit
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InappMarketingRoutingModule {}
