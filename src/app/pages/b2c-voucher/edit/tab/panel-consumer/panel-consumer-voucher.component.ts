import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import * as _ from 'underscore';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { BtoBVoucherService } from 'app/services/bto-bvoucher.service';
import { GeotreeService } from 'app/services/geotree.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DateAdapter, MatDialogConfig, MatDialog } from '@angular/material';
import { BannerService } from 'app/services/inapp-marketing/banner.service';
import { B2CVoucherService } from 'app/services/b2c-voucher.service';
import { ImportAudienceDialogComponent } from '../import-audience-dialog/import-audience-dialog.component';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-panel-consumer-voucher',
  templateUrl: './panel-consumer-voucher.component.html',
  styleUrls: ['./panel-consumer-voucher.component.scss']
})
export class PanelConsumerVoucherComponent implements OnInit {
  formFilter: FormGroup;
  onLoad: boolean;

  rows: any[] = [];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  offsetPagination: any;
  allRowsSelected: boolean;
  // allRowsSelectedValid: boolean;

  isSelected: boolean;

  keyUp = new Subject<string>();
  permission: any;
  roles: PagesName = new PagesName();

  areaFromLogin;
  area_id_list: any = [];
  listLevelArea: any[];
  list: any;
  area: Array<any>;
  lastLevel: any;
  endArea: String;
  dialogRef: any;
  totalData: number;
  wholesalerIds: any = [];
  isSort: boolean;
  detailVoucher: any;
  isDetail: Boolean;
  indexDelete: any;
  areaType: any[] = [];
  isArea: boolean;

  isVoucherAutomation: FormControl = new FormControl(false);
  formConsumerGroup: FormGroup;

  typeArea: any[] = ['national', 'zone', 'region', 'area', 'district', 'salespoint', 'territory'];
  listSmoker: any[] = [{ name: 'Semua', value: 'both' }, { name: 'Merokok', value: 'yes' }, { name: 'Tidak Merokok', value: 'no' }];
  listGender: any[] = [{ name: 'Semua', value: 'both' }, { name: 'Laki-laki', value: 'male' }, { name: 'Perempuan', value: 'female' }];
  listVA: any[] = [
    { name: 'Referral Code', value: 'referral' },
    { name: 'Verified Customer', value: 'verified' },
    { name: 'Referral and Verified', value: 'referral-and-verified' },
    { name: 'Referral or Verified', value: 'referral-or-verified' }
  ];

  _data: any = null;
  @Input()
  set data(data: any) {
    if (data) {
      this.detailVoucher = data;
      this.isVoucherAutomation.setValue(data.automation ? true : false);
      this.formConsumerGroup.get('allocationVoucher').setValue(data.allocation_voucher);
      this.formConsumerGroup.get('va').setValue(data.automation);
      this.formConsumerGroup.get('is_smoker').setValue(data.smoker);
      this.formConsumerGroup.get('age_consumer_from').setValue(data.age_from);
      this.formConsumerGroup.get('age_consumer_to').setValue(data.age_to);
      this.formConsumerGroup.get('gender').setValue(data.gender);
      this.formConsumerGroup.get('isTargetAudience').setValue(data.is_target_audience_customer === 1 ? true : false);
      if (data && data.dataPanelCustomer) {
        if (data.dataPanelCustomer.selected) {
          this.selected = data.dataPanelCustomer.selected;
        } else if (data.dataPanelCustomer.area_id) {
          this.isArea = true;
        }
      }
    }
  }
  get data(): any { return this._data; }

  // tslint:disable-next-line:no-output-on-prefix
  @Output()
  onChangeVoucherAutomation: any;

  // tslint:disable-next-line:no-output-on-prefix
  @Output()
  onRefresh: any;

  @Output()
  scrollToTop: any;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private b2bVoucherService: BtoBVoucherService,
    private b2cVoucherService: B2CVoucherService,
    private geotreeService: GeotreeService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private bannerService: BannerService,
    private adapter: DateAdapter<any>,
  ) {
    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[0].path === 'detail' ? true : false;
    });
    this.adapter.setLocale('id');
    this.selected = [];
    this.allRowsSelected = false;
    this.isSelected = false;
    this.totalData = 0;
    this.isSort = false;
    this.onChangeVoucherAutomation = new EventEmitter<any>();
    this.onRefresh = new EventEmitter<any>();
    this.scrollToTop = new EventEmitter<any>();
    this.onLoad = true;
    this.isArea = false;

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
      salespoint: [],
      district: [],
      territory: []
    };

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.getListConsumer(data);
      });
  }

  ngOnInit() {
    this.formConsumerGroup = this.formBuilder.group({
      allocationVoucher: [0],
      is_smoker: ['both', Validators.required],
      gender: ['both', Validators.required],
      age_consumer_from: ['', Validators.required],
      age_consumer_to: ['', Validators.required],
      isTargetAudience: [false],
      areas: this.formBuilder.array([]),
      va: [''],
    });

    this.formFilter = this.formBuilder.group({
      national: [''],
      zone: [''],
      region: [''],
      area: [''],
      salespoint: [''],
      district: [''],
      territory: ['']
    });

    this.formConsumerGroup.controls['is_smoker'].valueChanges.debounceTime(50).subscribe(res => {
      if (res === 'yes') {
        this.formConsumerGroup.controls['age_consumer_from'].setValidators([Validators.required, Validators.min(18)]);
        this.formConsumerGroup.controls['age_consumer_to'].setValidators([Validators.required]);
        this.formConsumerGroup.updateValueAndValidity();
      } else {
        this.formConsumerGroup.controls['age_consumer_from'].setValidators([Validators.required, Validators.min(0)]);
        this.formConsumerGroup.controls['age_consumer_to'].setValidators([Validators.required]);
        this.formConsumerGroup.updateValueAndValidity();
      }
    });

    this.initAreaV2();

    this.formFilter.valueChanges.debounceTime(1000).subscribe(res => {
      this.getListConsumer();
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
    this.formFilter.get('area').valueChanges.subscribe(res => {
      if (res) {
        this.getAudienceAreaV2('salespoint', res);
      }
    });
    this.formFilter.get('salespoint').valueChanges.subscribe(res => {
      if (res) {
        this.getAudienceAreaV2('district', res);
      }
    });
    this.formFilter.get('district').valueChanges.subscribe(res => {
      if (res) {
        this.getAudienceAreaV2('territory', res);
      }
    });

    // this.addArea();
    this.getDetail();

    this.formConsumerGroup.get('isTargetAudience').valueChanges.debounceTime(500).subscribe(res => {
      if (res) {
        this.initAreaV2();
        this.getCustomerSelected();
      }
    });
  }


  async getDetail() {
    this.detailVoucher = this.dataService.getFromStorage('detail_voucher_b2c');
    if (this.detailVoucher) {
      this.formConsumerGroup.get('is_smoker').setValue(this.detailVoucher.smoker);
      this.formConsumerGroup.get('age_consumer_from').setValue(this.detailVoucher.age_from);
      this.formConsumerGroup.get('age_consumer_to').setValue(this.detailVoucher.age_to);
      this.formConsumerGroup.get('gender').setValue(this.detailVoucher.gender);

      if (this.detailVoucher.is_enable_panel_customer) {
        this.addArea();
        this.onLoad = false;
      }

      if (!this.formConsumerGroup.get('isTargetAudience').value) {
        for (const { val, index } of this.detailVoucher.area_customer.map((val, index) => ({ val, index }))) {
          this.onLoad = true;
          const response = await this.bannerService.getParentArea({ parent: val.area_id }).toPromise();
          const wilayah = this.formConsumerGroup.controls['areas'] as FormArray;

          wilayah.push(this.formBuilder.group({
            national: [this.getArea(response, 'national'), Validators.required],
            zone: [this.getArea(response, 'division')],
            region: [this.getArea(response, 'region')],
            area: [this.getArea(response, 'area')],
            salespoint: [this.getArea(response, 'salespoint')],
            district: [this.getArea(response, 'district')],
            territory: [this.getArea(response, 'teritory')],
            list_national: this.formBuilder.array(this.listLevelArea),
            list_zone: this.formBuilder.array([]),
            list_region: this.formBuilder.array([]),
            list_area: this.formBuilder.array([]),
            list_salespoint: this.formBuilder.array([]),
            list_district: this.formBuilder.array([]),
            list_territory: this.formBuilder.array([])
          }));

          if (this.detailVoucher.area_customer.length === (index + 1)) {
            this.onLoad = false;
          } else {
            this.initArea(index);
            this.initFormGroup(response, index);
          }
        }
      } else {
        this.onLoad = false;
      }
      
    } else {
      setTimeout(() => {
        this.getDetail();
      }, 1000);
    }
  }

  isChangeVoucherAutomation(event: any) {
    this.onChangeVoucherAutomation.emit({ checked: event.checked });
    if (event.checked) {
      // this.formConsumerGroup.get('allocationVoucher').setValidators([Validators.required, Validators.min(0)]);
      // this.formConsumerGroup.get('va').setValidators(Validators.required);
    } else {
      console.log('CLEAR')
      // this.formConsumerGroup.get('allocationVoucher').clearValidators();
      // this.formConsumerGroup.get('va').clearValidators();
    }
  }

  isChangeTargetAudience(event: any) {
    if (event.checked) {
    }
  }

  onSelect({ selected }) {
    console.log('selected', selected);
    this.selected.splice(0, this.selected.length);
    console.log('selected2', this.selected);
    this.selected.push(...selected);
  }

  selectFn(allRowsSelected: boolean) {
    this.allRowsSelected = allRowsSelected;
    if (!allRowsSelected) { this.selected = [];
    } else { this.selected.length = this.totalData; }
  }

  getId(row) {
    return row.id;
  }

  getAudienceAreaV2(selection, id, event?) {
    let item: any;
    const fd = new FormData();
    const lastLevel = this.geotreeService.getBeforeLevel(this.parseArea(selection));
    let areaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) =>
    ({ key, value })).filter(item_ => item_.key === this.parseArea(lastLevel));
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
          ({ key, value })).filter(item_ => item_.key === this.parseArea(beforeLevel));
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
      ({ key, value })).filter(item_ => item_.key === this.parseArea(beforeLastLevel));
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
            ({ key, value })).filter(item_ => item_.key === this.parseArea(beforeLevel));
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
        if (id && id.length !== 0) {
          item = this.list['zone'].length > 0 ? this.list['zone'].filter(() => {
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
        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'area':
        if (id && id.length !== 0) {
          item = this.list['region'].length > 0 ? this.list['region'].filter(() => {
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
        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'salespoint':
        if (id && id.length !== 0) {
          item = this.list['area'].length > 0 ? this.list['area'].filter(() => {
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
          item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(() => {
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
          item = this.list['district'].length > 0 ? this.list['district'].filter(() => {
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

  getListConsumer(string?: any) {
    try {
      this.dataService.showLoading(true);
      this.pagination.per_page = 25;
      if (string) { this.pagination.search = string;
      } else { delete this.pagination.search; }
      const areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) =>
      item.value !== null && item.value !== '' && item.value.length !== 0);
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

      this.b2cVoucherService.getAudienceCustomer(this.pagination).subscribe(res => {
          Page.renderPagination(this.pagination, res);
          this.totalData = res.total;
          this.rows = res.data;
          this.loadingIndicator = false;
          this.isSort = false;
          this.dataService.showLoading(false);
      }, err => {
        console.warn(err);
        this.dialogService.openSnackBar({ message: 'Terjadi Kesalahan Pencarian' });
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
      });
    } catch (ex) {
      console.log('ex', ex);
      this.dataService.showLoading(false);
    }
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;
    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage('page', pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage('page');
    }

    this.getListConsumer();
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage('page', this.pagination.page);
    this.dataService.setToStorage('sort', event.column.prop);
    this.dataService.setToStorage('sort_type', event.newValue);
    this.isSort = true;

    this.getListConsumer();
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

  filteringGeotree(areaList) {
    return areaList;
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

  getCustomerSelected() {
    if (this.detailVoucher.is_target_audience_customer === 1 ) {
      this.b2cVoucherService.getSelectedCustomerPanel({ voucher_id: this.detailVoucher.id }).subscribe(res => {
          this.selected = res.data.targeted_audiences.map(aud => ({
            ...aud,
            id: aud.user_id
          }))
      });
    } else {
      // this.geotreeService.getFilter2Geotree(res.data.areas.area_id);
    }
  }

  onSave() {
    console.log('formConsumerGroup.controls[allocationVoucher].value', this.formConsumerGroup.controls['allocationVoucher'].value)
    if (this.formConsumerGroup.valid || this.formConsumerGroup.get('isTargetAudience').value) {
    let body = null;
    const bodyArea = {
      'type': 'customer',
      'is_target_audience': this.formConsumerGroup.get('isTargetAudience').value ? 1 : 0,
      'user_id': this.selected.map(aud => aud.id),
      'area_id': [1],
      'automation': this.formConsumerGroup.get('va').value,
      'smoker': this.formConsumerGroup.get('is_smoker').value,
      'age_from': this.formConsumerGroup.get('age_consumer_from').value,
      'age_to': this.formConsumerGroup.get('age_consumer_to').value,
      'gender': this.formConsumerGroup.get('gender').value,
      'allocation_voucher': this.formConsumerGroup.get('allocationVoucher').value
    };
    if (this.formConsumerGroup.get('isTargetAudience').value) {
      body = {
        'type': 'customer',
        'is_target_audience': this.formConsumerGroup.get('isTargetAudience').value ? 1 : 0,
        'user_id': this.selected.map(aud => aud.id),
      };
    } else {
      if (this.isVoucherAutomation.value) {
        if (!this.formConsumerGroup.get('allocationVoucher').value || this.formConsumerGroup.get('allocationVoucher').value < 1) {
          commonFormValidator.validateAllFields(this.formConsumerGroup);
          this.scrollToTop.emit();
          alert('Jumlah Alokasi Voucher harus diisi');
          return;
        }
        if (!this.formConsumerGroup.get('va').value) {
          commonFormValidator.validateAllFields(this.formConsumerGroup);
          this.scrollToTop.emit();
          return;
        }
      }
    }

    let _areas = [];
      let areas = [];
      let value = this.formConsumerGroup.getRawValue();

      value.areas.map(item => {
        let obj = Object.entries(item).map(([key, value]) => ({ key, value }))
        for (const val of this.typeArea) {
          const filteredValue = obj.filter(xyz => val === xyz.key && xyz.value);
          if (filteredValue.length > 0) _areas.push(...filteredValue)
        }

        areas.push(_.last(_areas));
        _areas = [];
      })

      let same = this.findDuplicate(areas.map(item => item.value));
      if (same.length > 0) {
        return this.dialogService.openSnackBar({ message: "Terdapat duplikat sales tree, mohon periksa kembali data anda!" });
      }

      bodyArea['area_id'] = [];
      areas.map(item => {
        console.log('AREAS', item)
        bodyArea['area_id'].push(item.value);
      });

    this.dataService.showLoading(true);
    this.b2cVoucherService.updatePanel({ voucher_id: this.detailVoucher.id }, body ? body : bodyArea).subscribe(res => {
      // this.router.navigate(['b2c-voucher']);
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({ message: 'Data berhasil disimpan!' });
      this.onRefresh.emit();
      setTimeout(() => {
        this.getIsArea();
      }, 1000);
    }, err => {
      this.dataService.showLoading(false);
    });
    } else {
      commonFormValidator.validateAllFields(this.formConsumerGroup);
      this.scrollToTop.emit();
    }
  }

  getIsArea() {
    if (this.detailVoucher) {
      if (!this.detailVoucher.is_enable_panel_retailer) {
        if (this.isArea) {
          this.getDetail();
        }
      } else {
        setTimeout(() => {
          this.getIsArea();
        }, 2000);
      }
    }
  }

  async exportCustomer() {
    if (this.selected.length === 0) {
      this.dialogService.openSnackBar({ message: 'Pilih audience untuk di export!' });
      return;
    }
    this.dataService.showLoading(true);
    const body = this.selected.map(aud => aud.id);
    try {
      const response = await this.b2cVoucherService.exportAudienceCustomer({ selected: body, audience: 'customer' }).toPromise();
      this.downLoadFile(response, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      `B2CVoucher_Panel_Customer_${new Date().toLocaleString()}.xls`);
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
    console.log('Here');
    console.log(error);

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
    // alert('Open console to see the error')
  }

  importCustomer(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { audience: 'customer'};

    this.dialogRef = this.dialog.open(ImportAudienceDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.onSelect({ selected: response });
        if (response.data) {
          this.dialogService.openSnackBar({ message: 'File berhasil diimport' });
        }
      }
    });
  }

  createArea(): FormGroup {
    return this.formBuilder.group({
      national: [1, Validators.required],
      zone: [''],
      salespoint: [''],
      region: [''],
      area: [''],
      district: [''],
      territory: [''],
      list_national: this.formBuilder.array(this.listLevelArea),
      list_zone: this.formBuilder.array([]),
      list_region: this.formBuilder.array([]),
      list_area: this.formBuilder.array([]),
      list_salespoint: this.formBuilder.array([]),
      list_district: this.formBuilder.array([]),
      list_territory: this.formBuilder.array([])
    });
  }

  addArea() {
    const wilayah = this.formConsumerGroup.controls['areas'] as FormArray;
    wilayah.push(this.createArea());
    const index = wilayah.length > 0 ? (wilayah.length - 1) : 0;
    this.initArea(index);
    this.generateList('zone', 1, index, 'render');
  }

  deleteArea(idx: number) {
    this.indexDelete = idx;
    const data = {
      titleDialog: 'Hapus Salestree',
      captionDialog: `Apakah anda yakin untuk menghapus Salestree ${idx + 1} ?`,
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ['Hapus', 'Batal']
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  initArea(index: number) {
    const wilayah = this.formConsumerGroup.controls['areas'] as FormArray;
    this.areaType.map(item => {
      switch (item.type.trim()) {
        case 'national':
          wilayah.at(index).get('national').disable();
          break;
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
    });
  }

  async generateList(selection: any, id: any, index: number, type: any) {
    let item: any;
    const wilayah = this.formConsumerGroup.controls['areas'] as FormArray;
    switch (selection) {
      case 'zone': {
        const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
        const list = wilayah.at(index).get(`list_${selection}`) as FormArray;

        while (list.length > 0) {
          list.removeAt(list.length - 1);
        }

        _.clone(response || []).map((item_: any) => {
          list.push(this.formBuilder.group({ ...item_, name: item_.name === 'all' ? 'Semua Zone' : item_.name }));
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
      }
        break;
      case 'region': {
        item = wilayah.at(index).get('list_zone').value.length > 0 ?
        wilayah.at(index).get('list_zone').value.filter((item_: any) => item_.id === id)[0] : {};
        if (item.name !== 'Semua Zone') {
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
          const list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item_ => {
            list.push(this.formBuilder.group({ ...item_, name: item_.name === 'all' ? 'Semua Regional' : item_.name }));
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
      }
        break;
      case 'area': {
        item = wilayah.at(index).get('list_region').value.length > 0 ?
        wilayah.at(index).get('list_region').value.filter(item_ => item_.id === id)[0] : {};
        if (item.name !== 'Semua Regional') {
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
          const list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item_ => {
            list.push(this.formBuilder.group({ ...item_, name: item_.name === 'all' ? 'Semua Area' : item_.name }));
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
      }
        break;
      case 'salespoint': {
        item = wilayah.at(index).get('list_area').value.length > 0 ?
        wilayah.at(index).get('list_area').value.filter(item_ => item_.id === id)[0] : {};
        if (item.name !== 'Semua Area') {
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
          const list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item_ => {
            list.push(this.formBuilder.group({ ...item_, name: item_.name === 'all' ? 'Semua Salespoint' : item_.name }));
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
      }
        break;
      case 'district': {
        item = wilayah.at(index).get('list_salespoint').value.length > 0 ?
        wilayah.at(index).get('list_salespoint').value.filter(item_ => item_.id === id)[0] : {};
        if (item.name !== 'Semua Salespoint') {
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
          const list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item_ => {
            list.push(this.formBuilder.group({ ...item_, name: item_.name === 'all' ? 'Semua District' : item_.name }));
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
      }
        break;
      case 'territory': {
        item = wilayah.at(index).get('list_district').value.length > 0 ?
        wilayah.at(index).get('list_district').value.filter(item_ => item_.id === id)[0] : {};
        if (item.name !== 'Semua District') {
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
          const list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item_ => {
            list.push(this.formBuilder.group({ ...item_, name: item_.name === 'all' ? 'Semua Territory' : item_.name }));
          });
        }

        if (type !== 'render') {
          wilayah.at(index).get('territory').setValue('');

          if (item.name === 'Semua District') {
            this.clearFormArray(index, 'list_territory');
          }
        }
      }
        break;

      default:
        break;
    }
  }

  clearFormArray = (index: number, selection: any) => {
    const wilayah = this.formConsumerGroup.controls['areas'] as FormArray;
    const list = wilayah.at(index).get(selection) as FormArray;
    while (list.length > 0) {
      list.removeAt(list.length - 1);
    }
  }

  getArea(response, selection) {
    return response.data.filter(item => item.level_desc === selection).map(item => item.name)[0]
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


  initFormGroup(response, index) {
    response.data.map(item => {
      let level_desc = '';
      switch (item.level_desc.trim()) {
        case 'national':
          level_desc = 'zone';
          break;
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
      this.generateList(level_desc, item.id, index, 'render');
    });
  }

  confirmDelete() {
    const wilayah = this.formConsumerGroup.controls['areas'] as FormArray;
    wilayah.removeAt(this.indexDelete);
    this.dialogService.brodcastCloseConfirmation();
  }

  getToolTipData(value: any, array: any) {
    if (value && array.length) {
      const msg = array.filter((item: any) => item.id === value)[0]['name'];
      return msg;
    } else {
      return '';
    }
  }

}
