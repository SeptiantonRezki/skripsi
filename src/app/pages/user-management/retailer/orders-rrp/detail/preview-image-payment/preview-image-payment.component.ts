import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { DialogService } from "app/services/dialog.service";

@Component({
  selector: 'app-preview-image-payment',
  templateUrl: './preview-image-payment.component.html',
  styleUrls: ['./preview-image-payment.component.scss']
})
export class PreviewImagePaymentComponent implements OnInit {
  payload: any;

  constructor(
    private dialogService: DialogService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<PreviewImagePaymentComponent>,
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    this.payload = data;
  }

  ngOnInit() {}
}
