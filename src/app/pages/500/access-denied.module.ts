import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccessDeniedRoutingModule } from './access-denied-routing.module';
import { AccessDeniedComponent } from './access-denied.component';
import { MatIconModule } from '../../../../node_modules/@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';

@NgModule({
  imports: [
    AccessDeniedRoutingModule,
    MatIconModule,
    FuseSharedModule
  ],
  declarations: [AccessDeniedComponent]
})
export class AccessDeniedModule { }
