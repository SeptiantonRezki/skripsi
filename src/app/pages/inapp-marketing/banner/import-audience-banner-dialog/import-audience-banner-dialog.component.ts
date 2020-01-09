import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { BannerService } from 'app/services/inapp-marketing/banner.service';
import { DataService } from 'app/services/data.service';

@Component({
  // selector: 'app-import-audience-banner-dialog',
  templateUrl: './import-audience-banner-dialog.component.html',
  styleUrls: ['./import-audience-banner-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportAudienceBannerDialogComponent implements OnInit {
  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];
  dialogData: any;

  typeTargeted: string;

  constructor(
    public dialogRef: MatDialogRef<ImportAudienceBannerDialogComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private bannerService: BannerService,
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
    fd.append('audience', this.dialogData.audience);
    let keyAudience = this.dialogData.audience === 'retailer' ? 'importAudience' : 'importCustomerAudience';
    this.dataService.showLoading(true);
    this.bannerService[keyAudience](fd).subscribe(
      res => {
        if (res && res.data.is_valid) {
          this.rows = res.data && res.data.audiences ? res.data.audiences : [];
          this.validData = res.data && res.data.is_valid ? res.data.is_valid : false;
          // this.validData = (res.data.audiences || []).filter(item => item.is_valid).length;
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
      const res = this.rows.map(item => { return { ...item } });
      this.dialogRef.close(res);
    } else {
      this.dialogService.openSnackBar({ message: "Semua row tidak valid " });
    }
  }

}
