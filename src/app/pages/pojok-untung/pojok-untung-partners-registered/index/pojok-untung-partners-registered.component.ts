import { Component, OnInit, ViewChild, TemplateRef, Input, EventEmitter } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Router } from '@angular/router';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import {map, startWith, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import { DataService } from 'app/services/data.service';
import { PagesName } from 'app/classes/pages-name';
import { DialogService } from 'app/services/dialog.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PojokUntungPartnersRegisteredService } from 'app/services/pojok-untung/pojok-untung-partners-registered.service';
import { PojokUntungPartnersListService } from 'app/services/pojok-untung/pojok-untung-partners-list.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { PojokUntungPartnersRegisteredImportDialogComponent } from '../pojok-untung-partners-registered-import-dialog/pojok-untung-partners-registered-import-dialog.component';

@Component({
  selector: 'app-pojok-untung-partners-registered',
  templateUrl: './pojok-untung-partners-registered.component.html',
  styleUrls: ['./pojok-untung-partners-registered.component.scss']
})
export class PojokUntungPartnersRegisteredComponent implements OnInit {
  formFilter: FormGroup;
  loadingIndicator = true;
  loadingSearch = false;
  onDeleting = null;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  offsetPagination: any;
  partner_type: any = -9;
  defaultPartnerType: any[] = [{ id: -9, label: "Semua Jenis Partner" }];
  defaultPartnerId: any[] = [{ id: '', partner_name: "Semua Partner" }];
  defaultStatus: any[] = [{ id: '', label: "Semua Status" }];
  formImportRegistered: FormGroup;

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild('table') table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;
  
  partnerTypeList: any[];
  partnerIdList: any[];
  statusList: any[];

  rows: any[];

  permission: any;
  roles: PagesName = new PagesName();

  selected: any[] = [];
  dialogRef: any;
  onRowsSelected = new EventEmitter<any>();
  dataType: any;
  loaded: Boolean;


  constructor(
    private ls: LanguagesService,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private PojokUntungPartnersRegisteredService: PojokUntungPartnersRegisteredService,
    private PojokUntungPartnersListService: PojokUntungPartnersListService,
    private dialog: MatDialog,
  ) { 
    this.permission = this.roles.getRoles('principal.pojokuntung_registered_partner');
    const observable = this.keyUp.debounceTime(1000)
    .distinctUntilChanged()
    .flatMap(search => {
      return Observable.of(search).delay(500);
    })
    .subscribe(data => {
      this.updateFilter('search', data);
    });
  
    this.formFilter = this.formBuilder.group({
      partner_type: '',
      partner_id: '',
      status: ''
    });
  }

  ngOnInit() {
    this.initFormFilter();
    this.getPartnerTypeList();
    this.getPartnerIdList();
    this.getStatusList();
    this.getList(true);
    // this.initImportRegistered();

    // this.formImportRegistered.get('partner_id')
    //   .valueChanges
    //   .subscribe(res => {
    //     if (res && this.loaded) {
    //       this.loaded = false;
    //     }
    //   })
  }

  initFormFilter() {
    this.formFilter.get('partner_type').setValue(this.defaultPartnerType[0].id);
    this.formFilter.get('partner_id').setValue(this.defaultPartnerId[0].id);
    this.formFilter.get('status').setValue(this.defaultStatus[0].id);
  }

  getPartnerTypeList() {
    this.PojokUntungPartnersRegisteredService.getPartnerType({partner_type: this.partner_type}).subscribe(res => {
      this.partnerTypeList = this.defaultPartnerType.concat(res.data);
    }, err=> { })
  }

  getPartnerIdList() {
    this.PojokUntungPartnersListService.get({partner_type: this.partner_type}).subscribe(res => {
      this.partnerIdList = this.defaultPartnerId.concat(res.data.data);
    }, err=> { })
  }

  getStatusList() {
    this.PojokUntungPartnersRegisteredService.getStatus({}).subscribe(res => {
      this.statusList = this.defaultStatus.concat(res.data.status);
    }, err=> { })
  }

  updateFilter(string, value) {
    this.loadingIndicator = true;

    if (string === 'search') {
      this.pagination.search = value;
    }
    if (string === 'partner_type') {
      this.pagination.partner_type = value;
    }
    if (string === 'partner_id') {
      this.pagination.partner_id = value;
    }
    if (string === 'status') {
      if (value === 0) {
        this.pagination.status = '0';
      } else {
        this.pagination.status = value;
      }
    }

    if (value) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page_pojok_untung_partners_registered");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }
    this.PojokUntungPartnersRegisteredService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  changeFilteredData(param?: any, type?: any){
    if (type === 'partner_type') {
      this.formFilter.get('partner_id').setValue(this.defaultPartnerId[0].id, {emitEvent: false});
      // this.formFilter.get('status').setValue(this.defaultStatus[0].id, {emitEvent: false});
      this.pagination.partner_id = '';
      // this.pagination.status = '';
    }
    // if (type === 'partner_id') {
    //   this.formFilter.get('status').setValue(this.defaultStatus[0].id, {emitEvent: false});
    //   this.pagination.status = '';
    // }

    // this.dataService.setToStorage("filter_partners_registered", param);
    this.updateFilter(type, param);
  }

  getList(resetPage?) {
    this.pagination.page = resetPage ? 1 : this.dataService.getFromStorage("page_pojok_untung_partners_registered");
    this.pagination.sort_type = resetPage ? null : this.dataService.getFromStorage("sort_type_pojok_untung_partners_registered");
    this.pagination.sort = resetPage ? null : this.dataService.getFromStorage("sort_pojok_untung_partners_registered");
    
    if (!this.pagination.partner_type) {
      this.pagination.partner_type = '-9';
    }

    this.dataService.setToStorage("page_pojok_untung_partners_registered", this.pagination.page);
    this.dataService.setToStorage("sort_type_pojok_untung_partners_registered", this.pagination.sort_type);
    this.dataService.setToStorage("sort_pojok_untung_partners_registered", this.pagination.sort);

    this.offsetPagination = this.pagination.page ? (this.pagination.page - 1) : 0;
    this.PojokUntungPartnersRegisteredService.get(this.pagination).subscribe(
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

    if (!this.pagination.partner_type) {
      this.pagination.partner_type = '-9';
    }

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page_pojok_untung_partners_registered", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page_pojok_untung_partners_registered");
    }
    this.PojokUntungPartnersRegisteredService.get(this.pagination).subscribe(
      res => {
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

    if (!this.pagination.partner_type) {
      this.pagination.partner_type = '-9';
    }

    this.dataService.setToStorage("page_pojok_untung_partners_template", this.pagination.page);
    this.dataService.setToStorage("sort_pojok_untung_partners_template", event.column.prop);
    this.dataService.setToStorage("sort_type_pojok_untung_partners_template", event.newValue);
    this.PojokUntungPartnersRegisteredService.get(this.pagination).subscribe(
      res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  async export() {
    this.dataService.showLoading(true);
    let fd = {
      partner_type: this.pagination.partner_type ? this.pagination.partner_type !== '-9' ? this.pagination.partner_type : -9 : -9,
      partner_id: this.pagination.partner_id ? this.pagination.partner_id : null,
      status: this.pagination.status ? this.pagination.status : null,
      search: this.pagination.search ? this.pagination.search : null
    }
    try {
      const response = await this.PojokUntungPartnersRegisteredService.exportPartner(fd).toPromise();
      // console.log('he', response.headers);
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `Export_Registered_Partner_${new Date().toLocaleString()}.xls`);
      // this.downLoadFile(response, "data:text/csv;charset=utf-8", `Export_Registered_Partner_${new Date().toLocaleString()}.csv`);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
      this.dataService.showLoading(false);

    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
      // throw error;
    }
  }

  downLoadFile(data: any, type: string, fileName: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    var newBlob = new Blob([data], { type: type });

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }

    // For other browsers: 
    // Create a link pointing to the ObjectURL containing the blob.
    const url = window.URL.createObjectURL(newBlob);

    var link = document.createElement('a');
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

  // getId(row) {
  //   return row ? row.id : row;
  // }


  onSelect({ selected }) {
    // console.log(arguments);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
    this.onRowsSelected.emit({ isSelected: true, data: selected });
  }

  import(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    // dialogConfig.data = {
      // type: 'partner_registered',
      // status: this.formImportRegistered.get('registration_status').value,
      // registration_status: this.dataType === "Not Approve" ? 0 : this.dataType === "Approved" ? 1 : this.dataType === "On Progress" ? 2 : null
    // };

    this.dialogRef = this.dialog.open(PojokUntungPartnersRegisteredImportDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.onSelect({ selected: response });
        this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text8 });
      }
    });
  }

  handleError(error) {
    // console.log('Here')
    console.log(error)

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
    // alert('Open console to see the error')
  }

}
