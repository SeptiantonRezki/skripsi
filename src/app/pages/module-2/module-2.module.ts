import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseSharedModule } from '@fuse/shared.module';
import { Module2Component } from './module-2.component';
import { Module2RoutingModule } from './module-2-routing.module';
import { MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatStepperModule } from '@angular/material';






@NgModule({
    declarations: [
        Module2Component
    ],
    imports     : [
        Module2RoutingModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatStepperModule,
        FuseSharedModule
    ],
    exports     : [
        Module2Component
    ]
})

export class Module2Module
{
}
