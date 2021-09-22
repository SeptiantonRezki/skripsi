import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { GeotreeService } from 'app/services/geotree.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { B2CVoucherService } from 'app/services/b2c-voucher.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-list-detail-voucher',
  templateUrl: './list-detail-voucher.component.html',
  styleUrls: ['./list-detail-voucher.component.scss']
})
export class ListDetailVoucherComponent implements OnInit {
  onLoad: boolean;
  detailVoucher: any;

  formFilter: FormGroup;
  formFilterAdditional: FormGroup;
  via: FormControl = new FormControl('');

  areaType: any[] = [];
  areaFromLogin: any;
  area_id_list: any = [];
  listLevelArea: any[];
  lastLevel: any;
  list: any;
  endArea: String;

  keyUp = new Subject<string>();
  viaList: any[] = [
    { name: 'Semua', value: 'all' },
    { name: 'Retailer', value: 'retailer' },
    { name: 'Kasir', value: 'cashier' }
  ];
  statusList: any[] = [
    { name: 'Semua', value: 'all' },
    { name: 'Belum di redeem', value: '0' },
    { name: 'Sudah di redeem', value: '1' }
  ];

  loadingIndicator: boolean;
  reorderable: boolean;
  rows: any[] = [];
  pagination: Page = new Page();
  offsetPagination: any;
  isSort: boolean;

  _data: any = null;
  @Input()
  set data(data: any) {
    this.detailVoucher = data;
    // this._data = data;
  }
  get data(): any { return this._data; }

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private b2cVoucherService: B2CVoucherService,
    private geotreeService: GeotreeService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private ls: LanguagesService
  ) {
    this.areaType = this.dataService.getDecryptedProfile()['area_type'];
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
    };
    this.isSort = false;
    this.loadingIndicator = true;
    this.reorderable = true;
    this.rows = [];

    this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        // this.getListMitra(data);
      });
  }

  ngOnInit() {

    this.formFilter = this.formBuilder.group({
      national: [''],
      zone: [''],
      region: [''],
      area: [''],
      via: [''],
      status: ['']
    });

    this.formFilterAdditional = this.formBuilder.group({
      via: [''],
      status: ['']
    });

    this.detailVoucher = this.dataService.getFromStorage('detail_voucher_b2c');
    this.initAreaV2();
    this.getListDetailVoucher();

    this.formFilter.valueChanges.debounceTime(1000).subscribe(res => {
      this.getListDetailVoucher();
    });

    this.formFilter.get('zone').valueChanges.subscribe(res => {
      if (res) {
        this.getAudienceAreaV2('region', res);
      }
    });
    this.formFilter.get('region').valueChanges.subscribe(res => {
      if (res) {
        this.getAudienceAreaV2('area', res);
      }
    });
    this.formFilter.get('via').valueChanges.subscribe(res => {
      if (res !== 'all') {
        this.pagination['from'] = res;
      } else {
        delete this.pagination['from'];
      }
    });
    this.formFilter.get('status').valueChanges.subscribe(res => {
      if (res !== 'all') {
        this.pagination['redeem'] = res;
      } else {
        delete this.pagination['redeem'];
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
          if (!this.formFilter.controls[this.parseArea(level.type)] || !this.formFilter.controls[this.parseArea(level.type)].value ||
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

  getListDetailVoucher(string?: any) {
    try {
      this.dataService.showLoading(true);
      this.pagination.per_page = 25;
      if (string) { this.pagination.search = string;
      } else { delete this.pagination.search; }
      const areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) =>
      ({ key, value })).filter((item: any, index: number) => item.value !== null && item.value !== '' && item.value.length !== 0 && index !== 4 && index !== 5);
      const area_id = areaSelected[areaSelected.length - 1].value;
      const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
      this.pagination.area = area_id;
      
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
          if (findOnFirstArea) { is_area_2 = false;
          } else { is_area_2 = true; }

          if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
            if (is_area_2) { this.pagination['last_self_area'] = [last_self_area[1]];
          } else { this.pagination['last_self_area'] = [last_self_area[0]]; }
          } else {
            this.pagination['after_level'] = true;
            this.pagination['last_self_area'] = newLastSelfArea;
          }
        } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
          this.pagination['after_level'] = true;
          if (newLastSelfArea.length > 0) {
            this.pagination['last_self_area'] = newLastSelfArea;
          }
        }
      }
      this.loadingIndicator = true;
      this.getList();
    } catch (ex) {
      console.warn('ex', ex);
      this.dataService.showLoading(false);
    }
  }

  getList() {
    if (this.detailVoucher) {
      this.b2cVoucherService.getListDetailVoucher({ voucher_id: this.detailVoucher.id }, this.pagination).subscribe(res => {
        if (res.status === 'success') {
          Page.renderPagination(this.pagination, res.data);
          this.rows = res.data.data;
          this.loadingIndicator = false;
          this.isSort = false;
          this.dataService.showLoading(false);
        } else {
          this.dialogService.openSnackBar({ message: 'Terjadi Kesalahan Pencarian' });
          Page.renderPagination(this.pagination, res.data);
          this.rows = [];
          this.loadingIndicator = false;
          this.dataService.showLoading(false);
        }
      }, err => {
        console.warn(err);
        this.dialogService.openSnackBar({ message: 'Terjadi Kesalahan Pencarian' });
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
      });
    } else {
      setTimeout(() => {
        this.getList();
      }, 1000);
    }
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
          areaSelectedOnRawValues.value.includes(ar.id)).map(ar => ar.parent_id).filter((v, i, a) => a.indexOf(v) === i);
      }
    }

    return newLastSelfArea;
  }

  getAudienceAreaV2(selection, id, event?) {
    let item: any;
    const fd = new FormData();
    const lastLevel = this.geotreeService.getBeforeLevel(this.parseArea(selection));
    let areaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) =>
    ({ key, value })).filter(item => item.key === this.parseArea(lastLevel));
    if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
      fd.append('area_id[]', areaSelected[0].value);
    } else if (areaSelected.length > 0) {
      if (areaSelected[0].value !== '') {
        areaSelected[0].value.map(ar => {
          fd.append('area_id[]', ar);
        });
        if (areaSelected[0].value.length === 0) {
          const beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
          const newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) =>
          ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
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
      areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) =>
      ({ key, value })).filter(item => item.key === this.parseArea(beforeLastLevel));
      if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
        fd.append('area_id[]', areaSelected[0].value);
      } else if (areaSelected.length > 0) {
        if (areaSelected[0].value !== '') {
          areaSelected[0].value.map(ar => {
            fd.append('area_id[]', ar);
          });
          if (areaSelected[0].value.length === 0) {
            const beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
            const newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) =>
            ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
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
        this.geotreeService.getChildFilterArea(fd).subscribe(res => {
          this.list[this.parseArea(selection)] = expectedArea.length > 0 ? res.data.filter(dt =>
            expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
        });

        this.formFilter.get('region').setValue('');
        this.formFilter.get('area').setValue('');
        // this.formFilter.get('salespoint').setValue('');
        // this.formFilter.get('district').setValue('');
        // this.formFilter.get('territory').setValue('');
        this.list['region'] = [];
        this.list['area'] = [];
        // this.list['salespoint'] = [];
        // this.list['district'] = [];
        // this.list['territory'] = [];
        break;
      case 'region':
        if (id && id.length !== 0) {
          item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt =>
                expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list['region'] = [];
        }
        this.formFilter.get('region').setValue('');
        this.formFilter.get('area').setValue('');
        // this.formFilter.get('salespoint').setValue('');
        // this.formFilter.get('district').setValue('');
        // this.formFilter.get('territory').setValue('');
        this.list['area'] = [];
        // this.list['salespoint'] = [];
        // this.list['district'] = [];
        // this.list['territory'] = [];
        break;
      case 'area':
        if (id && id.length !== 0) {
          item = this.list['region'].length > 0 ? this.list['region'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt =>
                expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list['area'] = [];
        }

        this.formFilter.get('area').setValue('');
        // this.formFilter.get('salespoint').setValue('');
        // this.formFilter.get('district').setValue('');
        // this.formFilter.get('territory').setValue('');
        // this.list['salespoint'] = [];
        // this.list['district'] = [];
        // this.list['territory'] = [];
        break;
      case 'salespoint':
        if (id && id.length !== 0) {
          item = this.list['area'].length > 0 ? this.list['area'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt =>
                expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
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
        if (id && id.length !== 0) {
          item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt =>
                expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
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
        if (id && id.length !== 0) {
          item = this.list['district'].length > 0 ? this.list['district'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt =>
                expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
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

  setPage(pageInfo: any) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;
    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage('page', pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage('page');
    }

    this.getListDetailVoucher();
  }

  onSort(event: any) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage('page', this.pagination.page);
    this.dataService.setToStorage('sort', event.column.prop);
    this.dataService.setToStorage('sort_type', event.newValue);
    this.isSort = true;

    this.getListDetailVoucher();
  }

  filteringGeotree(areaList) {
    return areaList;
  }

  async exportListDetailVoucher() {
    this.dataService.showLoading(true);
    try {
      const response = await this.b2cVoucherService.exportListDetailVoucher({ voucher_id: this.detailVoucher.id }, {
        from: this.formFilter.get('via').value === 'all' ? null : this.formFilter.get('via').value,
        redeem: this.formFilter.get('status').value === 'all' ? null : this.formFilter.get('status').value
      }).toPromise();
      this.downLoadFile(response, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      `List_Detail_Voucher_${new Date().toLocaleString()}.xls`);
      this.dataService.showLoading(false);
    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
    }
  }

  downLoadFile(data: any, type: string, fileName: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    const newBlob = new Blob([data], { type: type });

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }

    // For other browsers:
    // Create a link pointing to the ObjectURL containing the blob.
    const url = window.URL.createObjectURL(newBlob);

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
    console.warn('err', error);

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.warn(error);
    // alert('Open console to see the error')
  }


}
