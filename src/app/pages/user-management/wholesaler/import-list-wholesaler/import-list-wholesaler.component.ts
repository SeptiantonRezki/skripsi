import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { WholesalerService } from 'app/services/user-management/wholesaler.service';

@Component({
  selector: 'app-import-list-wholesaler',
  templateUrl: './import-list-wholesaler.component.html',
  styleUrls: ['./import-list-wholesaler.component.scss']
})
export class ImportListWholesalerComponent implements OnInit {

  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];

  constructor(
    public dialogRef: MatDialogRef<ImportListWholesalerComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private wholesalerService: WholesalerService,
    private dataService: DataService) {
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
    if (this.files.name.indexOf(".xls") === -1) {
      this.dialogService.openSnackBar({ message: "Ekstensi File wajib XLS!" });
      return;
    }

    fd.append('file', this.files);
    this.dataService.showLoading(true);
    this.wholesalerService.importExcel(fd).subscribe(
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
      console.log(res);
      this.wholesalerService.storeImport({ gswCode: res }).subscribe(resp => {
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
