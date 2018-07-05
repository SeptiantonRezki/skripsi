import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseError404Component } from './error-404.component';
import { Error404RoutingModule } from './error-404-routing.module';

@NgModule({
    declarations: [
        FuseError404Component
    ],
    imports     : [
        Error404RoutingModule,

        MatIconModule,

        FuseSharedModule
    ]
})
export class Error404Module
{
}