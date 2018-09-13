import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ProductIndexComponent } from "./product/index/product-index.component";
import { ProductCreateComponent } from "./product/create/product-create.component";
import { ProductEditComponent } from "./product/edit/product-edit.component";
import { brConfig } from "../../classes/breadcrumbs.config";
import { RewardIndexComponent } from "./reward/index/reward-index.component";
import { RewardCreateComponent } from "./reward/create/reward-create.component";
import { RewardEditComponent } from "./reward/edit/reward-edit.component";
import { RewardHistoryIndexComponent } from "./reward-history/index/reward-history-index.component";
import { CoinIndexComponent } from "./coin/index/coin-index.component";
import {
  ListBrandResolver,
  ListCategoryResolver,
  ListPackagingResolver
} from "../../resolver/product.resolver";

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
    }
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
    }
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
    }
  },
  {
    path: "reward",
    component: RewardIndexComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.reward.index
    }
  },
  {
    path: "reward/create",
    component: RewardCreateComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.reward.create
    }
  },
  {
    path: "reward/edit",
    component: RewardEditComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.reward.edit
    }
  },
  {
    path: "reward-history",
    component: RewardHistoryIndexComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.rewardHistory.index
    }
  },
  {
    path: "coin",
    component: CoinIndexComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.coin.index
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkuManagementRoutingModule {}