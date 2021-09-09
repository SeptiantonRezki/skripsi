import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { GeotreeService } from 'app/services/geotree.service';
import { RcaAgentService } from 'app/services/rca-agent.service';
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
  plannedDays: any[] = [
    { id: 'senin', name: 'Senin' },
    { id: 'selasa', name: 'Selasa' },
    { id: 'rabu', name: 'Rabu' },
    { id: 'kamis', name: 'Kamis' },
    { id: 'jumat', name: `Jumat` },
    { id: 'sabtu', name: 'Sabtu' },
    { id: 'minggu', name: 'Minggu' },
  ];
  territoryCodes: any[] = [];
  cities: any[] = [];
  districts: any[] = [];
  villages: any[] = [];

  positionCode: FormControl = new FormControl('');
  positionCodesList: any[] = [];

  selected: any[];
  id: any;
  statusRow: any;

  reorderable = true;
  onLoad: boolean;

  offsetPagination: Number = null;


  @ViewChild('activeCell') activeCellTemp: TemplateRef<any>;
  @ViewChild('table') table: DatatableComponent;
  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private geotreeService: GeotreeService,
    private dialogService: DialogService,
    private rcaAgentService: RcaAgentService
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
    this.getListRoutePlan();
    this.getRPPositionCodes();
    this.getRPSummary();
  }
  loadFormFilter(search?: string) {
    if (!search && this.formSearch.value) search = this.formSearch.value;

    this.getListRoutePlan(search)
  }

  getRPPositionCodes() {
    this.rcaAgentService.getRPPositionCode({ perPage: 15 }).subscribe(res => {
      console.log("resss", res);
      this.positionCodesList = res.data;
    })
  }

  getRPSummary() {
    this.rcaAgentService.getRPSummary({}).subscribe(res => {
      this.summaries = res;
    })
  }

  getListRoutePlan(search?: string) {
    this.dataService.showLoading(true);
    this.pagination.page = 1;

    this.loadingIndicator = true;
    this.pagination['search'] = search;
    this.pagination['area'] = 1;
    if (this.positionCode.value) {
      let position = this.positionCodesList.find(pos => pos.id === this.positionCode.value);
      if (position) {
        this.pagination['area'] = position['area_id'];
        this.pagination['position'] = this.positionCode.value;
      }
    }

    this.rcaAgentService.getRoutePlan(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;
    this.offsetPagination = pageInfo.offset;

    this.rcaAgentService.getRoutePlan(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event['newValue'];
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.rcaAgentService.getRoutePlan(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  submit() {

  }
}
