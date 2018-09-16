import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "../../shared/shared.module";
import { ngfModule } from "angular-file";

import { SkuManagementRoutingModule } from "./sku-management-routing.module";
import { ProductIndexComponent } from "./product/index/product-index.component";
import { ProductCreateComponent } from "./product/create/product-create.component";
import { ProductEditComponent } from "./product/edit/product-edit.component";
import { RewardIndexComponent } from "./reward/index/reward-index.component";
import { RewardCreateComponent } from "./reward/create/reward-create.component";
import { RewardEditComponent } from "./reward/edit/reward-edit.component";
import { RewardHistoryIndexComponent } from "./reward-history/index/reward-history-index.component";
import { CoinIndexComponent } from "./coin/index/coin-index.component";
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatTabsModule,
  MatChipsModule,
  MatSelectModule,
  MatDatepickerModule,
  MatRadioModule,
  MatTooltipModule,
  MatAutocompleteModule,
  MatSnackBarModule,
  MatProgressBarModule
} from "@angular/material";

import {
  ListBrandResolver,
  ListCategoryResolver,
  ListPackagingResolver
} from "../../resolver/product.resolver";

@NgModule({
  imports: [
    CommonModule,
    SkuManagementRoutingModule,
    FuseSharedModule,
    SharedModule,
    NgxDatatableModule,
    NgxMatSelectSearchModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatChipsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatProgressBarModule,
    ngfModule
  ],
  declarations: [
    ProductIndexComponent,
    ProductCreateComponent,
    ProductEditComponent,
    RewardIndexComponent,
    RewardCreateComponent,
    RewardEditComponent,
    RewardHistoryIndexComponent,
    CoinIndexComponent
  ],
  exports: [
    ProductIndexComponent,
    ProductCreateComponent,
    ProductEditComponent,
    RewardIndexComponent,
    RewardCreateComponent,
    RewardEditComponent,
    RewardHistoryIndexComponent,
    CoinIndexComponent
  ],
  providers: [ListBrandResolver, ListCategoryResolver, ListPackagingResolver]
})
export class SkuManagementModule {}
