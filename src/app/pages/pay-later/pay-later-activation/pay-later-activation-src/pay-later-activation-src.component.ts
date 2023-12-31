import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { PayLaterDeactivateService } from 'app/services/pay-later/pay-later-deactivate.service';
import { GeotreeService } from 'app/services/geotree.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import moment from 'moment';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-pay-later-activation-src',
  templateUrl: './pay-later-activation-src.component.html',
  styleUrls: ['./pay-later-activation-src.component.scss']
})
export class PayLaterActivationSrcComponent implements OnInit {
  @Input() dataType: string;
  rows: any[];
  selected: any[];
  id: any[];
  statusRow: string;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;
  offsetPagination: any;

  // 2 geotree property
  listLevelArea: any[];
  list: any;
  areaFromLogin;
  formFilter: FormGroup;
  filterArea: Boolean;
  area_id_list: any = [];
  endArea: String;
  lastLevel: any;

  status: FormControl = new FormControl('');
  start_date: FormControl = new FormControl('');
  end_date: FormControl = new FormControl('');
  listStatus: any[] = [
    { name: "Semua Status", value: "" },
    { name: "BERMINAT", value: "interested" },
    { name: "BELUM MENGAJUKAN", value: "belum-mengajukan" },
    { name: "PENGAJUAN", value: "pending" },
    { name: "DITOLAK", value: "rejected" },
    { name: "DISETUJUI", value: "approved" },
  ]

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private payLaterDeactivateService: PayLaterDeactivateService,
    private geotreeService: GeotreeService,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
  ) {
    this.onLoad = true;
    this.selected = [];

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
    this.initFormFilter();

    this.status.valueChanges.subscribe(res => {
      if (res) this.getSRCList();
    })

    this.start_date.valueChanges.subscribe(res => {
      if (res) this.getSRCList();
    })
    this.end_date.valueChanges.subscribe(res => {
      if (res) this.getSRCList();
    })
  }

  getSRCList() {
    const areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).
      filter((item: any) => item.value !== null && item.value !== '' && item.value.length !== 0);
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
    this.loadingIndicator = true;
    const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
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
        if (findOnFirstArea) { is_area_2 = false; }
        else { is_area_2 = true; }

        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2) { this.pagination['last_self_area'] = [last_self_area[1]]; }
          else { this.pagination['last_self_area'] = [last_self_area[0]]; }
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
    const page = this.dataService.getFromStorage("page_src");
    const sort_type = this.dataService.getFromStorage("sort_type_src");
    const sort = this.dataService.getFromStorage("sort_src");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;
    this.pagination['status'] = this.status.value;
    this.pagination['start_date'] = moment(this.start_date.value).format("YYYY-MM-DD");
    this.pagination['end_date'] = moment(this.end_date.value).format("YYYY-MM-DD");

    if (!this.start_date.value) delete this.pagination['start_date'];
    if (!this.end_date.value) delete this.pagination['end_date'];

    this.offsetPagination = page ? (page - 1) : 0;
    this.payLaterDeactivateService.getActivateSRC({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(
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

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  setPage(pageInfo) {
    const areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).
      filter((item: any) => item.value !== null && item.value !== '' && item.value.length !== 0);
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
    this.loadingIndicator = true;
    const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
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
        if (findOnFirstArea) { is_area_2 = false; }
        else { is_area_2 = true; }

        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2) { this.pagination['last_self_area'] = [last_self_area[1]]; }
          else { this.pagination['last_self_area'] = [last_self_area[0]]; }
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
    this.pagination.page = pageInfo.offset + 1;

    if (!this.start_date.value) delete this.pagination['start_date'];
    if (!this.end_date.value) delete this.pagination['end_date'];

    this.payLaterDeactivateService.getActivateSRC({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    const areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).
      filter((item: any) => item.value !== null && item.value !== '' && item.value.length !== 0);
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
    this.loadingIndicator = true;
    const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
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
        if (findOnFirstArea) { is_area_2 = false; }
        else { is_area_2 = true; }

        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2) { this.pagination['last_self_area'] = [last_self_area[1]]; }
          else { this.pagination['last_self_area'] = [last_self_area[0]]; }
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
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;
    if (!this.start_date.value) delete this.pagination['start_date'];
    if (!this.end_date.value) delete this.pagination['end_date'];

    console.log("check pagination", this.pagination);

    this.payLaterDeactivateService.getActivateSRC({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    const areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).
      filter((item: any) => item.value !== null && item.value !== '' && item.value.length !== 0);
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
    this.loadingIndicator = true;
    const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
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
        if (findOnFirstArea) { is_area_2 = false; }
        else { is_area_2 = true; }

        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2) { this.pagination['last_self_area'] = [last_self_area[1]]; }
          else { this.pagination['last_self_area'] = [last_self_area[0]]; }
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
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;

    console.log(this.pagination);
    if (!this.start_date.value) delete this.pagination['start_date'];
    if (!this.end_date.value) delete this.pagination['end_date'];

    this.payLaterDeactivateService.getActivateSRC({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  initFormFilter() {
    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];

    this.listLevelArea = [
      {
        'id': 1,
        'parent_id': null,
        'code': 'SLSNTL      ',
        'name': 'SLSNTL'
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

    this.formFilter = this.formBuilder.group({
      national: [''],
      zone: [''],
      region: [''],
      area: [''],
      salespoint: [''],
      district: [''],
      territory: ['']
    });

    this.initAreaV2();
    this.getSRCList();

    this.formFilter.valueChanges.debounceTime(1000).subscribe(() => {
      this.getSRCList();
    });

    this.formFilter.get('zone').valueChanges.subscribe(res => {
      console.log('zone', res);
      if (res) {
        this.getAudienceAreaV2('region', res);
      }
    });
    this.formFilter.get('region').valueChanges.subscribe(res => {
      console.log('region', res);
      if (res) {
        this.getAudienceAreaV2('area', res);
      }
    });
    this.formFilter.get('area').valueChanges.subscribe(res => {
      console.log('area', res, this.formFilter.value['area']);
      if (res) {
        this.getAudienceAreaV2('salespoint', res);
      }
    });
    this.formFilter.get('salespoint').valueChanges.subscribe(res => {
      console.log('salespoint', res);
      if (res) {
        this.getAudienceAreaV2('district', res);
      }
    });
    this.formFilter.get('district').valueChanges.subscribe(res => {
      console.log('district', res);
      if (res) {
        this.getAudienceAreaV2('territory', res);
      }
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
          if (!this.formFilter.controls[this.parseArea(level.type)] || !this.formFilter.controls[this.parseArea(level.type)].value || this.formFilter.controls[this.parseArea(level.type)].value === '') {
            this.formFilter.controls[this.parseArea(level.type)].setValue([level.id]);
            console.log('ff value', this.formFilter.value);
            // console.log(this.formFilter.controls[this.parseArea(level.type)]);
            if (sameArea.level_desc === level.type) {
              lastLevelDisabled = level.type;

              this.formFilter.get(this.parseArea(level.type)).disable();
            }

            if (areasDisabled.indexOf(level.type) > -1) { this.formFilter.get(this.parseArea(level.type)).disable(); }
            // if (this.formFilter.get(this.parseArea(level.type)).disabled) this.getFilterArea(level_desc, level.id);
            console.log(this.parseArea(level.type), this.list[this.parseArea(level.type)]);
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

    // let mutableAreas = this.geotreeService.listMutableArea(lastLevelDisabled);
    // mutableAreas.areas.map((ar, i) => {
    //   this.list[ar].splice(1, 1);
    // });
  }

  parseArea(type: any) {
    // return type === 'division' ? 'zone' : type;
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

  getAudienceAreaV2(selection: any, id: any, event?: any) {
    let item: any;
    const fd = new FormData();
    const lastLevel = this.geotreeService.getBeforeLevel(this.parseArea(selection));
    let areaSelected: any = Object.entries(this.formFilter.getRawValue()).map(
      ([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(lastLevel));
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
          const newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(
            ([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
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
      areaSelected = Object.entries(this.formFilter.getRawValue()).map(
        ([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLastLevel));
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
            const newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(
              ([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
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

  filteringGeotree(areaList: any) {
    return areaList;
  }

  checkAreaLocation(area: any, lastSelfArea: any) {
    const lastLevelFromLogin = this.parseArea(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
    const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
    const areaAfterEndLevel = this.geotreeService.getNextLevel(lastLevelFromLogin);
    const indexAreaAfterEndLevel = areaList.indexOf(areaAfterEndLevel);
    const indexAreaSelected = areaList.indexOf(area.key);
    const rawValues = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value }));
    let newLastSelfArea = []
    if (area.value !== 1) {
      if (indexAreaSelected >= indexAreaAfterEndLevel) {
        const areaSelectedOnRawValues: any = rawValues.find(raw => raw.key === areaAfterEndLevel);
        newLastSelfArea = this.list[areaAfterEndLevel].filter(ar =>
          areaSelectedOnRawValues.value.includes(ar.id)).map(ar => ar.parent_id).filter((v, i, a) => a.indexOf(v) === i);
      }
    }

    return newLastSelfArea;
  }
  async _export() {
    this.loadingIndicator = true;
    this.dataService.showLoading(true);
    try {
      const response = await this.payLaterDeactivateService.export({...this.pagination, paylater_company_type_id: this.dataType === "invoice-financing" ? 1 : this.dataType === "retailer-financing" ? 2 : this.dataType === "kur" ? 3 : null}).toPromise();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `Export_PaylaterActivateSrc_${new Date().toLocaleString()}.xlsx`);
      this.dataService.showLoading(false);
      
    } catch (error) {
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
      console.log({error});
      
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

}
