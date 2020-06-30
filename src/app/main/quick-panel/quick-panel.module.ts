import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatDividerModule, MatListModule, MatSlideToggleModule } from '@angular/material';

import { EllipsisModule } from 'ngx-ellipsis';
import { FuseSharedModule } from '@fuse/shared.module';

import { FuseQuickPanelComponent } from 'app/main/quick-panel/quick-panel.component';

@NgModule({
    declarations: [
        FuseQuickPanelComponent
    ],
    imports     : [
        RouterModule,

        MatDividerModule,
        MatListModule,
        MatSlideToggleModule,
        EllipsisModule,

        FuseSharedModule,
    ],
    exports: [
        FuseQuickPanelComponent
    ]
})
export class FuseQuickPanelModule
{
}
