import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';



import { FuseSharedModule } from '@fuse/shared.module';

import { DashboardComponent } from './dashboard.component';

const routes = [
    {
        path     : 'dashboard',
        component: DashboardComponent
    }
];

@NgModule({
    declarations: [
        DashboardComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        FuseSharedModule
    ],
    exports     : [
        DashboardComponent
    ]
})

export class DashboardModule
{
}
