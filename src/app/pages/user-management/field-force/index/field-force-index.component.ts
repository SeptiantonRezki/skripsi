import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../services/data.service";
import { Router } from "@angular/router";
import { Page } from "../../../../classes/laravel-pagination";
import { Subject, Observable } from "rxjs";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DialogService } from "../../../../services/dialog.service";
import { FieldForceService } from "../../../../services/user-management/field-force.service";
import { FormGroup, FormBuilder } from "@angular/forms";
import { PagesName } from "app/classes/pages-name";
import { GeotreeService } from "app/services/geotree.service";

@Component({
  selector: "app-field-force-index",
  templateUrl: "./field-force-index.component.html",
  styleUrls: ["./field-force-index.component.scss"]
})
export class FieldForceIndexComponent {
  rows: any[];
  selected: any[];
  id: any[];

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  listLevelArea: any[];
  list: any;
  areaFromLogin;
  formFilter: FormGroup;
  filterArea: Boolean;
  area_id_list: any = [];

  offsetPagination: any;

  permission: any;
  roles: PagesName = new PagesName();

  // 2 geotree property
  endArea: String;

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private fieldForceService: FieldForceService,
    private formBuilder: FormBuilder,
    private geotreeService: GeotreeService
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.fieldforce');
    console.log(this.permission);

    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    this.listLevelArea = [
      {
        "id": 1,
        "parent_id": null,
        "code": "SLSNTL      ",
        "name": "SLSNTL"
      }
    ];

    this.list = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

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
    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })

    // this.initArea()
    this.initAreaV2();
    this.getFfList();

    this.formFilter.valueChanges.debounceTime(1000).subscribe(() => {
      this.getFfList();
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
    let areas = this.dataService.getDecryptedProfile()['areas'] || [];
    this.geotreeService.getFilter2Geotree(areas);
    let sameArea = this.geotreeService.diffLevelStarted;
    let areasDisabled = this.geotreeService.disableArea(sameArea);
    let lastLevelDisabled = null;
    let levelAreas = ["national", "division", "region", "area", "salespoint", "district", "territory"];
    let lastDiffLevelIndex = levelAreas.findIndex(level => level === (sameArea.type === 'teritory' ? 'territory' : sameArea.type));

    if (!this.formFilter.get('national') || this.formFilter.get('national').value === '') {
      this.formFilter.get('national').setValue(1);
      this.formFilter.get('national').disable();
      lastLevelDisabled = 'national';
    }
    areas.map((area, index) => {
      area.map((level, i) => {
        let level_desc = level.level_desc;
        let levelIndex = levelAreas.findIndex(lvl => lvl === level.type);
        if (lastDiffLevelIndex > levelIndex - 2) {
          if (!this.list[level.type]) this.list[level.type] = [];
          if (!this.formFilter.controls[this.parseArea(level.type)] || !this.formFilter.controls[this.parseArea(level.type)].value || this.formFilter.controls[this.parseArea(level.type)].value === '') {
            this.formFilter.controls[this.parseArea(level.type)].setValue([level.id]);
            console.log('ff value', this.formFilter.value);
            // console.log(this.formFilter.controls[this.parseArea(level.type)]);
            if (sameArea.level_desc === level.type) {
              lastLevelDisabled = level.type;

              this.formFilter.get(this.parseArea(level.type)).disable();
            }

            if (areasDisabled.indexOf(level.type) > -1) this.formFilter.get(this.parseArea(level.type)).disable();
            // if (this.formFilter.get(this.parseArea(level.type)).disabled) this.getFilterArea(level_desc, level.id);
            console.log(this.parseArea(level.type), this.list[this.parseArea(level.type)]);
          }

          let isExist = this.list[this.parseArea(level.type)].find(ls => ls.id === level.id);
          level['area_type'] = `area_${index + 1}`;
          this.list[this.parseArea(level.type)] = isExist ? [...this.list[this.parseArea(level.type)]] : [
            ...this.list[this.parseArea(level.type)],
            level
          ];
          console.log('area you choose', level.type, this.parseArea(level.type), this.geotreeService.getNextLevel(this.parseArea(level.type)));
          if (!this.formFilter.controls[this.parseArea(level.type)].disabled) this.getAudienceAreaV2(this.geotreeService.getNextLevel(this.parseArea(level.type)), level.id);

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

  parseArea(type) {
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

  getAudienceAreaV2(selection, id, event?) {
    let item: any;
    let fd = new FormData();
    let lastLevel = this.geotreeService.getBeforeLevel(this.parseArea(selection));
    let areaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(lastLevel));
    // console.log('areaSelected', areaSelected, selection, lastLevel, Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })));
    console.log('audienceareav2', this.formFilter.getRawValue());
    if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
      fd.append('area_id[]', areaSelected[0].value);
    } else if (areaSelected.length > 0) {
      if (areaSelected[0].value !== "") {
        areaSelected[0].value.map(ar => {
          fd.append('area_id[]', ar);
        })
        if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
      }
    } else {
      let beforeLastLevel = this.geotreeService.getBeforeLevel(lastLevel);
      areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLastLevel));
      // console.log('new', beforeLastLevel, areaSelected);
      if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
        fd.append('area_id[]', areaSelected[0].value);
      } else if (areaSelected.length > 0) {
        if (areaSelected[0].value !== "") {
          areaSelected[0].value.map(ar => {
            fd.append('area_id[]', ar);
          })
          if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
        }
      }
    }

    fd.append('area_type', selection === 'territory' ? 'teritory' : selection);
    let thisAreaOnSet = [];
    let areaNumber = 0;
    let expectedArea = [];
    if (!this.formFilter.get(this.parseArea(selection)).disabled) {
      thisAreaOnSet = this.areaFromLogin[0] ? this.areaFromLogin[0] : [];
      if (this.areaFromLogin[1]) thisAreaOnSet = [
        ...thisAreaOnSet,
        ...this.areaFromLogin[1]
      ];

      thisAreaOnSet = thisAreaOnSet.filter(ar => (ar.level_desc === 'teritory' ? 'territory' : ar.level_desc) === selection);
      if (id && id.length > 1) {
        areaNumber = 1;
      }

      if (areaSelected && areaSelected[0] && areaSelected[0].key !== 'national') expectedArea = thisAreaOnSet.filter(ar => areaSelected[0].value.includes(ar.parent_id));
      // console.log('on set', thisAreaOnSet, selection, id);
    }


    switch (this.parseArea(selection)) {
      case 'zone':
        // area = this.formFilter.get(selection).value;
        this.geotreeService.getChildFilterArea(fd).subscribe(res => {
          // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
          // this.list[this.parseArea(selection)] = res.data;
          this.list[this.parseArea(selection)] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

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
        break;
      case 'region':
        // area = this.formFilter.get(selection).value;
        item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => {
          return id && id.length > 0 ? id[0] : id;
        })[0] : {};
        if (item && item.name && item.name !== 'all') {
          this.geotreeService.getChildFilterArea(fd).subscribe(res => {
            // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
            // this.list[selection] = res.data;
            this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
            // fd = null
          });
        } else {
          this.list[selection] = []
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
        item = this.list['region'].length > 0 ? this.list['region'].filter(item => {
          return id && id.length > 0 ? id[0] : id;
        })[0] : {};
        console.log('area hitted', selection, item, this.list['region']);
        if (item && item.name && item.name !== 'all') {
          this.geotreeService.getChildFilterArea(fd).subscribe(res => {
            // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
            // this.list[selection] = res.data;
            this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
            // fd = null
          });
        } else {
          this.list[selection] = []
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
        item = this.list['area'].length > 0 ? this.list['area'].filter(item => {
          return id && id.length > 0 ? id[0] : id;
        })[0] : {};
        console.log('item', item);
        if (item && item.name && item.name !== 'all') {
          this.geotreeService.getChildFilterArea(fd).subscribe(res => {
            // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
            // this.list[selection] = res.data;
            this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
            // fd = null
          });
        } else {
          this.list[selection] = []
        }

        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'district':
        // area = this.formFilter.get(selection).value;
        item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => {
          return id && id.length > 0 ? id[0] : id;
        })[0] : {};
        if (item && item.name && item.name !== 'all') {
          this.geotreeService.getChildFilterArea(fd).subscribe(res => {
            // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
            this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
            // fd = null
          });
        } else {
          this.list[selection] = []
        }

        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        // area = this.formFilter.get(selection).value;
        item = this.list['district'].length > 0 ? this.list['district'].filter(item => {
          return id && id.length > 0 ? id[0] : id;
        })[0] : {};
        if (item && item.name && item.name !== 'all') {
          this.geotreeService.getChildFilterArea(fd).subscribe(res => {
            // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
            // this.list[selection] = res.data;
            this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

            // fd = null
          });
        } else {
          this.list[selection] = []
        }

        this.formFilter.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  initArea() {
    this.areaFromLogin.map(area_types => {
      area_types.map((item, index) => {
        let level_desc = '';
        switch (item.type.trim()) {
          case 'national':
            level_desc = 'zone';
            this.formFilter.get('national').setValue(item.id);
            this.formFilter.get('national').disable();
            break
          case 'division':
            level_desc = 'region';
            this.formFilter.get('zone').setValue(item.id);
            if (index !== area_types.length - 1) this.formFilter.get('zone').disable();
            break;
          case 'region':
            level_desc = 'area';
            this.formFilter.get('region').setValue(item.id);
            if (index !== area_types.length - 1) this.formFilter.get('region').disable();
            break;
          case 'area':
            level_desc = 'salespoint';
            this.formFilter.get('area').setValue(item.id);
            if (index !== area_types.length - 1) this.formFilter.get('area').disable();
            break;
          case 'salespoint':
            level_desc = 'district';
            this.formFilter.get('salespoint').setValue(item.id);
            if (index !== area_types.length - 1) this.formFilter.get('salespoint').disable();
            break;
          case 'district':
            level_desc = 'territory';
            this.formFilter.get('district').setValue(item.id);
            if (index !== area_types.length - 1) this.formFilter.get('district').disable();
            break;
          case 'territory':
            this.formFilter.get('territory').setValue(item.id);
            if (index !== area_types.length - 1) this.formFilter.get('territory').disable();
            break;
        }
        this.getAudienceArea(level_desc, item.id);
      });
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.fieldForceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          this.list[selection] = res;
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
        break;
      case 'region':
        item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.fieldForceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
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
        item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.fieldForceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
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
        item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.fieldForceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'district':
        item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.fieldForceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.fieldForceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
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

  getFfList() {
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== "" && item.value.length !== 0);
    this.pagination.area = areaSelected[areaSelected.length - 1].value;

    console.log('area_selected on ff list', areaSelected);
    let lastSelectedArea: any = areaSelected[areaSelected.length - 1];
    let is_area_2 = false;

    let self_area = this.areaFromLogin[0] ? this.areaFromLogin[0].map(area_1 => area_1.id) : [];
    let last_self_area = [];
    if (self_area.length > 0) {
      last_self_area.push(self_area[self_area.length - 1]);
    }

    if (this.areaFromLogin[1]) {
      let second_areas = this.areaFromLogin[1];
      last_self_area = [
        ...last_self_area,
        second_areas[second_areas.length - 1].id
      ];
      self_area = [
        ...self_area,
        ...second_areas.map(area_2 => area_2.id).filter(area_2 => self_area.indexOf(area_2) === -1)
      ];
    }

    this.pagination['self_area'] = self_area;
    this.pagination['last_self_area'] = last_self_area;

    if (lastSelectedArea.value.length === 1 && this.areaFromLogin.length > 1) {
      let oneAreaSelected = lastSelectedArea.value[0];
      console.log('oneArea Selected', oneAreaSelected);
      let findOnFirstArea = this.areaFromLogin[0].find(are => are.id === oneAreaSelected);
      if (findOnFirstArea) is_area_2 = false;
      else is_area_2 = true;

      if (is_area_2) this.pagination['last_self_area'] = [last_self_area[1]];
      else this.pagination['last_self_area'] = [last_self_area[0]];
    }

    this.loadingIndicator = true;

    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.fieldForceService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
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

    console.log("Select Event", selected, this.selected);
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

    this.fieldForceService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
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

    this.fieldForceService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
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

    this.fieldForceService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  deleteFf(id): void {
    this.id = id;
    let data = {
      titleDialog: "Hapus Field Force",
      captionDialog: "Apakah anda yakin untuk menghapus Field Force ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.fieldForceService.delete({ fieldforce_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

        this.getFfList();
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  directEdit(param?: any): void {
    // let navigationExtras: NavigationExtras = {
    //   queryParams: param
    // }
    this.dataService.setToStorage("detail_field_force", param);
    this.router.navigate(["user-management", "field-force", "edit"]);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage("detail_field_force", param);
    this.router.navigate(["user-management", "field-force", "detail"]);
  }
}
