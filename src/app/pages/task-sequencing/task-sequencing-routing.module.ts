import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { brConfig } from "../../classes/breadcrumbs.config";
import { TaskSequencingComponent } from './task-sequencing/index/task-sequencing.component';
import { TaskSequencingCreateComponent } from './task-sequencing/create/task-sequencing-create.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: "task-sequencing",
    pathMatch: "full"
  },
  {
    path: "task-sequencing",
    component: TaskSequencingComponent,
    data: {
      breadcrumbs: brConfig.taskSequencingManagement.taskSequencing.index
    },
  },
  {
    path: "task-sequencing/create",
    component: TaskSequencingCreateComponent,
    data: {
      breadcrumbs: brConfig.taskSequencingManagement.taskSequencing.create
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskSequencingRoutingModule { }
