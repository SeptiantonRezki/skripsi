import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { B2CVoucherService } from 'app/services/b2c-voucher.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  templateUrl: './import-audience-dialog.component.html',
  styleUrls: ['./import-audience-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportAudienceDialogComponent implements OnInit {
  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];
  dialogData: any;


  constructor(
    public dialogRef: MatDialogRef<ImportAudienceDialogComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private b2cVoucherService: B2CVoucherService,
    private dataService: DataService,
    private ls: LanguagesService,
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

    console.warn('files info', this.files);
    if (this.files.name.indexOf('.xlsx') > -1) {
      this.dialogService.openSnackBar({ message: 'Ekstensi File wajib XLS!' }); // TODO
      return;
    }

    const fd = new FormData();

    fd.append('file', this.files);
    fd.append('audience', this.dialogData.audience);
    const keyAudience = this.dialogData.audience === 'retailer' ? 'importAudienceRetailer' : 'importAudienceCustomer';
    this.dataService.showLoading(true);
    let dataParams = null;
    if (this.dialogData.audience === 'retailer' && this.dialogData.isLimitVoucher) {
      dataParams = {
        isVoucher: 1,
        limit_by_voucher: this.dialogData.isLimitVoucher ? 1 : 0
      }
    }
    this.b2cVoucherService[keyAudience](fd, dataParams).subscribe(
      res => {
        if (res && res.data.is_valid) {
          if (this.dialogData.audience === 'retailer') {
            this.rows = res.data && res.data.listAudiences ? Object.values(res.data.listAudiences) : [];
          } else {
            this.rows = res.data && res.data.audiences ? res.data.audiences : [];
          }
          this.validData = res.data && res.data.is_valid ? res.data.is_valid : false;
          this.dataService.showLoading(false);
        } else {
          this.dialogService.openSnackBar({ message: 'Data tidak Valid, mohon mengunggah ulang.' }); // TODO
          this.dataService.showLoading(false);
        }
      }, err => {
        this.dataService.showLoading(false);
        this.files = undefined;

        if (err.status === 404 || err.status === 500) {
          this.dialogService.openSnackBar({ message: 'Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda.' }); // TODO
        }
      }
    )
  }

  submit() {
    if (this.rows.length > 0) {
      const res = this.rows.map(item => ({ ...item }));
      this.dialogRef.close(res);
    } else {
      this.dialogService.openSnackBar({ message: this.ls.locale.global.messages }); // TODO
    }
  }

}
