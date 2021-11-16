import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SrcKatalogKoinComponent } from './index/src-katalog-koin.component';
import { FuseSharedModule } from '@fuse/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatProgressSpinnerModule } from '@angular/material';
import { PageGuard } from 'app/classes/auth.guard';

const routes: Routes = [
  {
    path: "",
    component: SrcKatalogKoinComponent,
    // canActivate: [PageGuard]
  },
]

@NgModule({
  imports: [
    CommonModule,
    FuseSharedModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  declarations: [SrcKatalogKoinComponent],
  providers: [PageGuard]
})
export class SrcKatalogKoinModule { }
