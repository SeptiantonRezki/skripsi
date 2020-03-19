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
import { MatButtonModule, MatCheckboxModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatStepperModule, MatProgressBarModule, MatProgressSpinnerModule, MatTabsModule, MatTooltipModule, MatToolbarModule, MatDialogModule, MatDatepickerModule, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDividerModule } from '@angular/material';
import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { UserSrcCatalogueComponent } from './user-src-catalogue/index/user-src-catalogue.component';
import { UserSrcCatalogueCreateComponent } from './user-src-catalogue/create/user-src-catalogue-create.component';
import { UserSrcCatalogueEditComponent } from './user-src-catalogue/edit/user-src-catalogue-edit.component';
import { ListRoleAdminResolver } from 'app/resolver/user-management.resolver';
import { ProductCatalogueComponent } from './product-catalogue/index/product-catalogue.component';
import { ProductCatalogueCreateComponent } from './product-catalogue/create/product-catalogue-create.component';
import { ProductCatalogueEditComponent } from './product-catalogue/edit/product-catalogue-edit.component';
import { NgxCurrencyModule } from 'ngx-currency';
import { CatalogueProductImportFileDialogComponent } from './product-catalogue/index/import-file-dialog/import-file-dialog.component';
import { RupiahFormaterWithoutRpPipe, RupiahFormaterPipe } from '@fuse/pipes/rupiah-formater';
import { OrderCatalogueComponent } from './order-catalogue/index/order-catalogue.component';
import { OrderCatalogueDetailComponent } from './order-catalogue/detail/order-catalogue-detail.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { EstShippingDialogComponent } from './order-catalogue/est-shipping-dialog/est-shipping-dialog';

export const customCurrencyMaskConfig = {
  align: "left",
  allowNegative: false,
  allowZero: true,
  decimal: ",",
  precision: 0,
  prefix: "",
  suffix: "",
  thousands: ".",
  nullable: false
};

export const MY_FORMATS = {
  parse: {
    dateInput: "LL"
  },
  display: {
    dateInput: "LL",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

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
    MatDatepickerModule,
    MatDividerModule,
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
  ],
  declarations: [VendorsIndexComponent, VendorsEditComponent, VendorsCreateComponent, StoreLayoutTemplateComponent, StoreLayoutTemplateCreateComponent, StoreLayoutTemplateEditComponent, UserSrcCatalogueComponent, UserSrcCatalogueCreateComponent, UserSrcCatalogueEditComponent, ProductCatalogueComponent, ProductCatalogueCreateComponent, ProductCatalogueEditComponent, CatalogueProductImportFileDialogComponent, OrderCatalogueComponent, OrderCatalogueDetailComponent, EstShippingDialogComponent],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ListRoleAdminResolver, RupiahFormaterWithoutRpPipe, RupiahFormaterPipe],
  exports: [CatalogueProductImportFileDialogComponent, EstShippingDialogComponent],
  entryComponents: [CatalogueProductImportFileDialogComponent, EstShippingDialogComponent]
})
export class SrcCatalogueModule { }
