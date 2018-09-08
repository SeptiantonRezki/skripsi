import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';
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

  constructor(
    public dialogRef: MatDialogRef<UploadImageComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
  ) { }

  ngOnInit() {
    this.dataImage = this.formBuilder.group({
      image: [""]
    })
  }

  ngOnDestroy() {
    // this.onBoardChanged.unsubscribe();
  }

  removeImage(): void {
    this.files = undefined;
  }

  submit() {
    if (this.files && this.files.size <= 2000000) {
      let reader = new FileReader();
      let file = this.files;
      reader.readAsDataURL(file);

      let self = this;
      reader.onload = () => {
        this.dialogRef.close(reader.result);
      };
      
    } else {
      this.dialogService.openSnackBar({ message: 'Ukuran gambar melebihi 2mb'})
    }
  }

}
