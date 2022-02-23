import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { brConfig } from '../../classes/breadcrumbs.config';
import { PageGuard } from 'app/classes/auth.guard';
import { PendingChangesGuard } from 'app/pages/notes-retailer/notes-retailer.guard';
import {CreateNotesRetailerComponent} from 'app/pages/notes-retailer/component/create-notes-retailer.component';
import {NotesRetailerListComponent} from 'app/pages/notes-retailer/component/list-notes-retailer.component';

const routes: Routes = [
  {
    path: 'notes-retailer-create',
    component: CreateNotesRetailerComponent,
    data: {
      breadcrumbs: brConfig.notes_retailer.create,
    }
  },
  {
    path: 'notes-retailer-list',
    component: NotesRetailerListComponent,
    data: {
      breadcrumbs: brConfig.notes_retailer.list,
    }
  },
  {
    path: 'notes-retailer-edit/:id',
    component: CreateNotesRetailerComponent,
    data: {
      breadcrumbs: brConfig.notes_retailer.edit
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotesRetailerRoutingModule { }
