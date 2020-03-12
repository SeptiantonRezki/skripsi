import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorsIndexComponent } from './vendors/index/vendors-index.component';
import { VendorsEditComponent } from './vendors/edit/vendors-edit.component';
import { VendorsCreateComponent } from './vendors/create/vendors-create.component';
import { SrcCatalogueRoutingModule } from "./src-catalogue-routing.module";

@NgModule({
  imports: [
    CommonModule,
    SrcCatalogueRoutingModule
  ],
  declarations: [VendorsIndexComponent, VendorsEditComponent, VendorsCreateComponent]
})
export class SrcCatalogueModule { }
