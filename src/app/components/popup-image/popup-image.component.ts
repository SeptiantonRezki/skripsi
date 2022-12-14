import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
// import { VoucherCartData, VoucherItem, VoucherPrivateLabelDataService } from '../../voucher-private-label-data.service';

@Component({
  selector: 'app-popup-image',
  templateUrl: './popup-image.component.html',
  styleUrls: ['./popup-image.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PopupImageComponent {

  url: string;
  constructor(
    public dialogRef: MatDialogRef<PopupImageComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    this.url = data.url;
  }
}
