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
  MatSelectModule
} from "@angular/material";
import { ToolbarSearchComponent } from "./toolbar-search/toolbar-search.component";
import { PageContentComponent } from "./page-content-header/page-content-header.component";
import { FuseSharedModule } from "@fuse/shared.module";
import { DropdownTreeComponent } from "./dropdown-tree/dropdown-tree.component";
import { PopupNotifComponent } from "./popup-notif/popup-notif.component";

@NgModule({
  imports: [
    MatIconModule,
    MatInputModule,
    FuseSharedModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  declarations: [
    ToolbarSearchComponent,
    PageContentComponent,
    DropdownTreeComponent,
    PopupNotifComponent
  ],
  exports: [
    ToolbarSearchComponent,
    PageContentComponent,
    DropdownTreeComponent
  ],
  entryComponents: [],
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
export class SharedModule {}
