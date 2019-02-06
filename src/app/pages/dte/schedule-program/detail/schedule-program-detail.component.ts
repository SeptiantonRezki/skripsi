import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DateAdapter, MatDialogConfig, MatDialog, MatSelect } from '@angular/material';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { ScheduleTradeProgramService } from 'app/services/dte/schedule-trade-program.service';
import { ListAudienceDialogComponent } from '../dialog/list-audience-dialog.component';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { ImportCoinComponent } from '../import-coin/import-coin.component';
import { PagesName } from 'app/classes/pages-name';

@Component({
  selector: 'app-schedule-program-detail',
  templateUrl: './schedule-program-detail.component.html',
  styleUrls: ['./schedule-program-detail.component.scss']
})
export class ScheduleProgramDetailComponent {
  idScheduler: any;
  dataScheduler: any;
  dialogRef: any;

  listTradeProgram: Array<any>;
  listTemplateTask: Array<any>;
  onLoad: Boolean = true;
  showLoading: Boolean;

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

  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild('singleSelect') singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();
  
  valueChange: Boolean;
  saveData: Boolean;

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private scheduleTradeProgramService: ScheduleTradeProgramService
  ) { 
    this.permission = this.roles.getRoles('principal.importcoin');
    console.log(this.permission);

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
    this.scheduleTradeProgramService.getDetail(this.idScheduler).subscribe(res => {
      this.dataScheduler = res; 
      this.onLoad = false;
    })

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

  submitUpdate() {
    if (this.formSchedule.valid) {
      this.saveData = !this.saveData;
      // let tradeProgram = this.formSchedule.get('trade_creator_id').value;
      // if (!tradeProgram['id']) return this.dialogService.openSnackBar({ message: `Data Trade Program "${tradeProgram}" tidak tersedia, mohon lakukan pencarian kembali!` })
      
      let body = {
        name: this.formSchedule.get('name').value,
        trade_creator_id: this.formSchedule.get('trade_creator_id').value,
        task_templates: this.formSchedule.get('task_templates').value.map(item => {
          // let template = item.task_template_id['id'];
          // if (!template) return this.dialogService.openSnackBar({ message: `Data Template Tugas "${item.task_template_id}" tidak tersedia, mohon lakukan pencarian kembali!` })

          return {
            task_template_id: item.task_template_id,
            coin_delivered: item.coin_delivered,
            coin_approved: item.coin_approved,
            start_date: this.convertDate(item.start_date),
            end_date: this.convertDate(item.end_date),
            repeated: item.repeated,
            is_backup: 0,
            notif: item.is_backup === 1 ? item.notif : 0
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

  submit() {
    let body = {
      _method: 'PUT',
      status_scheduler: 'publish'
    }

    this.scheduleTradeProgramService.put(body, {schedule_tp_id: this.idScheduler}).subscribe(
      res => {
        this.dialogService.openSnackBar({ message: 'Status Berhasil diubah' });
        this.router.navigate(['dte', 'schedule-trade-program']);
      },
      err => {
        console.log(err.error.message)
      }
    )
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

  export() {
    
    const body = {
      trade_scheduler_id: this.dataScheduler.id,
      trade_creator_id: this.dataScheduler.trade_creator_id
    }

    this.showLoading = true;
    this.scheduleTradeProgramService.downloadExcel(body).subscribe(res => {
      // window.open(res.data, "_blank");
      // const link = document.createElement('a');
      // link.target = '_blank';
      // link.href = res.data;
      // link.setAttribute('visibility', 'hidden');
      // link.click();
      
      this.downloadLink.nativeElement.href = res.data;
      this.downloadLink.nativeElement.click();
      this.showLoading = false;
      // console.log(res);
    })
  }

  import() {

    if (this.dataScheduler.status_berjalan === "expired") {
      return this.dialogService.openSnackBar({ message: `Tidak dapat adjust coin karna status scheduler trade program telah ${this.dataScheduler.status_berjalan}` });
    }

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'adjustment-coin-dialog';
    dialogConfig.data = this.dataScheduler;;

    this.dialogRef = this.dialog.open(ImportCoinComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => { 
      if (response) {
        this.dialogService.openSnackBar({ message: "Data berhasil disimpan" });
      }
    })
  }
}
