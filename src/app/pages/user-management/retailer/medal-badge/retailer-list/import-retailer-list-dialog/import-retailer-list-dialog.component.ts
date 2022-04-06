import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { MedalBadgeService } from 'app/services/user-management/retailer/medal-badge.service';
import { LanguagesService } from 'app/services/languages/languages.service';
@Component({
  selector: 'app-import-retailer-list-dialog',
  templateUrl: './import-retailer-list-dialog.component.html',
  styleUrls: ['./import-retailer-list-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportRetailerListDialogComponent implements OnInit {
  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];
  dialogData: any;

  typeTargeted: string;

  constructor(
    public dialogRef: MatDialogRef<ImportRetailerListDialogComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private medalBadgeService: MedalBadgeService,
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

    console.log('files info', this.files);
    if (this.files.name.indexOf(".xls") === -1) {
      this.dialogService.openSnackBar({ message: "Ekstensi File wajib XLS!" });
      return;
    }

    const fd = new FormData();

    fd.append('file', this.files);
    this.dataService.showLoading(true);
    this.medalBadgeService.previewImportRetailer(fd).subscribe(preview => {
      console.log('preview res', preview);
      this.rows = preview.data;
      this.dataService.showLoading(false);
    }, (err: any) => {
      this.dataService.showLoading(false);
      this.files = undefined;

      if (err.status === 404 || err.status === 500) {
        this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda." });
      }
    });
  }

  submit() {
    if (this.rows.length > 0) {
      this.medalBadgeService.importRetailer().subscribe(() => {
        this.dataService.showLoading(false);
        this.dialogRef.close(this.rows);
      }, (err: any) => {
        this.dataService.showLoading(false);
      });
    } else {
      this.dialogService.openSnackBar({ message: "Semua row tidak valid " });
    }
  }

}
