import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { InappMarketingRoutingModule } from "./inapp-marketing-routing.module";
import { BannerIndexComponent } from "./banner/index/banner-index.component";
import { BannerCreateComponent } from "./banner/create/banner-create.component";
import { BannerEditComponent } from "./banner/edit/banner-edit.component";
import { LandingPageIndexComponent } from "./landing-page/index/landing-page-index.component";
import { LandingPageCreateComponent } from "./landing-page/create/landing-page-create.component";
import { LandingPageEditComponent } from "./landing-page/edit/landing-page-edit.component";
import { PromoMandiriComponent } from "./promo-mandiri/promo-mandiri.component";
import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "app/shared/shared.module";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatDatepickerModule,
  MatTooltipModule,
  MatRadioModule,
  MatDialogModule,
  MatToolbarModule,
  MatListModule,
  MatCardModule,
} from "@angular/material";

import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { FroalaEditorModule, FroalaViewModule } from "angular-froala-wysiwyg";
import { PageGuard } from "app/classes/auth.guard";

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from "@angular/material/core";

import { ngfModule } from "angular-file";
import { ListLevelAreaResolver } from "app/resolver/inapp-marketing.resolver";
import { LightboxModule } from 'ngx-lightbox';
import { ImportAudienceBannerDialogComponent } from './banner/import-audience-banner-dialog/import-audience-banner-dialog.component';
import { BannerSortingComponent } from './banner-sorting/banner-sorting.component';
import { DndModule } from 'ngx-drag-drop';
import { TranslateModule } from "@ngx-translate/core";

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
    InappMarketingRoutingModule,
    CommonModule,
    FuseSharedModule,
    SharedModule,
    NgxDatatableModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatRadioModule,
    ngfModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    LightboxModule,
    MatDialogModule,
    MatToolbarModule,
    DndModule,
    MatListModule,
    MatCardModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    BannerIndexComponent,
    BannerCreateComponent,
    BannerEditComponent,
    LandingPageIndexComponent,
    LandingPageCreateComponent,
    LandingPageEditComponent,
    ImportAudienceBannerDialogComponent,
    BannerSortingComponent,
    PromoMandiriComponent,
  ],
  exports: [
    BannerIndexComponent,
    BannerCreateComponent,
    BannerEditComponent,
    LandingPageIndexComponent,
    LandingPageCreateComponent,
    LandingPageEditComponent
  ],
  providers: [
    ListLevelAreaResolver,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    PageGuard
  ],
  entryComponents: [ImportAudienceBannerDialogComponent]
})
export class InappMarketingModule { }
