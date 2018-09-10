import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NewsfeedManagementRoutingModule } from "./newsfeed-management-routing.module";
import { CategoryIndexComponent } from "./category/index/category-index.component";
import { CategoryCreateComponent } from "./category/create/category-create.component";
import { CategoryEditComponent } from "./category/edit/category-edit.component";
import { NewsIndexComponent } from "./news/index/news-index.component";
import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "app/shared/shared.module";

import {
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatOptionModule,
  MatCheckboxModule,
  MatSelectModule,
  MatTabsModule,
  MatTooltipModule,
  MatButtonModule,
  MatSlideToggleModule,
  MatMenuModule,
  MatToolbarModule,
  MatDialogModule,
  MatDatepickerModule,
  MatAutocompleteModule,
  MatRadioModule,
  MatProgressBarModule
} from "@angular/material";

import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { MomentDateAdapter } from "@angular/material-moment-adapter";

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from "@angular/material/core";
import { ListCategoryNewsfeedResolver } from "../../resolver/newsfeed-management.resolver";
import { NewsDetailComponent } from "./news/detail/news-detail.component";

export const MY_FORMATS = {
  parse: {
    dateInput: "LL"
  },
  display: {
    dateInput: "LL",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

@NgModule({
  imports: [
    CommonModule, 
    NewsfeedManagementRoutingModule,
    FuseSharedModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatTooltipModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatToolbarModule,
    MatDialogModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatRadioModule,
    NgxDatatableModule,
    MatDatepickerModule,
    MatProgressBarModule
  ],
  declarations: [
    CategoryIndexComponent,
    CategoryCreateComponent,
    CategoryEditComponent,
    NewsIndexComponent,
    NewsDetailComponent
  ],
  exports: [
    CategoryIndexComponent,
    CategoryCreateComponent,
    CategoryEditComponent,
    NewsIndexComponent,
    NewsDetailComponent
  ],
  providers: [
    ListCategoryNewsfeedResolver,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
})
export class NewsfeedManagementModule {}
