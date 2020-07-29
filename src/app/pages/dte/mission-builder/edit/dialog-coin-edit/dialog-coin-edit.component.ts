import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, DateAdapter } from "@angular/material";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { AudienceService } from "../../../../../services/dte/audience.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Router } from "@angular/router";
import { Subject, Observable, ReplaySubject } from "rxjs";
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { TemplateTaskService } from '../../../../../services/dte/template-task.service';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog-coin-edit',
  templateUrl: './dialog-coin-edit.component.html',
  styleUrls: ['./dialog-coin-edit.component.scss']
})
export class DialogCoinEditComponent implements OnInit {

  form: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogCoinEditComponent>,
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      total_coin: "",
    });

    if (this.data !== null) {
      this.form.patchValue({
        total_coin: this.data.data.attribute.total_coin,
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
      name: 'Coin',
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
