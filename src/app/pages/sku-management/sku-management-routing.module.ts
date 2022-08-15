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
import { CashierSubmissionEditComponent } from "./product-cashier/submission/edit/edit.component";
import { CashierSubmissionComponent } from "./product-cashier/submission/index/index.component";
import { DbProductSubmissionComponent } from "./db-product-submission/index/index.component";
import { DbProductSubmissionEditComponent } from "./db-product-submission/edit/edit.component";
import { DbProductSubmissionApprovalComponent } from "./db-product-submission/approval/approval.component";

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
    component: CashierSubmissionComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.productCashier.submission
    },
    canActivate: [PageGuard]
  },
  {
    path: "product-cashier/detail/:id",
    component: CashierSubmissionEditComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.productCashier.submissionDetail
    },
    canActivate: [PageGuard]
  },
  {
    path: "product-cashier/list",
    component: CashierIndexComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.productCashier.list
    },
    canActivate: [PageGuard]
  },
  {
    path: "product-cashier/list/create",
    component: CashierCreateComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.productCashier.listCreate
    },
    canActivate: [PageGuard]
  },
  {
    path: "product-cashier/list/edit/:id",
    component: CashierEditComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.productCashier.listEdit
    },
    canActivate: [PageGuard]
  },
  {
    path: "product-cashier/list/detail/:id",
    component: CashierEditComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.productCashier.listDetail
    },
    canActivate: [PageGuard]
  },
  {
    path: "product-cashier/rrp",
    component: CashierIndexComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.productCashier.rrp
    },
    canActivate: [PageGuard]
  },
  {
    path: "product-cashier/rrp/create",
    component: CashierCreateComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.productCashier.rrpCreate
    },
    canActivate: [PageGuard]
  },
  {
    path: "product-cashier/rrp/edit/:id",
    component: CashierEditComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.productCashier.rrpEdit
    },
    canActivate: [PageGuard]
  },
  {
    path: "product-cashier/rrp/detail/:id",
    component: CashierEditComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.productCashier.rrpDetail
    },
    canActivate: [PageGuard]
  },
  {
    path: "db-product-submission",
    component: DbProductSubmissionComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.dbSubmission.index
    },
    canActivate: [PageGuard]
  },
  {
    path: "db-product-submission/detail/:id",
    component: DbProductSubmissionEditComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.dbSubmission.detail
    },
    resolve: {
      listBrand: ListBrandResolver,
      listCategory: ListCategoryResolver
    },
    canActivate: [PageGuard]
  },
  {
    path: "db-product-submission/approval",
    component: DbProductSubmissionApprovalComponent,
    data: {
      breadcrumbs: brConfig.skuManagement.dbSubmission.approval
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
