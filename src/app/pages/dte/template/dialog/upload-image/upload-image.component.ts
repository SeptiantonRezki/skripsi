import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';

@Component({
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UploadImageComponent {

  files: File;
  validComboDrag: boolean;

  dataImage: FormGroup;

  fileType: string;
  format: string;
  url: any;
  file_copied: any;

  constructor(
    public dialogRef: MatDialogRef<UploadImageComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private translate: TranslateService,
  ) {
    this.fileType = data.fileType;
   }

  ngOnInit() {
    this.dataImage = this.formBuilder.group({
      image: [""]
    })

    setTimeout(() => {
      document.getElementById("upload-image").getElementsByTagName("input")[0].id = "inputUploadImage";
    }, 500);
    setTimeout(() => {
      document.getElementById("upload-video").getElementsByTagName("input")[0].id = "inputUploadVideo";
    }, 500);
  }

  ngOnDestroy() {
    // this.onBoardChanged.unsubscribe();
  }

  removeImage(): void {
    this.files = undefined;
  }

  submit() {
    if (this.files && this.files.size <= 2000000 && this.fileType == 'image' || this.files && this.files.size <= 50000000 &&  this.fileType == 'video') {
      let reader = new FileReader();
      let file = this.files;
      reader.readAsDataURL(file);

      let self = this;
      reader.onload = () => {
        this.dialogRef.close({ res: reader.result, event: this.file_copied });
      };
      
    } else {
      if (this.fileType == 'image') {
        this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.image_size_limit', {size: '2MB'}) })
      } else {
        this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.video_size_limit', {size: '50MB'}) })
      }
    }
  }

  onSelectFile(value: any) {
    // console.log('event', event);
    const file = value;
    if (file) {
      this.file_copied = file;
      var reader = new FileReader();
      reader.readAsDataURL(file);
      if (file.type.indexOf('image')> -1){
        this.format = 'image';
      } else if(file.type.indexOf('video')> -1){
        this.format = 'video';
      }
      reader.onload = (event) => {
        // console.log('event', event);
        this.url = (<FileReader>event.target).result;
      }
    }
  }

}
