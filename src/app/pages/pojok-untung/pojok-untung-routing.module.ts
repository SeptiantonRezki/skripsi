import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { PageGuard } from "app/classes/auth.guard";
import { brConfig } from "app/classes/breadcrumbs.config";
import { PojokUntungTemplateComponent } from './pojok-untung-template/pojok-untung-template.component';
import { PojokUntungTemplateCreateComponent } from './pojok-untung-template/create/pojok-untung-template-create.component';
import { PojokUntungTemplateEditComponent } from './pojok-untung-template/edit/pojok-untung-template-edit.component';
import { PojokUntungPartnersListComponent } from './pojok-untung-partners-list/pojok-untung-partners-list.component';
import { PojokUntungPartnersListCreateComponent } from './pojok-untung-partners-list/create/pojok-untung-partners-list-create.component';
import { PojokUntungPartnersListEditComponent } from './pojok-untung-partners-list/edit/pojok-untung-partners-list-edit.component';
import { PojokUntungPartnersTemplateComponent } from './pojok-untung-partners-template/pojok-untung-partners-template.component';
import { PojokUntungPartnersTemplateCreateComponent } from './pojok-untung-partners-template/create/pojok-untung-partners-template-create.component';
import { PojokUntungPartnersTemplateEditComponent } from './pojok-untung-partners-template/edit/pojok-untung-partners-template-edit.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pojok-untung',
    pathMatch: 'full'
  },
  {
    path: "template-pojok-untung",
    component: PojokUntungTemplateCreateComponent,
    data: {
      breadcrumbs: brConfig.pojokuntung.templatePojokUntung.index
    },
    // canActivate: [PageGuard]
  },
  // {
  //   path: "template-pojok-untung/create",
  //   component: PojokUntungTemplateCreateComponent,
  //   data: {
  //     breadcrumbs: brConfig.pojokuntung.templatePojokUntung.create
  //   },
  //   // canActivate: [PageGuard]
  // },
  // {
  //   path: "template-pojok-untung/edit",
  //   component: PojokUntungTemplateEditComponent,
  //   data: {
  //     breadcrumbs: brConfig.pojokuntung.templatePojokUntung.edit
  //   },
  //   // canActivate: [PageGuard]
  // },
  {
    path: "partners-list",
    component: PojokUntungPartnersListComponent,
    data: {
      breadcrumbs: brConfig.pojokuntung.partners.index
    },
    // canActivate: [PageGuard]
  },
  {
    path: "partners-list/create",
    component: PojokUntungPartnersListCreateComponent,
    data: {
      breadcrumbs: brConfig.pojokuntung.partners.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "partners-list/edit",
    component: PojokUntungPartnersListEditComponent,
    data: {
      breadcrumbs: brConfig.pojokuntung.partners.edit
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
  {
    path: "partners-template/create",
    component: PojokUntungPartnersTemplateCreateComponent,
    data: {
      breadcrumbs: brConfig.pojokuntung.partnersTemplate.create
    },
    // canActivate: [PageGuard]
  },
  {
    path: "partners-template/edit",
    component: PojokUntungPartnersTemplateEditComponent,
    data: {
      breadcrumbs: brConfig.pojokuntung.partnersTemplate.edit
    },
    // canActivate: [PageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PojokUntungRoutingModule { }
