import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from "../../classes/breadcrumbs.config";
import { TncIndexComponent } from "./tnc/index/tnc-index.component";
import { TncCreateComponent } from "./tnc/create/tnc-create.component";
import { TncEditComponent } from "./tnc/edit/tnc-edit.component";
import { PrivacyIndexComponent } from "./privacy/index/privacy-index.component";
import { PrivacyCreateComponent } from "./privacy/create/privacy-create.component";
import { PrivacyEditComponent } from "./privacy/edit/privacy-edit.component";
import { HelpIndexComponent } from "./help/index/help-index.component";
import { HelpCreateComponent } from "./help/create/help-create.component";
import { HelpEditComponent } from "./help/edit/help-edit.component";
import { ReportListComponent } from "./report-list/report-list.component";
import { ReportDetailComponent } from "./report-list/report-detail/report-detail-wrapper.component";
import { KeywordManagementComponent } from "./keyword-management/keyword-management-component";
import { PageGuard } from "app/classes/auth.guard";

const routes: Routes = [
  {
    path: "",
    redirectTo: "terms-and-condition",
    pathMatch: "full"
  },
  {
    path: "terms-and-condition",
    component: TncIndexComponent,
    data: {
      breadcrumbs: brConfig.contentManagement.tnc.index
    }
  },
  {
    path: "terms-and-condition/create",
    component: TncCreateComponent,
    data: {
      breadcrumbs: brConfig.contentManagement.tnc.create
    }
  },
  {
    path: "terms-and-condition/edit",
    component: TncEditComponent,
    data: {
      breadcrumbs: brConfig.contentManagement.tnc.edit
    }
  },
  {
    path: "privacy",
    component: PrivacyIndexComponent,
    data: {
      breadcrumbs: brConfig.contentManagement.privacy.index
    }
  },
  {
    path: "privacy/create",
    component: PrivacyCreateComponent,
    data: {
      breadcrumbs: brConfig.contentManagement.privacy.create
    }
  },
  {
    path: "privacy/edit",
    component: PrivacyEditComponent,
    data: {
      breadcrumbs: brConfig.contentManagement.privacy.edit
    }
  },
  {
    path: "help",
    component: HelpIndexComponent,
    data: {
      breadcrumbs: brConfig.contentManagement.help.index
    }
  },
  {
    path: "help/create",
    component: HelpCreateComponent,
    data: {
      breadcrumbs: brConfig.contentManagement.help.create
    }
  },
  {
    path: "help/edit",
    component: HelpEditComponent,
    data: {
      breadcrumbs: brConfig.contentManagement.help.edit
    }
  },
  {
    path: "report-list",
    component: ReportListComponent,
    data: {
      breadcrumbs: brConfig.contentManagement.report_list.index
    }
  },
  {
    path: "report-list/detail/promo",
    component: ReportDetailComponent,
    data: {
      breadcrumbs: brConfig.contentManagement.report_list.detail_promo
    },
  },
  {
    path: "report-list/detail/history",
    component: ReportDetailComponent,
    data: {
      breadcrumbs: brConfig.contentManagement.report_list.detail_history
    }
  },
  {
    path: "keyword-management",
    component: KeywordManagementComponent,
    data: {
      breadcrumbs: brConfig.contentManagement.keywordManagement.index
    },
    canActivate: [PageGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentManagementRoutingModule { }
