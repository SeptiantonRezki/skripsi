import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: "confirmation-dialog",
  templateUrl: "./confirmation-dialog.component.html",
  styleUrls: ["./confirmation-dialog.component.scss"]
})
export class ConfirmationDialogComponent implements OnInit {
  formRadio: FormControl = new FormControl();
  formRemark: FormControl = new FormControl();
  private _onDestroy = new Subject<void>();
  valueRadio: any;
  payload: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) {
    this.valueRadio = null;
  }

  ngOnInit() {
    this.formRadio.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((value) => {
        this.valueRadio = value;
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  submit(){
    if (this.data.isRemark) {
      this.data.confirmCallback(this.formRemark.value);
    } else {
      this.data.confirmCallback();
    }
  }
}
