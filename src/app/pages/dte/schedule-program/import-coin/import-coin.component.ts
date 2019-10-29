import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { ScheduleTradeProgramService } from 'app/services/dte/schedule-trade-program.service';
import { DataService } from 'app/services/data.service';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './import-coin.component.html',
  styleUrls: ['./import-coin.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportCoinComponent {
  textReason: FormControl = new FormControl();
  files: File;
  validComboDrag: boolean;
  show: Boolean;

  uploading: Boolean;
  rows: any[];

  constructor(
    public dialogRef: MatDialogRef<ImportCoinComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private scheduleTradeProgramService: ScheduleTradeProgramService,
    private dataService: DataService
  ) {
    this.rows = [];
    if (data) {
      this.show = true;
    }
  }

  ngOnInit() {
  }

  preview(event) {
    this.files = undefined;
    this.files = event;

    let fd = new FormData();

    fd.append('file', this.files);
    this.dataService.showLoading(true);
    this.scheduleTradeProgramService.previewExcel(fd).subscribe(
      res => {
        this.rows = res;
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
    if (this.files) {
      const res = {
        coins: this.rows,
        reason: this.textReason.value
      };

      this.dataService.showLoading(true);
      this.scheduleTradeProgramService.storeExcel(res).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogRef.close(res);
      })

    } else {
      this.dialogService.openSnackBar({ message: 'Ukuran file melebihi 2mb' })
    }
  }

}
