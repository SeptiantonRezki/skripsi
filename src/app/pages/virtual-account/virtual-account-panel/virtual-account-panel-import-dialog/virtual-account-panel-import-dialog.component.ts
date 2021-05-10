import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { VirtualAccountPanelService } from 'app/services/virtual-account/virtual-account-panel.service';


@Component({
  selector: 'app-virtual-account-panel-import-dialog',
  templateUrl: './virtual-account-panel-import-dialog.component.html',
  styleUrls: ['./virtual-account-panel-import-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VirtualAccountPanelImportDialogComponent implements OnInit {
  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];
  dialogData: any;

  typeTargeted: string;
  payload: any;

  constructor(
    public dialogRef: MatDialogRef<VirtualAccountPanelImportDialogComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private mitraPanelService: VirtualAccountPanelService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    this.payload = data;
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

    let fd = new FormData();

    fd.append('file', this.files);
    fd.append('type', this.payload.type);
    fd.append('virtual_account_company_id', this.payload.virtual_account_company_id);

    this.dataService.showLoading(true);
    this.mitraPanelService.importFile(fd).subscribe(
      res => {
        let fdd = new FormData();
        fdd.append('type', this.payload.type);
        fdd.append('virtual_account_company_id', this.payload.virtual_account_company_id);
        this.mitraPanelService.previewImport(fdd).subscribe(preview => {
          console.log('preview res', preview);
          this.rows = preview.data;
          this.dataService.showLoading(false);
        }, err => {
          this.dataService.showLoading(false);
        })
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
      // let body = {
      // }
      // this.coinService.adjustCoin(body)
      //   .subscribe(res => {
      //     this.dialogService.openSnackBar({ message: "File berhasil Diimport " });
      //     this.dialogRef.close(res);
      //   }, err => {
      //     console.log('err', err);
      //   })
      this.dialogRef.close(this.rows);
    } else {
      this.dialogService.openSnackBar({ message: "Semua row tidak valid " });
    }
  }



}
