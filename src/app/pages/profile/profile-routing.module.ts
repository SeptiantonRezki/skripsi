import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { brConfig } from "../../classes/breadcrumbs.config";
import { ProfileComponent } from "./profile.component";

const routes: Routes = [
  {
    path: "",
    component: ProfileComponent,
    data: {
      breadcrumbs: brConfig.profile.myProfile.index
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}
