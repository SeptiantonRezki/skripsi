import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { DialogService } from "../../../../services/dialog.service";
import { ActivatedRoute } from "@angular/router";
import { DataService } from "app/services/data.service";
import * as _ from 'underscore';
import { SequencingService } from '../../../../services/dte/sequencing.service';
import { Subject, ReplaySubject } from "rxjs";
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { Page } from 'app/classes/laravel-pagination';
import { ImportTsmCoinComponent } from '../import-coin/import-tsm-coin.component';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-task-sequencing-edit',
  templateUrl: './task-sequencing-edit.component.html',
  styleUrls: ['./task-sequencing-edit.component.scss']
})
export class TaskSequencingEditComponent implements OnInit, OnDestroy {
  dialogRef: any;

  minDateTask: any;
  maxDateTask: any;
  submitting: any;
  taskSequenceForm: FormGroup;
  programs: any[];
  audiences: any[];
  detailSequencing: any;
  data: any;
  actions: any[];
  maxDate: any;
  minDate: any;

  isDetail: Boolean;
  ENABLE_EXPORT_IF = ['done', 'failed'];

  private _onDestroy = new Subject<void>();
  public filterGTP: FormControl = new FormControl();
  public filteredGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filterGTA: FormControl = new FormControl();
  public filteredGTA: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  pagination: Page = new Page();

  @ViewChild('downloadLink') downloadLink: ElementRef;

  pageName = this.translate.instant('dte.task_sequencing.text1');
  titleParam = {entity: this.pageName};

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private sequencingService: SequencingService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {

    activatedRoute.url.takeUntil(this._onDestroy).subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    this.detailSequencing = this.dataService.getFromStorage('detail_task_sequencing');

  }

  ngOnInit() {
    this.taskSequenceForm = this.formBuilder.group({
      id: ["", Validators.required],
      name: ["", Validators.required],
      trade_creator_id: ["", Validators.required],
      trade_audience_group_id: ["", Validators.required],
      start_date: ["", Validators.required],
      start_time: ["", Validators.required],
      end_date: ["", Validators.required],
      end_time: ["", Validators.required],
      trade_creator_name: ["", Validators.required],
      is_editable: [0],
      total_budget: ["", Validators.required],
      endDateTrade: ["", Validators.required],
      trade_audience_group_name: ["", Validators.required],
      current_week: ["", Validators.required],
      total_week: ["", Validators.required],
      status: ["", Validators.required],
      export_coin_status: [""],
      export_coin_result: [""],
      import_coin_status: [""],
      import_coin_status_type: [""],
    })

    this.filterGTP.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringGTP();
      });

    this.filterGTA.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringGTA();
      });

    this.setValue();
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
        matOption[index].querySelector('span').id = 'options';
      }
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  setValue() {
    this.sequencingService.show({ sequencing_id: this.detailSequencing.id }).subscribe(res => {
      this.data = res.data;
      this.taskSequenceForm.patchValue({
        id: this.data.id,
        name: this.data.name,
        trade_creator_id: this.data.trade_creator_id,
        trade_audience_group_id: this.data.trade_audience_group_id,
        start_date: this.data.start_date,
        start_time: moment(this.data.start_date).format("HH:mm"),
        end_date: this.data.end_date,
        end_time: moment(this.data.end_date).format("HH:mm"),
        is_editable: this.data.is_editable,
        trade_creator_name: this.data.trade_creator_name,
        total_budget: this.data.total_budget,
        trade_audience_group_name: this.data.trade_audience_group_name,
        current_week: this.data.current_week,
        total_week: this.data.total_week,
        status: this.data.status,
        export_coin_status: this.data.export_coin_status,
        export_coin_result: this.data.export_coin_result,
        import_coin_status: this.data.import_coin_status,
        import_coin_status_type: (this.data.import_coin_status_type) ? this.data.import_coin_status_type : '',
      });
      this.actions = res.data.actions;
      this.getTradePrograms(this.data.trade_creator_name);
      this.getTradeAudience(this.data.trade_audience_group_name);

      if (this.isDetail) {
        this.taskSequenceForm.disable();
      }
    });
  }

  selectChange(e: any) {
    const theIndex = this.programs.findIndex(x => x.id === e.value);
    console.log(this.programs[theIndex]);
    this.setDate(this.programs[theIndex].end_date);
    this.taskSequenceForm.patchValue({
      trade_creator_name: this.programs[theIndex].name,
      total_budget: this.programs[theIndex].budget,
      endDateTrade: this.programs[theIndex].end_date,
      status: "unpublish",
    });
  }

  setDate(d: any) {
    this.maxDate = moment(d).format('YYYY-MM-DD');
    this.minDate = moment(new Date()).format('YYYY-MM-DD');
  }

  selectChangeAudince(e: any) {
    const theIndex = this.audiences.findIndex(x => x.id === e.value);
    console.log(this.audiences[theIndex]);
    this.taskSequenceForm.patchValue({
      trade_audience_group_name: this.audiences[theIndex].name
    });
  }

  formatDate(val: any) {
    var d = new Date(val);
    let date = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + (d.getDate())).slice(-2)].join('-');
    return date;
  }

  submit() {
    this.taskSequenceForm
      .get("start_date")
      .patchValue(
        `${moment(this.taskSequenceForm.value.start_date).format(
          "YYYY-MM-DD"
        )} ${this.taskSequenceForm.value.start_time}:00`
      );
    this.taskSequenceForm
      .get("end_date")
      .patchValue(
        `${moment(this.taskSequenceForm.value.end_date).format(
          "YYYY-MM-DD"
        )} ${this.taskSequenceForm.value.end_time}:00`
      );
    this.taskSequenceForm.value.actions = this.actions;
    this.dataService.setDataSequencing({
      data: this.taskSequenceForm.value,
    });
  }

  filteringGTP() {
    if (!this.programs) {
      return;
    }
    // get the search keyword
    let search = this.filterGTP.value;

    this.pagination.per_page = 30;
    this.pagination.search = search;
    this.sequencingService.getListTradePrograms(this.pagination).subscribe(
      (res) => {
        console.log(res);
        this.programs = res.data.data;
        this.filteredGTP.next(this.programs.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    )
    // filter the banks
    this.filteredGTP.next(
      this.programs.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getTradePrograms(param?: any) {
    this.pagination.search = !!param ? param : null;
    this.pagination.per_page = 30;
    this.sequencingService.getListTradePrograms(this.pagination).subscribe(
      (res) => {
        // console.log("res trade programs", res);
        this.programs = res.data.data;
        this.filteredGTP.next(this.programs.slice());
        // this.programs = res.data;
      },
      (err) => {
        console.log("err trade programs", err);
      }
    );
  }

  filteringGTA() {
    if (!this.audiences) {
      return;
    }
    // get the search keyword
    let search = this.filterGTA.value;

    this.pagination.per_page = 30;
    this.pagination.search = search;
    this.sequencingService.getListTradeAudienceGroup(this.pagination).subscribe(
      (res) => {
        console.log(res);
        this.audiences = res.data.data;
        this.filteredGTA.next(this.audiences.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    )
    // filter the banks
    this.filteredGTA.next(
      this.audiences.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getTradeAudience(param?: any) {
    this.pagination.search = !!param ? param : null;
    this.pagination.per_page = 30;
    this.sequencingService.getListTradeAudienceGroup(this.pagination).subscribe(
      (res) => {
        // console.log("res trade programs", res);
        this.audiences = res.data.data;
        this.filteredGTA.next(this.audiences.slice());
        // this.audiences = res.data;
      },
      (err) => {
        console.log("err trade programs", err);
      }
    );
  }

  export() {
    // if (  this.taskSequenceForm.get('export_coin_result').value) {

    //   this.downloadLink.nativeElement.href = this.taskSequenceForm.get('export_coin_result').value;
    //   this.downloadLink.nativeElement.click();

    // } else {

      this.dataService.showLoading(true);
      const body = {
        trade_creator_id: this.data.trade_creator_id,
        task_sequencing_management_id: this.data.id
      }
      this.sequencingService.downloadAdjustmentCoin(body).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: `Request file berhasil.`,
        });
        // this.refreshRequestingFileStatus();
        // this.downloadLink.nativeElement.href = res.data;
        // this.downloadLink.nativeElement.click();
      }, err => {
        this.dataService.showLoading(false);
      })

    // }
  }

  checkReminder() {
    const body = {
      task_sequencing_management_id : this.data.id,
      trade_creator_id : this.data.trade_creator_id,
      per_page : 15,
    };

    this.sequencingService.getImportPreviewAdjustmentCoin(body).subscribe(res => {
      if (res.data.last_request) {
        const date = String(moment(res.data.last_request).format('DD MMMM YYYY'));

        let data = {
          titleDialog: this.translate.instant('dte.task_sequencing.coin_adjustment_confirm', {date: date}),
          captionDialog: "",
          confirmCallback: this.import.bind(this, true),
          buttonText: [this.translate.instant('global.button.yes_continue'), this.translate.instant('global.button.cancel')]
        };
        this.dialogService.openCustomConfirmationDialog(data);
      } else {
        this.import(false);
      }
    }, err => {
      console.log(err);
      this.import(false);
    });
  }

  import(isReminder: any) {
    if (isReminder) {
      this.dialogService.brodcastCloseConfirmation();
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'adjustment-coin-dialog';
    dialogConfig.data = { ...this.data, is_tsm: true };

    this.dialogRef = this.dialog.open(ImportTsmCoinComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.setValue();
        this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
      }
    })
  }

  refreshRequestingFileStatus() {

    this.sequencingService.show({ sequencing_id: this.detailSequencing.id }).subscribe(res => {

      if ( !this.ENABLE_EXPORT_IF.includes(res.data.export_coin_status) ) {
        setTimeout(() => {
          this.refreshRequestingFileStatus();
        }, 1000);

      } else {
        this.taskSequenceForm.get('export_coin_status').setValue(res.data.export_coin_status);
        this.taskSequenceForm.get('export_coin_result').setValue(res.data.export_coin_result);
      }

    }, err => {});

  }

}
