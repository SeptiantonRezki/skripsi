import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ProductIndexComponent } from "./product/index/product-index.component";
import { ProductCreateComponent } from "./product/create/product-create.component";
import { ProductEditComponent } from "./product/edit/product-edit.component";
import { CashierIndexComponent } from "./product-cashier/index/index.component";
import { CashierCreateComponent } from "./product-cashier/create/create.component";
import { CashierEditComponent } from "./product-cashier/edit/edit.component";
import { brConfig } from "../../classes/breadcrumbs.config";
import { RewardIndexComponent } from "./reward/index/reward-index.component";
import { RewardCreateComponent } from "./reward/create/reward-create.component";
import { RewardEditComponent } from "./reward/edit/reward-edit.component";
import { RewardHistoryIndexComponent } from "./reward-history/index/reward-history-index.component";
import { CoinIndexComponent } from "./coin/index/coin-index.component";
import { PageGuard } from "app/classes/auth.guard";
import {
  ListBrandResolver,
  ListCategoryResolver,
  ListPackagingResolver
} from "../../resolver/product.resolver";
import { DetailTradeProgramComponent } from "./coin/detail/detail-trade-program/detail-trade-program.component";
import { DetailRetailerComponent } from "./coin/detail/detail-retailer/detail-retailer.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "product",
    pathMatch: "full"
  },
  {
    path: "product",
    component: ProductIndexComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.product.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "product/create",
    component: ProductCreateComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.product.create
    },
    resolve: {
      listBrand: ListBrandResolver,
      listCategory: ListCategoryResolver,
      listPackaging: ListPackagingResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "product/edit/:id",
    component: ProductEditComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.product.edit
    },
    resolve: {
      listBrand: ListBrandResolver,
      listCategory: ListCategoryResolver,
      listPackaging: ListPackagingResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "product/detail/:id",
    component: ProductEditComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.product.detail
    },
    resolve: {
      listBrand: ListBrandResolver,
      listCategory: ListCategoryResolver,
      listPackaging: ListPackagingResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "product-cashier",
    component: CashierIndexComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.productCashier.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "product-cashier/create",
    component: CashierCreateComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.productCashier.create
    },
    canActivate: [PageGuard]
  },
  {
    path: "product-cashier/edit/:id",
    component: CashierEditComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.productCashier.edit
    },
    canActivate: [PageGuard]
  },
  {
    path: "reward",
    component: RewardIndexComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.reward.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "reward/create",
    component: RewardCreateComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.reward.create
    },
    canActivate: [PageGuard]
  },
  {
    path: "reward/edit",
    component: RewardEditComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.reward.edit
    },
    canActivate: [PageGuard]
  },
  {
    path: "reward-history",
    component: RewardHistoryIndexComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.rewardHistory.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "coin",
    component: CoinIndexComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.coin.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "coin/detail-trade-program/:id",
    component: DetailTradeProgramComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.coin.trade
    },
    canActivate: [PageGuard]
  },
  {
    path: "coin/detail-retailer/:id",
    component: DetailRetailerComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.coin.retailer
    },
    canActivate: [PageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkuManagementRoutingModule { }
