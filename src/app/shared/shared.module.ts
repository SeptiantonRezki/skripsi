import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatProgressBarModule,
  MatToolbarModule,
  MatInputModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatFormFieldModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatCheckboxModule,
  MatProgressSpinnerModule,
} from "@angular/material";
import { ToolbarSearchComponent } from "./toolbar-search/toolbar-search.component";
import { PageContentComponent } from "./page-content-header/page-content-header.component";
import { FuseSharedModule } from "@fuse/shared.module";
import { DropdownTreeComponent } from "./dropdown-tree/dropdown-tree.component";
import { NotificationCoinAdjustmentDialogComponent } from "./notification-coin-adjustment-dialog/notification-coin-adjustment-dialog.component";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { TargetAreaComponent } from './target-area/target-area.component';
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { DialogImportComponent } from './target-area/dialog-import/dialog-import.component';
import { SalestreeComponent } from './salestree/salestree.component';
import { SelectSearchComponent } from "./select-search/select-search.component";
import { SelectSearchDirective } from "./select-search/select-search.directive";
import { ImportAudienceComponent } from './import-audience/import-audience.component';
import { ngfModule } from "angular-file";
import { SearchProductBarcodeComponent } from './search-product-barcode/search-product-barcode.component';
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  imports: [
    MatIconModule,
    MatInputModule,
    FuseSharedModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    NgxDatatableModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    ngfModule,
    MatAutocompleteModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    ToolbarSearchComponent,
    PageContentComponent,
    DropdownTreeComponent,
    NotificationCoinAdjustmentDialogComponent,
    TargetAreaComponent,
    SalestreeComponent,
    SelectSearchComponent,
    SelectSearchDirective,
    DialogImportComponent,
    SearchProductBarcodeComponent,
    ImportAudienceComponent,
  ],
  exports: [
    ToolbarSearchComponent,
    PageContentComponent,
    DropdownTreeComponent,
    NotificationCoinAdjustmentDialogComponent,
    TargetAreaComponent,
    SalestreeComponent,
    SelectSearchComponent,
    DialogImportComponent,
    SearchProductBarcodeComponent,
    ImportAudienceComponent,
  ],
  entryComponents: [
    NotificationCoinAdjustmentDialogComponent,
    DialogImportComponent,
    ImportAudienceComponent,
  ],
  providers: [
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top"
      }
    }
  ]
})
export class SharedModule { }
