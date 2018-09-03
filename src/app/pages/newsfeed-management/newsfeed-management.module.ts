import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NewsfeedManagementRoutingModule } from "./newsfeed-management-routing.module";
import { CategoryIndexComponent } from "./category/index/category-index.component";
import { CategoryCreateComponent } from "./category/create/category-create.component";
import { CategoryEditComponent } from "./category/edit/category-edit.component";
import { NewsIndexComponent } from "./news/index/news-index.component";

@NgModule({
  imports: [CommonModule, NewsfeedManagementRoutingModule],
  declarations: [
    CategoryIndexComponent,
    CategoryCreateComponent,
    CategoryEditComponent,
    NewsIndexComponent
  ],
  exports: [
    CategoryIndexComponent,
    CategoryCreateComponent,
    CategoryEditComponent,
    NewsIndexComponent
  ],
  providers: []
})
export class NewsfeedManagementModule {}
