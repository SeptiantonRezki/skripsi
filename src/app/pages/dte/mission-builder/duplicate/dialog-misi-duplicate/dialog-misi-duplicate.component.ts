import { Component, OnInit, Inject, OnDestroy } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { Subject, ReplaySubject } from "rxjs";
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { TemplateTaskService } from '../../../../../services/dte/template-task.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Page } from 'app/classes/laravel-pagination';

@Component({
  selector: 'app-dialog-misi-duplicate',
  templateUrl: './dialog-misi-duplicate.component.html',
  styleUrls: ['./dialog-misi-duplicate.component.scss']
})
export class DialogMisiDuplicateComponent implements OnInit, OnDestroy {

  form: FormGroup;
  pushFF: FormControl = new FormControl(false);
  verifikasi: FormControl = new FormControl(false);
  verifikasiFF: FormControl = new FormControl(false);
  status_pin_up: FormControl = new FormControl(false);

  missions: any[];
  minDate: any;
  maxDate: any;
  private _onDestroy = new Subject<void>();
  public filterMission: FormControl = new FormControl();
  public filteredMission: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterMissionOther: FormControl = new FormControl();
  public filteredMissionOther: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  pagination: Page = new Page();

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogMisiDuplicateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private templateTaskService: TemplateTaskService,
  ) { }

  ngOnInit() {
    this.getMission(true);
    this.form = this.formBuilder.group({
      task_template_id: "",
      task_template_other_name_id: "",
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
      status_pin_up: this.status_pin_up,
    });

    this.filterMission.valueChanges
      .debounceTime(500)
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringMission();
      });

    this.filterMissionOther.valueChanges
      .debounceTime(500)
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringMissionOther();
      });

    if (this.data !== null) {
      this.form.patchValue({
        task_template_id: this.data.data.attribute.task_template_id,
        task_template_other_name_id: parseInt(this.data.data.attribute.task_template_id, 10),
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
        this.form.get('verifikasi').patchValue(false);
        this.form.get('verifikasiFF').patchValue(false);
      } else if (this.data.data.attribute.verification_type === 'principal') {
        this.form.get('verifikasi').patchValue(true);
        this.form.get('verifikasiFF').patchValue(false);
      } else if (this.data.data.attribute.verification_type === 'field-force') {
        this.form.get('verifikasi').patchValue(false);
        this.form.get('verifikasiFF').patchValue(true);
      }

      if (parseInt(this.data.data.attribute.is_push_to_ff) === 0) {
        this.form.get('pushFF').patchValue(false);
      } else if (parseInt(this.data.data.attribute.is_push_to_ff) === 1) {
        this.form.get('pushFF').patchValue(true);
        this.form.get('coin_submission').patchValue(0);
        this.form.get('coin_verification').patchValue(0);
        this.form.get('verifikasi').patchValue(false);
        this.form.get('verifikasiFF').patchValue(false);
      }

      if (parseInt(this.data.data.attribute.status_pin_up) === 0) {
        this.form.get('status_pin_up').patchValue(false);
      } else if (parseInt(this.data.data.attribute.status_pin_up) === 1) {
        this.form.get('status_pin_up').patchValue(true);
      }
    }
  }

  ngOnDestroy() {
    this._onDestroy.unsubscribe();
  }

  selectForm(form: any){
    const selectSearch = document.getElementById('select-search-'+form);
    let inputTag = selectSearch.querySelectorAll('input');
    for (let index = 0; index < inputTag.length; index++) {
      inputTag[index].id = "search-"+form;
    }
    
    let matOption = selectSearch.parentElement.querySelectorAll('mat-option');
    if (matOption) {
      for (let index = 0; index < matOption.length; index++) {
        matOption[index].querySelector('span').id = 'options';
      }
    }
  }

  selectChangeMisi(e: any) {
    // console.log(e);
    // this.filterMissionOther.setValue(e.value);
    this.form.get("task_template_other_name_id").setValue(e.value);
    const theIndex = this.missions.findIndex(x => x.id === e.value);
    // console.log(this.missions[theIndex]);
    this.form.patchValue({
      is_ir_template: this.missions[theIndex].is_ir_template
    });

    this.form.get('verifikasiFF').enable();
    this.form.get('coin_verification').enable();
    if (this.missions[theIndex].is_ir_template === 1) {
      this.form.get('verifikasiFF').patchValue(false);
      this.form.get('pushFF').patchValue(false);
      this.form.get('verifikasi').patchValue(true);
    } else {
      this.form.get('verifikasi').patchValue(false);
      if (this.missions[theIndex].is_quiz === 1) {
        this.form.get('verifikasiFF').disable();
        this.form.get('verifikasi').patchValue(true);
        let totalCoin = 0;
        this.missions[theIndex].questions.map(qst => {
          totalCoin += Number(qst.coin);
        });
        this.form.get('coin_verification').patchValue(totalCoin);
        this.form.get('coin_verification').disable();
      }
    }
  }

  selectChangeMisiOtherName(e: any) {
    // this.filterMission.setValue(e.value);
    this.form.get("task_template_id").setValue(e.value);
    const theIndex = this.missions.findIndex(x => x.id === e.value);
    // console.log(this.missions[theIndex]);
    this.form.patchValue({
      is_ir_template: this.missions[theIndex].is_ir_template
    });

    this.form.get('verifikasiFF').enable();
    this.form.get('coin_verification').enable();
    if (this.missions[theIndex].is_ir_template === 1) {
      this.form.get('verifikasiFF').patchValue(false);
      this.form.get('pushFF').patchValue(false);
      this.form.get('verifikasi').patchValue(true);
    } else {
      this.form.get('verifikasi').patchValue(false);
      if (this.missions[theIndex].is_quiz === 1) {
        this.form.get('verifikasiFF').disable();
        this.form.get('verifikasi').patchValue(true);
        let totalCoin = 0;
        this.missions[theIndex].questions.map(qst => {
          totalCoin += Number(qst.coin);
        });
        this.form.get('coin_verification').patchValue(totalCoin);
        this.form.get('coin_verification').disable();
      }
    }
  }

  filteringMission() {
    if (!this.missions) {
      return;
    }
    // get the search keyword
    let search = this.filterMission.value;
    this.pagination.per_page = 30;
    this.pagination.search = search;
    if (this.pagination['id']) {
      delete this.pagination['id'];
    }
    this.templateTaskService.get(this.pagination).subscribe(
      (res) => {
        this.missions = res.data.data;
        this.filteredMission.next(this.missions.slice());
        this.filteredMissionOther.next(this.missions.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );
    // filter the banks
    this.filteredMission.next(
      this.missions.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );

    this.filteredMissionOther.next(
      this.missions.filter(item => item.other_name.toLowerCase().indexOf(search) > -1)
    );
  }

  filteringMissionOther() {
    if (!this.missions) {
      return;
    }
    // get the search keyword
    let search = this.filterMissionOther.value;
    this.pagination.per_page = 30;
    this.pagination.search = search;
    if (this.pagination['id']) {
      delete this.pagination['id'];
    }
    this.templateTaskService.get(this.pagination).subscribe(
      (res) => {
        this.missions = res.data.data;
        this.filteredMission.next(this.missions.slice());
        this.filteredMissionOther.next(this.missions.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );
    // filter the banks
    this.filteredMissionOther.next(
      this.missions.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );

    this.filteredMission.next(
      this.missions.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  checkTaskTemplate() {
    if (this.form.get('task_template_id').value && this.missions.length > 0) {
      this.filterMission.setValue(this.form.get('task_template_id').value, { emitEvent: false });
      this.filterMissionOther.setValue(this.form.get('task_template_id').value, { emitEvent: false });
      const theIndex = this.missions.findIndex(x => x.id === this.form.get('task_template_id').value);

      this.form.patchValue({
        is_ir_template: this.missions[theIndex].is_ir_template
      });

      this.form.get('verifikasiFF').enable();
      this.form.get('coin_verification').enable();
      if (this.missions[theIndex].is_ir_template === 1) {
        this.form.get('verifikasiFF').patchValue(false);
        this.form.get('pushFF').patchValue(false);
        this.form.get('verifikasi').patchValue(true);
      } else {
        this.form.get('verifikasi').patchValue(false);
        if (this.missions[theIndex].is_quiz === 1) {
          this.form.get('verifikasiFF').disable();
          this.form.get('verifikasi').patchValue(true);
          let totalCoin = 0;
          this.missions[theIndex].questions.map(qst => {
            totalCoin += Number(qst.coin);
          });
          this.form.get('coin_verification').patchValue(totalCoin);
          this.form.get('coin_verification').disable();
        }
      }
    }
  }

  getMission(isFirstLoad?: boolean) {
    this.pagination.per_page = 30;
    if (isFirstLoad && this.data && this.data.data && this.data.data.attribute && this.data.data.attribute.task_template_id) {
      this.pagination['id'] = this.data.data.attribute.task_template_id;
    }
    this.templateTaskService.get(this.pagination).subscribe(
      (res) => {
        this.missions = res.data.data;
        this.filteredMission.next(this.missions.slice());
        this.filteredMissionOther.next(this.missions.slice());
        this.checkTaskTemplate();
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
    this.form.get('coin_verification').enable();
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
    form.get('status_pin_up').patchValue(
      (form.value.status_pin_up === true) ? 1 : 0
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
    console.log('update => ',returnObject);
    this.dialogRef.close(returnObject);
  }

}
