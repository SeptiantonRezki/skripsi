import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { PayLaterDeactivateService } from 'app/services/pay-later/pay-later-deactivate.service';
import { DataService } from 'app/services/data.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-deactivate-reason-dialog',
  templateUrl: './deactivate-reason-dialog.component.html',
  styleUrls: ['./deactivate-reason-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DeactivateReasonDialogComponent implements OnInit {

  reasonForm: FormGroup;
  payload: any;

  constructor(
    public dialogRef: MatDialogRef<DeactivateReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private deactivatePayLaterService: PayLaterDeactivateService,
    private dataService: DataService,
    private ls: LanguagesService
  ) {
    this.payload = data;
    this.reasonForm = this.formBuilder.group({
      reason: ["", [Validators.required, Validators.minLength(20)]]
    })
  }

  ngOnInit() {
    this.reasonForm.get('reason').valueChanges.subscribe(res => {
      commonFormValidator.validateAllFields(this.reasonForm);
    })
  }

  ngOnDestroy() {
  }

  submit(): void {
    if (this.reasonForm.status === 'VALID') {
      this.dataService.showLoading(true);
      let body = {
        status: this.payload.status === 'declined' ? 'ditolak' : 'disetujui',
        reason: this.reasonForm.get('reason').value
      }

      this.deactivatePayLaterService.approval(body, { deactivation_id: this.payload.row.id }).subscribe(res => {
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22
        });
        this.dataService.showLoading(false);
        this.dialogRef.close(res);
      }, err => {
        this.dataService.showLoading(false)
      })
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu, Alasan Minimal 20 Karakter." });
    }
  }

}
