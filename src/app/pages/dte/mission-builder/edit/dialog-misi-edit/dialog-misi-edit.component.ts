import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from "@angular/forms";
import { Subject, ReplaySubject } from "rxjs";
import moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { TemplateTaskService } from '../../../../../services/dte/template-task.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Page } from 'app/classes/laravel-pagination';
import { DialogService } from "app/services/dialog.service";
import { DataService } from "app/services/data.service";
import { LanguagesService } from "app/services/languages/languages.service";

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
  status_pin_up: FormControl = new FormControl(false);
  non_coin_reward: FormControl = new FormControl(false);
  isRewardError: boolean = false;
  auto_submit: FormControl = new FormControl(false);
  mission_reblast: FormControl = new FormControl(false);
  rejected_list = [];

  missions: any[];
  minDate: any;
  maxDate: any;
  private _onDestroy = new Subject<void>();
  public filterMission: FormControl = new FormControl();
  public filteredMission: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterMissionOther: FormControl = new FormControl();
  public filteredMissionOther: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  pagination: Page = new Page();
  isDetail: Boolean;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogMisiEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private templateTaskService: TemplateTaskService,
    private dialogService: DialogService,
    private dataService: DataService,
    private ls: LanguagesService,
  ) { }

  ngOnInit() {
    this.getMission(true);
    this.form = this.formBuilder.group({
      task_template_id: "",
      task_template_other_name_id: "",
      start_date: [moment(), Validators.required],
      start_time: "",
      end_date: "",
      end_time: "",
      pushFF: this.pushFF,
      verifikasi: this.verifikasi,
      verifikasiFF: this.verifikasiFF,
      verification_type: null,
      is_push_to_ff: 0,
      coin_submission: "",
      coin_verification: "",
      is_ir_template: null,
      status_pin_up: this.status_pin_up,
      non_coin_reward: this.non_coin_reward,
      reward_description: [""],
      auto_submit: this.auto_submit,
      xp_submission: null,
      xp_verification: null,
      mission_reblast: this.mission_reblast,
      verification_notes: this.formBuilder.array([]),
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

    this.form.get('coin_verification').valueChanges
      .debounceTime(500)
      .pipe(takeUntil(this._onDestroy))
      .subscribe((value) => {
        if (value > 0) {
          !this.form.get('verifikasiFF').value ? this.form.get('verifikasi').patchValue(true) : null;
        }
      });

    if (this.data !== null) {
      const { attribute } = this.data.data;

      this.form.patchValue({
        task_template_id: this.data.data.attribute.task_template_id,
        task_template_other_name_id: parseInt(this.data.data.attribute.task_template_id, 10),
        start_date: this.data.data.attribute.start_date === null ? "" : this.data.data.attribute.start_date,
        end_date: this.data.data.attribute.end_date === null ? "" : this.data.data.attribute.end_date,
        start_time: attribute.start_time ? attribute.start_time : "",
        end_time: attribute.end_time ? attribute.end_time : "",
        verification_type: this.data.data.attribute.verification_type,
        coin_submission: this.data.data.attribute.coin_submission === 0 ? null : this.data.data.attribute.coin_submission,
        coin_verification: this.data.data.attribute.coin_verification === 0 ? null : this.data.data.attribute.coin_verification,
        xp_submission: this.data.data.attribute.xp_submission === 0 ? null : this.data.data.attribute.xp_submission,
        xp_verification: this.data.data.attribute.xp_verification === 0 ? null : this.data.data.attribute.xp_verification,
        is_push_to_ff: parseInt(this.data.data.attribute.is_push_to_ff),
        is_ir_template: parseInt(this.data.data.attribute.is_ir_template),
        status_pin_up: this.data.data.attribute.status_pin_up,
        non_coin_reward: this.data.data.attribute.non_coin_reward,
        reward_description: this.data.data.attribute.reward_description,
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
        this.form.get('verifikasi').patchValue(false);
        this.form.get('verifikasiFF').patchValue(false);
      }

      if (parseInt(this.data.data.attribute.status_pin_up) === 0) {
        this.form.get('status_pin_up').patchValue(false);
      } else if (parseInt(this.data.data.attribute.status_pin_up) === 1) {
        this.form.get('status_pin_up').patchValue(true);
      }

      if (parseInt(this.data.data.attribute.auto_submit) === 0) {
        this.form.get('auto_submit').patchValue(false);
      } else if (parseInt(this.data.data.attribute.auto_submit) === 1) {
        this.form.get('auto_submit').patchValue(true);
      }

      if (parseInt(this.data.data.attribute.non_coin_reward) === 0) {
        this.form.get('non_coin_reward').patchValue(false);
      } else if (parseInt(this.data.data.attribute.non_coin_reward) === 1) {
        this.form.get('non_coin_reward').patchValue(true);
      }

      if (this.data.isDetail) {
        this.isDetail = this.data.isDetail;
        setTimeout(() => {
          this.form.get("task_template_other_name_id").disable();
          this.form.get("start_date").disable();
          this.form.get("end_date").disable();
          this.form.get("coin_submission").disable();
          this.form.get("coin_verification").disable();
          // this.form.get("verification_type").disable();
          // this.form.get("is_push_to_ff").disable();
          // this.form.get("is_ir_template").disable();
          this.form.get("status_pin_up").disable();
          this.form.get("auto_submit").disable();
          this.form.get("xp_submission").disable();
          this.form.get("xp_verification").disable();
        }, 1000)
      }

      this.form.get('mission_reblast').patchValue(attribute.mission_reblast === "active" ? true : false);

      if (attribute.verification_notes && attribute.verification_notes.length) {
        const verif_notes = this.form.get('verification_notes') as FormArray;
        attribute.verification_notes.forEach(verif => {
          verif_notes.push(this.formBuilder.group({ reason: [verif.reason, Validators.required], detail: verif.detail }));
        })
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

  copyMessage(linkMisi: any) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (linkMisi));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
    this.dialogService.openSnackBar({ message: "Link Misi Disalin!" });
  }

  checkTaskTemplate() {
    if (this.form.get('task_template_id').value && this.missions.length > 0) {
      this.filterMission.setValue(this.form.get('task_template_id').value, { emitEvent: false });
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
        // this.form.get('verifikasi').patchValue(false);
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

  selectChangeMisi(e: any) {
    this.form.get("task_template_other_name_id").setValue(e.value);
    const theIndex = this.missions.findIndex(x => x.id === e.value);

    const verif_notes = this.form.get("verification_notes") as FormArray;
    this.rejected_list = this.missions[theIndex].rejected_reason_choices;
    this.form.get('mission_reblast').setValue(false);
    while (verif_notes.value.length > 0) {
      verif_notes.removeAt(verif_notes.value.length - 1);
    }

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
      // this.form.get('verifikasi').patchValue(false);
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
      // this.form.get('verifikasi').patchValue(false);
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

  getMission(isFirstLoad?: boolean) {
    this.pagination.per_page = 30;
    if (isFirstLoad && this.data && this.data.data && this.data.data.attribute && this.data.data.attribute.task_template_id) {
      this.pagination['id'] = this.data.data.attribute.task_template_id;
    }

    const dataLocal = this.dataService.getFromStorage('detail_task_sequencing');
    if (dataLocal.type === "personalization") {
      this.templateTaskService.getPersonalize(this.pagination).subscribe(
        (res) => {
          this.missions = res.data.data;
          this.filteredMission.next(this.missions.slice());
          this.filteredMissionOther.next(this.missions.slice());
          this.checkTaskTemplate();
          this.form.get("task_template_other_name_id").disable();

          const task_template = this.form.get("task_template_id").value;
          const index = this.missions.findIndex(mission => mission.id === task_template);
          if (task_template) this.rejected_list = this.missions[index].rejected_reason_choices;
        },
        (err) => {
          console.log("err ", err);
        }
      );
    } else {
      this.templateTaskService.get(this.pagination).subscribe(
        (res) => {
          this.missions = res.data.data;
          this.filteredMission.next(this.missions.slice());
          this.filteredMissionOther.next(this.missions.slice());
          this.checkTaskTemplate();

          const task_template = this.form.get("task_template_id").value;
          const index = this.missions.findIndex(mission => mission.id === task_template);
          if (task_template) this.rejected_list = this.missions[index].rejected_reason_choices;
        },
        (err) => {
          console.log("err ", err);
        }
      );
    }
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
    } else {
      this.form.get('xp_submission').patchValue(null);
      this.form.get('xp_verification').patchValue(null);
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

  handleVerificationNotes(reblast){
    if (reblast) {
      const verif_notes = this.form.get("verification_notes") as FormArray;

      if (!verif_notes.length) {
        this.rejected_list.forEach(rejected => {
          verif_notes.push(this.formBuilder.group({ reason: [rejected, Validators.required], detail: [""] }))
        })
      }
    }
  }

  addVerifNotes(){
    const verif_notes = this.form.get('verification_notes') as FormArray;
    let available = [];
    this.rejected_list.forEach(rejected => {
      if (!verif_notes.value.some(verif => verif.reason === rejected)) {
        available.push(rejected);
      }
    });

    verif_notes.push(this.formBuilder.group({ reason: [available[0], Validators.required], detail: [""] }))
  }

  deleteVerifNotes(index){
    const verif_notes = this.form.get("verification_notes") as FormArray;
    verif_notes.removeAt(index);
  }

  checkReason(item){
    const verif_notes = this.form.get("verification_notes").value;
    return verif_notes.some(verif => verif.reason === item);
  }

  checkReasonClose(index){
    const verif_notes = this.form.get("verification_notes").value;
    return verif_notes[index].reason.toLowerCase() === "others";
  }

  submit(form: any) {
    if (form.value.non_coin_reward === true && (form.value.reward_description == "" || form.value.reward_description == undefined)) {
      this.isRewardError = true;
      this.dialogService.openSnackBar({ message: 'Keterangan Reward harus diisi' });
      return;
    }

    this.form.get('coin_verification').enable();
    form.get('start_date')
      .patchValue(
        `${moment(form.value.start_date).format(
          "YYYY-MM-DD"
        )} ${form.value.start_time}:00`
      );
    form.get('end_date')
      .patchValue(
        `${moment(form.value.end_date).format(
          "YYYY-MM-DD"
        )} ${form.value.end_time}:00`
      );

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
    form.get('auto_submit').patchValue(
      (form.value.auto_submit === true) ? 1 : 0
    );
    form.get('mission_reblast').patchValue(
      (form.value.mission_reblast === true) ? "active" : "inactive"
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
    this.dialogRef.close(returnObject);
  }

}
