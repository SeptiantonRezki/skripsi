import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from "../../classes/breadcrumbs.config";

import { CategoryIndexComponent } from "./category/index/category-index.component";
import { CategoryCreateComponent } from "./category/create/category-create.component";
import { CategoryEditComponent } from "./category/edit/category-edit.component";
import { NewsIndexComponent } from "./news/index/news-index.component";
import { ListCategoryNewsfeedResolver } from "app/resolver/newsfeed-management.resolver";
import { NewsDetailComponent } from "./news/detail/news-detail.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "category",
    pathMatch: "full"
  },
  {
    path: "category",
    component: CategoryIndexComponent,
    data: {
      breadcrumbs: brConfig.newsfeedManagement.category.index
    }
  },
  {
    path: "category/create",
    component: CategoryCreateComponent,
    data: {
      breadcrumbs: brConfig.newsfeedManagement.category.create
    }
  },
  {
    path: "category/edit",
    component: CategoryEditComponent,
    data: {
      breadcrumbs: brConfig.newsfeedManagement.category.edit
    }
  },
  {
    path: "news",
    component: NewsIndexComponent,
    data: {
      breadcrumbs: brConfig.newsfeedManagement.news.index
    },
    resolve: {
      listCategory: ListCategoryNewsfeedResolver
    }
  },
  {
    path: "news/detail",
    component: NewsDetailComponent,
    data: {
      breadcrumbs: brConfig.newsfeedManagement.news.detail
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsfeedManagementRoutingModule {}
