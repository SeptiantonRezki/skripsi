import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'dialog-other-help',
  templateUrl: './dialog-other-help.html',
  styleUrls: ['./dialog-other-help.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogOtherHelp {

  constructor(
    public dialogRef: MatDialogRef<DialogOtherHelp>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
