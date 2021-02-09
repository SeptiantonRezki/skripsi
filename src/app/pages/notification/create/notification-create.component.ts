import { Component, OnInit, ViewChild, Input, ElementRef, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { NotificationService } from 'app/services/notification.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';
import { Lightbox } from 'ngx-lightbox';

import * as _ from 'underscore';
import * as moment from "moment";
import { Config } from 'app/classes/config';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { Subject } from 'rxjs';
import { RetailerService } from 'app/services/user-management/retailer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { ImportPopUpAudienceComponent } from 'app/pages/popup-notification/import-pop-up-audience/import-pop-up-audience.component';
import { GeotreeService } from 'app/services/geotree.service';
import { TemplateTaskService } from 'app/services/dte/template-task.service';
import { P } from '@angular/core/src/render3';

@Component({
  selector: 'app-notification-create',
  templateUrl: './notification-create.component.html',
  styleUrls: ['./notification-create.component.scss']
})
export class NotificationCreateComponent {
  onLoad: boolean;
  loadingIndicator: boolean;
  formFilter: FormGroup;

  formNotification: FormGroup;
  formArea: FormGroup;
  formNotificationError: any;

  formDailyRecurrence: FormGroup;
  formWeeklyRecurrence: FormGroup;
  formMonthlyRecurrence: FormGroup;
  formYearlyRecurrence: FormGroup;
  formRecurrenceCommon: FormGroup;

  listJenisKonsumen: any[] = [{ name: "Semua", value: "all" }, { name: "Terverifikasi", value: "verified" }];
  userGroup: any[] = [
    { name: "Field Force", value: "field-force" },
    { name: "Wholesaler", value: "wholesaler" },
    { name: "Retailer", value: "retailer" },
    // { name: "Paguyuban", value: "paguyuban" },
    { name: "Customer", value: "customer" }
  ];

  dialogRef: any;
  typeArea: any[] = ["national", "zone", "region", "area", "salespoint", "district", "territory"];
  areaFromLogin;
  indexDelete: any;

  listLevelArea: any[];
  list: any;
  listUserGroup: any[] = [{ name: "Retailer", value: "retailer" }, { name: "Customer", value: "customer" }, { name: "Wholesaler", value: "wholesaler" }, { name: "TSM", value: "tsm" }];
  listAge: any[] = [{ name: "18+", value: "18+" }, { name: "< 18", value: "18-" }];
  listLandingPage: any[] = [];
  listContentType: any[] = [{ name: "Static Page", value: "static_page" }, { name: "Landing Page", value: "landing_page" }, { name: "Iframe", value: "iframe" }, { name: "Image", value: "image" }, { name: "Unlinked", value: "unlinked" }, { name: "Pojok Modal", value: "pojok_modal" }];
  listNotifType: any [] = [
    { name: "Kirim Sebagai Notifikasi", value: "notif" },
    { name: "Kirim Sebagai Pesan", value: "message" },
  ];

  imageContentType: File;
  imageContentTypeBase64: any;
  imagePrivew: string;

  multipleImageContentType: any[];
  videoContentType: File;
  videoContentTypeURL: any;

  public options: Object = Config.FROALA_CONFIG;

  public optionsStaticPage: Object = Config.FROALA_CONFIG_NOTIFICATION; // Static Page Only

  audienceSelected: any[] = [];

  listTypeOfRecurrence: Object[] = [
    { id: 'OneTime', name: 'Aktivasi notifikasi sekali kirim' },
    { id: 'Recurring', name: 'Aktivasi notifikasi berulang' },
    { id: 'Bday', name: 'Aktivasi notifikasi ulang tahun' },
    { id: 'Bday18', name: 'Aktivasi notifikasi ulang tahun ke-18' }
  ];

  listRecurrenceTypes: Object[] = [
    { id: 'Daily', name: 'Harian'},
    { id: 'Weekly', name: 'Mingguan'},
    { id: 'Monthly', name: 'Bulanan'},
    { id: 'Yearly', name: 'Tahunan'}
  ];

  recurrenceLabel: Object = {
    Daily: 'hari',
    Weekly: 'minggu',
    Monthly: 'bulan',
    Yearly: 'tahun'
  }

  listWeekDays: any[] = [
    { id: 'Monday', name: 'Senin' },
    { id: 'Tuesday', name: 'Selasa' },
    { id: 'Wednesday', name: 'Rabu' },
    { id: 'Thursday', name: 'Kamis' },
    { id: 'Friday', name: 'Jumat' },
    { id: 'Saturday', name: 'Sabtu' },
    { id: 'Sunday', name: 'Minggu' }
  ]

  listMonths: Object[] = [
    { id: 'Jan', name:'Januari'},
    { id: 'Feb', name:'Februari'},
    { id: 'Mar', name:'Maret'},
    { id: 'Apr', name:'April'},
    { id: 'May', name:'Mei'},
    { id: 'Jun', name:'Juni'},
    { id: 'Jul', name:'Juli'},
    { id: 'Aug', name:'Agustus'},
    { id: 'Sep', name:'September'},
    { id: 'Oct', name:'Oktober'},
    { id: 'Nov', name:'November'},
    { id: 'Dec', name:'Desember'},
  ]

  listDates: number[];


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

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  areaType: any;
  lastLevel: any;
  actionType: string = 'create';
  idNotif: any = '';

  _typeOfRecurrence: string;
  _recurrenceType: string;

  @Input() get typeOfRecurrence(): string {
    return this._typeOfRecurrence
  }

  set typeOfRecurrence(val: string) {
    this._typeOfRecurrence = val;
    if(this._typeOfRecurrence !== 'Recurring') {
      this.recurrenceType = '';
    }

    if(this._typeOfRecurrence !== 'OneTime') {
      this.formNotification.controls.is_target_audience.setValue(false);
      this.formNotification.controls.is_target_audience.disable();
    } else {
      this.formNotification.controls.is_target_audience.enable();
    }
  }

  @Input() get recurrenceType(): string {
    return this._recurrenceType
  }

  set recurrenceType(val: string) {
    this._recurrenceType = val;
  }

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private _lightbox: Lightbox,
    private retailerService: RetailerService,
    private dialog: MatDialog,
    private geotreeService: GeotreeService,
    private taskTemplateService: TemplateTaskService,
    private route: ActivatedRoute,
  ) {
    this.multipleImageContentType = [];
    this.areaType = this.dataService.getDecryptedProfile()['area_type'];
    console.log(this.areaType);
    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    this.formNotificationError = {
      title: {},
      body: {},
      user: {},
      user_group: {},
      age: {},
      notif_type: {},
    };

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
    route.url.subscribe(params => {
      console.log({ params });
      this.idNotif = (params[2]) ? params[2].path : null;
      this.actionType = params[1].path;
    })
  }

  ngOnInit() {
    this.formNotification = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      user_group: ["retailer", Validators.required],
      verification: ["all"],
      age: ["18+", Validators.required],
      content_type: ["static_page", Validators.required],
      static_page_title: ["", Validators.required],
      static_page_body: ["", Validators.required],
      landing_page_value: ["belanja", Validators.required],
      url_iframe: ["", [Validators.required, Validators.pattern("(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?")]],
      areas: this.formBuilder.array([]),
      is_target_audience: [false],
      transfer_token: ["yes", Validators.required],
      type_of_recurrence: ["OneTime", Validators.required],
      recurrence_type: [""],
      status: ["Active"],
      notif_type: ['notif', Validators.required],
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

    this.formDailyRecurrence = this.formBuilder.group({
      recurrence_time: ["", Validators.required]
    })

    this.formWeeklyRecurrence = this.formBuilder.group({
      recurrence_day: this.formBuilder.group({}),
      recurrence_time: ["", Validators.required]
    })

    let recurrenceDaysControls = this.formWeeklyRecurrence.controls.recurrence_day as FormGroup
    this.listWeekDays.forEach(day => {
      recurrenceDaysControls.addControl(day.id, new FormControl(false))
    })

    this.formMonthlyRecurrence = this.formBuilder.group({
      recurrence_date: ["", Validators.required],
      recurrence_time: ["", Validators.required]
    })

    this.formYearlyRecurrence = this.formBuilder.group({
      recurrence_date: ["", Validators.required],
      recurrence_month: ["", Validators.required],
      recurrence_time: ["", Validators.required]
    })

    this.formRecurrenceCommon = this.formBuilder.group({
      recurrence_pattern: [1, Validators.required],
      recurrence_start_date: ["", Validators.required],
      end_option: ["no_end_date"],
      recurrence_end_date: [""],
      end_recurrence_count: [10]
    })

    this.listDates = Array.from({length: 31}, (_, i) => i + 1)

    this.typeOfRecurrence = 'OneTime';

    this.formNotification.controls['user_group'].valueChanges.debounceTime(50).subscribe(res => {
      if (res === 'retailer' || res === 'tsm') {
        this.listLandingPage = [{ name: "Belanja", value: "belanja" }, { name: "Misi", value: "misi" }, { name: "Pelanggan", value: "pelanggan" }, { name: "Bantuan", value: "bantuan" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Pojok Modal", value: "pojok_modal" }];
        // this.formNotification.controls['landing_page_value'].disable();
      } else {
        this.listLandingPage = [{ name: "Kupon", value: "kupon" }, { name: "Terdekat", value: "terdekat" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Bantuan", value: "bantuan" }];
        // this.formNotification.controls['landing_page_value'].enable();
      }
      if (res === 'wholesaler') {
        this.listContentType = [{ name: "Static Page", value: "static_page" }, { name: "Iframe", value: "iframe" }, { name: "Image", value: "image" }, { name: "Unlinked", value: "unlinked" }, { name: "Video", value: "video" }];
      } else {
        this.listContentType = [{ name: "Static Page", value: "static_page" }, { name: "Landing Page", value: "landing_page" }, { name: "Iframe", value: "iframe" }, { name: "Image", value: "image" }, { name: "Unlinked", value: "unlinked" }];
      }

      if (res !== 'customer') {
        this.formNotification.get('notif_type').setValidators([]);
        this.formNotification.get('notif_type').setValue('');
        this.formNotification.updateValueAndValidity();
      } else {
        this.formNotification.get('notif_type').setValidators([Validators.required]);
        this.formNotification.get('notif_type').setValue('notif');
        this.formNotification.updateValueAndValidity();
      }

      if (this.formNotification.get("is_target_audience").value === true) {
        this.getAudience();
      };

      this.selected.splice(0, this.selected.length);
      this.audienceSelected = [];
      this.contentType(this.formNotification.controls['content_type'].value);
    });

    this.formNotification.controls['age'].valueChanges.debounceTime(50).subscribe(res => {
      if (this.formNotification.get("is_target_audience").value === true) {
        this.getAudience();
      };
      this.selected.splice(0, this.selected.length);
      this.audienceSelected = [];
    });

    this.formNotification.controls['user_group'].setValue('retailer');
    this.formNotification.controls['url_iframe'].disable();

    this.formNotification.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formNotification, this.formNotificationError);
    });

    this.formRecurrenceCommon.get('recurrence_end_date').valueChanges.subscribe(val => {
      if(val) {
        this.formRecurrenceCommon.controls['end_option'].setValue('end_date');
      }
    })

    this.formRecurrenceCommon.get('end_recurrence_count').valueChanges.subscribe(val => {
      if(val) {
        this.formRecurrenceCommon.controls['end_option'].setValue('end_count');
      }
    })

    // this.formFilter.valueChanges.subscribe(filter => {
    //   if (this.formNotification.get("is_target_audience").value === false) {
    //     this.getAudience();
    //   };
    // });
    
    this.addArea();
    
    
    // this.initFilterArea();

    this.initAreaV2();

    if (this.actionType === 'detail') {
      console.log('GET DETAILS');
      this.getDetails();
    }

    if(this.formNotification.controls.user_group.value !== 'customer') {
      this.formNotification.controls.type_of_recurrence.disable();
    }

    this.formFilter.get('zone').valueChanges.subscribe(res => {
      console.log('zone', res);
      if (res) {
        this.getAudienceAreaV2('region', res);
        this.getAudience();
      }
    });
    this.formFilter.get('region').valueChanges.subscribe(res => {
      console.log('region', res);
      if (res) {
        this.getAudienceAreaV2('area', res);
        this.getAudience();
      }
    });
    this.formFilter.get('area').valueChanges.subscribe(res => {
      console.log('area', res, this.formFilter.value['area']);
      if (res) {
        this.getAudienceAreaV2('salespoint', res);
        this.getAudience();
      }
    });
    this.formFilter.get('salespoint').valueChanges.subscribe(res => {
      console.log('salespoint', res);
      if (res) {
        this.getAudienceAreaV2('district', res);
        this.getAudience();
      }
    });
    this.formFilter.get('district').valueChanges.subscribe(res => {
      console.log('district', res);
      if (res) {
        this.getAudienceAreaV2('territory', res);
        this.getAudience();
      }
    });

    this.formFilter.get('territory').valueChanges.subscribe(res => {
      console.log('territory', res);
      if (res) {
        // this.getAudienceAreaV2('territory', res);
        this.getAudience();
      }
    });
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
    console.log('audienceareav2', this.formFilter.getRawValue(), areaSelected[0]);
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
          console.log('the selection', this.parseArea(selection), newAreaSelected);
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
            console.log('the selection', this.parseArea(selection), newAreaSelected);
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
    let wilayah = this.formNotification.controls['areas'] as FormArray;
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
    let wilayah = this.formNotification.controls['areas'] as FormArray;
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
    // this.getAudience();
  }

  async generataList(selection, id, index, type) {
    let item: any;
    let wilayah = this.formNotification.controls['areas'] as FormArray;
    console.log('wilayah', wilayah);
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

  confirmDelete() {
    let wilayah = this.formNotification.controls['areas'] as FormArray;
    wilayah.removeAt(this.indexDelete);
    this.dialogService.brodcastCloseConfirmation();
  }

  clearFormArray = (index, selection) => {
    let wilayah = this.formNotification.controls['areas'] as FormArray;
    let list = wilayah.at(index).get(selection) as FormArray;
    while (list.length > 0) {
      list.removeAt(list.length - 1);
    }
  }

  removeImageVideo(): void {
    this.imageContentType = undefined;
    this.imageContentTypeBase64 = null;
    // this.videoContentType = undefined;
    this.videoContentTypeURL = null;
  }

  selectChange(e: any) {
    // console.log(e);
    if (e.source.value === 'tsm') {
      this.formNotification.get('user_group').patchValue('tsm');
    }

    if(e.source.value != 'customer') {
      this.typeOfRecurrence = 'OneTime';
      this.formNotification.controls.type_of_recurrence.disable();
    } else {
      this.formNotification.controls.type_of_recurrence.enable();
    }
    console.log(this.formNotification.value.user_group);
  }

  async submit() {
    if (!this.formNotification.valid) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formNotification);
      return;
    }

    if(this.typeOfRecurrence === 'Recurring' && !this.recurrenceType) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      return;
    }

    if(this.recurrenceType == 'Daily' && !this.formDailyRecurrence.valid) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formDailyRecurrence);
      return;
    }
    
    let selectedWeekDays = []

    if(this.recurrenceType == 'Weekly') {
      if(!this.formWeeklyRecurrence.valid) {
        this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
        commonFormValidator.validateAllFields(this.formWeeklyRecurrence);
        return;
      }
      let cbRecurrenceDay = this.formWeeklyRecurrence.controls.recurrence_day as FormGroup
      console.log('weeky', cbRecurrenceDay)
      
      let recurrenceDayValues = cbRecurrenceDay.value
      selectedWeekDays = Object.keys(recurrenceDayValues).filter(key => recurrenceDayValues[key])

      if(selectedWeekDays.length == 0) {
        this.dialogService.openSnackBar({ message: "Harap pilih minimal satu hari terbit!" });
        return;
      }
    }

    if(this.recurrenceType == 'Monthly' && !this.formMonthlyRecurrence.valid) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formMonthlyRecurrence);
      return;
    }

    if(this.recurrenceType == 'Yearly' && !this.formYearlyRecurrence.valid) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formYearlyRecurrence);
      return;
    }

    if(this.typeOfRecurrence == 'Recurring' && !this.formRecurrenceCommon.valid) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formRecurrenceCommon);
      return;
    }
    let startDate
    let endDate

    if(this.typeOfRecurrence == 'Recurring') {
      let startDateStr = this.formRecurrenceCommon.controls.recurrence_start_date.value
      startDate = moment(startDateStr)

      if(!this.idNotif && !startDate.isSameOrAfter(moment(), 'day')) {
        this.dialogService.openSnackBar({ message: "Tanggal mulai tidak boleh sebelum hari ini!" });
        return;
      }
      
      if(this.formRecurrenceCommon.controls.end_option.value === 'end_date') {
        let endDateStr = this.formRecurrenceCommon.controls.recurrence_end_date.value
        if(!endDateStr) {
          this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
          return;
        }
        endDate = moment(endDateStr)
        if(startDate.isSameOrAfter(endDate, 'day')) {
          this.dialogService.openSnackBar({ message: "Tanggal selesai harus setelah tanggal mulai!" });
          return;
        }
      }
      
    }

    let _areas = [];
    let areas = [];
    let value = this.formNotification.getRawValue();

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
      return this.dialogService.openSnackBar({ message: "Terdapat duplikat sales tree, mohon periksa kembali data anda!" });
    }

    let body: any = {
      title: this.formNotification.get("title").value,
      body: this.formNotification.get("body").value,
      type: this.formNotification.get("user_group").value,
      content_type: this.formNotification.get('content_type').value,
      area_id: areas[0].value,
      type_of_recurrence: this.typeOfRecurrence,
      status: this.formNotification.get('status').value
    };

    //only allow edit for customer type, non one-time recurrence, else create new notification instead
    if(body.type === 'customer' && body.type_of_recurrence !== 'OneTime' && this.idNotif) {
      body.id = this.idNotif
    }

    let recurrenceBody: { [key: string]: any; };

    if(this.typeOfRecurrence == 'Recurring') {
      recurrenceBody = {
        recurrence_type: this.recurrenceType
      }
      switch(this.recurrenceType) {
        case 'Daily':
          recurrenceBody.recurrence_time = this.formDailyRecurrence.get('recurrence_time').value
          break;
        case 'Weekly':
          recurrenceBody.recurrence_day = selectedWeekDays
          recurrenceBody.recurrence_time = this.formWeeklyRecurrence.get('recurrence_time').value
          break;
        case 'Monthly':
          recurrenceBody.recurrence_date = this.formMonthlyRecurrence.get('recurrence_date').value
          recurrenceBody.recurrence_time = this.formMonthlyRecurrence.get('recurrence_time').value
          break;
        case 'Yearly':
          recurrenceBody.recurrence_date = this.formYearlyRecurrence.get('recurrence_date').value
          recurrenceBody.recurrence_month = this.formYearlyRecurrence.get('recurrence_month').value
          recurrenceBody.recurrence_time = this.formYearlyRecurrence.get('recurrence_time').value
          break;
      }

      recurrenceBody.recurrence_pattern = "" + this.formRecurrenceCommon.get('recurrence_pattern').value
      recurrenceBody.recurrence_start_date = startDate.format('YYYY-MM-DD')
      let end_option = this.formRecurrenceCommon.get('end_option').value
      if(end_option == 'end_date') {
        recurrenceBody.recurrence_end_date = endDate.format('YYYY-MM-DD')
      } else if(end_option == 'end_count') {
        recurrenceBody.end_recurrence_count = "" + this.formRecurrenceCommon.get('end_recurrence_count').value
      }

      body = {
        ...body,
        ...recurrenceBody
      }
    }

    if (body.type === 'customer') {
      body['verification'] = this.formNotification.get('verification').value;
      body['age'] = this.formNotification.get("age").value;
      body['notif_type'] = this.formNotification.get('notif_type').value;
    }

    if (body.content_type === 'static_page') {
      body['static_page_title'] = this.formNotification.get("static_page_title").value
      body['static_page_body'] = this.formNotification.get("static_page_body").value
    } else if (body.content_type === 'landing_page') {
      body['landing_page_value'] = this.formNotification.get('landing_page_value').value;
    } else if (body.content_type === 'iframe') {
      let url = this.formNotification.get('url_iframe').value;
      if (!url.match(/^[a-zA-Z]+:\/\//)) { url = 'http://' + url; }
      body['iframe_value'] = url;
      body['transfer_token'] = this.formNotification.get('transfer_token').value;
    } else if (body.content_type === 'image') {
      if (this.imageContentTypeBase64) {
        body['image_value'] = [this.imageContentTypeBase64];
      } else {
        if (this.multipleImageContentType.length > 0) {
          this.dataService.showLoading(true);
          return await new Promise(async (resolve, reject) => {
            const bodyVideo = new FormData();
            bodyVideo.append('title', body.title);
            bodyVideo.append('body', body.body);
            bodyVideo.append('type', body.type);
            bodyVideo.append('content_type', body.content_type);
            bodyVideo.append('area_id', body.area_id);
            this.multipleImageContentType.forEach((element, i) => {
              bodyVideo.append(`image_value[${i}]`, element);
            });
            if (this.formNotification.get('is_target_audience').value) {
              bodyVideo.append('target_audience', '1');
              const ta = await this.audienceSelected.map((aud, i) => {
                bodyVideo.append(`target_audiences[${i}]`, aud.id);
              });
            } else {
              if (bodyVideo.get('target_audience')) {
                bodyVideo.delete('target_audience');
              }
            }
            bodyVideo.append('type_of_recurrence', body.type_of_recurrence);
            if(this.typeOfRecurrence == 'Recurring') {
              Object.entries(recurrenceBody).forEach(entry => {
                let [key, val] = entry
                bodyVideo.append(key, val);
              })
            }
            this.notificationService.create(bodyVideo).subscribe(
              res => {
                this.router.navigate(["notifications"]);
                this.dialogService.openSnackBar({ message: "Data berhasil disimpan" });
                this.dataService.showLoading(false);
                resolve(res);
              },
              err => {
                this.dataService.showLoading(false);
                reject(err);
              }
            );
          });
        } else {
          return this.dialogService.openSnackBar({ message: "Konten image belum dipilih" });
        }
      }
    } else if (body.content_type === 'video') {
      if (this.videoContentTypeURL) {
        this.dataService.showLoading(true);
        return await new Promise(async (resolve, reject) => {
          const bodyVideo = new FormData();
          bodyVideo.append('title', body.title);
          bodyVideo.append('body', body.body);
          bodyVideo.append('type', body.type);
          bodyVideo.append('content_type', body.content_type);
          bodyVideo.append('area_id', body.area_id);
          bodyVideo.append('video_value', this.videoContentType);
          if (this.formNotification.get('is_target_audience').value) {
            bodyVideo.append('target_audience', '1');
            const ta = await this.audienceSelected.map((aud, i) => {
              bodyVideo.append(`target_audiences[${i}]`, aud.id);
            });
          } else {
            if (bodyVideo.get('target_audience')) {
              bodyVideo.delete('target_audience');
            }
          }

          if(this.typeOfRecurrence == 'Recurring') {
            Object.entries(recurrenceBody).forEach(entry => {
              let [key, val] = entry
              bodyVideo.append(key, val);
            })
          }

          this.notificationService.create(bodyVideo).subscribe(
            res => {
              this.router.navigate(["notifications"]);
              this.dialogService.openSnackBar({ message: "Data berhasil disimpan" });
              this.dataService.showLoading(false);
              resolve(res);
            },
            err => {
              this.dataService.showLoading(false);
              reject(err);
            }
          );
        });
      } else {
        return this.dialogService.openSnackBar({ message: "Konten video belum dipilih" });
      }
    }

    if (this.formNotification.get("is_target_audience").value) {
      body['target_audience'] = 1;
      body['target_audiences'] = this.audienceSelected.map(aud => aud.id);
    } else {
      if (body['target_audience']) delete body['target_audience'];
    }

    this.dataService.showLoading(true);
    console.log(body)
    this.notificationService.create(body).subscribe(
      res => {
        this.router.navigate(["notifications"]);
        this.dialogService.openSnackBar({ message: "Data berhasil disimpan" });
        this.dataService.showLoading(false);
      },
      err => {
        // this.dialogService.openSnackBar({ message: err.error.message });
        // this.loadingIndicator = false;
        this.dataService.showLoading(false);
      }
    );
  }

  contentType(value) {
    if (this.imageContentTypeBase64 && this.imageContentType) {
      this.imageContentType = undefined;
      this.imageContentTypeBase64 = undefined;
    }

    if (this.multipleImageContentType && this.imageContentType) {
      this.imageContentType = undefined;
      this.multipleImageContentType = [];
    }

    if (this.videoContentType && this.videoContentTypeURL) {
      this.videoContentType = undefined;
      this.videoContentTypeURL = null;
    }

    if (value !== 'static_page') {
      this.formNotification.controls['static_page_title'].setValue('');
      this.formNotification.controls['static_page_body'].setValue('');
      this.formNotification.controls['static_page_title'].disable();
      this.formNotification.controls['static_page_body'].disable();
    } else {
      this.formNotification.controls['static_page_title'].enable();
      this.formNotification.controls['static_page_body'].enable();
    }

    if (value === 'iframe') {
      this.formNotification.controls['url_iframe'].setValue('');
      this.formNotification.controls['url_iframe'].enable();
    } else {
      this.formNotification.controls['url_iframe'].disable();
    }

    if (value === 'landing_page') {
      this.formNotification.controls['landing_page_value'].setValue('');
      this.formNotification.controls['landing_page_value'].enable();
    } else {
      this.formNotification.controls['landing_page_value'].disable();
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

  imagesContentType(event) {
    if (this.imageContentType['length'] !== undefined && this.imageContentType['length'] !== null) {
      if (this.imageContentType && this.imageContentType[0]) {
        const filesAmount = this.imageContentType['length'];
        for (let i = 0; i < filesAmount; i++) {
          const reader = new FileReader();
          reader.onloadend = (ev: any) => {
            console.log('onloadend', ev);
            this.multipleImageContentType.push(ev.target.result);
            if (i == filesAmount - 1) {
              console.log('SELESAI');
              this.imageContentType = undefined;
            }
          }
          reader.readAsDataURL(this.imageContentType[i]);
        }
      }
    } else {
      const file: File = event;
      const myReader: FileReader = new FileReader();

      this.multipleImageContentType = [];

      myReader.onloadend = (e) => {
        this.imageContentTypeBase64 = myReader.result;
      }

      myReader.readAsDataURL(file);
    }
  }

  async previewImage(index = 0) {
    if (this.multipleImageContentType['length'] > 0) {
      const albums = [];
      const filesAmount = this.multipleImageContentType['length'];
      console.log('previewImage', albums)
      for (let i = 0; i < filesAmount; i++) {
        albums.push({
          src: this.multipleImageContentType[i],
          caption: '',
          thumb: this.multipleImageContentType[i]
        });
        // return i;
      }
      console.log('album', albums)
      this._lightbox.open(albums, index);
    } else if (this.imagePrivew && !this.imageContentTypeBase64){
      const album = {
        src: this.imagePrivew,
        caption: '',
        thumb: this.imagePrivew
      };

      this._lightbox.open([album], 0);
    }else {
      const album = {
        src: this.imageContentTypeBase64,
        caption: '',
        thumb: this.imageContentTypeBase64
      };

      this._lightbox.open([album], 0);
    }
  }

  removeImageMultiple(index) {
    console.log('removeImageMultiple', index);
    this.multipleImageContentType.splice(index, 1);
    // delete this.imageContentType[index];
    // const d = [];
    // for (let i = 0; i < this.imageContentType['length']; i++) {
    //   if ( i !== index) {
    //     d.push(this.imageContentType[i]);
    //   }
    // }
    // console.log('d', d);
    // this.imageContentType = d;
  }

  onVideoContentTypeSelect(event) {
    console.log('event video', event);

    const file: File = event;
    const myReader: FileReader = new FileReader();

    this.multipleImageContentType = [];

    myReader.onloadend = (e) => {
      this.videoContentTypeURL = myReader.result;
    }

    myReader.readAsDataURL(file);
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

  // Targeted Audience

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
        console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        console.log('last self area', last_self_area, is_area_2, levelCovered, levelCovered.indexOf(lastSelectedArea.key) !== -1, lastSelectedArea);
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

    this.pagination['audience'] = this.formNotification.get("user_group").value;
    if (this.formNotification.get("user_group").value === 'customer') {
      let age = this.formNotification.get("age").value === "18+" ? "18plus" : "18min";
      this.pagination['age'] = age;
    }
    else {
      if (this.pagination['age']) delete this.pagination['age'];
    }

    if (this.formNotification.get("user_group").value === 'retailer' && this.formNotification.get("landing_page_value").value === 'pojok-modal') {
      this.pagination['type'] = 'pojok-modal'
    } else {
      delete this.pagination['type'];
    }
    // if (this.formPopupGroup.get("user_group").value === 'retailer') {
    //   this.pagination['retailer_type'] = this.formPopupGroup.get("group_type").value;
    //   delete this.pagination['customer_smoking'];
    //   delete this.pagination['customer_gender'];
    //   delete this.pagination['customer_age_from'];
    //   delete this.pagination['customer_age_to'];
    // }
    // if (this.formPopupGroup.get("user_group").value === 'customer') {
    //   delete this.pagination['customer_smoking'];
    //   delete this.pagination['customer_gender'];
    //   delete this.pagination['customer_age_from'];
    //   delete this.pagination['customer_age_to'];
    //   delete this.pagination['retailer_type'];
    // }
    // if (this.formPopupGroup.get("user_group").value === 'customer') {
    //   delete this.pagination['retailer_type'];
    //   this.pagination['customer_smoking'] = this.formPopupGroup.get("is_smoker").value;
    //   this.pagination['customer_gender'] = this.formPopupGroup.get("gender").value;
    //   this.pagination['customer_age_from'] = this.formPopupGroup.get("age_consumer_from").value;
    //   this.pagination['customer_age_to'] = this.formPopupGroup.get("age_consumer_to").value;
    // }

    this.notificationService.getPushNotifAudience(this.pagination).subscribe(res => {
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
        console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        console.log('last self area', last_self_area, is_area_2, levelCovered, levelCovered.indexOf(lastSelectedArea.key) !== -1, lastSelectedArea);
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
    this.notificationService.getPushNotifAudience(this.pagination).subscribe(res => {
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
        console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        console.log('last self area', last_self_area, is_area_2, levelCovered, levelCovered.indexOf(lastSelectedArea.key) !== -1, lastSelectedArea);
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

    this.notificationService.getPushNotifAudience(this.pagination).subscribe(res => {
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
        console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
        if (findOnFirstArea) is_area_2 = false;
        else is_area_2 = true;

        console.log('last self area', last_self_area, is_area_2, levelCovered, levelCovered.indexOf(lastSelectedArea.key) !== -1, lastSelectedArea);
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

    this.notificationService.getPushNotifAudience(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  displayCheck(row) {
    return row.name !== 'Ethel Price';
  }

  onSelectAudience(event, row) {
    console.log('onnnnnn', event);
    let index = this.audienceSelected.findIndex(r => r.id === row.id);
    if (index > - 1) {
      this.audienceSelected.splice(index, 1);
    } else {
      this.audienceSelected.push(row);
    }
    this.onSelect({ selected: this.audienceSelected });
    console.log('asdasd', this.audienceSelected);
  }

  selectCheck(row, column, value) {
    console.log('selectcheck', row, column, value);
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

  async export() {
    if (this.audienceSelected.length === 0) {
      this.dialogService.openSnackBar({ message: 'Pilih audience untuk di ekspor!' });
      return;
    }
    this.dataService.showLoading(true);
    let body = this.audienceSelected.map(aud => aud.id);
    let age = null
    if (this.formNotification.get("user_group").value === 'customer') age = this.formNotification.get("age").value === "18+" ? "18plus" : "18min";
    else {
      if (age) age = null
    }
    try {
      const response = await this.notificationService.exportPushNotifAudience({ selected: body, audience: this.formNotification.get("user_group").value, age: age }).toPromise();
      console.log('he', response.headers);
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `PushNotification_${new Date().toLocaleString()}.xls`);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
      this.dataService.showLoading(false);
    } catch (error) {
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

  handleError(error) {
    console.log('Here')
    console.log(error)

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
    // alert('Open console to see the error')
  }

  import(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { audience: this.formNotification.get("user_group").value, type: 'push_notification' };

    this.dialogRef = this.dialog.open(ImportPopUpAudienceComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.audienceSelected = response;
        this.onSelect({ selected: this.audienceSelected });
        if (response.data) {
          this.dialogService.openSnackBar({ message: 'File berhasil diimport' });
        }
      }
    });
  }
  async getDetails() {
    try {
      this.dataService.showLoading(true);
      const details = await this.notificationService.show({ notification_id: this.idNotif }).toPromise();
      const { title, static_page_slug, body, age, content_type, type, type_of_recurrence, target_audience, audience, recurrence, status, notif_type, content_type_value,
        verification,
      } = details;
      // await this.notificationService.show({ notification_id: this.idNotif }).toPromise();
      // let staticPageDetail = null;
      let static_page_body = '';
      const iframe_value = (content_type === 'iframe') ? content_type_value.iframe_value : '';
      const landing_page_value = (content_type === 'landing_page') ? content_type_value.landing_page_value : '';
      const image_url = (content_type === 'image') ? content_type_value.image_value : [];

      if (static_page_slug) {
        const {body} = await this.notificationService.getPageContent(static_page_slug).toPromise();
        static_page_body = body || '';
      }
      if (image_url && image_url.length) {
        this.imagePrivew = image_url[0];
        this.imageContentTypeBase64 = image_url[0];
      }

      const frm = this.formNotification;
      frm.controls['title'].setValue(title);
      frm.controls['body'].setValue(body);
      frm.controls['user_group'].setValue(type);
      frm.controls['age'].setValue(age);
      frm.controls['content_type'].setValue(content_type);
      frm.controls['static_page_title'].setValue(static_page_slug);
      frm.controls['static_page_body'].setValue(static_page_body);
      frm.controls['status'].setValue(status);
      frm.controls['verification'].setValue(verification);
      setTimeout(() => {
        /**
         * dikasih timeout karena ada subscriber user_group, content_type ketika init
         */
        frm.controls['url_iframe'].setValue(iframe_value);
        frm.controls['landing_page_value'].setValue(landing_page_value);
        frm.controls['notif_type'].setValue(notif_type); 
      }, 1000);

      if(type_of_recurrence == 'Recurring' && recurrence) {
        this.formNotification.controls.type_of_recurrence.enable();
        this.typeOfRecurrence = 'Recurring'
        this.recurrenceType = recurrence.recurrence_type

        switch(recurrence.recurrence_type) {
          case 'Daily':
            this.formDailyRecurrence.controls['recurrence_time'].setValue(recurrence.time)
            break;
          case 'Weekly':
            let recurrenceDayControls = this.formWeeklyRecurrence.controls['recurrence_day'] as FormGroup
            let days = recurrence.day_of_week.split(',')
            days.forEach(day => {
              recurrenceDayControls.controls[day].setValue(true)
            })
            this.formWeeklyRecurrence.controls['recurrence_time'].setValue(recurrence.time)
            break;
          case 'Monthly':
            this.formMonthlyRecurrence.controls['recurrence_date'].setValue(recurrence.date)
            this.formMonthlyRecurrence.controls['recurrence_time'].setValue(recurrence.time)
            break;
          case 'Yearly':
            this.formYearlyRecurrence.controls['recurrence_date'].setValue(recurrence.date)
            this.formYearlyRecurrence.controls['recurrence_month'].setValue(recurrence.month)
            this.formYearlyRecurrence.controls['recurrence_time'].setValue(recurrence.time)
            break;
        }
        const frmCommon = this.formRecurrenceCommon;
        frmCommon.controls['recurrence_pattern'].setValue(recurrence.recurrence_pattern);
        frmCommon.controls['recurrence_start_date'].setValue(recurrence.start_date);
        if(recurrence.end_date) {
          frmCommon.controls['end_option'].setValue('end_date');
          frmCommon.controls['recurrence_end_date'].setValue(recurrence.end_date);
        }
        if(recurrence.end_recurrence_count) {
          frmCommon.controls['end_option'].setValue('end_count');
          frmCommon.controls['end_recurrence_count'].setValue(recurrence.end_recurrence_count);
        }
      } else {
        this.typeOfRecurrence = type_of_recurrence
      }
      console.log('type', type);
      console.log('target_audience', target_audience);
      if(type !== 'customer' || target_audience) {
        frm.controls['is_target_audience'].setValue(target_audience ? true : false);
        if (target_audience) {
          setTimeout(() => {
            this.audienceSelected = audience;
            this.onSelect({ selected: this.audienceSelected });
          }, 400);
        }
      }
      if (type === 'customer') {
        frm.controls['notif_type'].setValidators([Validators.required]);
        frm.controls['notif_type'].setValue(notif_type);
      } else {
        frm.controls['notif_type'].setValidators([]);
        frm.controls['notif_type'].setValue('');
      }

      // end request
      this.dataService.showLoading(false);
    } catch (error) {
      console.log({ error });
      this.dataService.showLoading(false);

    }
  }
}
