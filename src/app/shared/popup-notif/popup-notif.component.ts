import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { NotificationService } from 'app/services/notification.service';
import { DialogService } from 'app/services/dialog.service';
import { GoogleAnalyticsService } from 'app/services/google-analytics.service';

@Component({
  selector: 'popup-notif',
  templateUrl: './popup-notif.component.html',
  styleUrls: ['./popup-notif.component.scss']
})
export class PopupNotifComponent implements OnInit {

  response: any;
  onLoad: Boolean;

  @ViewChild('openLink') openLink: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PopupNotifComponent>,
    private notifService: NotificationService,
    private dialogService: DialogService,
    private gaService: GoogleAnalyticsService
  ) {
    this.onLoad = true;
  }

  ngOnInit() {
    // this.fetch();
  }

  async fetch() {
    try {
      this.response = await this.notifService.getPopupNotif().toPromise();
      this.onLoad = false;
    } catch (error) {
      this.onLoad = false;
      throw error;
    }
  }

  async close() {
    try {
      const response = await this.notifService.sendPopupNotif({ id: this.data.id }).toPromise();

      /** TRACKING GA */
      // this.gaService.customDimension('dimension1', this.data.negative_text);
      // this.gaService.eventTracking({
      //   'event_category': 'PopUpBanner',
      //   'event_action': 'Click',
      //   'event_label': `${this.data.id}`,
      //   'event_value': 1,
      //   'event_noninteraction': 0
      // })

      if (response.status) {
        this.dialogRef.close();
      }
    } catch (error) {
      throw error;
    }
  }

  async submit() {
    try {
      await this.notifService.sendPopupNotif({ id: this.data.id }).toPromise();
      this.dialogRef.close();

      /** TRACKING GA */
      // this.gaService.customDimension('dimension1', this.data.positive_text);
      // this.gaService.eventTracking({
      //   'event_category': 'PopUpBanner',
      //   'event_action': 'Click',
      //   'event_label': `${this.data.id}`,
      //   'event_value': 1,
      //   'event_noninteraction': 0
      // })

      if (this.data.action === 'iframe') {
        this.openLink.nativeElement.href = this.data.action_data;
        this.openLink.nativeElement.click();
      }
    } catch (error) {
      throw error;
    }
  }
}
