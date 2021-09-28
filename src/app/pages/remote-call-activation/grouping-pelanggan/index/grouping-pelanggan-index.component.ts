import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { GeotreeService } from 'app/services/geotree.service';
import { RcaAgentService } from 'app/services/rca-agent.service';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GroupingPelangganImportDialogComponent } from '../../grouping-pelanggan-import-dialog/grouping-pelanggan-import-dialog.component';
import { PositionCodeDialogComponent } from '../../position-code-dialog/position-code-dialog.component';

@Component({
  selector: 'app-grouping-pelanggan-index',
  templateUrl: './grouping-pelanggan-index.component.html',
  styleUrls: ['./grouping-pelanggan-index.component.scss']
})
export class GroupingPelangganIndexComponent implements OnInit {
  formFilter: FormGroup;
  lastLevel: any;
  endArea: String;
  area_id_list: any = [];
  listLevelArea: any[];
  list: any;
  areaFromLogin: any;
  loadingIndicator: boolean;
  rows: any[];
  selected: any[];
  id: any;
  statusRow: any;

  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  offsetPagination: Number = null;

  keyUp = new Subject<string>();
  classification: FormControl = new FormControl('');
  listClasification: any[] = [{ name: 'All Classifications', value: '' },
  { name: 'RCA', value: 'RCA' },
  { name: 'SRC', value: 'SRC' },
  { name: 'NON-SRC', value: 'NON-SRC' },
  { name: 'IMO', value: 'IMO' },
  { name: 'LAMP/HOP', value: 'LAMP/HOP' },
  { name: 'GT', value: 'GT' },
  { name: 'KA', value: 'KA' }
  ];

  @ViewChild('activeCell') activeCellTemp: TemplateRef<any>;
  @ViewChild('table') table: DatatableComponent;
  formSearch: FormControl = new FormControl('');

  summaries: any[] = [];
  listPositionCodes: any[] = [];

  positionCode: FormControl = new FormControl('');
  positionCodesList: any[] = [];
  cities: any[] = [];
  districts: any[] = [];
  villages: any[] = [];

  public filterPosition: FormControl = new FormControl('');
  public filteredPosition: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  private _onDestroy = new Subject<void>();
  all_areas: any[] = [];
  queryParamsPositionCodes: any;
  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private geotreeService: GeotreeService,
    private dialogService: DialogService,
    private rcaAgentService: RcaAgentService,
    private matDialog: MatDialog
  ) {
    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    this.all_areas = this.dataService.getDecryptedProfile()['areas'];
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
        // this.loadFormFilter(data);
      });


    this.filterPosition.valueChanges
      .debounceTime(500)
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringPosition();
      });
  }

  filteringPosition() {
    if (!this.positionCodesList) {
      return;
    }
    // get the search keyword
    let search = this.filterPosition.value;
    let pagination = { ...this.queryParamsPositionCodes }
    pagination['per_page'] = 30;
    pagination['search'] = search;

    this.rcaAgentService.getRPPositionCode(pagination).subscribe(
      (res) => {
        this.positionCodesList = res.data;
        this.filteredPosition.next(this.positionCodesList.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );
    // filter the banks
    this.filteredPosition.next(
      this.positionCodesList.filter(item => item.code ? item.code.toLowerCase().indexOf(search) > -1 : item.code.indexOf(search))
    );
  }

  getFilterArea(category?) {
    let params = {};
    const areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) =>
      ({ key, value })).filter((item: any) => item.value !== null && item.value !== '' && item.value.length !== 0);
    const area_id = areaSelected[areaSelected.length - 1].value;
    const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
    this.pagination.area = area_id;

    console.log('area_selected on ff list', areaSelected, this.list);
    if (this.areaFromLogin[0].length === 1 && this.areaFromLogin[0][0].type === 'national' && this.pagination.area !== 1) {
      this.pagination['after_level'] = true;
    } else {
      const lastSelectedArea: any = areaSelected[areaSelected.length - 1];
      const indexAreaAfterEndLevel = areaList.indexOf(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
      const indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
      let is_area_2 = false;

      let self_area = this.areaFromLogin[0] ? this.areaFromLogin[0].map(area_1 => area_1.id) : [];
      let last_self_area = [];
      if (self_area.length > 0) {
        last_self_area.push(self_area[self_area.length - 1]);
      }

      if (this.areaFromLogin[1]) {
        const second_areas = this.areaFromLogin[1];
        last_self_area = [
          ...last_self_area,
          second_areas[second_areas.length - 1].id
        ];
        self_area = [
          ...self_area,
          ...second_areas.map(area_2 => area_2.id).filter(area_2 => self_area.indexOf(area_2) === -1)
        ];
      }

      const newLastSelfArea = this.checkAreaLocation(areaSelected[areaSelected.length - 1], last_self_area);

      if (this.pagination['after_level']) { delete this.pagination['after_level']; }
      this.pagination['self_area'] = self_area;
      this.pagination['last_self_area'] = last_self_area;
      let levelCovered = [];
      if (this.areaFromLogin[0]) { levelCovered = this.areaFromLogin[0].map(level => this.parseArea(level.type)); }
      if (lastSelectedArea.value.length === 1 && this.areaFromLogin.length > 1) {
        const oneAreaSelected = lastSelectedArea.value[0];
        const findOnFirstArea = this.areaFromLogin[0].find(are => are.id === oneAreaSelected);
        console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) { is_area_2 = false; } else { is_area_2 = true; }
        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2) {
            this.pagination['last_self_area'] = [last_self_area[1]];
          } else { this.pagination['last_self_area'] = [last_self_area[0]]; }
        } else {
          // console.log('its hitted [other level]');
          this.pagination['after_level'] = true;
          this.pagination['last_self_area'] = newLastSelfArea;
        }
      } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
        // console.log('its hitted [other level other]');
        this.pagination['after_level'] = true;
        if (newLastSelfArea.length > 0) {
          this.pagination['last_self_area'] = newLastSelfArea;
        }
      }
    }
    if (this.pagination['area']) params['area'] = this.pagination['area'];
    if (this.pagination['self_area']) params['self_area'] = this.pagination['self_area'];
    if (this.pagination['last_self_area']) params['last_self_area'] = this.pagination['last_self_area'];
    if (this.pagination['after_level']) params['after_level'] = this.pagination['after_level'];
    params['return'] = category;
    this.rcaAgentService.getFilterArea(params).subscribe(res => {
      if (category === 'city') this.cities = res;
      if (category === 'district') this.districts = res;
      if (category === 'village') this.villages = res;
    })
  }

  getPositionCodes() {
    let zone_areas = this.all_areas.map(area => {
      let zone = area.find(zn => zn.level_desc === 'division')
      if (zone) {
        return zone;
      } else {
        return -1;
      }
    });

    let params = {};
    if (zone_areas.length > 0 && zone_areas[0] && zone_areas[0] !== -1) {
      const areaSelected = [
        { key: 'national', value: 1 },
        { key: 'zone', value: zone_areas.map(zn => zn.id) }
      ]
      const area_id = areaSelected[areaSelected.length - 1].value;
      const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
      params['area'] = area_id;

      console.log('area_selected on ff list', areaSelected, this.list);
      if (this.areaFromLogin[0].length === 1 && this.areaFromLogin[0][0].type === 'national' && params['area'] !== 1) {
        params['after_level'] = true;
      } else {
        const lastSelectedArea: any = areaSelected[areaSelected.length - 1];
        const indexAreaAfterEndLevel = areaList.indexOf(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
        const indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
        let is_area_2 = false;

        let self_area = this.areaFromLogin[0] ? this.areaFromLogin[0].map(area_1 => area_1.id) : [];
        let last_self_area = [];
        if (self_area.length > 0) {
          last_self_area.push(self_area[self_area.length - 1]);
        }

        if (this.areaFromLogin[1]) {
          const second_areas = this.areaFromLogin[1];
          last_self_area = [
            ...last_self_area,
            second_areas[second_areas.length - 1].id
          ];
          self_area = [
            ...self_area,
            ...second_areas.map(area_2 => area_2.id).filter(area_2 => self_area.indexOf(area_2) === -1)
          ];
        }

        const newLastSelfArea = this.checkAreaLocation(areaSelected[areaSelected.length - 1], last_self_area);

        if (params['after_level']) { delete params['after_level']; }
        params['self_area'] = self_area;
        params['last_self_area'] = last_self_area;
        let levelCovered = [];
        if (this.areaFromLogin[0]) { levelCovered = this.areaFromLogin[0].map(level => this.parseArea(level.type)); }
        if (lastSelectedArea.value.length === 1 && this.areaFromLogin.length > 1) {
          const oneAreaSelected = lastSelectedArea.value[0];
          const findOnFirstArea = this.areaFromLogin[0].find(are => are.id === oneAreaSelected);
          console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
          if (findOnFirstArea) { is_area_2 = false; } else { is_area_2 = true; }
          if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
            // console.log('its hitted [levelCovered > -1]');
            if (is_area_2) {
              params['last_self_area'] = [last_self_area[1]];
            } else { params['last_self_area'] = [last_self_area[0]]; }
          } else {
            // console.log('its hitted [other level]');
            params['after_level'] = true;
            params['last_self_area'] = newLastSelfArea;
          }
        } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
          // console.log('its hitted [other level other]');
          params['after_level'] = true;
          if (newLastSelfArea.length > 0) {
            params['last_self_area'] = newLastSelfArea;
          }
        }
      }

      this.queryParamsPositionCodes = params;
    }

    this.rcaAgentService.getRPPositionCode({ per_page: 30, ...params }).subscribe(
      (res) => {
        this.positionCodesList = res.data;
        this.filteredPosition.next(this.positionCodesList.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );
  }

  ngOnInit() {
    this.formFilter = this.formBuilder.group({
      national: [''],
      zone: [''],
      region: [''],
      area: [''],
      salespoint: [''],
      district: [''],
      territory: [''],
      status: [''],
      city: [''],
      district_code: [''],
      village: [''],
    });
    this.formFilter.valueChanges.debounceTime(1000).subscribe(res => {
      // this.getListAudience(this.trade_audience_group_id);
    });

    this.formFilter.get('national').valueChanges.subscribe(res => {
      console.log('zone', res);
      if (res) {
        // this.getAudienceAreaV2('region', res);
        this.getFilterArea('city')
        this.getFilterArea('district')
        this.getFilterArea('village')
      }
    });
    this.formFilter.get('zone').valueChanges.subscribe(res => {
      console.log('zone', res);
      if (res) {
        this.getAudienceAreaV2('region', res);
        this.getFilterArea('city')
        this.getFilterArea('district')
        this.getFilterArea('village')
      }
    });
    this.formFilter.get('region').valueChanges.subscribe(res => {
      console.log('region', res);
      if (res) {
        this.getAudienceAreaV2('area', res);
        this.getFilterArea('city')
        this.getFilterArea('district')
        this.getFilterArea('village')
      }
    });
    this.formFilter.get('area').valueChanges.subscribe(res => {
      console.log('area', res, this.formFilter.value['area']);
      if (res) {
        this.getAudienceAreaV2('salespoint', res);
        this.getFilterArea('city')
        this.getFilterArea('district')
        this.getFilterArea('village')
      }
    });
    this.formFilter.get('salespoint').valueChanges.subscribe(res => {
      console.log('salespoint', res);
      if (res) {
        this.getAudienceAreaV2('district', res);
        this.getFilterArea('city')
        this.getFilterArea('district')
        this.getFilterArea('village')
      }
    });
    this.formFilter.get('district').valueChanges.subscribe(res => {
      console.log('district', res);
      if (res) {
        this.getAudienceAreaV2('territory', res);
        this.getFilterArea('city')
        this.getFilterArea('district')
        this.getFilterArea('village')
      }
    });

    this.initAreaV2();

    this.getListGroupingPelanggan();
    this.getPositionCodes();

  }


  getSummary() {
    this.rcaAgentService.getGPSummary(this.pagination).subscribe(res => {
      this.summaries = res || [];
    });
  }

  loadFormFilter(search?: string) {
    if (!search && this.formSearch.value) search = this.formSearch.value;
    this.getListGroupingPelanggan(search);
  }

  getListGroupingPelanggan(search?) {
    this.dataService.showLoading(true);
    this.pagination.page = 1;
    this.pagination.sort = 'name';
    this.pagination.sort_type = 'asc';
    // if (this.statusValue.length !== 0) {
    //   this.pagination.status = this.statusValue;
    // }
    // if (this.statusCoinSelected.length !== 0) {
    //   this.pagination['status_coin'] = this.statusCoinSelected;
    // }
    // if (this.irCheckSelected.length !== 0) {
    //   this.pagination['ir_check'] = this.irCheckSelected;
    // }
    const areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) =>
      ({ key, value })).filter((item: any) => item.value !== null && item.value !== '' && item.value.length !== 0);
    const area_id = areaSelected[areaSelected.length - 1].value;
    const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
    this.pagination.area = area_id;

    console.log('area_selected on ff list', areaSelected, this.list);
    if (this.areaFromLogin[0].length === 1 && this.areaFromLogin[0][0].type === 'national' && this.pagination.area !== 1) {
      this.pagination['after_level'] = true;
    } else {
      const lastSelectedArea: any = areaSelected[areaSelected.length - 1];
      const indexAreaAfterEndLevel = areaList.indexOf(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
      const indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
      let is_area_2 = false;

      let self_area = this.areaFromLogin[0] ? this.areaFromLogin[0].map(area_1 => area_1.id) : [];
      let last_self_area = [];
      if (self_area.length > 0) {
        last_self_area.push(self_area[self_area.length - 1]);
      }

      if (this.areaFromLogin[1]) {
        const second_areas = this.areaFromLogin[1];
        last_self_area = [
          ...last_self_area,
          second_areas[second_areas.length - 1].id
        ];
        self_area = [
          ...self_area,
          ...second_areas.map(area_2 => area_2.id).filter(area_2 => self_area.indexOf(area_2) === -1)
        ];
      }

      const newLastSelfArea = this.checkAreaLocation(areaSelected[areaSelected.length - 1], last_self_area);

      if (this.pagination['after_level']) { delete this.pagination['after_level']; }
      this.pagination['self_area'] = self_area;
      this.pagination['last_self_area'] = last_self_area;
      let levelCovered = [];
      if (this.areaFromLogin[0]) { levelCovered = this.areaFromLogin[0].map(level => this.parseArea(level.type)); }
      if (lastSelectedArea.value.length === 1 && this.areaFromLogin.length > 1) {
        const oneAreaSelected = lastSelectedArea.value[0];
        const findOnFirstArea = this.areaFromLogin[0].find(are => are.id === oneAreaSelected);
        console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) { is_area_2 = false; } else { is_area_2 = true; }
        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2) {
            this.pagination['last_self_area'] = [last_self_area[1]];
          } else { this.pagination['last_self_area'] = [last_self_area[0]]; }
        } else {
          // console.log('its hitted [other level]');
          this.pagination['after_level'] = true;
          this.pagination['last_self_area'] = newLastSelfArea;
        }
      } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
        // console.log('its hitted [other level other]');
        this.pagination['after_level'] = true;
        if (newLastSelfArea.length > 0) {
          this.pagination['last_self_area'] = newLastSelfArea;
        }
      }
    }
    this.loadingIndicator = true;
    if (search) this.pagination['search'] = search;
    else delete this.pagination['search'];
    if (this.positionCode.value) {
      let position = this.positionCodesList.find(pos => pos.id === this.positionCode.value);
      if (position) {
        this.pagination['area'] = position['area_id'];
        this.pagination['position'] = this.positionCode.value;
      } else {
        this.pagination['position'] = this.positionCode.value;
      }
    }

    if (this.classification.value) this.pagination['classification'] = this.classification.value;
    else delete this.pagination['classification']
    // this.pagination.area = this.formAudience.get('type').value === 'pick-all' ? 1 : area_id;

    if (this.formFilter.get('city').value) this.pagination['city'] = this.formFilter.get('city').value;
    if (this.formFilter.get('district_code').value) this.pagination['district'] = this.formFilter.get('district_code').value;
    if (this.formFilter.get('village').value) this.pagination['village'] = this.formFilter.get('village').value;

    let isAdminHaveNational = this.area_id_list.filter(ar => ar === 1);
    if (areaSelected.length === 1 && isAdminHaveNational.length === 0) {
      this.dataService.showLoading(false);
      this.loadingIndicator = false;
      this.dialogService.openSnackBar({ message: "Kamu Tidak Bisa Melihat Area National karena tidak Memiliki Akses Geotree National" });
      return;
    }

    this.getSummary();

    this.rcaAgentService.getGroupingPelanggan(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
      // this.getFilterArea('city');
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;
    this.offsetPagination = pageInfo.offset;

    this.rcaAgentService.getGroupingPelanggan(this.pagination).subscribe(res => {
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

    this.rcaAgentService.getGroupingPelanggan(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  initAreaV2() {
    const areas = this.dataService.getDecryptedProfile()['areas'] || [];
    this.geotreeService.getFilter2Geotree(areas);
    const sameArea = this.geotreeService.diffLevelStarted;
    const areasDisabled = this.geotreeService.disableArea(sameArea);
    this.lastLevel = areasDisabled;
    let lastLevelDisabled = null;
    const levelAreas = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
    const lastDiffLevelIndex = levelAreas.findIndex(level => level === (sameArea.type === 'teritory' ? 'territory' : sameArea.type));

    if (!this.formFilter.get('national') || this.formFilter.get('national').value === '') {
      this.formFilter.get('national').setValue(1);
      this.formFilter.get('national').disable();
      lastLevelDisabled = 'national';
    }
    areas.map((area, index) => {
      area.map((level, i) => {
        const level_desc = level.level_desc;
        const levelIndex = levelAreas.findIndex(lvl => lvl === level.type);
        if (lastDiffLevelIndex > levelIndex - 2) {
          if (!this.list[level.type]) { this.list[level.type] = []; }
          if (!this.formFilter.controls[this.parseArea(level.type)] ||
            !this.formFilter.controls[this.parseArea(level.type)].value ||
            this.formFilter.controls[this.parseArea(level.type)].value === '') {
            this.formFilter.controls[this.parseArea(level.type)].setValue([level.id]);
            if (sameArea.level_desc === level.type) {
              lastLevelDisabled = level.type;

              this.formFilter.get(this.parseArea(level.type)).disable();
            }

            if (areasDisabled.indexOf(level.type) > -1) { this.formFilter.get(this.parseArea(level.type)).disable(); }
          }

          const isExist = this.list[this.parseArea(level.type)].find(ls => ls.id === level.id);
          level['area_type'] = `area_${index + 1}`;
          this.list[this.parseArea(level.type)] = isExist ? [...this.list[this.parseArea(level.type)]] : [
            ...this.list[this.parseArea(level.type)],
            level
          ];
          if (!this.formFilter.controls[this.parseArea(level.type)].disabled) {
            this.getAudienceAreaV2(this.geotreeService.getNextLevel(this.parseArea(level.type)), level.id);
          }

          if (i === area.length - 1) {
            this.endArea = this.parseArea(level.type);
            this.getAudienceAreaV2(this.geotreeService.getNextLevel(this.parseArea(level.type)), level.id);
          }
        }
      });
    });
  }

  parseArea(type) {
    switch (type) {
      case 'division':
        return 'zone';
      case 'teritory':
      case 'territory':
        return 'territory';
      default:
        return type;
    }
  }

  getAudienceAreaV2(selection, id, event?) {
    let item: any;
    const fd = new FormData();
    const lastLevel = this.geotreeService.getBeforeLevel(this.parseArea(selection));
    let areaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(lastLevel));
    // console.log('areaSelected', areaSelected, selection, lastLevel, Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })));
    console.log('audienceareav2', this.formFilter.getRawValue(), areaSelected[0]);
    if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
      fd.append('area_id[]', areaSelected[0].value);
    } else if (areaSelected.length > 0) {
      if (areaSelected[0].value !== '') {
        areaSelected[0].value.map(ar => {
          fd.append('area_id[]', ar);
        });
        // if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
        if (areaSelected[0].value.length === 0) {
          const beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
          const newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
          console.log('the selection', this.parseArea(selection), newAreaSelected);
          if (newAreaSelected[0].key !== 'national') {
            newAreaSelected[0].value.map(ar => {
              fd.append('area_id[]', ar);
            });
          } else {
            fd.append('area_id[]', newAreaSelected[0].value);
          }
        }
      }
    } else {
      const beforeLastLevel = this.geotreeService.getBeforeLevel(lastLevel);
      areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLastLevel));
      // console.log('new', beforeLastLevel, areaSelected);
      if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
        fd.append('area_id[]', areaSelected[0].value);
      } else if (areaSelected.length > 0) {
        if (areaSelected[0].value !== '') {
          areaSelected[0].value.map(ar => {
            fd.append('area_id[]', ar);
          });
          // if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
          if (areaSelected[0].value.length === 0) {
            const beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
            const newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
            console.log('the selection', this.parseArea(selection), newAreaSelected);
            if (newAreaSelected[0].key !== 'national') {
              newAreaSelected[0].value.map(ar => {
                fd.append('area_id[]', ar);
              });
            } else {
              fd.append('area_id[]', newAreaSelected[0].value);
            }
          }
        }
      }
    }

    fd.append('area_type', selection === 'territory' ? 'teritory' : selection);
    let thisAreaOnSet = [];
    let areaNumber = 0;
    let expectedArea = [];
    if (!this.formFilter.get(this.parseArea(selection)).disabled) {
      thisAreaOnSet = this.areaFromLogin[0] ? this.areaFromLogin[0] : [];
      if (this.areaFromLogin[1]) {
        thisAreaOnSet = [
          ...thisAreaOnSet,
          ...this.areaFromLogin[1]
        ];
      }

      thisAreaOnSet = thisAreaOnSet.filter(ar => (ar.level_desc === 'teritory' ? 'territory' : ar.level_desc) === selection);
      if (id && id.length > 1) {
        areaNumber = 1;
      }

      if (areaSelected && areaSelected[0] && areaSelected[0].key !== 'national') {
        expectedArea = thisAreaOnSet.filter(ar => areaSelected[0].value.includes(ar.parent_id));
      }
      // console.log('on set', thisAreaOnSet, selection, id);
    }


    switch (this.parseArea(selection)) {
      case 'zone':
        // area = this.formFilter.get(selection).value;
        this.geotreeService.getChildFilterArea(fd).subscribe(res => {
          // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
          // this.list[this.parseArea(selection)] = res.data;
          this.list[this.parseArea(selection)] = expectedArea.length > 0 ?
            res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

          // fd = null
        });

        this.formFilter.get('region').setValue('');
        this.formFilter.get('area').setValue('');
        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['region'] = [];
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        console.log('zone selected', selection, this.list['region'], this.formFilter.get('region').value);
        break;
      case 'region':
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] = expectedArea.length > 0 ?
                res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list['region'] = [];
        }
        this.formFilter.get('region').setValue('');
        this.formFilter.get('area').setValue('');
        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'area':
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['region'].length > 0 ? this.list['region'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          console.log('area hitted', selection, item, this.list['region']);
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] = expectedArea.length > 0 ?
                res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list['area'] = [];
        }

        this.formFilter.get('area').setValue('');
        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'salespoint':
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['area'].length > 0 ? this.list['area'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          console.log('item', item);
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] = expectedArea.length > 0 ?
                res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list['salespoint'] = [];
        }

        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'district':
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              this.list[selection] = expectedArea.length > 0 ?
                res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list['district'] = [];
        }

        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['district'].length > 0 ? this.list['district'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              // this.list[selection] = res.data;
              this.list[selection] = expectedArea.length > 0 ?
                res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

              // fd = null
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list['territory'] = [];
        }

        this.formFilter.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  filteringGeotree(areaList) {
    return areaList;
  }

  checkAreaLocation(area, lastSelfArea) {
    const lastLevelFromLogin = this.parseArea(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
    const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
    const areaAfterEndLevel = this.geotreeService.getNextLevel(lastLevelFromLogin);
    const indexAreaAfterEndLevel = areaList.indexOf(areaAfterEndLevel);
    const indexAreaSelected = areaList.indexOf(area.key);
    const rawValues = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value }));
    let newLastSelfArea = [];
    if (area.value !== 1) {
      if (indexAreaSelected >= indexAreaAfterEndLevel) {
        const areaSelectedOnRawValues: any = rawValues.find(raw => raw.key === areaAfterEndLevel);
        newLastSelfArea = this.list[areaAfterEndLevel].filter(ar =>
          areaSelectedOnRawValues.value.includes(ar.id)).map(ar => ar.parent_id
          ).filter((v, i, a) => a.indexOf(v) === i);
      }
    }
    return newLastSelfArea;
  }

  openDialogPositionCode(row) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.width = "350px";
    dialogConfig.panelClass = "popup-notif";
    dialogConfig.data = row;

    let dialogReg = this.matDialog.open(PositionCodeDialogComponent, dialogConfig);
    dialogReg.afterClosed().subscribe(res => {
      if (res) {
        this.getListGroupingPelanggan();
        this.getSummary();
      }
    })
  }

  submit() {
  }

  exportGrouping() {
    this.dataService.showLoading(true);
    if (this.positionCode.value) {
      let position = this.positionCodesList.find(pos => pos.id === this.positionCode.value);
      if (position) {
        this.pagination['area'] = position['area_id'];
        this.pagination['position'] = this.positionCode.value;
      }
    }
    let params = {};
    if (this.classification.value) params['classification'] = this.classification.value;
    if (this.pagination['area']) {
      if (!Array.isArray(this.pagination['area'])) {
        this.pagination['area'] = [this.pagination['area']];
      }
      params['area'] = this.pagination['area'];
    }
    if (this.pagination['self_area']) params['self_area'] = this.pagination['self_area'];
    if (this.pagination['last_self_area']) params['last_self_area'] = this.pagination['last_self_area'];
    if (this.pagination['after_level']) params['after_level'] = this.pagination['after_level'];
    this.rcaAgentService.exportGrouping({ area: this.pagination['area'], ...params, position: this.pagination['position'] ? this.pagination['position'] : null }).subscribe(res => {
      console.log('res', res);
      this.downLoadFile(res, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `Export_GroupingPelangganRCA_${new Date().toLocaleString()}.xlsx`);
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    })
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

  handleError(error) {
    // console.log('Here')
    console.log(error)

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
    // alert('Open console to see the error')
  }

  importGrouping() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { catalog: 'grouping_pelanggan' };

    let dialogRef = this.matDialog.open(GroupingPelangganImportDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.getListGroupingPelanggan();
        this.dialogService.openSnackBar({ message: 'File berhasil diimport' });
      }
    });
  }

}
