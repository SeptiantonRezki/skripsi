import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { DialogService } from "app/services/dialog.service";

@Component({
  selector: "submission-preview-image",
  templateUrl: "./preview-image.component.html",
  styleUrls: ["./preview-image.component.scss"],
})
export class PreviewImageComponent implements OnInit {
  payload: any;

  constructor(
    private dialogService: DialogService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<PreviewImageComponent>,
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    this.payload = data;
  }

  ngOnInit() {}
}
