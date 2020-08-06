import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";

@Component({
  selector: 'app-dialog-yes-no',
  templateUrl: './dialog-yes-no.component.html',
  styleUrls: ['./dialog-yes-no.component.scss']
})
export class DialogYesNoComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogYesNoComponent>,
  ) { }

  decisionType(x: string) {
    this.dialogRef.close(x);
  }

}
