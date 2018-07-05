import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseSharedModule } from '@fuse/shared.module';
import { ResetPasswordComponent } from './reset-password.component';
import { ResetPasswordRoutingModule } from './reset-password-routing.module';
import { MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatStepperModule, MatCheckboxModule } from '@angular/material';

@NgModule({
    declarations: [
        ResetPasswordComponent
    ],
    imports     : [
        ResetPasswordRoutingModule,
        FuseSharedModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatStepperModule, MatCheckboxModule
    ],
    exports     : [
        ResetPasswordComponent
    ]
})

export class ResetPasswordModule
{
}
