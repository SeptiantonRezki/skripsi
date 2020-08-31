import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { FormGroup, FormBuilder } from "@angular/forms";

@Component({
  selector: 'app-diaglog-waktu-tunggu',
  templateUrl: './diaglog-waktu-tunggu.component.html',
  styleUrls: ['./diaglog-waktu-tunggu.component.scss']
})
export class DiaglogWaktuTungguComponent implements OnInit {
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DiaglogWaktuTungguComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      time: "",
      type: "",
    });

    if (this.data !== null) {
      this.form.patchValue({
        time: this.data.data.attribute.time,
        type: this.data.data.attribute.type,
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
      name: 'Waktu Tunggu',
      type: 'time',
      attribute: form.value,
      next_step_component: this.data.data.next_step_component,
      next_step_component_yes: this.data.data.next_step_component_yes,
      next_step_component_no: this.data.data.next_step_component_no,
      decision_type: this.data.data.decision_type,
    }
    this.dialogRef.close(returnObject);
  }

}
