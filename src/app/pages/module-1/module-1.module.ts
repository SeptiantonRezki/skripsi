import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseSharedModule } from '@fuse/shared.module';
import { Module1Component } from './module-1.component';
import { Module1RoutingModule } from './module-1-routing.module';





@NgModule({
    declarations: [
        Module1Component
    ],
    imports     : [
        Module1RoutingModule,
        FuseSharedModule
    ],
    exports     : [
        Module1Component
    ]
})

export class Module1Module
{
}
