import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { DataService } from "../../../../services/data.service";
import { FormBuilder } from "@angular/forms";
import { AuthenticationService } from "../../../../services/authentication.service";
import { DialogService } from "../../../../services/dialog.service";
import { LanguagesService } from "app/services/languages/languages.service";
import { NotificationConfigurationService } from "app/services/settings/notification-configuration.service";
import { Page } from "app/classes/laravel-pagination";
import { PagesName } from "app/classes/pages-name";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { EditStepDialogComponent } from "../edit-step-dialog/edit-step-dialog.component";

@Component({
  selector: 'app-notification-configuration',
  templateUrl: './notification-configuration.component.html',
  styleUrls: ['./notification-configuration.component.scss']
})
export class NotificationConfigurationComponent implements OnInit {
  pathSound: any;
  fileName: any;
  roles: PagesName = new PagesName();
  loadingUpload: boolean = false;

  loadingIndicator = true;
  pagination: Page = new Page();
  rows: any[];
  permission: any;
  dialogRef: any;

  @ViewChild('fileSound') fileSound: ElementRef;
  @ViewChild('audioOption') audioPlayerRef: ElementRef;

  constructor(
    private dialogService: DialogService,
    private notificationConfigurationService: NotificationConfigurationService,
    private ls: LanguagesService,
    private dialog: MatDialog,
  ) {
    this.permission = this.roles.getRoles('principal.notification-configuration');
  }

  onAudioPlay(){
    this.audioPlayerRef.nativeElement.play();
  }
  clickNotifSound(){
    this.onAudioPlay();
  }

  ngOnInit() {
    this.getSound();
    this.notificationConfigurationService.getStep().subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
        this.loadingIndicator = false;
      }
    );
  }

  getSound() {
    this.notificationConfigurationService.getSound().subscribe(
      res => {
        if (res.status === 'success') {
          this.pathSound = res.data;
          const arr = res.data.split("/");
          this.fileName = arr[arr.length - 1];
          let audio = this.audioPlayerRef.nativeElement;
          audio.load();
        }
      }
    );
  }

  openInput() {
    this.fileSound.nativeElement.click();
  }

  fileChange(files) {
    this.loadingUpload = true;
    let fd = new FormData();
    for (const file of files) {
      fd.append('file', file);
    }
    this.notificationConfigurationService.updateSound(fd).subscribe(
      res => {
        this.getSound();
        this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text2 });
        this.loadingUpload = false;
      },
      err => {
        this.loadingUpload = false;
      }
    )
  }

  edit(row, index) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { row, index };

    this.dialogRef = this.dialog.open(EditStepDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(res => {
      if (res) {
        let arr = this.rows;
        arr[res.index]['process_values'] = res.hours;
        this.rows = arr;
        this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text2 });
      }
    });
  }
}
