import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Page } from 'app/classes/laravel-pagination';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { GeotreeService } from 'app/services/geotree.service';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-route-plan',
  templateUrl: './route-plan.component.html',
  styleUrls: ['./route-plan.component.scss']
})
export class RoutePlanComponent implements OnInit {
  formFilter: FormGroup;
  lastLevel: any;
  endArea: String;
  area_id_list: any = [];
  listLevelArea: any[];
  list: any;
  areaFromLogin: any;
  loadingIndicator: boolean;
  rows: any[];
  pagination: Page = new Page();
  keyUp = new Subject<string>();
  formSearch: FormControl = new FormControl('');

  summaries: any[] = [];
  positionCodes: any[] = [];
  plannedDays: any[] = [];
  territoryCodes: any[] = [];
  cities: any[] = [];
  districts: any[] = [];
  villages: any[] = [];

  positionCode: FormControl = new FormControl('');
  positionCodesList: any[] = [];
  offsetPagination: any;
  reorderable = true;
  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private geotreeService: GeotreeService,
    private dialogService: DialogService,
  ) {
    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    this.listLevelArea = [
      {
        'id': 1,
        'parent_id': null,
        'code': 'SLSNTL      ',
        'name': 'SSLSNTL'
      }
    ];

    this.list = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    };
    this.rows = [];
    this.loadingIndicator = false;

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.formSearch.setValue(data);
        this.loadFormFilter(data);
      });
  }

  ngOnInit() {
    this.formFilter = this.formBuilder.group({
      plannedDay: [''],
      territoryCode: [''],
      city: [''],
      district: [''],
      village: [''],
    });

    // this.initAreaV2();
  }

  loadFormFilter(search?: string) {
    if (!search && this.formSearch.value) search = this.formSearch.value;

    // this.getListAudience(this.trade_audience_group_id, search)
  }

  getListRoutePlan(id: any, search?: string) {
    this.dataService.showLoading(true);
    this.pagination.page = 1;
    this.pagination.sort = 'name';
    this.pagination.sort_type = 'asc';

    this.loadingIndicator = true;
    this.pagination['search'] = search;

    // this.taskVerificationService.getListAudience({ audience_id: id, template_id: this.idTemplate }, this.pagination).subscribe(res => {
    //   Page.renderPagination(this.pagination, res.data);
    //   this.rows = res.data.data;
    //   this.loadingIndicator = false;
    //   this.pagination.status = null;
    //   delete this.pagination['status_coin'];
    //   delete this.pagination['ir_check'];
    //   this.dataService.showLoading(false);
    // }, err => {
    //   this.dataService.showLoading(false);
    // });
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;
    this.offsetPagination = pageInfo.offset;

    // this.taskVerificationService.getListAudience({ audience_id: this.trade_audience_group_id, template_id: this.idTemplate }, this.pagination).subscribe(res => {
    //   Page.renderPagination(this.pagination, res.data);
    //   this.rows = res.data.data;
    //   this.loadingIndicator = false;
    //   this.dataService.showLoading(false);
    // }, err => {
    //   this.dataService.showLoading(false);
    // });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event['newValue'];
    this.pagination.page = 1;
    this.loadingIndicator = true;

    // this.taskVerificationService.getListAudience({ audience_id: this.trade_audience_group_id, template_id: this.idTemplate }, this.pagination).subscribe(res => {
    //   Page.renderPagination(this.pagination, res.data);
    //   this.rows = res.data.data;
    //   this.loadingIndicator = false;
    //   this.dataService.showLoading(false);
    // }, err => {
    //   this.dataService.showLoading(false);
    // });
  }
  submit() {
    throw new Error("Not Implemented!");
    
  }
}
