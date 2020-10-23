import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { B2BVoucherInjectService } from 'app/services/b2b-voucher-inject.service';

@Component({
  selector: 'app-import-redeem-dialog',
  templateUrl: './import-redeem-dialog.component.html',
  styleUrls: ['./import-redeem-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportRedeemDialogComponent {
  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];
  dialogData: any;

  typeTargeted: string;

  constructor(
    public dialogRef: MatDialogRef<ImportRedeemDialogComponent>,
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

  preview(event: any) {
    this.files = undefined;
    this.files = event;

    console.log('files info', this.files);
    if (this.files.name.indexOf('.xls') === -1) {
      this.dialogService.openSnackBar({ message: 'Ekstensi File wajib XLS!' });
      return;
    }

    const fd = new FormData();

    fd.append('file', this.files);

    this.dataService.showLoading(true);
    this.b2bVoucherInjectService.redeemImportPreview(fd, { voucher_id: this.dialogData.voucher_id }).subscribe(res => {
        this.rows = res.data;
        this.dataService.showLoading(false);
      }, err => {
        this.dataService.showLoading(false);
        this.files = undefined;

        if (err.status === 404 || err.status === 500) {
          this.dialogService.openSnackBar({
            message: 'Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda.'
          });
        } else {
          console.log('err', err);
          alert('Terjadi kesalahan saat Import File');
        }
      }
    );
  }

  submit() {
    if (this.rows.length > 0) {
      const body = {
        redeem_voucher: this.rows
      }
      this.b2bVoucherInjectService.redeemImportSubmit(body, { voucher_id: this.dialogData.voucher_id }).subscribe(res => {
        this.dialogRef.close(this.rows);
      }, err => {
        console.log('err submit', err);
        this.dialogService.openSnackBar({ message: 'Terjadi Kesalahan saat Import File' });
      });
    } else {
      this.dialogService.openSnackBar({ message: 'Semua row tidak valid ' });
    }
  }

}
