import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { DateAdapter, MatDatepicker, MatSelect } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from '../../../../services/dialog.service';
import { commonFormValidator } from '../../../../classes/commonFormValidator';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { startWith, map, takeUntil } from 'rxjs/operators';
import { ScheduleTradeProgramService } from '../../../../services/dte/schedule-trade-program.service';
import * as moment from 'moment';

@Component({
  selector: 'app-schedule-program-create',
  templateUrl: './schedule-program-create.component.html',
  styleUrls: ['./schedule-program-create.component.scss']
})
export class ScheduleProgramCreateComponent {
  formSchedule: FormGroup;
  formScheduleError: any;
  minDate: any;
  maxStartDateTemplate: any;
  maxDateTemplate: any;

  searchTradeProgram = new Subject<string>();
  searchTemplateTask = new Subject<string>();

  listTradeProgram: Array<any>;
  listTemplateTask: Array<any>;
  listAudience: Array<any>;
  listReminder: Array<any> = [{ name: 'Ada', value: 'by-weekly' }, { name: 'Tidak Ada', value: 'none' }];
  listNotification: Array<any> = [{ name: 'Ya', value: 1 }, { name: 'Tidak', value: 0 }];
  listAddNotif: Array<any> = [{ name: 'H+1', value: 1 }, { name: 'H+2', value: 2 }, { name: 'H+3', value: 3 }];

  filteredTpOptions: Observable<string[]>;
  filteredTemplateOptions: Observable<string[]>;

  public filterTP: FormControl = new FormControl();
  public filteredTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filterTask: FormControl = new FormControl();
  public filteredTask: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect') singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();
  tradeProgramObj: any;

  valueChange: Boolean;
  saveData: Boolean;

  isIRTemplate: boolean;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.valueChange && !this.saveData) {
      return false;
    }

    return true;
  }

  // dateFilter = (date: Date): boolean => {
  //   const dateUtc = new Date(date);
  //   const day = dateUtc.getDay();
  //
  //   console.log(day);
  //   // Prevent Saturday and Sunday from being selected.
  //   return day !== 0;
  // }

  constructor(
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private scheduleTradeProgramService: ScheduleTradeProgramService
  ) {
    this.saveData = false;
    this.adapter.setLocale("id");
    this.listTemplateTask = this.activatedRoute.snapshot.data["listTemplate"].data;
    this.listTradeProgram = this.activatedRoute.snapshot.data["listTradeProgram"].data;

    this.formScheduleError = {
      name: {},
      trade_creator_id: {},
      task_templates: []
    }

    this.filteredTP.next(this.listTradeProgram.slice());
    this.filteredTask.next(this.listTemplateTask.slice());
    this.minDate = moment();

    // this.searchTradeProgram.debounceTime(500)
    // .flatMap(key => {
    //   return Observable.of(key).delay(300);
    // })
    // .subscribe(res => {
    //   this.filterTradeProgram(res);
    // })

    // this.searchTemplateTask.map(value => value)
    // .debounceTime(500)
    // .flatMap(key => {
    //   return Observable.of(key).delay(300);
    // })
    // .subscribe(res => {
    //   this.filterTemplateTask(res);
    // })
  }

  ngOnInit() {
    this.formSchedule = this.formBuilder.group({
      name: ["", Validators.required],
      trade_creator_id: ["", Validators.required],
      task_templates: this.formBuilder.array([this.createTaskTemplate()], Validators.required),
    })

    this.formSchedule.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formSchedule, this.formScheduleError);
    })

    this.formSchedule.valueChanges.subscribe(res => {
      this.valueChange = true;
    })

    this.filterTP.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringTP();
      });

    this.filterTask.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringTask();
      });

      const templates = this.formSchedule.get('task_templates') as FormArray;
      const template = templates.at(0);
      template.get('is_verification').disable();
  }

  onChangeTemplateTask(event: any, i: number) {
    console.log('eventasdjaslkda', event, i);
    this.isIRTemplate = event.is_ir_template === 1 ? true : false;
    const templates = this.formSchedule.get('task_templates') as FormArray;
    const template = templates.at(i);
    if (this.isIRTemplate) {
      // template.get('is_verification_ir_toggle').setValue(true);
      template.get('is_verification_hq').setValue(true);
      template.get('is_verification_toggle').setValue(false);
      template.get('is_verification').setValue(false);
      template.get('is_backup').setValue(false);
      template.get('is_verification').disable();
    } else {
      template.get('is_verification').setValue(false);
    }
  }

  filteringTP() {
    if (!this.listTradeProgram) {
      return;
    }
    // get the search keyword
    let search = this.filterTP.value;
    if (!search) {
      this.filteredTP.next(this.listTradeProgram.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredTP.next(
      this.listTradeProgram.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  filteringTask() {
    if (!this.listTemplateTask) {
      return;
    }
    // get the search keyword
    let search = this.filterTask.value;
    if (!search) {
      this.filteredTask.next(this.listTemplateTask.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredTask.next(
      this.listTemplateTask.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  createTaskTemplate(): FormGroup {
    return this.formBuilder.group({
      task_template_id: ["", Validators.required],
      coin_delivered: ["", [Validators.required, Validators.min(0)]],
      coin_approved: ["", [Validators.required, Validators.min(0)]],
      start_date: ["", Validators.required],
      end_date: ["", Validators.required],
      min_end_date: [""],
      repeated: ["by-weekly", Validators.required],
      is_notif: [1, Validators.required],
      notif: [1, Validators.required],
      is_backup: [false, Validators.required],
      is_verification: [false, Validators.required],
      is_verification_toggle: [false, Validators.required],
      // is_verification_ir_toggle: [false, Validators.required],
      is_verification_hq: [true, Validators.required],
      task_template_id_backup: [{ value: "", disabled: true }],
      coin_delivered_backup: [{ value: "", disabled: true }],
      coin_approved_backup: [{ value: "", disabled: true }],
      start_date_backup: [{ value: "", disabled: true }],
      end_date_backup: [{ value: "", disabled: true }]
    })
  }

  addTaskTemplate() {
    let templates = this.formSchedule.get('task_templates') as FormArray;
    templates.push(this.createTaskTemplate())

    const template = templates.at(templates.length - 1);
    template.get('is_verification').disable();
  }

  deleteTaskTemplate(idx) {
    let template = this.formSchedule.get('task_templates') as FormArray;
    template.removeAt(idx);
  }

  getTradeProgram() {
    let tradeProgramId = this.formSchedule.get('trade_creator_id').value;
    let tradeProgram = this.listTradeProgram.filter(item => item.id === tradeProgramId)[0];

    this.minDate = tradeProgram['start_date'];
    this.maxStartDateTemplate = tradeProgram['end_date'];
  }

  // _filterTp(value): any[] {
  //   const filterValue = typeof value == "object" ? value.name.toLowerCase() : value.toLowerCase();
  //   return this.listTradeProgram.filter(item => item.name.toLowerCase().includes(filterValue));
  // }

  // _filterTemplate(value): any[] {
  //   const filterValue = typeof value == "object" ? value.name.toLowerCase() : value.toLowerCase();
  //   return this.listTemplateTask.filter(item => item.name.toLowerCase().includes(filterValue));
  // }

  // filterTradeProgram(param) {
  //   if(param.length >= 3) {
  //     this.scheduleTradeProgramService.getTradeProgram({ param: param }).subscribe(res => {
  //       this.listTradeProgram = res.data;
  //       this.filteredTpOptions = this.formSchedule.get("trade_creator_id").valueChanges.pipe(startWith(""), map(value => this._filterTp(value)));
  //     })
  //   } else {
  //     this.listTradeProgram = [];
  //     this.filteredTpOptions = this.formSchedule.get("trade_creator_id").valueChanges.pipe(startWith(""), map(value => this._filterTp(value)));
  //   }
  // }

  // filterTemplateTask(param) {
  //   let template = this.formSchedule.get('task_templates') as FormArray;
  //   if(param['value'].length >= 3) {
  //     this.scheduleTradeProgramService.getTemplate({ param: param['value'] }).subscribe(res => {
  //       this.listTemplateTask = res.data;
  //       this.filteredTemplateOptions = template.at(param['index']).get("task_template_id").valueChanges.pipe(startWith(""), map(value => this._filterTemplate(value)));
  //     })
  //   } else {
  //     this.listTemplateTask = [];
  //     this.filteredTemplateOptions = template.at(param['index']).get("task_template_id").valueChanges.pipe(startWith(""), map(value => this._filterTemplate(value)));
  //   }
  // }

  // displayTpName(param?): any {
  //   return param ? param.name : param;
  // }

  // displayTemplateName(param?): any {
  //   return param ? param.name : param;
  // }

  setMinDate(idx) {
    const template = this.formSchedule.get('task_templates') as FormArray;
    const is_backup = template.at(idx).get('is_backup').value;

    const start_date = template.at(idx).get('start_date').value;

    if (is_backup)
      template.at(idx).get('min_end_date').setValue(moment(start_date).add(2, 'days'));
    else
      template.at(idx).get('min_end_date').setValue(start_date);

    template.at(idx).get('end_date').setValue('');
  }

  setMaxDate(dateSelected, i) {
    let template = this.formSchedule.get('task_templates') as FormArray;
    let dateNumber = moment(template.at(i).get('start_date').value).day();

    let datePlus = dateNumber ? (6 - dateNumber) + 1 : 6;
    let start_date = moment(template.at(i).get('start_date').value).format('YYYY/MM/DD 23:59:00');

    let overDate = Date.parse(start_date) >= Date.parse(this.maxStartDateTemplate);
    if (overDate)
      return this.maxStartDateTemplate;

    return template.at(i).get('repeated').value === 'none' ? this.maxStartDateTemplate : moment(dateSelected).add(datePlus, 'days');
  }

  changeValue(idx) {
    let template = this.formSchedule.get('task_templates') as FormArray;

    if (template.at(idx).get('is_notif').value === 0)
      template.at(idx).get('notif').disable();
    else
      template.at(idx).get('notif').enable();
  }

  getRepeated(idx) {
    let template = this.formSchedule.get('task_templates') as FormArray;

    if (this.setMaxDate(template.at(idx).get('start_date').value, idx) < template.at(idx).get('end_date').value) {
      template.at(idx).get('end_date').setValue('');
    }
  }

  // isVerifIR(event, i) {
  //   const templates = this.formSchedule.get('task_templates') as FormArray;
  //   const template = templates.at(i);
  //   template.get('is_verification_ir_toggle').setValue(true);
  // }


  isVerifHQ(event, i) {
    const templates = this.formSchedule.get('task_templates') as FormArray;
    const template = templates.at(i);

    if (event.checked) {
      template.get('is_verification_toggle').setValue(false);
      template.get('is_verification').setValue(false);
      template.get('is_backup').setValue(false);
      template.get('is_verification').disable();
      template.updateValueAndValidity();
    } else {
      template.get('is_verification').enable();
    }
  }

  backupTask(evnt, idx) {
    const templates = this.formSchedule.get('task_templates') as FormArray;
    const template = templates.at(idx);

    const start_date = template.get('start_date').value;

    if (evnt.checked) {
      template.enable();
      template.get('min_end_date').setValue(moment(start_date).add(2, 'days'));

      template.get('task_template_id_backup').setValidators(Validators.required);
      template.get('coin_delivered_backup').setValidators([Validators.required, Validators.min(0)]);
      template.get('coin_approved_backup').setValidators([Validators.required, Validators.min(0)]);
      template.get('start_date_backup').setValidators(Validators.required);
      template.get('end_date_backup').setValidators(Validators.required);

      template.get('is_notif').setValue(0);
      template.get('is_notif').disable();

      template.get('is_verification').setValue(false);
      // template.get('is_verification').disable();

      template.get('is_verification_hq').setValue(false);
      template.get('is_verification_toggle').setValue(false);
      // template.get('is_verification_toggle').disable();

      template.updateValueAndValidity();

      let value = template.value;
      template.get('task_template_id_backup').setValue(value.task_template_id ? value.task_template_id : "");
      template.get('coin_delivered_backup').setValue(value.coin_delivered ? value.coin_delivered : "");
      template.get('coin_approved_backup').setValue(value.coin_approved ? value.coin_approved : "");

      if (value.start_date && value.end_date) this.setStartEndDateBackup(value, idx);

    } else {
      template.get('min_end_date').setValue(start_date);

      template.get('is_verification').enable();
      template.get('is_notif').enable();
      // template.get('is_verification_toggle').enable();

      template.get('task_template_id_backup').disable();
      template.get('coin_delivered_backup').disable();
      template.get('coin_approved_backup').disable();
      template.get('start_date_backup').disable();
      template.get('end_date_backup').disable();
    }
  }

  isVerif(event, i) {
    const templates = this.formSchedule.get('task_templates') as FormArray;
    const template = templates.at(i);

    if (event.checked) {
      template.get('is_verification_hq').setValue(false);
      template.get('is_verification').setValue(false);
      template.get('is_backup').setValue(false);
      template.updateValueAndValidity();
    }

  }

  isVerifFieldForce(event, i) {
    const templates = this.formSchedule.get('task_templates') as FormArray;
    const template = templates.at(i);

    if (event.checked) {
      template.get('is_verification_hq').setValue(false);
      template.get('is_verification_toggle').setValue(false);
      template.get('is_backup').setValue(false);
      template.updateValueAndValidity();
    }
  }

  setStartEndDateBackup(value, idx) {
    const templates = this.formSchedule.get('task_templates') as FormArray;
    const template = templates.at(idx);

    const start_date_backup = moment(value.end_date).subtract(1, 'days');
    const end_date_backup = value.end_date;

    template.get('start_date_backup').setValue(this.convertDate(start_date_backup.toDate()));
    template.get('end_date_backup').setValue(this.convertDate(end_date_backup));
  }

  verfication(event, idx) {
    if (event.checked) {
      this.backupTask({ checked: false }, idx);
    }
  }

  submit() {
    if (this.formSchedule.valid) {
      this.saveData = true;
      // let tradeProgram = this.formSchedule.get('trade_creator_id').value;
      // if (!tradeProgram['id']) return this.dialogService.openSnackBar({ message: `Data Trade Program "${tradeProgram}" tidak tersedia, mohon lakukan pencarian kembali!` })

      let body = {
        name: this.formSchedule.get('name').value,
        trade_creator_id: this.formSchedule.get('trade_creator_id').value,
        task_templates: this.formSchedule.get('task_templates').value.map(item => {
          // let template = item.task_template_id['id'];
          // if (!template) return this.dialogService.openSnackBar({ message: `Data Template Tugas "${item.task_template_id}" tidak tersedia, mohon lakukan pencarian kembali!` })

          return {
            ...item,
            is_backup: item.is_backup ? 1 : 0,
            is_verification: item.is_verification ? 1 : 0,
            is_verification_toggle: item.is_verification_toggle ? 1 : 0,
            is_verification_hq: item.is_verification_hq ? 1 : 0,
            notif: item.is_notif === 1 ? item.notif : 0,
            start_date: this.convertDate(item.start_date),
            end_date: this.convertDate(item.end_date)
          }
        })
      }

      let foundUndefined = body['task_templates'].some(item => item === undefined)
      if (!foundUndefined) {
        this.scheduleTradeProgramService.create(body).subscribe(
          res => {
            this.dialogService.openSnackBar({ message: 'Data Berhasil Disimpan' });
            this.router.navigate(['dte', 'schedule-trade-program']);
          },
          err => {
            console.log(err.error.message);
          }
        )
      }
    } else {
      this.dialogService.openSnackBar({ message: 'Silakan lengkapi data terlebih dahulu!' });
      commonFormValidator.validateAllFields(this.formSchedule);
    }
  }

  convertDate(param: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return "";
  }

}
