import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule, MatIconModule, MatMenuModule, MatProgressBarModule, MatToolbarModule,MatInputModule } from '@angular/material';
import { ToolbarSearchComponent } from './toolbar-search/toolbar-search.component';


@NgModule({
  imports: [
    MatIconModule,
    MatInputModule
   
  ],
  declarations: [
    ToolbarSearchComponent
  ],
  exports: [
    ToolbarSearchComponent
  ],
  entryComponents: [
    
  ],
  providers: [
    
  ]
})
export class SharedModule { }
