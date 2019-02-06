import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from 'app/services/dte/audience.service';

@Component({
  templateUrl: './import-audience-dialog.component.html',
  styleUrls: ['./import-audience-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportAudienceDialogComponent {

  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];

  constructor(
    public dialogRef: MatDialogRef<ImportAudienceDialogComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private audienceService: AudienceService
  ) { 
    this.uploading = false;
  }

  ngOnInit() {
  }

  preview(event) {
    this.files = undefined;
    this.files = event;

    let fd = new FormData();

    fd.append('file', this.files);
    this.uploading = true;
    this.audienceService.importExcel(fd).subscribe(
      res => {
        this.rows = res;
        this.uploading = false;
      },
      err => {
        this.uploading = false;
        this.files = undefined;
        
        if (err.status === 404 || err.status === 500)
        this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda."})
      }
    )
  }

  submit() {
    if (this.files) {
      const res = this.rows.map(item => { return { id: item.id } });
      this.dialogRef.close(res);
    } else {
      this.dialogService.openSnackBar({ message: 'Ukuran file melebihi 2mb'})
    }
  }

}