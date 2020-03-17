import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorsIndexComponent } from './vendors/index/vendors-index.component';
import { VendorsEditComponent } from './vendors/edit/vendors-edit.component';
import { VendorsCreateComponent } from './vendors/create/vendors-create.component';
import { SrcCatalogueRoutingModule } from "./src-catalogue-routing.module";
import { StoreLayoutTemplateComponent } from './store-layout-template/index/store-layout-template.component';
import { StoreLayoutTemplateCreateComponent } from './store-layout-template/create/store-layout-template-create.component';
import { StoreLayoutTemplateEditComponent } from './store-layout-template/edit/store-layout-template-edit.component';
import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule, MatCheckboxModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatStepperModule, MatProgressBarModule, MatProgressSpinnerModule, MatTabsModule, MatTooltipModule, MatToolbarModule, MatDialogModule } from '@angular/material';
import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { UserSrcCatalogueComponent } from './user-src-catalogue/index/user-src-catalogue.component';
import { UserSrcCatalogueCreateComponent } from './user-src-catalogue/create/user-src-catalogue-create.component';
import { UserSrcCatalogueEditComponent } from './user-src-catalogue/edit/user-src-catalogue-edit.component';
import { ListRoleAdminResolver } from 'app/resolver/user-management.resolver';

@NgModule({
  imports: [
    CommonModule,
    SrcCatalogueRoutingModule,
    FuseSharedModule,
    SharedModule,
    NgxDatatableModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    MatToolbarModule,
    MatDialogModule,
    ngfModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    NgxMatSelectSearchModule,
  ],
  declarations: [VendorsIndexComponent, VendorsEditComponent, VendorsCreateComponent, StoreLayoutTemplateComponent, StoreLayoutTemplateCreateComponent, StoreLayoutTemplateEditComponent, UserSrcCatalogueComponent, UserSrcCatalogueCreateComponent, UserSrcCatalogueEditComponent],
  providers: [ListRoleAdminResolver]
})
export class SrcCatalogueModule { }
