import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { StorePhotoVerificationService } from 'app/services/store-photo-verification.service';
import * as _ from 'underscore'

export interface RejectReason {
  id: number;
  reason: string;
}

@Component({
  selector: 'app-dialog-reject-reason',
  templateUrl: './dialog-reject-reason.component.html',
  styleUrls: ['./dialog-reject-reason.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogRejectReasonComponent {
  reasons: Array<any> = [];

  formReasons: FormGroup = this.formBuilder.group({ reasonList: this.formBuilder.array([]) })

  actionType: any;
  selectedReason: any;
  editable: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogRejectReasonComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data,
    private formBuilder: FormBuilder,
    private storePhotoVerificationService: StorePhotoVerificationService
  ) {
    this.editable = data.editable;
    this.storePhotoVerificationService.rejectReasonData.subscribe(data => {
      this.reasons = data;
    })
    this.actionType = data.actionType; // confirmation / undefined; 'confirmation' is for confirm rejection of photo verification
    // this.reasons = data.reasons || [];
  }

  delete(reason: RejectReason) {

    const tempReasons = [...this.reasons];
    this.reasons = [...this.reasons].filter(item => item.id !== reason.id);
    // delete be
    this.storePhotoVerificationService.deleteRejectReason({ id: reason.id }).subscribe(res => {
      console.log({ res });
    }, err => {
      this.reasons = tempReasons;
      console.log({ err });
    })
  }

  addNewReasonItem() {
    let reasonItem = this.formBuilder.group({
      id: _.uniqueId('tmp_'),
      reason: ['', Validators.required]
    })
    // let a = this.formReasons as FormArray;
    let list = this.formReasons.get('reasonList') as FormArray;
    list.push(reasonItem);
    // this.formReasons.push(reasonItem);
    // console.log({RS: this.formReasons})
  }

  onSaveNewReason(item: FormGroup, index) {
    const list = this.formReasons.get('reasonList') as FormArray;
    // const item = list.at(index) as FormGroup;
    if (item.valid) {

      list.removeAt(index);
      const payload = {
        id: item.get('id').value,
        reason: item.get('reason').value
      }

      this.reasons.push(payload)

      this.storePhotoVerificationService.postRejectReason({ reason: payload.reason }).subscribe(res => {

        console.log('ADD REASON SUCCESS', res);
        this.storePhotoVerificationService.fetchRejectReasons();

      }, err => {

        this.onCancelNewReason(item, index);

      })
    }
    console.log({ item, index })
  }

  onCancelNewReason(item: FormGroup, index) {
    const list = this.formReasons.get('reasonList') as FormArray;
    list.removeAt(index)
  }

  onRejectConfirmed() {
    this.dialogRef.close({
      reason: this.selectedReason,
      confirmed: true
    })
  }
  onCancel() {
    this.dialogRef.close({ reason: false, confirmed: false });
  }

}
