import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ReplaySubject, Subject, Observable } from 'rxjs';
import { MatSelect, DateAdapter, MatDialog, MatDialogConfig } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { ScheduleTradeProgramService } from 'app/services/dte/schedule-trade-program.service';
import * as moment from 'moment';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { takeUntil } from 'rxjs/operators';
import { ListAudienceDialogComponent } from '../dialog/list-audience-dialog.component';

@Component({
  selector: 'app-schedule-program-edit',
  templateUrl: './schedule-program-edit.component.html',
  styleUrls: ['./schedule-program-edit.component.scss']
})
export class ScheduleProgramEditComponent {

  idScheduler: any;
  dataScheduler: any;
  dialogRef: any;

  listTradeProgram: Array<any>;
  listTemplateTask: Array<any>;
  onLoad: Boolean = true;

  formSchedule: FormGroup;
  formScheduleError: any;
  minDate: any;
  maxStartDateTemplate: any;
  maxDateTemplate: any;

  listAudience: Array<any>;
  
  listReminder: Array<any> = [{ name: 'Tiap Minggu', value: 'by-weekly' }, { name: 'Tiap 2 Minggu', value: 'bi-weekly' }, { name: 'Tidak Ada', value: 'none' }];
  listNotification: Array<any> = [{ name: 'Ya', value: 1 }, { name: 'Tidak', value: 0 }];
  listAddNotif: Array<any> = [{ name: 'H+1', value: 1}, { name: 'H+2', value: 2}, { name: 'H+3', value: 3}];

  public filterTP: FormControl = new FormControl();
  public filteredTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filterTask: FormControl = new FormControl();
  public filteredTask: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect') singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();
  
  valueChange: Boolean;
  saveData: Boolean;

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

  constructor(
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private scheduleTradeProgramService: ScheduleTradeProgramService
  ) { 
    activatedRoute.url.subscribe(param => {
      this.idScheduler = param[2].path;
    })

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
  }

  ngOnInit() {

    this.formSchedule = this.formBuilder.group({
      trade_creator_id: ["", Validators.required],
      task_templates: this.formBuilder.array([], Validators.required),
    })

    this.scheduleTradeProgramService.getDetail(this.idScheduler).subscribe(res => {
      this.dataScheduler = res; 
      this.onLoad = false;

      if (res.status_berjalan !== 'no') {
        let status = res.status_berjalan === 'yes' ? 'sudah berjalan' : (res.status_berjalan === 'expired' ? 'sudah berakhir' : '');
        this.dialogService.openSnackBar({ message: `Tidak dapat mengubah tanggal penjadwalan karena status ${status}.` });
        this.router.navigate(['dte', 'schedule-trade-program']);
      }
      
      this.formSchedule.controls['trade_creator_id'].setValue(res.trade_creator_id);
      
      let task_templates = this.formSchedule.controls['task_templates'] as FormArray;
      res.templates.map(item => {
        return task_templates.push(this.formBuilder.group({
          coin_approved: [item.coin_approved],
          coin_delivered: [item.coin_delivered],
          end_date: [item.end_date, Validators.required],
          start_date: [item.start_date, Validators.required],
          trade_scheduler_template_id: [item.trade_scheduler_template_id],
          task_template_name: [item.task_template_name]
        }))
      })

      let tradeProgram = this.listTradeProgram.filter(item => item.id == res.trade_creator_id)[0];
      this.minDate = tradeProgram['start_date'];
      this.maxStartDateTemplate = tradeProgram['end_date'];
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

  getTradeProgram() {
    let tradeProgramId = this.formSchedule.get('trade_creator_id').value;
    let tradeProgram = this.listTradeProgram.filter(item => item.id === tradeProgramId)[0];
    
    this.minDate = tradeProgram['start_date'];
    this.maxStartDateTemplate = tradeProgram['end_date'];
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

  openListAudience(item) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = item;

    this.dialogRef = this.dialog.open(ListAudienceDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => { })
  }

  submit() {
    if (this.formSchedule.valid) {
      this.saveData = true;

      let body = {
        trade_creator_id: this.formSchedule.get('trade_creator_id').value,
        task_templates: this.formSchedule.get('task_templates').value.map(item => {
          return {
            start_date: this.convertDate(item.start_date),
            end_date: this.convertDate(item.end_date),
            trade_scheduler_template_id: item.trade_scheduler_template_id
          }
        })
      }

      this.scheduleTradeProgramService.putDate(body, { schedule_tp_id: this.idScheduler }).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: 'Data berhasil diubah' });
          this.router.navigate(['dte', 'schedule-trade-program']);
        },
        err => {
          console.log(err.error.message);
        }
      )
    } else {
      this.dialogService.openSnackBar({ msg: 'Silakan lengkapi data terlebih dahulu.' });
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
