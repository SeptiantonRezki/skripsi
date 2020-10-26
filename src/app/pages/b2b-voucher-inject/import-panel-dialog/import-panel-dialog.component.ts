import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { B2BVoucherInjectService } from 'app/services/b2b-voucher-inject.service';

@Component({
  selector: 'app-import-panel-dialog',
  templateUrl: './import-panel-dialog.component.html',
  styleUrls: ['./import-panel-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportPanelDialogComponent implements OnInit {
  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];
  dialogData: any;

  typeTargeted: string;

  constructor(
    public dialogRef: MatDialogRef<ImportPanelDialogComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private b2bVoucherInjectService: B2BVoucherInjectService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    this.rows = [];
    this.dataService.showLoading(false);
    this.dialogData = data;
  }

  ngOnInit() {
  }

  preview(event) {
    this.files = undefined;
    this.files = event;

    console.log('files info', this.files);
    if (this.files.name.indexOf(".xls") === -1) {
      this.dialogService.openSnackBar({ message: "Ekstensi File wajib XLS!" });
      return;
    }

    let fd = new FormData();

    fd.append('file', this.files);
    fd.append('voucher_id', this.dialogData.voucher_id);
    fd.append('type', this.dialogData.type);

    this.dataService.showLoading(true);
    this.b2bVoucherInjectService.importFile(fd).subscribe(
      res => {
        this.b2bVoucherInjectService.previewImport({ voucher_id: this.dialogData.voucher_id, type: this.dialogData.type }).subscribe(preview => {
          console.log('preview res', preview);
          this.rows = preview.data;
          this.dataService.showLoading(false);
        }, err => {
          this.dataService.showLoading(false);
        })
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
      // const res = this.rows.map(item => { return { ...item } });
      // let body = {
      // }
      // this.coinService.adjustCoin(body)
      //   .subscribe(res => {
      //     this.dialogService.openSnackBar({ message: "File berhasil Diimport " });
      //     this.dialogRef.close(res);
      //   }, err => {
      //     console.log('err', err);
      //   })
      this.dialogRef.close(this.rows);
    } else {
      this.dialogService.openSnackBar({ message: "Semua row tidak valid " });
    }
  }

}