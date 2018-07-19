import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule, MatIconModule, MatMenuModule, MatProgressBarModule, MatToolbarModule,MatInputModule } from '@angular/material';
import { ToolbarSearchComponent } from './toolbar-search/toolbar-search.component';
import { PageContentComponent } from './page-content-header/page-content-header.component';
import { FuseSharedModule } from '@fuse/shared.module';


@NgModule({
  imports: [
    MatIconModule,
    MatInputModule,
    FuseSharedModule,
    RouterModule,
    MatButtonModule
   
  ],
  declarations: [
    ToolbarSearchComponent,
    PageContentComponent
  ],
  exports: [
    ToolbarSearchComponent,
    PageContentComponent
  ],
  entryComponents: [
    
  ],
  providers: [
    
  ]
})
export class SharedModule { }
