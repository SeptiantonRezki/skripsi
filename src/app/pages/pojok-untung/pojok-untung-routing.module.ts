import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { PageGuard } from "app/classes/auth.guard";
import { brConfig } from "app/classes/breadcrumbs.config";
import { PojokUntungTemplateComponent } from './pojok-untung-template/pojok-untung-template.component';
import { PojokUntungTemplateCreateComponent } from './pojok-untung-template/create/pojok-untung-template-create.component';
import { PojokUntungTemplateEditComponent } from './pojok-untung-template/edit/pojok-untung-template-edit.component';
import { PojokUntungPartnersListComponent } from './pojok-untung-partners-list/pojok-untung-partners-list.component';
import { PojokUntungPartnersTemplateComponent } from './pojok-untung-partners-template/pojok-untung-partners-template.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pojok-untung',
    pathMatch: 'full'
  },
  {
    path: "template-pojok-untung",
    component: PojokUntungTemplateComponent,
    data: {
      breadcrumbs: brConfig.pojokuntung.templatePojokUntung.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "template-pojok-untung/create",
    component: PojokUntungTemplateCreateComponent,
    data: {
      breadcrumbs: brConfig.pojokuntung.templatePojokUntung.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "template-pojok-untung/edit",
    component: PojokUntungTemplateEditComponent,
    data: {
      breadcrumbs: brConfig.pojokuntung.templatePojokUntung.edit
    },
    // canActivate: [PageGuard]
  },
  {
    path: "partners-list",
    component: PojokUntungPartnersListComponent,
    data: {
      breadcrumbs: brConfig.pojokuntung.partners.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "partners-template",
    component: PojokUntungPartnersTemplateComponent,
    data: {
      breadcrumbs: brConfig.pojokuntung.partnersTemplate.index
    },
    // canActivate: [PageGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PojokUntungRoutingModule { }
