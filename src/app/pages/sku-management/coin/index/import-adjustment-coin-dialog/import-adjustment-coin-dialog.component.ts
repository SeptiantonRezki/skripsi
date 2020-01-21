import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { CoinService } from 'app/services/sku-management/coin.service';
import { DataService } from 'app/services/data.service';
import { FormControl } from '@angular/forms';

@Component({
  // selector: 'app-import-adjustment-coin-dialog',
  templateUrl: './import-adjustment-coin-dialog.component.html',
  styleUrls: ['./import-adjustment-coin-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportAdjustmentCoinDialogComponent implements OnInit {

  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];
  dialogData: any;

  typeTargeted: string;
  textReason: FormControl = new FormControl('');

  constructor(
    public dialogRef: MatDialogRef<ImportAdjustmentCoinDialogComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private coinService: CoinService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    this.rows = [];
    this.dataService.showLoading(false);
    this.dialogData = data;
  }

  ngOnInit() {
    switch (this.dialogData.type) {
      case 'push_notification':
        this.typeTargeted = 'importPushNotifAudience';
        break;
      default:
        this.typeTargeted = 'importAudience';
    }
  }

  preview(event) {
    this.files = undefined;
    this.files = event;

    console.log('files info', this.files);
    if (this.files.name.indexOf(".xlsx") > -1) {
      this.dialogService.openSnackBar({ message: "Ekstensi File wajib XLS!" });
      return;
    }

    let fd = new FormData();

    fd.append('file', this.files);
    this.dataService.showLoading(true);
    this.coinService.previewImport(fd).subscribe(
      res => {
        if (res && res.is_valid) {
          this.rows = res.data;
          // this.validData = (res.data || []).filter(item => item.is_valid).length;
          this.dataService.showLoading(false);
        } else {
          this.dialogService.openSnackBar({ message: "Data tidak Valid, mohon mengunggah ulang." });
          this.dataService.showLoading(false);
        }
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
      let body = {
        reason: this.textReason.value,
        coins: this.rows.map(item => ({
          retailer_id: item.retailer_id,
          coin: item.coin,
          trade_creator: item.trade_creator
        }))
      }
      this.coinService.adjustCoin(body)
        .subscribe(res => {
          this.dialogService.openSnackBar({ message: "File berhasil Diimport " });
          this.dialogRef.close(res);
        }, err => {
          console.log('err', err);
        })
    } else {
      this.dialogService.openSnackBar({ message: "Semua row tidak valid " });
    }
  }
}
