import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { RetailerService } from 'app/services/user-management/retailer.service';
import { DataService } from 'app/services/data.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  templateUrl: './import-access-cashier-dialog.component.html',
  styleUrls: ['./import-access-cashier-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ImportAccessCashierDialogComponent {

  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];

  constructor(
    public dialogRef: MatDialogRef<ImportAccessCashierDialogComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private retailerService: RetailerService,
    private dataService: DataService,
    private ls: LanguagesService,
  ) {
    this.rows = [];
    this.dataService.showLoading(false);
  }

  ngOnInit() {
  }

  preview(event) {
    this.files = undefined;
    this.files = event;

    let fd = new FormData();

    console.log('files info', this.files);
    if (this.files.name.indexOf(".xlsx") === -1) {
      this.dialogService.openSnackBar({ message: "Ekstensi File wajib XLSX!" });
      return;
    }

    fd.append('file', this.files);
    this.dataService.showLoading(true);
    this.retailerService.importExcel(fd).subscribe(
      res => {
        this.rows = res.data;
        this.validData = (res.data || []).filter(item => item.is_valid).length;
        this.dataService.showLoading(false);
      },
      err => {
        this.dataService.showLoading(false);
        this.files = undefined;

        if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda." })
      }
    )
  }

  submit() {
    if (this.rows.length > 0) {
      const res = this.rows.map(item => { return { ...item } });
      this.retailerService.storeAccessCashier({ flag_cashier: res }).subscribe(resp => {
        console.log('resp', resp);
        this.dialogRef.close(resp);
      }, err => {
        console.log('err', err);
        this.dialogService.openSnackBar({ message: "File Gagal di import, terjadi kesalahan saat melakukan upload!" });
        this.dialogRef.close(null);
      });
    } else {
      this.dialogService.openSnackBar({ message: "Semua row tidak valid " });
    }
  }

}
