import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-confirmation-publish-dialog',
  templateUrl: './confirmation-publish-dialog.component.html',
  styleUrls: ['./confirmation-publish-dialog.component.scss']
})
export class ConfirmationPublishDialogComponent implements OnInit {
  formRadio: FormControl = new FormControl();
  private _onDestroy = new Subject<void>();
  valueRadio: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmationPublishDialogComponent>
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
}
