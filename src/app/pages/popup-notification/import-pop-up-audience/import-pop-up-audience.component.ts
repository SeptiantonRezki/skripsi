import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { NotificationService } from 'app/services/notification.service';
import { DataService } from 'app/services/data.service';

@Component({
  templateUrl: './import-pop-up-audience.component.html',
  styleUrls: ['./import-pop-up-audience.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportPopUpAudienceComponent {

  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];
  dialogData: any;

  constructor(
    public dialogRef: MatDialogRef<ImportPopUpAudienceComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private notificationService: NotificationService,
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

    let fd = new FormData();

    fd.append('file', this.files);
    fd.append('audience', this.dialogData.audience);
    this.dataService.showLoading(true);
    this.notificationService.importAudience(fd).subscribe(
      res => {
        if (res && res.is_valid) {
          this.rows = res.data;
          this.validData = (res.data || []).filter(item => item.is_valid).length;
          this.dataService.showLoading(false);
        } else {
          this.dialogService.openSnackBar({ message: "Data tidak Valid, mohon mengunggah ulang." });
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
