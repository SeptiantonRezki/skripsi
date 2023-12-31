import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import moment from 'moment';
import { FormGroup, FormBuilder } from '../../../../../../node_modules/@angular/forms';
import { PagesName } from 'app/classes/pages-name';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from "@ngx-translate/core";
import { SpinTheWheelService } from 'app/services/dte/spin-the-wheel.service';
import { HttpErrorResponse } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-spin-the-wheel',
  templateUrl: './spin-the-wheel.component.html',
  styleUrls: ['./spin-the-wheel.component.scss']
})
export class SpinTheWheelComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();
  dateNow: any;

  listLevelArea: any[];
  list: any;
  areaFromLogin;
  formFilter: FormGroup;
  filterArea: Boolean;

  permission: any;
  roles: PagesName = new PagesName();

  offsetPagination: any;
  area_id_list: any = [];

  // 2 geotree property
  endArea: String;
  lastLevel: any;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private translate: TranslateService,
    private spinService: SpinTheWheelService,
  ) {
    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
  }

  ngOnInit() {
    this.getSpinList();
  }

  getSpinList() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.spinService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data.data : [];

        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
        this.onLoad = false;
      }
    );
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

    this.spinService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.spinService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.spinService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage('spin_the_wheel', param);
    this.router.navigate(['dte', 'spin-the-wheel', 'edit', param.id]);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage('spin_the_wheel', param);
    this.router.navigate(['dte', 'spin-the-wheel', 'detail', param.id]);
  }

  // export(row) {
  //   this.dataService.showLoading(true);
  //   this.spinService.exportSpin({id: row.id}).subscribe(({data}) => {

  //     console.log({data});
  //     this.downLoadFile(data.file);
  //     this.dataService.showLoading(false);

  //   }, err => {

  //     this.dataService.showLoading(false);
  //   })
  // }

  // downLoadFile(url) {

  //   var link = document.createElement('a');
  //   link.href = url;
  //   // link.download = fileName;
  //   // this is necessary as link.click() does not work on the latest firefox
  //   link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

  //   setTimeout(function () {
  //     // For Firefox it is necessary to delay revoking the ObjectURL
  //     window.URL.revokeObjectURL(url);
  //     link.remove();
  //   }, 100);
  // }

  async export(row) {
    try {
      const response = await this.spinService.exportSpin({ id: row.id }).toPromise();
      const timestamp = new Date().getTime();
      const getTime = moment(timestamp).format("HHmmss");
      const encryptTime = CryptoJS.AES.encrypt(getTime, "timestamp").toString();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `ExportSpinTheWheel_${encryptTime}.xlsx`);

      this.dataService.showLoading(false);
    } catch (error) {
      console.log(error);
      this.handleError(error);
      this.dataService.showLoading(false);
      // throw error;
    }
  }

  downLoadFile(data: any, type: string, fileName: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    const newBlob = new Blob([data], { type: type });
    const url= window.URL.createObjectURL(newBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }

  handleError(error) {
    console.log('Here')
    console.log(error)

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
    // alert('Open console to see the error')
  }

  deleteTp(id) {
    this.id = id;
    let data = {
      titleDialog: 'Hapus Spin The Wheel',
      captionDialog: 'Apakah anda yakin untuk menghapus data ini?',
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [ this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel') ]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.spinService.delete({ id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getSpinList();

        this.dialogService.openSnackBar({ message: 'Berhasil' });
      }
    });
  }

}
