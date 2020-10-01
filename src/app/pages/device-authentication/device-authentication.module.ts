import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSelectModule, MatStepperModule } from '@angular/material';
import { DeviceAuthenticationComponent } from './device-authentication.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "authentication",
    component: DeviceAuthenticationComponent
  },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
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
  declarations: [DeviceAuthenticationComponent]
})
export class DeviceAuthenticationModule { }
