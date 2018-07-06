import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardRoutingModule } from './dashboard-routing.module';




import { FuseSharedModule } from '@fuse/shared.module';

import { DashboardComponent } from './dashboard.component';

@NgModule({
    declarations: [
        DashboardComponent
    ],
    imports     : [
        DashboardRoutingModule,
        FuseSharedModule
    ],
    exports     : [
        DashboardComponent
    ]
})

export class DashboardModule
{
}
