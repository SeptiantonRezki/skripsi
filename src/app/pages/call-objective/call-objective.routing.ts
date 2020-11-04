import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from '../../classes/breadcrumbs.config';
import { PageGuard } from 'app/classes/auth.guard';
import { PendingChangesGuard } from 'app/pages/call-objective/call-objective.guard';
import {CreateCallObjectiveComponent} from 'app/pages/call-objective/component/create-call-objective.component';
import {CallObjectiveListComponent} from 'app/pages/call-objective/component/list-call-objective.component';

const routes: Routes = [
  {
    path: 'call-objective-create',
    component: CreateCallObjectiveComponent,
    data: {
    }
  },
  {
    path: 'call-objective-list',
    component: CallObjectiveListComponent,
    data: {
    }
  },
  {
    path: 'call-objective-edit/:id',
    component: CreateCallObjectiveComponent,
    data: {
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallobjRoutingModule { }
