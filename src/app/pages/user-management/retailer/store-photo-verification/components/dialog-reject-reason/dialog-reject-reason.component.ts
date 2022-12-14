import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as _ from 'underscore'

export interface RejectReason {
  id: number;
  name: string;
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

  constructor(
    public dialogRef: MatDialogRef<DialogRejectReasonComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data,
    private formBuilder: FormBuilder
  ) {
    this.reasons = data.reasons || [];
  }

  delete(reason: RejectReason) {
    this.reasons = [...this.reasons].filter(item => item.id !== reason.id);
    // delete be
  }

  addNewReasonItem() {
    let reasonItem = this.formBuilder.group({
      id: _.uniqueId('tmp_'),
      name: ['', Validators.required]
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
    if(item.valid) {
      
      list.removeAt(index);
      
      this.reasons.push({
        id: item.get('id').value,
        name: item.get('name').value
      })
    }
    console.log({item, index})
  }

  onCancelNewReason(item: FormGroup, index) {
    const list = this.formReasons.get('reasonList') as FormArray;
    list.removeAt(index)
  }

}
