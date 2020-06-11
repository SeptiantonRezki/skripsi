import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogConfig, MatMenuTrigger } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Subject, } from 'rxjs';

@Component({
  templateUrl: './confirm-dialog-indialog.component.html',
  styleUrls: ['./confirm-dialog-indialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmDialogIndialogComponent implements OnInit {
  loadingIndicator = true;
  onLoad: boolean;

  private _onDestroy = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogIndialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
  ) {
  }

  ngOnInit() {
    // this.onLoad = true;
  }

  // =========== ACTION ============

  verifikasiMisi() {
    // this.dataService.showLoading(true);
    // console.log('data', this.data);
    // this.taskVerificationService.verification({
    //   trade_scheduler_template_id: this.data.trade_scheduler_template_id,
    //   trade_creator_id: this.data.trade_creator_id,
    //   trade_creator_group_id: this.data.trade_creator_group_id,
    //   retailer_id: this.data.retailer_id,
    // }).subscribe(res => {
    //   this.dataService.showLoading(false);
    //   this.dialogRef.close();
    // }, err => {
    //   this.dataService.showLoading(false);
    // });
  }

 
}
