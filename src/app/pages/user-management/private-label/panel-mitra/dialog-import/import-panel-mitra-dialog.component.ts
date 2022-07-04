import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { FormControl } from '@angular/forms';
import { PanelMitraService } from 'app/services/user-management/private-label/panel-mitra.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  templateUrl: './import-panel-mitra-dialog.component.html',
  styleUrls: ['./import-panel-mitra-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportPanelMitraDialogComponent {

  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];
  dialogData: any;

  typeTargeted: string;
  textReason: FormControl = new FormControl('');
  onImport: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ImportPanelMitraDialogComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private panelMitraService: PanelMitraService,
    private dataService: DataService,
    private ls: LanguagesService,
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    this.rows = [];
    this.dataService.showLoading(false);
    this.dialogData = data;
  }

  import(event) {
    try {
      this.dataService.showLoading(true);
      this.files = undefined;
      this.files = event;

      // console.log('files info', this.files);
      if (this.files.name.indexOf(".xlsx") > -1) {
        this.dialogService.openSnackBar({ message: "Ekstensi File wajib XLS!" });
        return;
      }

      let fd = new FormData();

      setTimeout(() => {
        console.log('files info', this.files);
        fd.append('file', this.files);
        fd.append('supplier_company_id', this.dialogData.supplier_company_id)
        fd.append('product_id', this.dialogData.product_id)

        console.log('fd', fd.get('file'));
        this.panelMitraService.importMitra(fd).subscribe(res => {
          console.log('res.data', res);
          if (res.data) {
            setTimeout(() => {
              this.preview();
            }, 1000);
            this.onImport = true;
            this.rows = [];
          }
        },
          err => {
            this.dataService.showLoading(false);
            this.files = undefined;
            if (err.status === 404 || err.status === 500)
              this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda." })
          }
        )
      }, 500);
    } catch (ex) {
      console.log('ex', ex);
      this.dataService.showLoading(false);
    }
  }

  preview() {
    this.panelMitraService.previewImportMitra({
      'supplier_company_id': this.dialogData.supplier_company_id,
      'product_id': this.dialogData.product_id,
    }).subscribe(res => {
      // this.dialogRef.close(res);
      console.log('res', res);
      this.rows = res.data;
      this.onImport = false;
      this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text8 });
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
      console.log('err', err);
    })
  }

  submit() {
    this.dialogRef.close({ data: this.rows });
  }
}
