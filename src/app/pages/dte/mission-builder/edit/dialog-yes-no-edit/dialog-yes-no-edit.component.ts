import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, DateAdapter } from "@angular/material";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";

@Component({
  selector: 'app-dialog-yes-no-edit',
  templateUrl: './dialog-yes-no-edit.component.html',
  styleUrls: ['./dialog-yes-no-edit.component.scss']
})
export class DialogYesNoEditComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogYesNoEditComponent>,
  ) { }

  decisionType(x: string) {
    this.dialogRef.close(x);
  }

}
