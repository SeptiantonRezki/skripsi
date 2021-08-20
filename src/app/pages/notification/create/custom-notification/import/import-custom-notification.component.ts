import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { NotificationService } from 'app/services/notification.service';

@Component({
  selector: 'app-import-custom-notification',
  templateUrl: './import-custom-notification.component.html',
  styleUrls: ['./import-custom-notification.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportCustomNotificationComponent implements OnInit {
  files: File;
  validComboDrag: boolean;
  is_valid: boolean;

  uploading: Boolean;
  rows: any[];
  dialogData: any;

  constructor(
    public dialogRef: MatDialogRef<ImportCustomNotificationComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private dataService: DataService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.rows = [];
    this.dataService.showLoading(false);
    this.dialogData = data;
  }

  ngOnInit() {}

  preview(event) {
    this.files = undefined;
    this.files = event;

    let fd = new FormData();
    fd.append('file', this.files);
    fd.append('type', this.dialogData.type);
    this.dataService.showLoading(true);
    
    this.notificationService.previewImport(fd).subscribe(
      res => {
        this.dataService.showLoading(false);
        console.log('preview => ', res);
        if (res && res.data) {
          this.rows = res.data;
          this.is_valid = res.is_valid;

          if (!res.is_valid) {
            this.dialogService.openSnackBar({ message: "File yang diupload tidak sesuai. Mohon periksa kembali file Anda." });
          }
        } else {
          this.files = undefined;
          this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda." })
        }
      },
      err => {
        console.log('err', err);
        
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
      data: this.rows,
      total: this.rows.length
    }
    this.dialogRef.close(data);
    this.dataService.showLoading(false);
    this.dialogService.openSnackBar({ message: "File berhasil Diimport" });
  }

}
