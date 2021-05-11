import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { CoinDisburstmentService } from 'app/services/dte/coin-disburstment.service';

@Component({
  selector: 'app-import-exchange-coin',
  templateUrl: './import-exchange-coin.component.html',
  styleUrls: ['./import-exchange-coin.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class ImportExchangeCoinComponent implements OnInit {
  files: File;
  validComboDrag: boolean;
  is_valid: boolean;

  uploading: Boolean;
  rows: any[];

  constructor(
    public dialogRef: MatDialogRef<ImportExchangeCoinComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private dataService: DataService,
    private coinDisburstmentService: CoinDisburstmentService
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
    fd.append('file', this.files);
    this.dataService.showLoading(true);
    this.coinDisburstmentService.previewImport(fd).subscribe(
      res => {
        this.dataService.showLoading(false);
        if (res && res.data) {
          this.rows = res.data;
          this.is_valid = res.is_valid;
        } else {
          this.dataService.showLoading(false);
          this.files = undefined;
          this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda." })
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
    this.dataService.showLoading(true);
    const data = {
      data: this.rows
    }
    this.coinDisburstmentService.importExchange(data).subscribe(res => {
      this.dialogRef.close(true)
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({ message: "File berhasil Diimport" });
    }, err => {
      this.dataService.showLoading(false);
    })
  }

}
