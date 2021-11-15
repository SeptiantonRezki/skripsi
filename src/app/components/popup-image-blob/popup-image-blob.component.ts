import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
// import { VoucherCartData, VoucherItem, VoucherPrivateLabelDataService } from '../../voucher-private-label-data.service';

@Component({
  selector: 'app-popup-image-blob',
  templateUrl: './popup-image-blob.component.html',
  styleUrls: ['./popup-image-blob.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PopUpImageBlobComponent {

  url: string;
  constructor(
    public dialogRef: MatDialogRef<PopUpImageBlobComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.url = reader.result;
    }, false);

    if (data.blob) {
      reader.readAsDataURL(data.blob);
    }
  }
}
