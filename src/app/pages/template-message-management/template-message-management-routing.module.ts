import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from "../../classes/breadcrumbs.config";
import { TemplateMessageComponent } from "./template-message/index/template-message.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "template-pesan",
    pathMatch: "full"
  },
  {
    path: "template-pesan",
    component: TemplateMessageComponent,
    data: {
      breadcrumbs: brConfig.templateMessageManagement.templateMessage.index
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateMessageManagementRoutingModule { }
