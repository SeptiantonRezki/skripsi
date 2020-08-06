import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { Subject, ReplaySubject } from "rxjs";
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { TemplateTaskService } from '../../../../../services/dte/template-task.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Page } from 'app/classes/laravel-pagination';

@Component({
  selector: 'app-dialog-misi-edit',
  templateUrl: './dialog-misi-edit.component.html',
  styleUrls: ['./dialog-misi-edit.component.scss']
})
export class DialogMisiEditComponent implements OnInit {

  form: FormGroup;
  pushFF: FormControl = new FormControl(false);
  verifikasi: FormControl = new FormControl(false);
  verifikasiFF: FormControl = new FormControl(false);
  missions: any[];
  minDate: any;
  maxDate: any;
  private _onDestroy = new Subject<void>();
  public filterMission: FormControl = new FormControl();
  public filteredMission: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  pagination: Page = new Page();

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogMisiEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private templateTaskService: TemplateTaskService,
  ) { }

  ngOnInit() {
    this.getMission();
    this.form = this.formBuilder.group({
      task_template_id: "",
      start_date: [moment(), Validators.required],
      end_date: "",
      pushFF: this.pushFF,
      verifikasi: this.verifikasi,
      verifikasiFF: this.verifikasiFF,
      verification_type: null,
      is_push_to_ff: 0,
      coin_submission: "",
      coin_verification: "",
      is_ir_template: null,
    });

    this.filterMission.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringMission();
      });

    if (this.data !== null) {
      this.form.patchValue({
        task_template_id: this.data.data.attribute.task_template_id,
        start_date: this.data.data.attribute.start_date === null ? "" : this.data.data.attribute.start_date,
        end_date: this.data.data.attribute.end_date === null ? "" : this.data.data.attribute.end_date,
        verification_type: this.data.data.attribute.verification_type,
        coin_submission: this.data.data.attribute.coin_submission === 0 ? null : this.data.data.attribute.coin_submission,
        coin_verification: this.data.data.attribute.coin_verification === 0 ? null : this.data.data.attribute.coin_verification,
        is_push_to_ff: parseInt(this.data.data.attribute.is_push_to_ff),
        is_ir_template: parseInt(this.data.data.attribute.is_ir_template)
      });
      this.minDate = this.data.data.min_date;
      this.maxDate = this.data.data.max_date;

      if (this.data.data.attribute.verification_type === null) {
        // this.form.get('push').patchValue(false);
        this.form.get('verifikasi').patchValue(false);
        this.form.get('verifikasiFF').patchValue(false);
      } else if (this.data.data.attribute.verification_type === 'principal') {
        // this.form.get('push').patchValue(false);
        this.form.get('verifikasi').patchValue(true);
        this.form.get('verifikasiFF').patchValue(false);
      } else if (this.data.data.attribute.verification_type === 'field-force') {
        // this.form.get('push').patchValue(true);
        this.form.get('verifikasi').patchValue(false);
        this.form.get('verifikasiFF').patchValue(true);
      }

      if (parseInt(this.data.data.attribute.is_push_to_ff) === 0) {
        this.form.get('pushFF').patchValue(false);
      } else if (parseInt(this.data.data.attribute.is_push_to_ff) === 1) {
        this.form.get('pushFF').patchValue(true);
        this.form.get('coin_submission').patchValue(0);
        this.form.get('coin_verification').patchValue(0);
      }

    }
  }

  selectChangeMisi(e: any){
    // console.log(e);
    const theIndex = this.missions.findIndex(x => x.id === e.value);
    // console.log(this.missions[theIndex]);
    console.log("is ir template: "+this.missions[theIndex].is_ir_template);
    this.form.patchValue({
      is_ir_template: this.missions[theIndex].is_ir_template
    });

    if(this.missions[theIndex].is_ir_template === 1){
      this.form.get('verifikasiFF').patchValue(false);
      this.form.get('pushFF').patchValue(false);
      this.form.get('verifikasi').patchValue(true);
    } else {
      this.form.get('verifikasi').patchValue(false);
    }
  }

  filteringMission() {
    if (!this.missions) {
      return;
    }
    // get the search keyword
    let search = this.filterMission.value;
    if (!search) {
      this.filteredMission.next(this.missions.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredMission.next(
      this.missions.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getMission() {
    this.pagination.per_page = 999999;
    this.templateTaskService.get(this.pagination).subscribe(
      (res) => {
        this.missions = res.data.data;
        this.filteredMission.next(this.missions.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );
  }

  selectChangeFF(e: any) {
    if (e.source.name === 'push-to-ff' && e.checked === true) {
      this.form.get('is_push_to_ff').patchValue(1);
      this.form.get('coin_submission').patchValue(0);
      this.form.get('coin_verification').patchValue(0);
    } else if (e.source.name === 'push-to-ff' && e.checked === false) {
      this.form.get('is_push_to_ff').patchValue(0);
    }

  }

  selectChange(e: any) {
    if (e.source.name === 'verifikasi' && e.checked) {
      this.form.get('verifikasiFF').patchValue(false);
      this.form.get('pushFF').patchValue(false);
    }
    if (e.source.name === 'verifikasi-ff' && e.checked) {
      this.form.get('verifikasi').patchValue(false);
      this.form.get('pushFF').patchValue(false);
    }
    if (e.source.name === 'push-to-ff' && e.checked) {
      this.form.get('is_push_to_ff').patchValue(1);
      this.form.get('coin_submission').patchValue(0);
      this.form.get('coin_verification').patchValue(0);
      this.form.get('verifikasiFF').patchValue(false);
      this.form.get('verifikasi').patchValue(false);
    } else if (e.source.name === 'push-to-ff' && e.checked === false) {
      this.form.get('is_push_to_ff').patchValue(0);
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  formatDate(val: any) {
    var d = new Date(val);
    let date = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + (d.getDate())).slice(-2)].join('-');
    return date;
  }

  submit(form: any) {
    form.get('start_date').patchValue(this.formatDate(form.value.start_date));
    form.get('end_date').patchValue(this.formatDate(form.value.end_date));

    form.get('verification_type').patchValue(
      (form.value.verifikasiFF === false && form.value.verifikasi === false) ? null :
      (form.value.verifikasiFF === false && form.value.verifikasi === true) ? 'principal' :
      (form.value.verifikasiFF === true && form.value.verifikasi === false) ? 'field-force' : '');
      form.get('is_push_to_ff').patchValue(
        (form.value.pushFF === false) ? 0 :
        (form.value.pushFF === true) ? 1 : ''
      );
    form.removeControl('verifikasi', null);
    form.removeControl('verifikasiFF', null);

    const returnObject = {
      id: this.data.id,
      component_id: this.data.data.component_id,
      task_sequencing_management_id: this.data.data.task_sequencing_management_id,
      task_template_id: this.data.data.task_template_id,
      name: 'Mission',
      type: 'mission',
      attribute: form.value,
      next_step_component: this.data.data.next_step_component,
      next_step_component_yes: this.data.data.next_step_component_yes,
      next_step_component_no: this.data.data.next_step_component_no,
      decision_type: this.data.data.decision_type,
      min_date: this.minDate,
      max_date: this.maxDate
    }
    console.log(returnObject);
    this.dialogRef.close(returnObject);
  }

}
