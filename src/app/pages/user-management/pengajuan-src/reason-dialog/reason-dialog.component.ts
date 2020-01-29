import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { FormControl } from '@angular/forms';
import { PengajuanSrcService } from 'app/services/user-management/pengajuan-src.service';

@Component({
  selector: 'app-reason-dialog',
  templateUrl: './reason-dialog.component.html',
  styleUrls: ['./reason-dialog.component.scss']
})
export class ReasonDialogComponent implements OnInit {
  reason: FormControl = new FormControl('');

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    private pengajuanSrcService: PengajuanSrcService
  ) { }

  ngOnInit() { }

  closeDialog() {
    this.dialogRef.close();
  }

  submit() {
    let body = {
      status: this.data.status
    };
    if (this.data.status !== 'processed') {
      body['reason'] = this.reason.value;
    }
    this.pengajuanSrcService.updateStatus(body, { pengajuan_id: this.data.pengajuan_id })
  }

  renderStatus(agreement) {
    switch (agreement) {
      case 'processed':
        return 'DIPROSES';
      case 'approved':
        return 'DISETUJUI';
      case 'rejected':
        return 'DITOLAK';
      default:
        return 'DIUBAH'
    }
  }

}
