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
    NgxMatSelectSearchModule,
  ],
  declarations: [VendorsIndexComponent, VendorsEditComponent, VendorsCreateComponent, StoreLayoutTemplateComponent, StoreLayoutTemplateCreateComponent, StoreLayoutTemplateEditComponent]
})
export class SrcCatalogueModule { }
