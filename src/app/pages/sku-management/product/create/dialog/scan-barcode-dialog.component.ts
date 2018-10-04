import { Component, OnInit, Inject, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

@Component({
  templateUrl: './scan-barcode-dialog.component.html',
  styleUrls: ['./scan-barcode-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScanBarcodeDialogComponent {

  public barcode: FormControl = new FormControl();
  autofocus: boolean;

  constructor(
    public dialogRef: MatDialogRef<ScanBarcodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private formBuilder: FormBuilder
  ) { 
  }

  ngOnInit() {
    this.barcode.valueChanges.debounceTime(100).subscribe(res => {
      this.dialogRef.close(res);
    })
  }

}
