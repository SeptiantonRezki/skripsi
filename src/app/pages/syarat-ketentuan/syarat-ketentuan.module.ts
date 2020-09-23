import { NgModule } from '@angular/core';
import { SyaratKetentuanRoutingModule } from './syarat-ketentuan-routing.module';




import { FuseSharedModule } from '@fuse/shared.module';

import { SyaratKetentuanComponent } from './syarat-ketentuan.component';
import { MatButtonModule, MatIconModule, MatProgressSpinnerModule } from '@angular/material';

@NgModule({
    declarations: [
        SyaratKetentuanComponent
    ],
    imports     : [
        SyaratKetentuanRoutingModule,
        FuseSharedModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    exports     : [
        SyaratKetentuanComponent
    ]
})

export class SyaratKetentuanModule
{
}
