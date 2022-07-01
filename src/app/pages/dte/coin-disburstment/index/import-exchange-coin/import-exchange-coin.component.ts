import { Component, Inject, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { CoinDisburstmentService } from 'app/services/dte/coin-disburstment.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-import-exchange-coin',
  templateUrl: './import-exchange-coin.component.html',
  styleUrls: ['./import-exchange-coin.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class ImportExchangeCoinComponent implements OnInit {
  files: File;
  validComboDrag: boolean;
  is_valid: boolean;

  uploading: Boolean;
  rows: any[];
  dialogData: any;

  constructor(
    public dialogRef: MatDialogRef<ImportExchangeCoinComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private dataService: DataService,
    private coinDisburstmentService: CoinDisburstmentService,
    private ls: LanguagesService,
    @Inject(MAT_DIALOG_DATA) data,
    private translate: TranslateService,
  ) {
    this.rows = [];
    this.dataService.showLoading(false);
    this.dialogData = data;
  }

  ngOnInit() {}

  preview(event) {
    if (this.dialogData.type === "data_log") {
      this.previewDataLog(event);
      return;
    }

    this.files = undefined;
    this.files = event;

    let fd = new FormData();
    fd.append('file', this.files);
    this.dataService.showLoading(true);
    this.coinDisburstmentService.previewImport(fd).subscribe(
      res => {
        this.dataService.showLoading(false);
        if (res && res.data) {
          // Mengecek nama_program yang diimport sama dengan nama_program yang sedang dilihat
          const check = res.data.every(val => val.nama_program_penukaran_coin === this.dialogData.name);
          if (check) {
            this.rows = res.data;
            this.is_valid = res.is_valid;            
          }
          else{
            this.files = undefined;
            this.dialogService.openSnackBar({ message: this.translate.instant('dte.coin_disbursement.failed_upload_inconsistent_name') })
          }
        } else {
          this.dataService.showLoading(false);
          this.files = undefined;
          this.dialogService.openSnackBar({ message: this.translate.instant('dte.coin_disbursement.failed_upload_invalid_file') })
        }

      },
      err => {
        this.dataService.showLoading(false);
        this.files = undefined;

        if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({ message: this.translate.instant('dte.coin_disbursement.failed_upload_invalid_file') })
      }
    )
  }

  submit() {
    const endpoint = this.dialogData.type === "data_log" ? "dataLogImport" : "importExchange";
    
    this.dataService.showLoading(true);
    const data = {
      data: this.rows
    }
    this.coinDisburstmentService[endpoint](data).subscribe(res => {
      this.dialogRef.close(true)
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text8') });
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  previewDataLog(event) {
    this.files = undefined;
    this.files = event;

    let fd = new FormData();
    fd.append('file', this.files);
    fd.append('cd_approval_id', this.dialogData.data_log_id);
    this.dataService.showLoading(true);
    this.coinDisburstmentService.dataLogPreview(fd).subscribe(
      res => {
        this.dataService.showLoading(false);
        
        if (res && res.data) {
          this.rows = res.data;
          this.is_valid = res.is_valid;
        } else {
          this.dataService.showLoading(false);
          this.files = undefined;
          this.dialogService.openSnackBar({ message: this.translate.instant('dte.coin_disbursement.failed_upload_invalid_file') })
        }
      },
      err => {
        this.dataService.showLoading(false);
        this.files = undefined;
        console.log('err', err);

        if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({ message: this.translate.instant('dte.coin_disbursement.failed_upload_invalid_file') })
      }
    )
  }
}
