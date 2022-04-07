import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Subject, ReplaySubject } from "rxjs";
import { takeUntil } from 'rxjs/operators';
import { TemplateTaskService } from '../../../../../services/dte/template-task.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Page } from 'app/classes/laravel-pagination';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: 'app-diaglog-misi',
  templateUrl: './diaglog-misi.component.html',
  styleUrls: ['./diaglog-misi.component.scss']
})
export class DiaglogMisiComponent implements OnInit {
  form: FormGroup;
  pushFF: FormControl = new FormControl(false);
  verifikasi: FormControl = new FormControl(false);
  verifikasiFF: FormControl = new FormControl(false);
  status_pin_up: FormControl = new FormControl(false);
  non_coin_reward: FormControl = new FormControl(false);
  isRewardError: boolean = false;

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
    public dialogRef: MatDialogRef<DiaglogMisiComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private templateTaskService: TemplateTaskService,
    private dialogService: DialogService,
    private ls: LanguagesService,
  ) { }


  ngOnInit() {
    this.getMission(true);
    this.form = this.formBuilder.group({
      task_template_id: "",
      task_template_other_name_id: "",
      start_date: "",
      end_date: "",
      pushFF: this.pushFF,
      verifikasi: this.verifikasi,
      verifikasiFF: this.verifikasiFF,
      verification_type: null,
      is_push_to_ff: 0,
      coin_submission: null,
      coin_verification: null,
      is_ir_template: null,
      status_pin_up: this.status_pin_up,
      non_coin_reward: this.non_coin_reward,
      reward_description: [""]
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
        task_template_id: parseInt(this.data.data.attribute.task_template_id, 10),
        task_template_other_name_id: parseInt(this.data.data.attribute.task_template_id, 10),
        start_date: this.data.data.attribute.start_date === null ? "" : this.data.data.attribute.start_date,
        end_date: this.data.data.attribute.end_date === null ? "" : this.data.data.attribute.end_date,
        verification_type: this.data.data.attribute.verification_type,
        coin_submission: this.data.data.attribute.coin_submission === 0 ? null : this.data.data.attribute.coin_submission,
        coin_verification: this.data.data.attribute.coin_verification === 0 ? null : this.data.data.attribute.coin_verification,
        is_push_to_ff: this.data.data.attribute.is_push_to_ff,
        is_ir_template: this.data.data.attribute.is_ir_template,
        reward_description: this.data.data.attribute.reward_description
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

      if (this.data.data.attribute.is_push_to_ff === 0) {
        this.form.get('pushFF').patchValue(false);
      } else if (this.data.data.attribute.is_push_to_ff === 1) {
        this.form.get('pushFF').patchValue(true);
        this.form.get('coin_submission').patchValue(0);
        this.form.get('coin_verification').patchValue(0);
        this.form.get('verifikasi').patchValue(false);
        this.form.get('verifikasiFF').patchValue(false);
      }

      if (this.data.data.attribute.status_pin_up === 0) {
        this.form.get('status_pin_up').patchValue(false);
      } else if (this.data.data.attribute.status_pin_up === 1) {
        this.form.get('status_pin_up').patchValue(true);
      }

      if (this.data.data.attribute.non_coin_reward === 0) {
        this.form.get('non_coin_reward').patchValue(false);
      } else if (this.data.data.attribute.non_coin_reward === 1) {
        this.form.get('non_coin_reward').patchValue(true);
      }
    }
  }

  selectForm(form: any){
    const selectSearch = document.getElementById('select-search-'+form);
    let inputTag = selectSearch.querySelectorAll('input');
    for (let index = 0; index < inputTag.length; index++) {
      inputTag[index].id = "search-"+form;
    }
    
    let matOption = document.querySelectorAll('mat-option');
    if (matOption) {
      for (let index = 0; index < matOption.length; index++) {
        matOption[index].id = 'options';
      }
    }
  }

  selectChangeMisi(e: any) {
    this.form.get("task_template_other_name_id").setValue(e.value);
    const theIndex = this.missions.findIndex(x => x.id === e.value);

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
        console.log("res missions", res.data.data);
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
      this.missions.filter(item => item.name ? item.name.toLowerCase().indexOf(search) > -1 : item.name.indexOf(search))
    );

    this.filteredMissionOther.next(
      this.missions.filter(item => item.name ? item.name.toLowerCase().indexOf(search) > -1 : item.name.indexOf(search))
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
      this.missions.filter(item => item.name ? item.name.toLowerCase().indexOf(search) > -1 : item.name.indexOf(search))
    );

    this.filteredMission.next(
      this.missions.filter(item => item.name ? item.name.toLowerCase().indexOf(search) > -1 : item.name.indexOf(search))
    );
  }

  checkTaskTemplate() {
    if (this.form.get('task_template_id').value && this.missions.length > 0) {
      this.filterMission.setValue(this.form.get('task_template_id').value, { emitEvent: false })
      this.filterMissionOther.setValue(this.form.get('task_template_id').value, { emitEvent: false });
      const theIndex = this.missions.findIndex(x => x.id === this.form.get('task_template_id').value);

      this.form.patchValue({
        is_ir_template: this.missions[theIndex] && this.missions[theIndex]['is_ir_template'] ? this.missions[theIndex].is_ir_template : 0
      });

      this.form.get('verifikasiFF').enable();
      this.form.get('coin_verification').enable();
      if (this.missions[theIndex] && this.missions[theIndex]['is_ir_template'] && this.missions[theIndex].is_ir_template === 1) {
        this.form.get('verifikasiFF').patchValue(false);
        this.form.get('pushFF').patchValue(false);
        this.form.get('verifikasi').patchValue(true);
      } else {
        this.form.get('verifikasi').patchValue(false);
        if (this.missions[theIndex] && this.missions[theIndex].is_quiz && this.missions[theIndex].is_quiz === 1) {
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
        console.log("res missions", res.data.data);
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
    // console.log(e);
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

    if (e.source.name === 'non_coin_reward' && e.checked === false) {
      this.form.get('reward_description').patchValue("");
      this.isRewardError = false;
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

  changeRewardDesc(event){
    this.isRewardError = event.target.value.length ? false : true;
  }

  submit(form: any) {
    if (form.value.non_coin_reward === true && (form.value.reward_description == "" || form.value.reward_description == undefined)) {
      this.isRewardError = true;
      this.dialogService.openSnackBar({ message: 'Keterangan Reward harus diisi' });
      return;
    }

    this.form.get('coin_verification').enable();
    form.get('start_date').patchValue(this.formatDate(form.value.start_date));
    form.get('end_date').patchValue(this.formatDate(form.value.end_date));

    form.get('verification_type').patchValue(
      (!form.value.verifikasiFF && !form.value.verifikasi) ? null :
        (!form.value.verifikasiFF && form.value.verifikasi === true) ? 'principal' :
          (form.value.verifikasiFF === true && !form.value.verifikasi) ? 'field-force' : '');
    form.get('is_push_to_ff').patchValue(
      (form.value.pushFF === false) ? 0 :
        (form.value.pushFF === true) ? 1 : ''
    );
    form.get('status_pin_up').patchValue(
      (form.value.status_pin_up === true) ? 1 : 0
    );
    form.get('non_coin_reward').patchValue(
      (form.value.non_coin_reward === true) ? 1 : 0
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
