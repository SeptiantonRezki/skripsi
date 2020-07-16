import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { NewSignService } from 'app/services/settings/new-sign.service';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { Subject } from 'rxjs';
import { GeotreeService } from 'app/services/geotree.service';
import { NotificationService } from 'app/services/notification.service';
import { RetailerService } from 'app/services/user-management/retailer.service';
import * as _ from "lodash";
import * as moment from "moment";
import { Router } from '@angular/router';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-new-sign',
  templateUrl: './new-sign.component.html',
  styleUrls: ['./new-sign.component.scss']
})
export class NewSignComponent implements OnInit {
  listApplication: any[] = [{ name: 'Retailer', value: 'retailer' }, { name: 'Customer', value: 'customer' }, { name: 'Wholesaler', value: 'wholesaler' }];
  formNewSign: FormGroup;
  formFilter: FormGroup;
  onLoad: boolean;
  loadingIndicator: boolean;
  showLoading: Boolean;
  listLevelArea: any[];
  indexDelete: any;
  list: any;
  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;

  audienceSelected: any[] = [];

  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;
  SelecectionType = SelectionType;

  rows: any[];
  selected: any[] = [];
  id: any[];
  reorderable = true;
  pagination: Page = new Page();

  keyUp = new Subject<string>();
  areaType: any[] = [];

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;
  menuList: any[] = [];
  iconList: any[] = [];
  areaIdNonTargetAudience: any = 1;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private newSignService: NewSignService,
    private geotreeService: GeotreeService,
    private notificationService: NotificationService,
    private retailerService: RetailerService,
    private router: Router
  ) {
    this.areaType = this.dataService.getDecryptedProfile()['area_type'];
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

    this.selected = [];

    this.list = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }
  }

  ngOnInit() {
    this.formNewSign = this.formBuilder.group({
      application: ["retailer", Validators.required],
      menu: ["", Validators.required],
      date: [null, Validators.required],
      time: [null, Validators.required],
      endDate: [null, Validators.required],
      endTime: [null, Validators.required],
      is_target_audience: [false],
      areas: this.formBuilder.array([]),
      icon: ["", Validators.required]
    });

    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })

    this.getIconList();
    this.getMenuList();
    this.addArea();
    // this.initFilterArea();
    this.initAreaV2();

    this.formFilter.get('zone').valueChanges.subscribe(res => {
      // console.log('zone', res);
      if (res) {
        this.getAudienceAreaV2('region', res);
        this.getAudience();
      }
    });
    this.formFilter.get('region').valueChanges.subscribe(res => {
      // console.log('region', res);
      if (res) {
        this.getAudienceAreaV2('area', res);
        this.getAudience();
      }
    });
    this.formFilter.get('area').valueChanges.subscribe(res => {
      // console.log('area', res, this.formFilter.value['area']);
      if (res) {
        this.getAudienceAreaV2('salespoint', res);
        this.getAudience();
      }
    });
    this.formFilter.get('salespoint').valueChanges.subscribe(res => {
      // console.log('salespoint', res);
      if (res) {
        this.getAudienceAreaV2('district', res);
        this.getAudience();
      }
    });
    this.formFilter.get('district').valueChanges.subscribe(res => {
      // console.log('district', res);
      if (res) {
        this.getAudienceAreaV2('territory', res);
        this.getAudience();
      }
    });
    this.formFilter.get('territory').valueChanges.subscribe(res => {
      // console.log('territory', res);
      if (res) {
        // this.getAudienceAreaV2('territory', res);
        this.getAudience();
      }
    });

    this.formNewSign.get('application').valueChanges.subscribe(res => {
      this.getMenuList();
      if (this.formNewSign.get('is_target_audience').value === true) {
        this.getAudienceAreaV2('region', res);
        this.getAudience();
      }
    })
  }

  getMenuList() {
    this.newSignService.getMenuList({ type: this.formNewSign.get('application').value }).subscribe(res => {
      // console.log('menuList', res);
      this.menuList = res && res.data ? res.data : [];
    })
  }

  getIconList() {
    this.newSignService.getIconList().subscribe(res => {
      // console.log('iconList', res);
      this.iconList = res && res.data ? res.data : [];
    })
  }

  submit() {
    // console.log('this.pagination.area', this.pagination.area);
    if (this.formNewSign.valid) {

      let body = {
        type: this.formNewSign.get('application').value,
        menu: this.formNewSign.get('menu').value,
        start_date: moment(this.formNewSign.get('date').value).format("YYYY-MM-DD").toString() + " " + this.formNewSign.get('time').value + ":00",
        end_date: moment(this.formNewSign.get('endDate').value).format("YYYY-MM-DD") + " " + this.formNewSign.get('endTime').value + ":00",
        sign: this.formNewSign.get("icon").value,
      }

      if (this.formNewSign.get('is_target_audience').value === true) {
        body['target_audience'] = 1;
        body['target_audiences'] = this.audienceSelected.map(aud => aud.id);
      } else {
        body['area_id'] = [this.areaIdNonTargetAudience];
        if (body['target_audience']) {
          body['target_audience'] = 0;
          let _areas = [];
          let areas = [];
          let value = this.formNewSign.getRawValue();

          value.areas.map(item => {
            let obj = Object.entries(item).map(([key, value]) => ({ key, value }))
            for (const val of this.typeArea) {
              const filteredValue = obj.find(xyz => val === xyz.key && xyz.value !== "");
              if (filteredValue) _areas.push(filteredValue)
            }

            areas.push(_.last(_areas));
            _areas = [];
          })

          let same = this.findDuplicate(areas.map(item => item.value));
          if (same.length > 0) {
            this.dataService.showLoading(false);
            return this.dialogService.openSnackBar({ message: "Terdapat duplikat sales tree, mohon periksa kembali data anda!" });
          }

          body['areas'] = areas.map(item => item.value);
        }
      }
      this.dataService.showLoading(true);
      this.newSignService.create(body).subscribe(res => {
        this.dialogService.openSnackBar({
          message: "Data berhasil disimpan!"
        })
        this.dataService.showLoading(false);
        window.location.reload();
      }, err => {
        this.dataService.showLoading(false);
      })
    } else {
      this.dialogService.openSnackBar({ message: "Terjadi Kesalahan, Silahkan lengkapi kembali data anda!" });
      commonFormValidator.validateAllFields(this.formNewSign);
    }
  }

  initAreaV2() {
    let areas = this.dataService.getDecryptedProfile()['areas'] || [];
    this.geotreeService.getFilter2Geotree(areas);
    let sameArea = this.geotreeService.diffLevelStarted;
    let areasDisabled = this.geotreeService.disableArea(sameArea);
    this.lastLevel = areasDisabled;
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
            // console.log('ff value', this.formFilter.value);
            // console.log(this.formFilter.controls[this.parseArea(level.type)]);
            if (sameArea.level_desc === level.type) {
              lastLevelDisabled = level.type;

              this.formFilter.get(this.parseArea(level.type)).disable();
            }

            if (areasDisabled.indexOf(level.type) > -1) this.formFilter.get(this.parseArea(level.type)).disable();
            // if (this.formFilter.get(this.parseArea(level.type)).disabled) this.getFilterArea(level_desc, level.id);
            // console.log(this.parseArea(level.type), this.list[this.parseArea(level.type)]);
          }

          let isExist = this.list[this.parseArea(level.type)].find(ls => ls.id === level.id);
          level['area_type'] = `area_${index + 1}`;
          this.list[this.parseArea(level.type)] = isExist ? [...this.list[this.parseArea(level.type)]] : [
            ...this.list[this.parseArea(level.type)],
            level
          ];
          // console.log('area you choose', level.type, this.parseArea(level.type), this.geotreeService.getNextLevel(this.parseArea(level.type)));
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
    // console.log('audienceareav2', this.formFilter.getRawValue(), areaSelected[0]);
    if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
      fd.append('area_id[]', areaSelected[0].value);
    } else if (areaSelected.length > 0) {
      if (areaSelected[0].value !== "") {
        areaSelected[0].value.map(ar => {
          fd.append('area_id[]', ar);
        })
        // if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
        if (areaSelected[0].value.length === 0) {
          let beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
          let newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
          // console.log('the selection', this.parseArea(selection), newAreaSelected);
          if (newAreaSelected[0].key !== 'national') {
            newAreaSelected[0].value.map(ar => {
              fd.append('area_id[]', ar);
            })
          } else {
            fd.append('area_id[]', newAreaSelected[0].value);
          }
        }
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
          // if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
          if (areaSelected[0].value.length === 0) {
            let beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
            let newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
            // console.log('the selection', this.parseArea(selection), newAreaSelected);
            if (newAreaSelected[0].key !== 'national') {
              newAreaSelected[0].value.map(ar => {
                fd.append('area_id[]', ar);
              })
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
        // console.log('zone selected', selection, this.list['region'], this.formFilter.get('region').value);
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
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = []
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
          // console.log('area hitted', selection, item, this.list['region']);
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
          // console.log('item', item);
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
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = []
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
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

              // fd = null
            });
          } else {
            this.list[selection] = []
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

  initFilterArea() {
    this.areaFromLogin.map(item => {
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
          this.formFilter.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          this.formFilter.get('region').setValue(item.id);
          this.formFilter.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          this.formFilter.get('area').setValue(item.id);
          this.formFilter.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          this.formFilter.get('salespoint').setValue(item.id);
          this.formFilter.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          this.formFilter.get('district').setValue(item.id);
          this.formFilter.get('district').disable();
          break;
        case 'territory':
          this.formFilter.get('territory').setValue(item.id);
          this.formFilter.get('territory').disable();
          break;
      }
      this.getAudienceArea(level_desc, item.id);
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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

  createArea(): FormGroup {
    return this.formBuilder.group({
      national: [1, Validators.required],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""],
      list_national: this.formBuilder.array(this.listLevelArea),
      list_zone: this.formBuilder.array([]),
      list_region: this.formBuilder.array([]),
      list_area: this.formBuilder.array([]),
      list_salespoint: this.formBuilder.array([]),
      list_district: this.formBuilder.array([]),
      list_territory: this.formBuilder.array([])
    })
  }

  addArea() {
    let wilayah = this.formNewSign.controls['areas'] as FormArray;
    wilayah.push(this.createArea());
    const index = wilayah.length > 0 ? (wilayah.length - 1) : 0
    this.initArea(index);
    this.generataList('zone', 1, index, 'render');
  }

  deleteArea(idx) {
    this.indexDelete = idx;
    let data = {
      titleDialog: "Hapus Salestree",
      captionDialog: `Apakah anda yakin untuk menghapus Salestree ${idx + 1} ?`,
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  initArea(index) {
    let wilayah = this.formNewSign.controls['areas'] as FormArray;
    this.areaType.map(item => {
      switch (item.type.trim()) {
        case 'national':
          wilayah.at(index).get('national').disable();
          break
        case 'division':
          wilayah.at(index).get('zone').disable();
          break;
        case 'region':
          wilayah.at(index).get('region').disable();
          break;
        case 'area':
          wilayah.at(index).get('area').disable();
          break;
        case 'salespoint':
          wilayah.at(index).get('salespoint').disable();
          break;
        case 'district':
          wilayah.at(index).get('district').disable();
          break;
        case 'territory':
          wilayah.at(index).get('territory').disable();
          break;
      }
    })
  }

  initFormGroup(response, index) {
    response.data.map(item => {
      let level_desc = '';
      switch (item.level_desc.trim()) {
        case 'national':
          level_desc = 'zone';
          break
        case 'division':
          level_desc = 'region';
          break;
        case 'region':
          level_desc = 'area';
          break;
        case 'area':
          level_desc = 'salespoint';
          break;
        case 'salespoint':
          level_desc = 'district';
          break;
        case 'district':
          level_desc = 'territory';
          break;
      }
      this.generataList(level_desc, item.id, index, 'render');
    });
  }

  async generataList(selection, id, index, type) {
    this.areaIdNonTargetAudience = id;
    let item: any;
    let wilayah = this.formNewSign.controls['areas'] as FormArray;
    switch (selection) {
      case 'zone':
        const response = await this.notificationService.getListOtherChildren({ parent_id: id }).toPromise();
        let list = wilayah.at(index).get(`list_${selection}`) as FormArray;

        while (list.length > 0) {
          list.removeAt(list.length - 1);
        }

        _.clone(response || []).map(item => {
          list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Zone' : item.name }));
        });

        if (type !== 'render') {
          wilayah.at(index).get('region').setValue(null);
          wilayah.at(index).get('area').setValue('');
          wilayah.at(index).get('salespoint').setValue('');
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          this.clearFormArray(index, 'list_region');
          this.clearFormArray(index, 'list_area');
          this.clearFormArray(index, 'list_salespoint');
          this.clearFormArray(index, 'list_district');
          this.clearFormArray(index, 'list_territory');
        }
        break;
      case 'region':
        item = wilayah.at(index).get('list_zone').value.length > 0 ? wilayah.at(index).get('list_zone').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua Zone') {
          const response = await this.notificationService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item => {
            list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Regional' : item.name }));
          });
        }

        if (type !== 'render') {
          wilayah.at(index).get('region').setValue('');
          wilayah.at(index).get('area').setValue('');
          wilayah.at(index).get('salespoint').setValue('');
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          if (item.name === 'Semua Zone') {
            this.clearFormArray(index, 'list_region');
          }
          this.clearFormArray(index, 'list_area');
          this.clearFormArray(index, 'list_salespoint');
          this.clearFormArray(index, 'list_district');
          this.clearFormArray(index, 'list_territory');
        }
        break;
      case 'area':
        item = wilayah.at(index).get('list_region').value.length > 0 ? wilayah.at(index).get('list_region').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua Regional') {
          const response = await this.notificationService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item => {
            list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Area' : item.name }));
          });
        }

        if (type !== 'render') {
          wilayah.at(index).get('area').setValue('');
          wilayah.at(index).get('salespoint').setValue('');
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          if (item.name === 'Semua Regional') {
            this.clearFormArray(index, 'list_area');
          }
          this.clearFormArray(index, 'list_salespoint');
          this.clearFormArray(index, 'list_district');
          this.clearFormArray(index, 'list_territory');
        }
        break;
      case 'salespoint':
        item = wilayah.at(index).get('list_area').value.length > 0 ? wilayah.at(index).get('list_area').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua Area') {
          const response = await this.notificationService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item => {
            list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Salespoint' : item.name }));
          });
        }

        if (type !== 'render') {
          wilayah.at(index).get('salespoint').setValue('');
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          if (item.name === 'Semua Area') {
            this.clearFormArray(index, 'list_salespoint');
          }
          this.clearFormArray(index, 'list_district');
          this.clearFormArray(index, 'list_territory');
        }
        break;
      case 'district':
        item = wilayah.at(index).get('list_salespoint').value.length > 0 ? wilayah.at(index).get('list_salespoint').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua Salespoint') {
          const response = await this.notificationService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item => {
            list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua District' : item.name }));
          });
        }

        if (type !== 'render') {
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          if (item.name === 'Semua Salespoint') {
            this.clearFormArray(index, 'list_district');
          }
          this.clearFormArray(index, 'list_territory');
        }
        break;
      case 'territory':
        item = wilayah.at(index).get('list_district').value.length > 0 ? wilayah.at(index).get('list_district').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua District') {
          const response = await this.notificationService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item => {
            list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Territory' : item.name }));
          });
        }

        if (type !== 'render') {
          wilayah.at(index).get('territory').setValue('');

          if (item.name === 'Semua District') {
            this.clearFormArray(index, 'list_territory');
          }
        }
        break;

      default:
        break;
    }
  }

  getArea(response, selection) {
    return response.data.filter(item => item.level_desc === selection).map(item => item.id)[0]
  }

  confirmDelete() {
    let wilayah = this.formNewSign.controls['areas'] as FormArray;
    wilayah.removeAt(this.indexDelete);
    this.dialogService.brodcastCloseConfirmation();
  }

  clearFormArray = (index, selection) => {
    let wilayah = this.formNewSign.controls['areas'] as FormArray;
    let list = wilayah.at(index).get(selection) as FormArray;
    while (list.length > 0) {
      list.removeAt(list.length - 1);
    }
  }

  getToolTipData(value, array) {
    if (value && array.length) {
      let msg = array.filter(item => item.id === value)[0]['name'];
      return msg;
    } else {
      return "";
    }
  }

  findDuplicate(array) {
    var object = {};
    var result = [];

    array.forEach(function (item) {
      if (!object[item])
        object[item] = 0;
      object[item] += 1;
    })

    for (var prop in object) {
      if (object[prop] >= 2) {
        result.push(prop);
      }
    }

    return result;
  }

  checkAreaLocation(area, lastSelfArea) {
    let lastLevelFromLogin = this.parseArea(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
    let areaList = ["national", "division", "region", "area", "salespoint", "district", "territory"];
    let areaAfterEndLevel = this.geotreeService.getNextLevel(lastLevelFromLogin);
    let indexAreaAfterEndLevel = areaList.indexOf(areaAfterEndLevel);
    let indexAreaSelected = areaList.indexOf(area.key);
    let rawValues = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value }));
    let newLastSelfArea = []
    // console.log('[checkAreaLocation:area]', area);
    // console.log('[checkAreaLocation:lastLevelFromLogin]', lastLevelFromLogin);
    // console.log('[checkAreaLocation:areaAfterEndLevel]', areaAfterEndLevel);
    if (area.value !== 1) {
      // console.log('[checkAreaLocation:list]', this.list[area.key]);
      // console.log('[checkAreaLocation:indexAreaAfterEndLevel]', indexAreaAfterEndLevel);
      // console.log('[checkAreaLocation:indexAreaSelected]', indexAreaSelected);
      if (indexAreaSelected >= indexAreaAfterEndLevel) {
        // let sameAreas = this.list[area.key].filter(ar => area.value.includes(ar.id));
        let areaSelectedOnRawValues: any = rawValues.find(raw => raw.key === areaAfterEndLevel);
        newLastSelfArea = this.list[areaAfterEndLevel].filter(ar => areaSelectedOnRawValues.value.includes(ar.id)).map(ar => ar.parent_id).filter((v, i, a) => a.indexOf(v) === i);
        // console.log('[checkAreaLocation:list:areaAfterEndLevel', this.list[areaAfterEndLevel].filter(ar => areaSelectedOnRawValues.value.includes(ar.id)), areaSelectedOnRawValues);
        // console.log('[checkAreaLocation:newLastSelfArea]', newLastSelfArea);
      }
    }

    return newLastSelfArea;
  }

  getAudience() {
    this.dataService.showLoading(true);
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== "" && item.value.length !== 0);
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
    let areaList = ["national", "division", "region", "area", "salespoint", "district", "territory"];

    // console.log('area_selected on ff list', areaSelected, this.list);
    if (this.areaFromLogin[0].length === 1 && this.areaFromLogin[0][0].type === 'national' && this.pagination.area !== 1) {
      this.pagination['after_level'] = true;
    } else {

      let lastSelectedArea: any = areaSelected[areaSelected.length - 1];
      let indexAreaAfterEndLevel = areaList.indexOf(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
      let indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
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

      let newLastSelfArea = this.checkAreaLocation(areaSelected[areaSelected.length - 1], last_self_area);

      if (this.pagination['after_level']) delete this.pagination['after_level'];
      this.pagination['self_area'] = self_area;
      this.pagination['last_self_area'] = last_self_area;
      let levelCovered = [];
      if (this.areaFromLogin[0]) levelCovered = this.areaFromLogin[0].map(level => this.parseArea(level.type));
      if (lastSelectedArea.value.length === 1 && this.areaFromLogin.length > 1) {
        let oneAreaSelected = lastSelectedArea.value[0];
        let findOnFirstArea = this.areaFromLogin[0].find(are => are.id === oneAreaSelected);
        // console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        // console.log('last self area', last_self_area, is_area_2, levelCovered, levelCovered.indexOf(lastSelectedArea.key) !== -1, lastSelectedArea);
        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2) this.pagination['last_self_area'] = [last_self_area[1]];
          else this.pagination['last_self_area'] = [last_self_area[0]];
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

    this.pagination['audience'] = this.formNewSign.get('application').value;


    this.notificationService.getPopupAudience(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.dataService.showLoading(false);
    }, err => {
      console.log('err', err);
      this.dataService.showLoading(false);
    });
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  setPage(pageInfo) {
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== "" && item.value.length !== 0);
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
    let areaList = ["national", "division", "region", "area", "salespoint", "district", "territory"];

    // console.log('area_selected on ff list', areaSelected, this.list);
    if (this.areaFromLogin[0].length === 1 && this.areaFromLogin[0][0].type === 'national' && this.pagination.area !== 1) {
      this.pagination['after_level'] = true;
    } else {

      let lastSelectedArea: any = areaSelected[areaSelected.length - 1];
      let indexAreaAfterEndLevel = areaList.indexOf(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
      let indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
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

      let newLastSelfArea = this.checkAreaLocation(areaSelected[areaSelected.length - 1], last_self_area);

      if (this.pagination['after_level']) delete this.pagination['after_level'];
      this.pagination['self_area'] = self_area;
      this.pagination['last_self_area'] = last_self_area;
      let levelCovered = [];
      if (this.areaFromLogin[0]) levelCovered = this.areaFromLogin[0].map(level => this.parseArea(level.type));
      if (lastSelectedArea.value.length === 1 && this.areaFromLogin.length > 1) {
        let oneAreaSelected = lastSelectedArea.value[0];
        let findOnFirstArea = this.areaFromLogin[0].find(are => are.id === oneAreaSelected);
        // console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        // console.log('last self area', last_self_area, is_area_2, levelCovered, levelCovered.indexOf(lastSelectedArea.key) !== -1, lastSelectedArea);
        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2) this.pagination['last_self_area'] = [last_self_area[1]];
          else this.pagination['last_self_area'] = [last_self_area[0]];
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
    this.pagination.page = pageInfo.offset + 1;
    this.notificationService.getPopupAudience(this.pagination).subscribe(res => {
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
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== "" && item.value.length !== 0);
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
    let areaList = ["national", "division", "region", "area", "salespoint", "district", "territory"];

    // console.log('area_selected on ff list', areaSelected, this.list);
    if (this.areaFromLogin[0].length === 1 && this.areaFromLogin[0][0].type === 'national' && this.pagination.area !== 1) {
      this.pagination['after_level'] = true;
    } else {

      let lastSelectedArea: any = areaSelected[areaSelected.length - 1];
      let indexAreaAfterEndLevel = areaList.indexOf(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
      let indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
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

      let newLastSelfArea = this.checkAreaLocation(areaSelected[areaSelected.length - 1], last_self_area);

      if (this.pagination['after_level']) delete this.pagination['after_level'];
      this.pagination['self_area'] = self_area;
      this.pagination['last_self_area'] = last_self_area;
      let levelCovered = [];
      if (this.areaFromLogin[0]) levelCovered = this.areaFromLogin[0].map(level => this.parseArea(level.type));
      if (lastSelectedArea.value.length === 1 && this.areaFromLogin.length > 1) {
        let oneAreaSelected = lastSelectedArea.value[0];
        let findOnFirstArea = this.areaFromLogin[0].find(are => are.id === oneAreaSelected);
        // console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        // console.log('last self area', last_self_area, is_area_2, levelCovered, levelCovered.indexOf(lastSelectedArea.key) !== -1, lastSelectedArea);
        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2) this.pagination['last_self_area'] = [last_self_area[1]];
          else this.pagination['last_self_area'] = [last_self_area[0]];
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

    this.notificationService.getPopupAudience(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== "" && item.value.length !== 0);
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
    let areaList = ["national", "division", "region", "area", "salespoint", "district", "territory"];

    // console.log('area_selected on ff list', areaSelected, this.list);
    if (this.areaFromLogin[0].length === 1 && this.areaFromLogin[0][0].type === 'national' && this.pagination.area !== 1) {
      this.pagination['after_level'] = true;
    } else {

      let lastSelectedArea: any = areaSelected[areaSelected.length - 1];
      let indexAreaAfterEndLevel = areaList.indexOf(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
      let indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
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

      let newLastSelfArea = this.checkAreaLocation(areaSelected[areaSelected.length - 1], last_self_area);

      if (this.pagination['after_level']) delete this.pagination['after_level'];
      this.pagination['self_area'] = self_area;
      this.pagination['last_self_area'] = last_self_area;
      let levelCovered = [];
      if (this.areaFromLogin[0]) levelCovered = this.areaFromLogin[0].map(level => this.parseArea(level.type));
      if (lastSelectedArea.value.length === 1 && this.areaFromLogin.length > 1) {
        let oneAreaSelected = lastSelectedArea.value[0];
        let findOnFirstArea = this.areaFromLogin[0].find(are => are.id === oneAreaSelected);
        // console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        // console.log('last self area', last_self_area, is_area_2, levelCovered, levelCovered.indexOf(lastSelectedArea.key) !== -1, lastSelectedArea);
        if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
          // console.log('its hitted [levelCovered > -1]');
          if (is_area_2) this.pagination['last_self_area'] = [last_self_area[1]];
          else this.pagination['last_self_area'] = [last_self_area[0]];
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

    this.notificationService.getPopupAudience(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  displayCheck(row) {
    return row.name !== 'Ethel Price';
  }

  onSelectAudience(event, row) {
    // console.log('onnnnnn', event);
    let index = this.audienceSelected.findIndex(r => r.id === row.id);
    if (index > - 1) {
      this.audienceSelected.splice(index, 1);
    } else {
      this.audienceSelected.push(row);
    }
    this.onSelect({ selected: this.audienceSelected });
    // console.log('asdasd', this.audienceSelected);
  }

  selectCheck(row, column, value) {
    // console.log('selectcheck', row, column, value);
    return row.id !== null;
  }

  bindSelector(isSelected, row) {
    let index = this.audienceSelected.findIndex(r => r.id === row.id);
    if (index > - 1) {
      return true;
    }
    return false;
  }

  isTargetAudience(event) {
    if (event.checked) this.getAudience();
  }

}
