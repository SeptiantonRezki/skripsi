import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { VirtualAccountPanelService } from 'app/services/virtual-account/virtual-account-panel.service';
import { Router } from '@angular/router';
import { LanguagesService } from 'app/services/languages/languages.service';

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
    private router: Router,
    @Inject(MAT_DIALOG_DATA) data,
    private ls: LanguagesService
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

  // submit() {
  //   if (this.rows.length > 0) {
  //     const res = this.rows.map(item => { return { ...item } });
  //     console.log('ini submit', res)
    
  //     // let body = {
  //     // }
  //     // this.coinService.adjustCoin(body)
  //     //   .subscribe(res => {
  //     //     this.dialogService.openSnackBar({ message: "File berhasil Diimport " });
  //     //     this.dialogRef.close(res);
  //     //   }, err => {
  //     //     console.log('err', err);
  //     //   })
  //     this.dialogRef.close(this.rows);
  //   } else {
  //     this.dialogService.openSnackBar({ message: "Semua row tidak valid " });
  //   }
  // }

  submit() {
      const res = this.rows.map(item => { return { ...item } });
      console.log(res)
      this.dataService.showLoading(true);
      let body = {
        virtual_account_company_id: this.payload.virtual_account_company_id,
        type: this.dialogData.type,
        detail: res.map(mtr => {
          let mtrObj = {
            business_id: mtr.id,
            virtual_account_bin_id: undefined,
            subcode: undefined,
            rekening_name: undefined,
            rekening_number: undefined
          };
          if (this.dialogData.type === 'wholesaler') {
            mtrObj.virtual_account_bin_id = mtr.virtual_account_bin_id,
            mtrObj.subcode = mtr.subcode,
            mtrObj.rekening_name = mtr.rekening_name,
			      mtrObj.rekening_number = mtr.rekening_number
          }
          return mtrObj;
        })
      };
      console.log('initial', body.detail)

      console.log('my body', body);
      this.mitraPanelService.store(body).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22
        });
        this.dialogRef.close();
        // this.dataService.setToStorage("detail_virtual_account_panel", res.data);
        // this.router.navigate(['virtual-account', 'panel', 'edit']);
        this.router.navigate(['virtual-account', 'panel']);
      }, err => {
        console.log('err create panel mitra', err);
        this.dataService.showLoading(false);
      })
  }



}
