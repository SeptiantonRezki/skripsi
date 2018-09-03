import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FuseSharedModule } from "@fuse/shared.module";
import { LoginComponent } from "./login.component";
import { LoginRoutingModule } from "./login-routing.module";
import {
  MatButtonModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatStepperModule,
  MatCheckboxModule,
  MatProgressSpinnerModule
} from "@angular/material";

@NgModule({
  declarations: [LoginComponent],
  imports: [
    LoginRoutingModule,
    FuseSharedModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  exports: [LoginComponent]
})
export class LoginModule {}
