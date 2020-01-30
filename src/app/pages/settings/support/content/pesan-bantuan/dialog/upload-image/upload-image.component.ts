import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import * as moment from "moment";
import { QiscusService } from 'app/services/qiscus.service';
import { Subject } from "rxjs/Subject";
import { Page } from "../../../../../../../classes/laravel-pagination";

@Component({
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UploadImageComponent {

  loadingIndicator: boolean;
  pagination: Page = new Page();
  offsetPagination: any;
  files: File;
  validComboDrag: boolean;

  dataImage: FormGroup;

  message: any;
  data: any; // data from parent
  rows: any; // data list from API
  rowsTemp: any; // data list from Temporary/History

  keyUp = new Subject<string>();
  myControl = new FormControl();

  progressBar: number;
  isProgressBar: boolean;

  constructor(
    public dialogRef: MatDialogRef<UploadImageComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private qs: QiscusService,
  ) { 
    this.loadingIndicator = false;
    this.message = null;
    this.data = data;
    console.log('DATA',data);
    this.rows = [];
    this.rowsTemp = [];
    this.myControl.setValue('');
    this.progressBar = 0;
    this.isProgressBar = false;

    const productListTemp = window.localStorage.getItem('product-list');
    if (productListTemp) {
      this.rowsTemp = JSON.parse(productListTemp).reverse();
    }
  }

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

  onMessageKeyPress(e: any) {
    console.log('EVENT', e);
  }

  deleteSearch() {
    this.myControl.setValue('');
  }

  submit() {
    if (this.files && this.files.size <= 10000000) {
      this.isProgressBar = true;
      let reader = new FileReader();
      let file = this.files;
      reader.readAsDataURL(file);
      let self = this;
      reader.onload = () => {
        // this.dialogRef.close(reader.result);
        this.qs.qiscusMC.upload(file, (error: any, progress: any, fileURL: any) => {
          if (error) { alert('Maaf, Terjadi kesalahan saat mengupload produk'); return console.log('error when uploading', error); }
          if (progress){ this.progressBar = progress.percent; return console.log(progress.percent) };
          if (fileURL !== null && fileURL !== undefined) {
            const payload = JSON.stringify({
                url: fileURL,
                caption: self.message,
                file_name: file.name,
                size: file.size,
            });
            console.log('payload', payload);
            const uniqueId = String(moment().unix()) + String(Math.random());
            const dataUpload = {
              roomId: self.data.roomId,
              message: self.message ? self.message : '',
              uniqueId: uniqueId, 
              payload: payload
            }
            this.dialogRef.close(dataUpload);
          }
        });
      };
      
    } else {
      if (!this.files) {
        this.dialogService.openSnackBar({ message: 'Belum ada gambar yang dipilih'})
      } else {
        this.dialogService.openSnackBar({ message: 'Ukuran gambar melebihi 10MB'})
      }
    }
  }

}
