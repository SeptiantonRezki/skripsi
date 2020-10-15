import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageGuard } from 'app/classes/auth.guard';
import { brConfig } from 'app/classes/breadcrumbs.config';

import { B2CVoucherIndexComponent } from './index/b2c-voucher-index.component';
import { B2CVoucherCreateComponent } from './create/b2c-voucher-create.component';
import { B2CVoucherEditComponent } from './edit/b2c-voucher-edit.component';

const routes: Routes = [
  {
    path: '',
    component: B2CVoucherIndexComponent,
    data: {
      breadcrumbs: brConfig.b2c_voucher.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: 'create',
    component: B2CVoucherCreateComponent,
    data: {
      breadcrumbs: brConfig.b2c_voucher.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: 'edit/:id',
    component: B2CVoucherEditComponent,
    data: {
      breadcrumbs: brConfig.b2c_voucher.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: 'detail/:id',
    component: B2CVoucherEditComponent,
    data: {
      breadcrumbs: brConfig.b2c_voucher.detail
    },
    // canActivate: [PageGuard]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class B2CVoucherRoutingModule { }