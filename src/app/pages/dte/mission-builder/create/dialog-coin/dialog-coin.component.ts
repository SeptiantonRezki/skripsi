import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, DateAdapter } from "@angular/material";
import { FormGroup, FormBuilder } from "@angular/forms";
import { MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from "@ngx-translate/core";


@Component({
  selector: 'app-dialog-coin',
  templateUrl: './dialog-coin.component.html',
  styleUrls: ['./dialog-coin.component.scss']
})
export class DialogCoinComponent implements OnInit {

  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogCoinComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      total_coin: "",
    });

    if (this.data !== null) {
      this.form.patchValue({
        total_coin: this.data.data.attribute.total_coin ? this.data.data.attribute.total_coin : 0,
      });
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  submit(form: any) {
    const returnObject = {
      id: this.data.id,
      component_id: this.data.data.component_id,
      task_sequencing_management_id: this.data.data.task_sequencing_management_id,
      task_template_id: this.data.data.task_template_id,
      name: this.translate.instant('dte.task_sequencing.coin'),
      type: 'coin',
      attribute: form.value,
      next_step_component: this.data.data.next_step_component,
      next_step_component_yes: this.data.data.next_step_component_yes,
      next_step_component_no: this.data.data.next_step_component_no,
      decision_type: this.data.data.decision_type,
    }
    console.log(returnObject);
    this.dialogRef.close(returnObject);
  }

}
