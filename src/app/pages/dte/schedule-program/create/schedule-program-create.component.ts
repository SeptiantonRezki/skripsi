import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DateAdapter, MatDatepicker } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from '../../../../services/dialog.service';
import { commonFormValidator } from '../../../../classes/commonFormValidator';
import { Subject, Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
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
  maxDateTemplate: any;

  searchTradeProgram = new Subject<string>();
  searchTemplateTask = new Subject<string>();

  listTradeProgram: Array<any>;
  listTemplateTask: Array<any>;
  listAudience: Array<any>;
  listReminder: Array<any> = [{ name: 'Tiap Minggu', value: 'by-weekly' }, { name: 'Tiap 2 Minggu', value: 'bi-weekly' }, { name: 'Tidak Ada', value: 'none' }];
  listNotification: Array<any> = [{ name: 'Ya', value: 1 }, { name: 'Tidak', value: 0 }];
  listAddNotif: Array<any> = [{ name: 'H+1', value: 1}, { name: 'H+2', value: 2}, { name: 'H+3', value: 3}];

  filteredTpOptions: Observable<string[]>;
  filteredTemplateOptions: Observable<string[]>;

  constructor(
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private scheduleTradeProgramService: ScheduleTradeProgramService
  ) { 
    this.adapter.setLocale("id");
    this.listTradeProgram = [];
    this.listTemplateTask = []

    this.formScheduleError = {
      name: {},
      trade_creator_id: {},
      task_templates: []
    }

    this.minDate = moment();

    this.searchTradeProgram.debounceTime(500)
    .flatMap(key => {
      return Observable.of(key).delay(300);
    })
    .subscribe(res => {
      this.filterTradeProgram(res);
    })

    this.searchTemplateTask.map(value => value)
    .debounceTime(500)
    .flatMap(key => {
      return Observable.of(key).delay(300);
    })
    .subscribe(res => {
      this.filterTemplateTask(res);
    })
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
  }

  createTaskTemplate(): FormGroup {
    return this.formBuilder.group({
      task_template_id: ["", Validators.required],
      coin_delivered: ["", Validators.required],
      coin_approved: ["", Validators.required],
      start_date: ["", Validators.required],
      end_date: ["", Validators.required],
      repeated: ["by-weekly", Validators.required],
      is_backup: [1, Validators.required],
      notif: [1, Validators.required]
    })
  }

  addTaskTemplate() {
    let template = this.formSchedule.get('task_templates') as FormArray;
    template.push(this.createTaskTemplate())
  }

  deleteTaskTemplate(idx) {
    let template = this.formSchedule.get('task_templates') as FormArray;
    template.removeAt(idx);
  }

  _filterTp(value): any[] {
    const filterValue = typeof value == "object" ? value.name.toLowerCase() : value.toLowerCase();
    return this.listTradeProgram.filter(item => item.name.toLowerCase().includes(filterValue));
  }

  _filterTemplate(value): any[] {
    const filterValue = typeof value == "object" ? value.name.toLowerCase() : value.toLowerCase();
    return this.listTemplateTask.filter(item => item.name.toLowerCase().includes(filterValue));
  }

  filterTradeProgram(param) {
    if(param.length >= 3) {
      this.scheduleTradeProgramService.getTradeProgram({ param: param }).subscribe(res => {
        this.listTradeProgram = res.data;
        this.filteredTpOptions = this.formSchedule.get("trade_creator_id").valueChanges.pipe(startWith(""), map(value => this._filterTp(value)));
      })
    } else {
      this.listTradeProgram = [];
      this.filteredTpOptions = this.formSchedule.get("trade_creator_id").valueChanges.pipe(startWith(""), map(value => this._filterTp(value)));
    }
  }

  filterTemplateTask(param) {
    let template = this.formSchedule.get('task_templates') as FormArray;
    if(param['value'].length >= 3) {
      this.scheduleTradeProgramService.getTemplate({ param: param['value'] }).subscribe(res => {
        this.listTemplateTask = res.data;
        this.filteredTemplateOptions = template.at(param['index']).get("task_template_id").valueChanges.pipe(startWith(""), map(value => this._filterTemplate(value)));
      })
    } else {
      this.listTemplateTask = [];
      this.filteredTemplateOptions = template.at(param['index']).get("task_template_id").valueChanges.pipe(startWith(""), map(value => this._filterTemplate(value)));
    }
  }

  displayTpName(param?): any {
    return param ? param.name : param;
  }

  displayTemplateName(param?): any {
    return param ? param.name : param;
  }

  setMinDate(idx) {
    let template = this.formSchedule.get('task_templates') as FormArray;
    template.at(idx).get('end_date').setValue('');
  }

  setMaxDate(dateSelected) {
    return moment(dateSelected).add(7, 'days');
  }

  changeValue(idx) {
    let template = this.formSchedule.get('task_templates') as FormArray;

    if (template.at(idx).get('is_backup').value === 0) 
      template.at(idx).get('notif').disable();
    else 
    template.at(idx).get('notif').enable();
  }

  submit() {
    if (this.formSchedule.valid) {
      let tradeProgram = this.formSchedule.get('trade_creator_id').value;
      if (!tradeProgram['id']) return this.dialogService.openSnackBar({ message: `Data Trade Program "${tradeProgram}" tidak tersedia, mohon lakukan pencarian kembali!` })
      
      let body = {
        name: this.formSchedule.get('name').value,
        trade_creator_id: this.formSchedule.get('trade_creator_id').value['id'],
        task_templates: this.formSchedule.get('task_templates').value.map(item => {
          let template = item.task_template_id['id'];
          if (!template) return this.dialogService.openSnackBar({ message: `Data Template Tugas "${item.task_template_id}" tidak tersedia, mohon lakukan pencarian kembali!` })

          return {
            task_template_id: item.task_template_id['id'],
            coin_delivered: item.coin_delivered,
            coin_approved: item.coin_approved,
            start_date: this.convertDate(item.start_date),
            end_date: this.convertDate(item.end_date),
            repeated: item.repeated,
            is_backup: item.is_backup,
            notif: item.is_backup === 1 ? item.notif : null
          }
        })
      }

      let foundUndefined = body['task_templates'].some(item => item === undefined)
      if(!foundUndefined) {
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
    }
  }

  convertDate(param: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return "";
  }

}
