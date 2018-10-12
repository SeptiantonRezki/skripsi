import { NgModule } from "@angular/core";
import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "../../shared/shared.module";

import { ProfileRoutingModule } from "./profile-routing.module";
import { ProfileComponent } from "./profile.component";

import {
  MatInputModule,
  MatButtonModule,
  MatFormFieldModule,
  MatIconModule
} from "@angular/material";

@NgModule({
  imports: [
    ProfileRoutingModule,
    FuseSharedModule,
    SharedModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  declarations: [ProfileComponent],
  exports: [ProfileComponent]
})
export class ProfileModule {}
