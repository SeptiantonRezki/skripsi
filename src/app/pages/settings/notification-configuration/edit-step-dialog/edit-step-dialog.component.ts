import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { LanguagesService } from 'app/services/languages/languages.service';
import { NotificationConfigurationService } from "app/services/settings/notification-configuration.service";

@Component({
  selector: 'app-edit-step-dialog',
  templateUrl: './edit-step-dialog.component.html',
  styleUrls: ['./edit-step-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditStepDialogComponent implements OnInit {
  redirecting: Boolean;
  formStep: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditStepDialogComponent>,
    public dialog: MatDialog,
    public notificationConfigurationService: NotificationConfigurationService,
    public formBuilder: FormBuilder,
    public ls: LanguagesService
  ) {
    console.log('datanya', data, data.row.process_name);
    this.formStep = formBuilder.group({
      hours: [data.row.process_values, Validators.required],
    });
  }

  ngOnInit() {
  }

  submit() {
    if (this.formStep.valid) {
      const payload = this.formStep.getRawValue();
      this.notificationConfigurationService.updateHours(payload, this.data.row.id).subscribe(
        res => {
          const dataUpload = {
            index: this.data.index,
            hours: this.formStep.get('hours').value
          }
          this.dialogRef.close(dataUpload);
        },
        err => {
          const dataUpload = {
            index: this.data.index,
            hours: this.data.row.process_values
          }
          this.dialogRef.close(dataUpload);
        }
      )
    } else {
      commonFormValidator.validateAllFields(this.formStep);
    }
  }
}
