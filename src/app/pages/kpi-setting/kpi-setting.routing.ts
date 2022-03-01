import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from '../../classes/breadcrumbs.config';
import { PageGuard } from 'app/classes/auth.guard';
import { PendingChangesGuard } from 'app/pages/kpi-setting/kpi-setting.guard';
import {EditKPISettingComponent} from 'app/pages/kpi-setting/component/edit-kpi-setting.component';
import {KPIGroupsList} from 'app/pages/kpi-setting/component/list-kpi-groups.component';

const routes: Routes = [
  {
    path: 'kpi-groups-list',
    component: KPIGroupsList,
    data: {
      breadcrumbs: brConfig.kpi.list,
    }
  },
  {
    path: 'kpi-setting-create',
    component: EditKPISettingComponent,
    data: {
      breadcrumbs: brConfig.kpi.create,
    }
  },
  {
    path: 'kpi-setting-edit/:id',
    component: EditKPISettingComponent,
    data: {
      breadcrumbs: brConfig.kpi.edit,
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KPISettingRoutingModule { }
