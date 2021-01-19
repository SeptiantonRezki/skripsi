import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseQiscusComponent } from './fuse-qiscus.component';
import { UploadImageQiscusComponent } from "./upload-image-qiscus/upload-image-qiscus.component";
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCardModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatToolbarModule } from '@angular/material';
import { ngfModule } from 'angular-file';
import { FuseSharedModule } from '@fuse/shared.module';
import { EllipsisModule } from 'ngx-ellipsis';

@NgModule({
  imports: [
    RouterModule,
    BrowserAnimationsModule,

    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    ngfModule,

    FuseSharedModule,
    EllipsisModule,
  ],
  declarations: [FuseQiscusComponent, UploadImageQiscusComponent],
  exports: [FuseQiscusComponent],
  entryComponents: [UploadImageQiscusComponent]
})
export class FuseQiscusModule { }
