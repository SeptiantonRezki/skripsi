import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './import-audience.component.html',
  styleUrls: ['./import-audience.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportAudienceComponent {

  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  invalidData: any;
  dialogData: any;
  counter: any = false;

  typeTargeted: string;

  constructor(
    public dialogRef: MatDialogRef<ImportAudienceComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private dataService: DataService,
    private ls: LanguagesService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    this.rows = [];
    this.dataService.showLoading(false);
    this.dialogData = data;
  }

  ngOnInit() {
  }

  async preview(event) {
    this.files = undefined;
    this.files = event;

    console.log('files info', this.files);
    if (this.files.name.indexOf(".xlsx") > -1) {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.file_extension', { type: 'XLS' }) });
      return;
    }

    let fd = new FormData();

    fd.append('file', this.files);
    fd.append('audience', this.dialogData.audience);
    fd.append('type', this.dialogData.type);
    this.dataService.showLoading(true);
    if(this.dialogData.api) {
      this.dialogData.api(fd).subscribe(
        res => {
          if (res) {
            const data = res.data.audiences || res.data;
            this.rows = data;
            this.invalidData = (data || []).filter(item => !item.flag && !item.is_valid).length;
            this.dataService.showLoading(false);
            this.counter = {
              total: data.length,
              invalid: this.invalidData,
              valid: data.length - this.invalidData
            };
            if(this.invalidData > 0) {
              const filterData = () => {
                this.rows = this.rows.filter(item => item.flag || item.is_valid);
                this.invalidData = 0;
                this.counter = {
                  total: this.rows.length,
                  invalid: 0,
                  valid: this.rows.length
                };
                this.dialogService.brodcastCloseConfirmation();
              };
              const data = {
                titleDialog: this.translate.instant('global.messages.delete_confirm', { entity: this.translate.instant('global.label.invalid_data'), index: '' }),
                confirmCallback: () => filterData(),
                rejectCallback: () => {
                  this.dialogService.openSnackBar({
                    message: this.translate.instant("global.messages.please_reupload", { entity: this.translate.instant('global.label.data') })
                  });
                  this.dialogService.brodcastCloseConfirmation();
                },
                buttonText: [this.translate.instant('global.label.yes'), this.translate.instant('global.label.no')]
              };
              this.dialogService.openCustomConfirmationDialog(data);
            };
          } else {
            this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.reupload_invalid') });
            this.dataService.showLoading(false);
          }
        },
        err => {
          this.dataService.showLoading(false);
          this.files = undefined;
  
          if (err.status === 404 || err.status === 500)
            this.dialogService.openSnackBar({
              message: this.translate.instant('global.messages.text16')
            })
        }
      )
    };
  }

  submit() {
    if (this.rows.length > 0) {
      const res = this.rows.map(item => item);
      this.dialogRef.close(res);
    } else {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text17') });
    }
  }

}
