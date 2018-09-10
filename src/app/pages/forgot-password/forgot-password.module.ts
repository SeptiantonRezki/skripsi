import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FuseSharedModule } from "@fuse/shared.module";
import { ForgotPasswordComponent } from "./forgot-password.component";
import { ForgotPasswordRoutingModule } from "./forgot-password-routing.module";
import {
  MatButtonModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatStepperModule,
  MatCheckboxModule
} from "@angular/material";

@NgModule({
  declarations: [ForgotPasswordComponent],
  imports: [
    ForgotPasswordRoutingModule,
    FuseSharedModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatCheckboxModule
  ],
  exports: [ForgotPasswordComponent]
})
export class ForgotPasswordModule {}
