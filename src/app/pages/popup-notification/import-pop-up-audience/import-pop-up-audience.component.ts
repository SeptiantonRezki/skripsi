import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { NotificationService } from 'app/services/notification.service';
import { DataService } from 'app/services/data.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

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
  isValid: any;

  typeTargeted: string;

  constructor(
    public dialogRef: MatDialogRef<ImportPopUpAudienceComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private notificationService: NotificationService,
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
      this.dialogService.openSnackBar({ message: this.translate.instant('global.message.text18') });
      return;
    }

    let fd = new FormData();

    fd.append('file', this.files);
    fd.append('audience', this.dialogData.audience);
    this.dataService.showLoading(true);
    this.notificationService[this.typeTargeted](fd).subscribe(
      res => {
        if (res) {
          this.rows = res.data;

          if(res.is_valid == false)
          this.isValid = false;
          this.validData = (res.data || []).filter(item => item.is_valid).length;
          this.dataService.showLoading(false);
        } else {
          this.dialogService.openSnackBar({ message: 
            this.translate.instant('global.message.reupload_invalid', {
              entity: ''
            }) });
          this.dataService.showLoading(false);
        }
      },
      err => {
        this.dataService.showLoading(false);
        this.files = undefined;

        if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({ message: this.translate.instant('global.message.text16') })
      }
    )
  }

  submit() {
    if (this.rows.length > 0) {
      const res = this.dialogData.type === 'push_notification' ? this.rows.filter(item => item.is_valid) : this.rows.map(item => { return { ...item } });
      this.dialogRef.close(res);
    } else {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.message.text17') });
    }
  }

}
