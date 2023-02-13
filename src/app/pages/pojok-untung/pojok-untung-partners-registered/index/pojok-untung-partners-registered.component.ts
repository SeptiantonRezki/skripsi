import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Router } from '@angular/router';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import {map, startWith, debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import { DataService } from 'app/services/data.service';
import { PagesName } from 'app/classes/pages-name';
import { DialogService } from 'app/services/dialog.service';
import { PojokUntungPartnersRegisteredService } from 'app/services/pojok-untung/pojok-untung-partners-registered.service';
import { PojokUntungPartnersListService } from 'app/services/pojok-untung/pojok-untung-partners-list.service';

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
  partner_type: any = '-9';
  defaultPartnerType: any[] = [{ id: -9, label: "Semua Jenis Partner" }];
  defaultPartnerId: any[] = [{ id: '', partner_name: "Semua Partner" }];
  defaultStatus: any[] = [{ id: '', label: "Semua Status" }];

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild('table') table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;
  
  partnerTypeList: any[];
  partnerIdList: any[];
  // statusList: any[];
  statusList: any[] = [
    {
      id: '',
      label: 'Semua Status'
    },
    {
      id: 1,
      label: 'On Progress'
    },
    {
      id: 2,
      label: 'Approved'
    },
    {
      id: 3,
      label: 'Declined'
    }
  ];

  rows: any[];

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private ls: LanguagesService,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private PojokUntungPartnersRegisteredService: PojokUntungPartnersRegisteredService,
    private PojokUntungPartnersListService: PojokUntungPartnersListService
    ) { 
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
    // this.getStatusList();
    this.getList();
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
      this.partnerIdList = this.defaultPartnerId.concat(res.data);
    }, err=> { })
  }

  // getStatusList() {
  //   this.PojokUntungPartnersRegisteredService.getStatusList({}).subscribe(res => {
  //     this.statusList = this.defaultStatus.concat(res.data);
  //   }, err=> { })
  // }

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
      this.pagination.status = value;
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
      this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    });
  }

  changeFilteredData(param?: any, type?: any){
    if (type === 'partner_type') {
      this.formFilter.get('partner_id').setValue(this.defaultPartnerId[0].id, {emitEvent: false});
      this.formFilter.get('status').setValue(this.defaultStatus[0].id, {emitEvent: false});
      this.pagination.partner_id = '';
      this.pagination.status = '';
    }
    if (type === 'partner_id') {
      this.formFilter.get('status').setValue(this.defaultStatus[0].id, {emitEvent: false});
      this.pagination.status = '';
    }

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
        this.rows = res.data ? res.data : [];
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
      this.rows = res.data ? res.data : [];
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
      this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    });
  }

  export() {
    console.log('export done!');
  }

}
