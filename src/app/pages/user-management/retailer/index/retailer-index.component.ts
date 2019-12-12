import { Component, OnInit, ViewChild, TemplateRef, ElementRef, NgZone } from "@angular/core";
import { Page } from "app/classes/laravel-pagination";
import { Subject, Observable } from "rxjs";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Router } from "@angular/router";
import { DialogService } from "app/services/dialog.service";
import { DataService } from "app/services/data.service";
import { RetailerService } from "../../../../services/user-management/retailer.service";
import { FormGroup, FormBuilder, FormControl, FormArray } from "@angular/forms";
import { PagesName } from "app/classes/pages-name";
import { HttpErrorResponse } from "@angular/common/http";
import { MatDialogConfig, MatDialog } from "@angular/material";
import { ImportAccessCashierDialogComponent } from "../import-access-cashier-dialog/import-access-cashier-dialog.component";
import { GeotreeService } from "app/services/geotree.service";
import * as _ from 'lodash';

@Component({
  selector: "app-retailer-index",
  templateUrl: "./retailer-index.component.html",
  styleUrls: ["./retailer-index.component.scss"]
})
export class RetailerIndexComponent {
  rows: any[];
  selected: any[];
  id: any[];

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  dialogRef: any;
  exportAccessCashier: boolean;

  keyUp = new Subject<string>();

  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  listLevelArea: any[];
  list: any;
  areaFromLogin;
  area_id_list = [];
  formFilter: FormGroup;
  filterArea: Boolean;

  permission: any;
  roles: PagesName = new PagesName();

  offsetPagination: any;
  needContinue: boolean = false;
  endArea: String;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private retailerService: RetailerService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private geotreeService: GeotreeService

  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.retailer');
    console.log(this.permission);

    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    console.log('asdas', this.dataService.getDecryptedProfile());
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
      zone: new FormControl(),
      region: new FormControl(),
      area: new FormControl(),
      salespoint: new FormControl(),
      district: new FormControl(),
      territory: new FormControl()
    })

    // this.initArea();
    this.initAreaV2();
    this.getRetailerList();

    this.formFilter.valueChanges.debounceTime(1000).subscribe((res) => {
      this.getRetailerList();
    });
    this.formFilter.get('zone').valueChanges.subscribe(res => {
      console.log('zone', res);
      if (res) {
        this.getAudienceAreaV2('zone', res);
      }
    });
    this.formFilter.get('region').valueChanges.subscribe(res => {
      console.log('region', res);
      if (res) {
        this.getAudienceAreaV2('region', res);
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
    let lastDiffLevelIndex = levelAreas.findIndex(level => level === sameArea.type);

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
    console.log(this.list, lastLevelDisabled);
  }

  parseArea(type) {
    return type === 'division' ? 'zone' : type;
  }

  getChildAreas(selection, id) {
    console.log(selection, id);

    // let areas = this.dataService.getDecryptedProfile()['areas'];
    // let index = areas.findIndex(area => area.map(ar => ar.id).includes(id));
    // let needPopulate = areas[0] ? areas[0].find(area => this.parseArea(area.type) === selection) : null;
    // if (!needPopulate) {
    //   this.getAudienceAreaV2(selection, id);
    // } else {
    //   // console.log(this.geotreeService.mutableAreas);
    //   // let mutableAreas = this.geotreeService.mutableAreas;
    //   // let last = mutableAreas.areas.findIndex(ar => ar === selection);
    //   // mutableAreas.areas.map((area, indexArea) => {
    //   //   if (last > indexArea) return;

    //   //   if (this.parseArea(selection) === selection) {
    //   //     let item = areas[index].find(ar => this.parseArea(ar.type) === area);
    //   //     if (item) {
    //   //       this.list[this.parseArea(area)] = [item];
    //   //       this.formFilter.get(this.parseArea(area)).setValue(item.id);
    //   //     }
    //   //   }
    //   // });
    // }
  }

  getAudienceAreaV2(selection, id) {
    let item: any;
    // let selection = this.geotreeService.getNextLevel(areaSelected);
    // console.log('next', selection, areaSelected);
    let fd = new FormData();
    console.log('lk12j3kj12', id);
    // let area = this.formFilter.get(selection).value || [];
    let lastLevel = this.geotreeService.getBeforeLevel(selection);
    let areaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === lastLevel);
    if (areaSelected.length > 0) {
      console.log('asdkjkwqe12dxhuscazp- ', areaSelected, selection, lastLevel, id);
      areaSelected[0].value.map(ar => {
        fd.append('area_id[]', ar);
      })
    } else {
      let beforeLastLevel = this.geotreeService.getBeforeLevel(lastLevel);
      let lastAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === beforeLastLevel);
      console.log('new', beforeLastLevel, lastAreaSelected);
      if (lastAreaSelected.length > 0) {
        lastAreaSelected[0].value.map(ar => {
          fd.append('area_id[]', ar);
        })
      }
    }
    fd.append('area_type', selection);
    switch (selection) {
      case 'zone':
        // area = this.formFilter.get(selection).value;
        this.geotreeService.getChildFilterArea(fd).subscribe(res => {
          // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
          this.list[selection] = res.data;
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
            this.list[selection] = res.data;
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
            this.list[selection] = res.data;
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
            this.list[selection] = res.data;
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
            this.list[selection] = res.data;
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
            this.list[selection] = res.data;
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
    let areas = this.dataService.getDecryptedProfile()['areas'] || [];
    this.geotreeService.getFilter2Geotree(areas);
    let sameArea = this.geotreeService.diffLevelStarted;
    let areasDisabled = this.geotreeService.disableArea(sameArea);
    let lastLevelDisabled = null;

    if (this.areaFromLogin && this.areaFromLogin.length > 0) {
      this.areaFromLogin[0].map(item => {
        // console.log('area', item, sameArea);
        let level_desc = '';
        switch (item.type.trim()) {
          case 'national':
            level_desc = 'zone';
            this.formFilter.get('national').setValue(1);
            this.formFilter.get('national').disable();
            this.getAudienceArea(level_desc, item.id);
            break;
          case 'division':
            level_desc = 'region';
            this.formFilter.get('zone').setValue(item.id);
            if (sameArea.level_desc === 'division') {
              lastLevelDisabled = 'division';
              this.formFilter.get('zone').disable();
            }
            if (areasDisabled.indexOf(item.type) > -1) this.formFilter.get('zone').disable();
            // this.getFilterArea(level_desc, item.id);
            if (this.formFilter.get('zone').disabled) this.getFilterArea(level_desc, item.id);
            // else this.getAudienceArea(level_desc, item.id);
            break;
          case 'region':
            level_desc = 'area';
            this.formFilter.get('region').setValue(item.id);
            if (sameArea.level_desc === 'region') {
              lastLevelDisabled = 'region';
              this.formFilter.get('region').disable();
            }
            if (areasDisabled.indexOf(item.type) > -1) this.formFilter.get('region').disable();
            // this.getFilterArea(level_desc, item.id);
            if (this.formFilter.get('region').disabled) this.getFilterArea(level_desc, item.id);
            // else this.getAudienceArea(level_desc, item.id);
            break;
          case 'area':
            level_desc = 'salespoint';
            this.formFilter.get('area').setValue(item.id);
            if (sameArea.level_desc === 'area') {
              lastLevelDisabled = 'area';
              this.formFilter.get('area').disable();
            }
            if (areasDisabled.indexOf(item.type) > -1) this.formFilter.get('area').disable();
            // this.getFilterArea(level_desc, item.id);
            if (this.formFilter.get('area').disabled) this.getFilterArea(level_desc, item.id);
            // else this.getAudienceArea(level_desc, item.id);
            break;
          case 'salespoint':
            level_desc = 'district';
            this.formFilter.get('salespoint').setValue(item.id);
            if (sameArea.level_desc === 'salespoint') {
              lastLevelDisabled = 'salespoint';
              this.formFilter.get('salespoint').disable();
            }
            if (areasDisabled.indexOf(item.type) > -1) this.formFilter.get('salespoint').disable();
            // this.getFilterArea(level_desc, item.id);
            if (this.formFilter.get('salespoint').disabled) this.getFilterArea(level_desc, item.id);
            // else this.getAudienceArea(level_desc, item.id);
            break;
          case 'district':
            level_desc = 'territory';
            this.formFilter.get('district').setValue(item.id);
            if (sameArea.level_desc === 'district') {
              lastLevelDisabled = 'district';
              this.formFilter.get('district').disable();
            }
            if (areasDisabled.indexOf(item.type) > -1) this.formFilter.get('district').disable();
            // this.getFilterArea(level_desc, item.id);
            if (this.formFilter.get('district').disabled) this.getFilterArea(level_desc, item.id);
            // else this.getAudienceArea(level_desc, item.id);
            break;
          case 'territory':
            this.formFilter.get('territory').setValue(item.id);
            break;
          default:
            level_desc = 'zone';
            this.formFilter.get('national').setValue(1);
            this.formFilter.get('national').disable();
        }
        console.log(level_desc, lastLevelDisabled);
        // this.getAudienceArea(level_desc, item.id);
      });
    }
    // this.areaFromLogin.map(area_types => {
    //   area_types.map((item, index) => {
    //     let level_desc = '';
    //     switch (item.type.trim()) {
    //       case 'national':
    //         level_desc = 'zone';
    //         this.formFilter.get('national').setValue(item.id);
    //         this.formFilter.get('national').disable();
    //         break
    //       case 'division':
    //         level_desc = 'region';
    //         this.formFilter.get('zone').setValue(item.id);
    //         if (index !== area_types.length - 1) this.formFilter.get('zone').disable();
    //         break;
    //       case 'region':
    //         level_desc = 'area';
    //         this.formFilter.get('region').setValue(item.id);
    //         if (index !== area_types.length - 1) this.formFilter.get('region').disable();
    //         break;
    //       case 'area':
    //         level_desc = 'salespoint';
    //         this.formFilter.get('area').setValue(item.id);
    //         if (index !== area_types.length - 1) this.formFilter.get('area').disable();
    //         break;
    //       case 'salespoint':
    //         level_desc = 'district';
    //         this.formFilter.get('salespoint').setValue(item.id);
    //         if (index !== area_types.length - 1) this.formFilter.get('salespoint').disable();
    //         break;
    //       case 'district':
    //         level_desc = 'territory';
    //         this.formFilter.get('district').setValue(item.id);
    //         if (index !== area_types.length - 1) this.formFilter.get('district').disable();
    //         break;
    //       case 'territory':
    //         this.formFilter.get('territory').setValue(item.id);
    //         if (index !== area_types.length - 1) this.formFilter.get('territory').disable();
    //         break;
    //     }
    //     this.getAudienceArea(level_desc, item.id);
    //   });
    // });
  }

  getFilterArea(selection, id) {
    let item: any;
    let areas = this.dataService.getDecryptedProfile()['areas'];
    switch (selection) {
      case 'zone':
        this.list[selection] = areas.map(ar => ar.find(level => level.type === selection));

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
        if (!this.formFilter.get('zone').disabled && this.list[selection] && this.list[selection].length === 0) {
          this.getAudienceArea(selection, id);
        }
        break;
      case 'region':
        this.list[selection] = areas.map(ar => ar.find(level => level.type === selection));

        this.formFilter.get('area').setValue('');
        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        // this.list['region'] = [];
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        // if(this.formFilter.get('zone').disabled) this.getAudienceArea(selection, id);
        if (!this.formFilter.get('region').disabled && this.list[selection] && this.list[selection].length === 0) {
          this.getAudienceArea(selection, id);
        }
        break;
      case 'area':
        this.list[selection] = areas.map(ar => ar.find(level => level.type === selection));

        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        // this.list['region'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        if (!this.formFilter.get('area').disabled && this.list[selection] && this.list[selection].length === 0) {
          this.getAudienceArea(selection, id);
        }
        break;
      case 'salespoint':
        this.list[selection] = areas.map(ar => ar.find(level => level.type === selection));

        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        // this.list['region'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        if (!this.formFilter.get('salespoint').disabled && this.list[selection] && this.list[selection].length === 0) {
          this.getAudienceArea(selection, id);
        }
        break;
      case 'district':
        this.formFilter.get('territory').setValue('');
        // this.list['region'] = [];
        this.list['territory'] = [];
        if (!this.formFilter.get('district').disabled && this.list[selection] && this.list[selection].length === 0) {
          this.getAudienceArea(selection, id);
        }
        break;
      case 'territory':
        this.getAudienceArea(selection, id);
        break;
      default:
        break;
    }
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
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
          this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
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
          this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
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
          this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
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
          this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
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
          this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
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
    // let filteredArea = areaList.slice(1, areaList.length).filter(ar => this.area_id_list.includes(Number(ar.id)));
    // // if (areaList && areaList[0]) filteredArea.unshift(areaList[0]);
    // return filteredArea.length > 0 ? filteredArea : areaList;
    return areaList;
  }

  getRetailerList() {
    this.dataService.showLoading(true);
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== "" && item.value.length !== 0);
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
    console.log(areaSelected);
    // this.pagination.sort = "name";
    // this.pagination.sort_type = "asc";

    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.loadingIndicator = true;
    this.retailerService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.onLoad = false;

        this.loadingIndicator = false;
        this.dataService.showLoading(false);
      },
      err => {
        console.error(err);
        this.onLoad = false;
        this.dataService.showLoading(false);
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

    this.retailerService.get(this.pagination).subscribe(res => {
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

    this.retailerService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.loadingIndicator = false;
      },
      err => {
        this.loadingIndicator = false;
      }
    );
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

    this.retailerService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  deleteWholesaler(id): void {
    this.id = id;
    let data = {
      titleDialog: "Hapus Retailer",
      captionDialog: "Apakah anda yakin untuk menghapus Retailer ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.retailerService.delete({ retailer_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

        this.getRetailerList();
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  directEdit(param?: any): void {
    console.log('paramsss', param);
    // this.dataService.setToStorage("detail_retailer", param);
    this.dataService.setToStorage("id_retailer", param.id);
    this.router.navigate(["user-management", "retailer", "edit"]);
  }

  directDetail(param?: any): void {
    // this.dataService.setToStorage("detail_retailer", param);
    this.dataService.setToStorage("id_retailer", param.id);
    this.router.navigate(["user-management", "retailer", "detail"]);
  }

  async export() {
    this.dataService.showLoading(true);
    this.exportAccessCashier = true;
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.value !== "");
    let area_id = areaSelected[areaSelected.length - 1].value;
    console.log('area you selected', area_id, areaSelected[areaSelected.length - 1]);
    try {
      const response = await this.retailerService.getAccessCashier({ area_id: area_id }).toPromise();
      console.log('he', response.headers);
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `Export_Retailer_${new Date().toLocaleString()}.xlsx`);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
      this.exportAccessCashier = false;
      this.dataService.showLoading(false);

    } catch (error) {
      this.exportAccessCashier = false;
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

  import(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { password: 'P@ssw0rd' };

    this.dialogRef = this.dialog.open(ImportAccessCashierDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.selected = response;
        if (response.data) {
          this.dialogService.openSnackBar({ message: 'File berhasil diimport' });
          this.getRetailerList();
        }
      }
    });
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
}
