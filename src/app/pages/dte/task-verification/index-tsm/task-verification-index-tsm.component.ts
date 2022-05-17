import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DialogService } from 'app/services/dialog.service';
import { DateAdapter, MatDialogConfig, MatDialog } from '@angular/material';
import moment from 'moment';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { IdleService } from 'app/services/idle.service';
import { TaskVerificationService } from 'app/services/dte/task-verification.service';
import { ConfirmDialogTsmComponent } from '../dialog/confirm-dialog-tsm/confirm-dialog-tsm.component';
import { SequencingService } from 'app/services/dte/sequencing.service';
import * as CryptoJS from 'crypto-js';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-task-verification-index-tsm',
  templateUrl: './task-verification-index-tsm.component.html',
  styleUrls: ['./task-verification-index-tsm.component.scss']
})
export class TaskVerificationIndexTsmComponent implements OnInit {

  onLoad: boolean;
  loadingIndicator: boolean;

  permissionVerifikasiMisi: any;
  permissionVerifikasiMisiAll: any;
  permissionReleaseCoin: any;
  roles: PagesName = new PagesName();

  rows: any[];
  keyUp = new Subject<string>();

  table: DatatableComponent;
  reorderable = true;
  pagination: Page = new Page();
  offsetPagination: any;

  formFilter: FormGroup;

  minDate: any;

  statusFilter: any[] = [
    { name: this.translate.instant('dte.pengatur_jadwal_program.text2'), value: 'day' },
    { name: this.translate.instant('dte.pengatur_jadwal_program.text3'), value: 'mounth' },
    { name: this.translate.instant('dte.pengatur_jadwal_program.text4'), value: 'year' }
  ];

  listStatuses: any[] = [
    { name: this.translate.instant('dte.pengatur_jadwal_program.text7'), value: "" },
    { name: this.translate.instant('dte.pengatur_jadwal_program.text8'), value: 'publish' },
    { name: this.translate.instant('dte.pengatur_jadwal_program.text9'), value: 'unpublish' },
    { name: this.translate.instant('dte.pengatur_jadwal_program.text10'), value: 'draft' }
  ];

  dialogRef: any;
  @ViewChild('downloadLink') downloadLink: ElementRef;
  pageName = this.translate.instant('dte.task_verification.mission_verification_tsm')
  titleParam = {entity: this.pageName}

  constructor(
    private dialogService: DialogService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private userIdle: IdleService,
    private taskVerificationService: TaskVerificationService,
    private dialog: MatDialog,
    private sequencingService: SequencingService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.adapter.setLocale('id');
    this.rows = [];
    this.onLoad = true;
    this.loadingIndicator = true;

    this.permissionVerifikasiMisi = this.roles.getRoles('principal.dtetaskverification');
    this.permissionVerifikasiMisiAll = this.roles.getRoles('principal.dtetaskverificationall');
    this.permissionReleaseCoin = this.roles.getRoles('principal.dtetaskverificationreleasecoin');

    this.keyUp.debounceTime(500)
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(res => {
        this.updateFilter(res);
      });
  }

  ngOnInit() {
    this.getListTaskVerification();

    this.formFilter = this.formBuilder.group({
      filter: 'day',
      start_date: '',
      end_date: '',
      status: '',
    });
  }

  updateFilter(string?) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage('page');
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.pagination['type'] = this.convertDate(this.formFilter.get('start_date').value) ||
      this.convertDate(this.formFilter.get('end_date').value) ? this.formFilter.get('filter').value : '';
    this.pagination.start_date = this.convertDate(this.formFilter.get('start_date').value);
    this.pagination.end_date = this.convertDate(this.formFilter.get('end_date').value);
    this.pagination['status'] = this.formFilter.get('status').value;

    this.taskVerificationService.getTsm(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  getListTaskVerification() {
    const page = this.dataService.getFromStorage('page');
    const sort_type = this.dataService.getFromStorage('sort_type');
    const sort = this.dataService.getFromStorage('sort');

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.taskVerificationService.getTsm(this.pagination).subscribe(
      res => {
        console.log('1');
        if (res.total < res.per_page && page !== 1) {
          this.dataService.setToStorage('page', 1);
          this.getListTaskVerification();
        } else {
          Page.renderPagination(this.pagination, res);
          this.rows = res.data;
          this.onLoad = false;
          this.loadingIndicator = false;
        }

        setTimeout(() => {
          this.addObjectToTable();
        }, 2000);
      }, err => {
        console.error(err);
        this.onLoad = false;
        this.loadingIndicator = false;
      }
    );
  }

  addObjectToTable(){
    document.querySelector("datatable-body").id = "datatable-body";
    let tableTSM = document.getElementById("datatable-tsm");
    
    let rows = tableTSM.querySelectorAll("datatable-row-wrapper");
    for (let index = 0; index < rows.length; index++) {
      // let numberRow = index + 1;
      rows[index].id = 'data-row-tsm';
      // rows[index].id = 'data-row-tsm-'+String(numberRow);

      let cells = rows[index].querySelectorAll("datatable-body-cell");
      for (let indexCell = 0; indexCell < cells.length; indexCell++) {
        cells[indexCell].id = 'data-cell-tsm';
        // cells[indexCell].id = 'data-cell-tsm-'+String(numberRow)+'-'+String(indexCell+1);          
      }
    }
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return '';
  }

  setMinDate(e) { }

  openConfirmDialog(item: any, popupType: string) {
    const dialogConfig = new MatDialogConfig();
    item.popupType = popupType;

    // TODO: UNTUK MENANDAKAN PERSONALIZED ATAU TIDAK
    // const data = item;
    // if (item.task_sequencing_management_type === 'personalization') {
    //   data.submission_id = item.submission_id;
    // }
    // dialogConfig.data = data;

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = item;

    this.dialogRef = this.dialog.open(ConfirmDialogTsmComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.getListTaskVerification();
      }
    });
  }

  async export(item) {
    this.dataService.showLoading({ show: true });

    let params = {
      task_sequencing_management_id: item.task_sequencing_management_id,
      task_sequencing_management_template_id: item.task_sequencing_management_template_id,
      rand: "",
      last: "true"
    }

    try {
      const response = await this.taskVerificationService.exportTrueTsm(params).toPromise();    
      const newBlob = new Blob([response], { type: 'application/zip' });
      const url= window.URL.createObjectURL(newBlob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().getTime();
      const getTime = moment(timestamp).format("HHmmss");
      const encrypTime = CryptoJS.AES.encrypt(getTime, "timestamp").toString();
      link.download = `Export_${item.task_sequencing_management_name}-${encrypTime}.zip`;
      
      // this is necessary as link.click() does not work on the latest firefox
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

      setTimeout(function () {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 100);

      this.dataService.showLoading(false);
    } catch (error) {
      console.log("err", error);
      this.dataService.showLoading(false);
      throw error;
    }
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.taskVerificationService.getTsm(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.pagination['type'] = this.formFilter.get('filter').value;
    this.pagination.start_date = this.convertDate(this.formFilter.get('start_date').value);
    this.pagination.end_date = this.convertDate(this.formFilter.get('end_date').value);
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.taskVerificationService.getTsm(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  isDisableVerification(row) {
    if (row.task_sequencing_management_template_quiz === 1) return true;

    if (row.task_need_verify === 0) {
      return true;
    } else {
      return false;
    }
  }

  isDisableReleaseCoin(row) {
    if (row.task_sequencing_management_template_quiz === 1) return true;

    if (row.task_need_coin === 0) {
      return true;
    } else {
      return false;
    }
  }

}
