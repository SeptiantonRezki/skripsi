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
import { PageGuard } from "app/classes/auth.guard";
import { BannerSortingComponent } from "./banner-sorting/banner-sorting.component";
import { PromoMandiriComponent } from "./promo-mandiri/promo-mandiri.component";

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
    },
    canActivate: [PageGuard]
  },
  {
    path: "banner/create",
    component: BannerCreateComponent,
    data: {
      breadcrumbs: brConfig.inappMarketing.banner.create
    },
    resolve: {
      listLevelArea: ListLevelAreaResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "banner/edit",
    component: BannerEditComponent,
    data: {
      breadcrumbs: brConfig.inappMarketing.banner.edit
    },
    resolve: {
      listLevelArea: ListLevelAreaResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "banner/detail",
    component: BannerEditComponent,
    data: {
      breadcrumbs: brConfig.inappMarketing.banner.detail
    },
    resolve: {
      listLevelArea: ListLevelAreaResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "banner/sorting",
    component: BannerSortingComponent,
    data: {
      breadcrumbs: brConfig.inappMarketing.banner.sorting
    },
    // canActivate: [PageGuard]
  },
  {
    path: "landing-page",
    component: LandingPageIndexComponent,
    data: {
      breadcrumbs: brConfig.inappMarketing.landingPage.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "landing-page/create",
    component: LandingPageCreateComponent,
    data: {
      breadcrumbs: brConfig.inappMarketing.landingPage.create
    },
    canActivate: [PageGuard]
  },
  {
    path: "landing-page/edit",
    component: LandingPageEditComponent,
    data: {
      breadcrumbs: brConfig.inappMarketing.landingPage.edit
    },
    canActivate: [PageGuard]
  },
  {
    path: "promo-mandiri",
    component: PromoMandiriComponent,
    canActivate: [PageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InappMarketingRoutingModule {}
