import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ContentManagementRoutingModule } from "./content-management-routing.module";
import { TncIndexComponent } from "./tnc/index/tnc-index.component";
import { TncCreateComponent } from "./tnc/create/tnc-create.component";
import { TncEditComponent } from "./tnc/edit/tnc-edit.component";
import { PrivacyIndexComponent } from "./privacy/index/privacy-index.component";
import { PrivacyCreateComponent } from "./privacy/create/privacy-create.component";
import { PrivacyEditComponent } from "./privacy/edit/privacy-edit.component";
import { HelpIndexComponent } from "./help/index/help-index.component";
import { HelpCreateComponent } from "./help/create/help-create.component";
import { HelpEditComponent } from "./help/edit/help-edit.component";
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
  MatTabsModule,
  MatChipsModule,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS
} from "@angular/material";
import { ngfModule } from "angular-file";
import { FroalaEditorModule, FroalaViewModule } from "angular-froala-wysiwyg";
import { ReportListComponent } from './report-list/report-list.component';
import { ReportListIndexComponent } from './report-list/report-index/report-list-index.component';
import { ReportHistoryComponent } from './report-list/report-history/report-history.component';
import { ReportDetailComponent } from './report-list/report-detail/report-detail-wrapper.component';
import { ReporterListComponent } from './report-list/report-detail/reporter-list/reporter-list.component';
import { DetailReportComponent } from './report-list/report-detail/detail-report/detail-report.component';
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { PipesModule } from "app/pipe/pipes.module";

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
    PipesModule,
    CommonModule,
    ContentManagementRoutingModule,
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
    MatTabsModule,
    MatChipsModule,
    MatDatepickerModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot()
  ],
  declarations: [
    TncIndexComponent,
    TncCreateComponent,
    TncEditComponent,
    PrivacyIndexComponent,
    PrivacyCreateComponent,
    PrivacyEditComponent,
    HelpIndexComponent,
    HelpCreateComponent,
    HelpEditComponent,
    ReportListComponent,
    ReportListIndexComponent,
    ReportHistoryComponent,
    ReportDetailComponent,
    ReporterListComponent,
    DetailReportComponent
  ],
  exports: [
    TncIndexComponent,
    TncCreateComponent,
    TncEditComponent,
    PrivacyIndexComponent,
    PrivacyCreateComponent,
    PrivacyEditComponent,
    HelpIndexComponent,
    HelpCreateComponent,
    HelpEditComponent,
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class ContentManagementModule { }
