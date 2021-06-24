import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from '../../classes/breadcrumbs.config';
import { PageGuard } from 'app/classes/auth.guard';
import { PendingChangesGuard } from 'app/pages/kpi-setting/kpi-setting.guard';
import {EditKPISettingComponent} from 'app/pages/kpi-setting/component/edit-kpi-setting.component';
import {KPSListComponent} from 'app/pages/kpi-setting/component/list-kps.component';

const routes: Routes = [
  {
    path: 'kps-list',
    component: KPSListComponent,
    data: {
    }
  },
  {
    path: 'kpi-setting-edit/:id',
    component: EditKPISettingComponent,
    data: {
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KPISettingRoutingModule { }
