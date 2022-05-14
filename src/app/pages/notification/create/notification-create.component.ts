import { Component, OnInit, ViewChild, Input, ElementRef, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { NotificationService } from 'app/services/notification.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';
import { Lightbox } from 'ngx-lightbox';

import * as _ from 'underscore';
import moment from 'moment';
import { Config } from 'app/classes/config';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { Observable, Subject } from 'rxjs';
import { RetailerService } from 'app/services/user-management/retailer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { ImportAudienceComponent } from 'app/shared/import-audience/import-audience.component';
import { GeotreeService } from 'app/services/geotree.service';
import { TemplateTaskService } from 'app/services/dte/template-task.service';
import { P } from '@angular/core/src/render3';
import { LanguagesService } from 'app/services/languages/languages.service';
import { BannerService } from 'app/services/inapp-marketing/banner.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notification-create',
  templateUrl: './notification-create.component.html',
  styleUrls: ['./notification-create.component.scss']
})
export class NotificationCreateComponent {
  onLoad: boolean;
  loadingIndicator: boolean;
  formFilter: FormGroup;
  listEmployee: any[] = [{ name: "Semua", value: "all" }, { name: "Employee Only", value: "yes" }];
  formNotification: FormGroup;
  formArea: FormGroup;
  formNotificationError: any;

  formDailyRecurrence: FormGroup;
  formWeeklyRecurrence: FormGroup;
  formMonthlyRecurrence: FormGroup;
  formYearlyRecurrence: FormGroup;
  formRecurrenceCommon: FormGroup;
  listProductBarcodes: Array<any> = []

  listJenisKonsumen: any[] = [{ name: "Semua", value: "all" }, { name: "Terverifikasi", value: "verified" }];
  listSubscriptionStatus: any[] = [{ name: 'Semua', value: 'all' }, { name: 'Berlangganan', value: 'subscribed' }, { name: 'Tidak Berlangganan', value: 'not-subscribed' }]
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
  minStartDate: any = new Date();

  listLevelArea: any[];
  list: any;
  listUserGroup: any[] = [{ name: "Retailer", value: "retailer" }, { name: "Customer", value: "customer" }, { name: "Wholesaler", value: "wholesaler" }, { name: "TSM", value: "tsm" }];
  listAge: any[] = [{ name: "18+", value: "18+" }, { name: "18-", value: "18-" }, { name: 'Semua', value: 'all' }];
  listEmployeeFilter: any[] = [{ name: 'Employee Only', value: 'employee-only' }, { name: 'Semua', value: 'all' }];
  listLandingPage: any[] = [];
  listContentType: any[] = [{ name: "Static Page", value: "static_page" }, { name: "Landing Page", value: "landing_page" }, { name: "Iframe", value: "iframe" }, { name: "Image", value: "image" }, { name: "Unlinked", value: "unlinked" }, { name: "Pojok Modal", value: "pojok_modal" }];
  listNotifType: any[] = [
    { name: "Kirim Sebagai Notifikasi", value: "notif" },
    { name: "Kirim Sebagai Pesan", value: "message" },
  ];
  listConsumentType: any[] = [
    { name: 'Semua', value: 'all' },
    { name: 'Merokok', value: '1' },
    { name: 'Tidak Merokok', value: '0' }
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
    { id: 'Daily', name: 'Harian' },
    { id: 'Weekly', name: 'Mingguan' },
    { id: 'Monthly', name: 'Bulanan' },
    { id: 'Yearly', name: 'Tahunan' }
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
    { id: 'Jan', name: 'Januari' },
    { id: 'Feb', name: 'Februari' },
    { id: 'Mar', name: 'Maret' },
    { id: 'Apr', name: 'April' },
    { id: 'May', name: 'Mei' },
    { id: 'Jun', name: 'Juni' },
    { id: 'Jul', name: 'Juli' },
    { id: 'Aug', name: 'Agustus' },
    { id: 'Sep', name: 'September' },
    { id: 'Oct', name: 'Oktober' },
    { id: 'Nov', name: 'November' },
    { id: 'Dec', name: 'Desember' },
  ]

  listDates: number[];

  listContentWallet: any[] = [];
  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;
  SelecectionType = SelectionType;

  rows: any[];
  selected: any[] = [];
  id: any[];
  allRowsSelected = false;
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
  Country: any = '';

  _typeOfRecurrence: string;
  _recurrenceType: string;
  isActiveInactiveShow: boolean;
  recType: any;
  isHideSaveButton: boolean = true;
  isCreateOrEditNotification: any;
  iframe_value: any;

  selectedArea: any[] = [];
  selectedAll: boolean = false;
  selectedAllId: any[] = [];
  areasInit: any[] = [];

  @Input() get typeOfRecurrence(): string {
    return this._typeOfRecurrence
  }

  set typeOfRecurrence(val: string) {
    this._typeOfRecurrence = val;
    if (this._typeOfRecurrence !== 'Recurring') {
      this.recurrenceType = '';
    }

    if (this._typeOfRecurrence == 'Bday' || this._typeOfRecurrence == 'Bday18') {
      this.formNotification.controls.is_target_audience.setValue(false);
      this.formNotification.controls.is_target_audience.disable();
      this.formNotification.controls.is_target_area.setValue(false);
      this.formNotification.controls.is_target_area.disable();
    } else {
      this.formNotification.controls.is_target_audience.enable();
      this.formNotification.controls.is_target_area.enable();
    }

    if (this.typeOfRecurrence == 'Bday18') {
      this.formNotification.controls.age.setValue('18+');
      this.formNotification.controls.age.disable();
    } else {
      this.formNotification.controls.age.enable();
    }
  }

  @Input() get recurrenceType(): string {
    return this._recurrenceType
  }

  set recurrenceType(val: string) {
    this._recurrenceType = val;
  }
  pageName = this.translate.instant('notification.text');
  titleParam = { entity: this.pageName };

  ALLOW_FOR_TYPE = ['customer', 'retailer', 'wholesaler'];
  // ALLOW_FOR_TYPE = ['customer'];

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
    private ls: LanguagesService,
    private bannerService: BannerService,
    private translate: TranslateService,
  ) {
    this.multipleImageContentType = [];
    this.areaType = this.dataService.getDecryptedProfile()['area_type'];
    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    this.formNotificationError = {
      title: {},
      body: {},
      user: {},
      user_group: {},
      age: {},
      notif_type: {},
      is_smoking: {},
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

    this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
  }

  ngOnInit() {
    this.formNotification = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      user_group: ["retailer", Validators.required],
      verification: ["all"],
      subscription_status: ['all'],
      age: ["18+", Validators.required],
      employee_filter: ["all", Validators.required],
      employee: ["all"],
      content_type: ["static_page", Validators.required],
      static_page_title: ["", Validators.required],
      static_page_body: ["", Validators.required],
      content_wallet: [1, Validators.required],
      button_text: ["", [Validators.maxLength(30)]],
      landing_page_value: ["belanja", Validators.required],
      url_link: ["", [Validators.required, Validators.pattern(/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i)]],
      areas: this.formBuilder.array([]),
      is_target_audience: [false],
      is_target_area: [false],
      search: [""],
      transfer_token: ["yes", Validators.required],
      type_of_recurrence: ["OneTime", Validators.required],
      recurrence_type: [""],
      send_ayo: [false],
      status: ["Active"],
      notif_type: ['notif', Validators.required],
      is_smoking: ['all', Validators.required],
      area_ids: [[]],
      date: [moment(), Validators.required],
      time: ["00:00", Validators.required],
      barcode:["", Validators.required]
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

    if (this.ls.selectedLanguages == 'id') {
      this.Country = 'ID';
    }
    else if (this.ls.selectedLanguages == 'km') {
      this.Country = 'KH';
    }
    else if (this.ls.selectedLanguages == 'en-ph') {
      this.Country = 'PH';
    }

    this.isCreateOrEditNotification = this.router.url;
    if (this.isCreateOrEditNotification !== '/notifications/push-notification/create') {
      this.recType = this.dataService.getFromStorage("detail_notif");
      if (this.recType.type_of_recurrence.toLowerCase() === 'onetime') {
        this.isHideSaveButton = false;
      } else {
        this.isActiveInactiveShow = true;
      }
    }

    this.isCreateOrEditNotification = this.router.url;
    if (this.isCreateOrEditNotification !== '/notifications/push-notification/create') {
      this.recType = this.dataService.getFromStorage("detail_notif");
      if (this.recType.type_of_recurrence.toLowerCase() === 'onetime') {
        this.isHideSaveButton = false;
      } else {
        this.isActiveInactiveShow = true;
      }
    }

    this.formDailyRecurrence = this.formBuilder.group({
      recurrence_time: ["", Validators.required]
    })

    this.formWeeklyRecurrence = this.formBuilder.group({
      recurrence_day: this.formBuilder.group({}),
      recurrence_time: ["", Validators.required]
    })

    this.bannerService.getListWallet().subscribe(res => {
      this.listContentWallet = res.data;
    });

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

    this.listDates = Array.from({ length: 31 }, (_, i) => i + 1)

    this.typeOfRecurrence = 'OneTime';

    this.formNotification.controls['user_group'].valueChanges.debounceTime(50).subscribe(res => {
      if (res === 'retailer' || res === 'tsm') {
        this.listLandingPage = [{ name: "Belanja", value: "belanja" }, { name: "Misi", value: "misi" }, { name: "Pelanggan", value: "pelanggan" }, { name: "Bantuan", value: "bantuan" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Pojok Modal", value: "pojok_modal" }];
        // this.formNotification.controls['landing_page_value'].disable();
      } else if (res === 'customer') {
        this.listLandingPage = [{ name: "Kupon", value: "kupon" }, { name: "Terdekat", value: "terdekat" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Bantuan", value: "bantuan" }, { name: "Pesan Antar", value: "pesan_antar" }, { name: "Tantangan", value: "tantangan" }, { name: "Peluang", value: "peluang" }, { name: "Main Bareng", value: "main_bareng" }];
      } else {
        this.listLandingPage = [{ name: "Pesan Antar", value: "pesan_antar" }, { name: "Terdekat", value: "terdekat" }, { name: "Main Bareng", value: "main_bareng" }, { name: "Tantangan", value: "tantangan" }, { name: "Peluang", value: "peluang" }, { name: "Kupon", value: "kupon" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Bantuan", value: "bantuan" }];
        // this.formNotification.controls['landing_page_value'].enable();
      }
      if (res === 'wholesaler') {
        this.listContentType = [{ name: "Static Page", value: "static_page" }, { name: "Iframe", value: "iframe" }, { name: "Image", value: "image" }, { name: "Unlinked", value: "unlinked" }, { name: "Video", value: "video" }];
      } else if (res === 'customer') {
        this.listContentType = [{ name: "Static Page", value: "static_page" }, { name: "Landing Page", value: "landing_page" }, { name: "Iframe", value: "iframe" }, { name: "Image", value: "image" }, { name: "Unlinked", value: "unlinked" }, { name: "E-Wallet", value: "e_wallet" }, { name: "Link to Web Browser", value: "link_web" }];
      } else if(res === 'tsm'){
        this.listContentType = [{ name: "Static Page", value: "static_page" }, { name: "Landing Page", value: "landing_page" }, { name: "Iframe", value: "iframe" }, { name: "Image", value: "image" }, { name: "Unlinked", value: "unlinked" }];
      } else{
        this.listContentType = [{ name: "Static Page", value: "static_page" }, { name: "Landing Page", value: "landing_page" }, { name: "Iframe", value: "iframe" }, { name: "Image", value: "image" }, { name: "Unlinked", value: "unlinked" }, {name:"Spesifik Produk B2B", value:"spesific_product_b2b"}];
      }

      if (!this.ALLOW_FOR_TYPE.includes(res)) {
        this.formNotification.get('notif_type').setValidators([]);
        this.formNotification.get('notif_type').setValue('');
        this.formNotification.get('content_wallet').setValidators([]);
        this.formNotification.get('content_wallet').setValue('');
        this.formNotification.updateValueAndValidity();
      } else {
        this.formNotification.get('notif_type').setValidators([Validators.required]);
        this.formNotification.get('notif_type').setValue('notif');
        this.formNotification.get('content_wallet').setValidators([Validators.required]);
        this.formNotification.get('content_wallet').setValue(1);
        this.formNotification.updateValueAndValidity();
      }

      if (this.formNotification.get("is_target_audience").value === true) {
        this.getAudience();
      };

      this.selected.splice(0, this.selected.length);
      this.audienceSelected = [];
      // console.log(this.formNotification.controls['content_type'].value)
      this.contentType(this.formNotification.controls['content_type'].value);
    });

    this.formNotification.controls['age'].valueChanges.debounceTime(50).subscribe(res => {
      this.resetAudience();
    });
    this.formNotification.controls['verification'].valueChanges.debounceTime(50).subscribe(res => {
      this.resetAudience();
    });
    this.formNotification.controls['subscription_status'].valueChanges.debounceTime(50).subscribe(res => {
      this.resetAudience();
    });
    this.formNotification.controls['employee_filter'].valueChanges.debounceTime(50).subscribe(res => {
      this.resetAudience();
    });

    this.formNotification.controls['user_group'].setValue('retailer');
    this.formNotification.controls['url_link'].disable();

    this.formNotification.controls['landing_page_value'].valueChanges.subscribe(res => {
      if (res) {
        this.getAudience();
      }
    });

    this.formNotification.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formNotification, this.formNotificationError);
    });

    this.formRecurrenceCommon.get('recurrence_end_date').valueChanges.subscribe(val => {
      if (val) {
        this.formRecurrenceCommon.controls['end_option'].setValue('end_date');
      }
    })

    this.formRecurrenceCommon.get('end_recurrence_count').valueChanges.subscribe(val => {
      if (val) {
        this.formRecurrenceCommon.controls['end_option'].setValue('end_count');
      }
    })

    this.formNotification.controls['is_smoking'].valueChanges.debounceTime(50).subscribe(res => {
      if (this.formNotification.get("is_target_audience").value === true) {
        this.getAudience();
        this.selected.splice(0, this.selected.length);
        this.audienceSelected = [];
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

    if (!this.ALLOW_FOR_TYPE.includes(this.formNotification.controls.user_group.value)) {
      // this.formNotification.controls.type_of_recurrence.disable();
      this.formNotification.controls.send_ayo.setValue(true);
      this.formNotification.controls.send_ayo.disable();
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

  resetAudience() {
    if (this.formNotification.get("is_target_audience").value === true) {
      this.getAudience();
    };
    this.selected.splice(0, this.selected.length);
    this.audienceSelected = [];
  }
  // resetArea() {
  //   if(this.formNotification.get('is_target_area').value === false) {
  //     this.formNotification.get('area_ids').setValue('1');
  //   }
  // }

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
          this.list[this.parseArea(selection)] = res.data;
          // this.list[this.parseArea(selection)] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

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
              this.list[selection] = res.data;
              // this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
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
              this.list[selection] = res.data;
              // this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
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
              this.list[selection] = res.data;
              // this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
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
              this.list[selection] = res.data;
              // this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
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
              this.list[selection] = res.data;
              // this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

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
      // switch (item.type.trim()) {
      //   case 'national':
      //     wilayah.at(index).get('national').disable();
      //     break
      //   case 'division':
      //     wilayah.at(index).get('zone').disable();
      //     break;
      //   case 'region':
      //     wilayah.at(index).get('region').disable();
      //     break;
      //   case 'area':
      //     wilayah.at(index).get('area').disable();
      //     break;
      //   case 'salespoint':
      //     wilayah.at(index).get('salespoint').disable();
      //     break;
      //   case 'district':
      //     wilayah.at(index).get('district').disable();
      //     break;
      //   case 'territory':
      //     wilayah.at(index).get('territory').disable();
      //     break;
      // }
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

  handleSearchProduct(event){
    if(event.id)
    this.formNotification.get("barcode").setValue(event)
    else
    this.formNotification.get("barcode").setValue("")
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

    if(e.source.value !== 'customer'){
      this.formNotification.get('is_target_area').setValue(false)
      this.formNotification.get('is_target_audience').setValue(false)
    }

    if (!this.ALLOW_FOR_TYPE.includes(e.source.value)) {
      this.typeOfRecurrence = 'OneTime';
      // this.formNotification.controls.type_of_recurrence.disable();
      this.formNotification.controls.send_ayo.setValue(true);
      this.formNotification.controls.send_ayo.disable();
      this.formNotification.controls.subscription_status.setValue('all');
    } else {
      this.formNotification.controls.type_of_recurrence.enable();
      this.formNotification.controls.send_ayo.enable();
      this.formNotification.controls.send_ayo.setValue(false);
    }
  }

  async submit() {
    // console.log(this.formNotification.valid, this.formNotification.get("barcode").value, this.formNotification.controls['barcode'], this.formNotification.get("title").value, this.formNotification.controls['title'].hasError('required'))
    if (!this.formNotification.valid) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formNotification);
      return;
    }

    if (this.typeOfRecurrence === 'Recurring' && !this.recurrenceType) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      return;
    }

    if (this.recurrenceType == 'Daily' && !this.formDailyRecurrence.valid) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formDailyRecurrence);
      return;
    }

    let selectedWeekDays = []

    if (this.recurrenceType == 'Weekly') {
      if (!this.formWeeklyRecurrence.valid) {
        this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
        commonFormValidator.validateAllFields(this.formWeeklyRecurrence);
        return;
      }
      let cbRecurrenceDay = this.formWeeklyRecurrence.controls.recurrence_day as FormGroup

      let recurrenceDayValues = cbRecurrenceDay.value
      selectedWeekDays = Object.keys(recurrenceDayValues).filter(key => recurrenceDayValues[key])

      if (selectedWeekDays.length == 0) {
        this.dialogService.openSnackBar({ message: "Harap pilih minimal satu hari terbit!" });
        return;
      }
    }

    if (this.recurrenceType == 'Monthly' && !this.formMonthlyRecurrence.valid) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formMonthlyRecurrence);
      return;
    }

    if (this.recurrenceType == 'Yearly' && !this.formYearlyRecurrence.valid) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formYearlyRecurrence);
      return;
    }

    if (this.typeOfRecurrence == 'Recurring' && !this.formRecurrenceCommon.valid) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formRecurrenceCommon);
      return;
    }
    let startDate
    let endDate

    if (this.typeOfRecurrence == 'Recurring') {
      let startDateStr = this.formRecurrenceCommon.controls.recurrence_start_date.value
      startDate = moment(startDateStr)

      if (!this.idNotif && !startDate.isSameOrAfter(moment(), 'day')) {
        this.dialogService.openSnackBar({ message: "Tanggal mulai tidak boleh sebelum hari ini!" });
        return;
      }

      if (this.formRecurrenceCommon.controls.end_option.value === 'end_date') {
        let endDateStr = this.formRecurrenceCommon.controls.recurrence_end_date.value
        if (!endDateStr) {
          this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
          return;
        }
        endDate = moment(endDateStr)
        if (startDate.isSameOrAfter(endDate, 'day')) {
          this.dialogService.openSnackBar({ message: "Tanggal selesai harus setelah tanggal mulai!" });
          return;
        }
      }

    }

    if (this.formNotification.get("is_target_audience").value) {
      let unique_set = new Set(this.audienceSelected);
      if (this.audienceSelected.length !== unique_set.size) {
        this.dialogService.openSnackBar({ message: 'Mohon cek kembali data yang diupload.' });
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
        return;
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
      subscription_status: this.formNotification.get('subscription_status').value,
      content_type: this.formNotification.get('content_type').value,
      area_ids: areas[0].value.toString(),
      type_of_recurrence: this.typeOfRecurrence,
      send_sfmc: this.formNotification.get('send_ayo').value ? '0' : '1',
      country: this.Country,
      status: this.formNotification.get('status').value,
    };

    body['date'] = `${moment(this.formNotification.get('date').value).format('YYYY-MM-DD')} ${this.formNotification.get('time').value}:00`;

    //only allow edit for customer type, non one-time recurrence, else create new notification instead
    if (this.ALLOW_FOR_TYPE.includes(body.type) && body.type_of_recurrence !== 'OneTime' && this.idNotif) {
      body.id = this.idNotif
    }

    let recurrenceBody: { [key: string]: any; };

    body['age'] = this.formNotification.get("age").value;

    if (this.ALLOW_FOR_TYPE.includes(body.type)) {
      body['employee'] = this.formNotification.get('employee').value;
      body['verification'] = this.formNotification.get('verification').value;
      body['subscription_status'] = this.formNotification.get('subscription_status').value;
      body['notif_type'] = this.formNotification.get('notif_type').value;
      body['is_smoking'] = this.formNotification.get('is_smoking').value;
      body['employee_filter'] = this.formNotification.get('employee_filter').value;
    }

    if (this.typeOfRecurrence == 'Bday18') {
      body['age'] = '18+';
    } else if (this.typeOfRecurrence == 'Recurring') {
      recurrenceBody = {
        recurrence_type: this.recurrenceType
      }
      switch (this.recurrenceType) {
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
      if (end_option == 'end_date') {
        recurrenceBody.recurrence_end_date = endDate.format('YYYY-MM-DD')
      } else if (end_option == 'end_count') {
        recurrenceBody.end_recurrence_count = "" + this.formRecurrenceCommon.get('end_recurrence_count').value
      }

      body = {
        ...body,
        ...recurrenceBody
      }
    }

    if (body.content_type === 'static_page') {
      body['static_page_title'] = this.formNotification.get("static_page_title").value
      body['static_page_body'] = this.formNotification.get("static_page_body").value
    } else if (body.content_type === 'landing_page') {
      body['landing_page_value'] = this.formNotification.get('landing_page_value').value;
    } else if (body.content_type === 'iframe' || body.content_type === 'link_web') {
      let url = this.formNotification.get('url_link').value;
      if (!url.match(/^[a-zA-Z]+:\/\//)) { url = 'http://' + url; }
      body[`${body.content_type === 'iframe' ? 'iframe' : 'link_web'}_value`] = url;
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

            if (this.ALLOW_FOR_TYPE.includes(body.type)) {
              bodyVideo.append('verification', body.verification);
              bodyVideo.append('age', body.age);
              bodyVideo.append('notif_type', body.notif_type);
            }

            bodyVideo.append('subscription_status', body.subscription_status);
            bodyVideo.append('content_type', body.content_type);
            bodyVideo.append('area_ids', body.area_ids);
            bodyVideo.append('status', body.status);
            this.multipleImageContentType.forEach((element, i) => {
              bodyVideo.append(`image_value[${i}]`, element);
            });
            if (this.formNotification.get('is_target_audience').value) {
              bodyVideo.append('target_audience', '1');
              const ta = await this.audienceSelected.map((id, i) => {
                bodyVideo.append(`target_audiences[${i}]`, id);
              });
            } else {
              if (bodyVideo.get('target_audience')) {
                bodyVideo.delete('target_audience');
              }
            }

            bodyVideo.append('employee_filter', this.formNotification.get('employee_filter').value);
            if (this.formNotification.get('send_ayo').value) {
              bodyVideo.append('send_sfmc', '0');
            } else {
              bodyVideo.append('send_sfmc', '1');
            }

            bodyVideo.append('type_of_recurrence', body.type_of_recurrence);
            if (this.typeOfRecurrence == 'Recurring') {
              Object.entries(recurrenceBody).forEach(entry => {
                let [key, val] = entry;
                bodyVideo.append(key, val);
                bodyVideo.delete('recurrence_day');
                if(key === 'recurrence_day'){
                  for (let i = 0; i < val.length; i++) {
                    bodyVideo.append('recurrence_day['+i+']', val[i]);
                  }
                }
              })
            }
            this.notificationService.create(bodyVideo).subscribe(
              res => {
                this.router.navigate(["notifications"]);
                this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
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
          if (this.ALLOW_FOR_TYPE.includes(body.type)) {
            bodyVideo.append('verification', body.verification);
            bodyVideo.append('age', body.age);
            bodyVideo.append('notif_type', body.notif_type);
          }
          bodyVideo.append('subscription_status', body.subscription_status);
          bodyVideo.append('content_type', body.content_type);
          bodyVideo.append('area_ids', body.area_ids);
          bodyVideo.append('status', body.status);
          bodyVideo.append('video_value', this.videoContentType);
          if (this.formNotification.get('is_target_audience').value) {
            bodyVideo.append('target_audience', '1');
            const ta = await this.audienceSelected.map((id, i) => {
              bodyVideo.append(`target_audiences[${i}]`, id);
            });
          } else {
            if (bodyVideo.get('target_audience')) {
              bodyVideo.delete('target_audience');
            }
          }

          bodyVideo.append('employee_filter', this.formNotification.get('employee_filter').value);
          if (this.formNotification.get('send_ayo').value) {
            bodyVideo.append('send_sfmc', '0');
          } else {
            bodyVideo.append('send_sfmc', '1');
          }

          bodyVideo.append('type_of_recurrence', body.type_of_recurrence);

          if (this.typeOfRecurrence == 'Recurring') {
            Object.entries(recurrenceBody).forEach(entry => {
              let [key, val] = entry;
              bodyVideo.append(key, val);
              bodyVideo.delete('recurrence_day');
              if(key === 'recurrence_day'){
                for (let i = 0; i < val.length; i++) {
                  bodyVideo.append('recurrence_day['+i+']', val[i]);
                }
              }
            })
          }

          this.notificationService.create(bodyVideo).subscribe(
            res => {
              this.router.navigate(["notifications"]);
              this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
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
    } else if (body.content_type === 'e_wallet') {
      body['content_wallet'] = this.formNotification.get("content_wallet").value;
      body['button_text'] = this.formNotification.get("button_text").value;
      body['static_page_body'] = this.formNotification.get("static_page_body").value;
    }else if (body.content_type === "spesific_product_b2b"){
      body['barcode_value'] = this.formNotification.get("barcode").value.id
      body['name_value'] = this.formNotification.get("barcode").value.name
    }

    if (this.formNotification.get("is_target_audience").value) {
      body['target_audience'] = 1;
      body['target_audiences'] = this.audienceSelected;
    } else {
      if (body['target_audience']) delete body['target_audience'];
    }
    if (this.ALLOW_FOR_TYPE.includes(body.type) && this.formNotification.get("is_target_area").value) {
      let str = '';
      if (this.selectedAll) {
        const all = this.selectedAllId;
        all.map((item, i) => i === 0 ? str += item : str += `,${item}`);
        body['area_ids'] = str;
      } else {
        let selected = this.selectedArea.filter((item) => (item.id && item.id.toString() !== "1")).map((item) => item.id);
        selected.map((item, i) => i === 0 ? str += item : str += `,${item}`);
        if (selected.length) {
          body['area_ids'] = str;
        } else {
          this.dataService.showLoading(false);
          return this.dialogService.openSnackBar({ message: "Target Area harus dipilih!" });
        }
      }
    }

    this.dataService.showLoading(true);

    this.notificationService.create(body).subscribe(
      res => {
        this.router.navigate(["notifications"]);
        this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
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
      if (value !== 'e_wallet') {
        this.formNotification.controls['static_page_body'].setValue('');
        this.formNotification.controls['static_page_body'].disable();
      }
      this.formNotification.controls['static_page_title'].setValue('');
      this.formNotification.controls['static_page_title'].disable();
    } else {
      this.formNotification.controls['static_page_title'].enable();
      this.formNotification.controls['static_page_body'].enable();
    }

    if (value === 'iframe' || value === 'link_web') {
      this.formNotification.controls['url_link'].setValue('');
      this.formNotification.controls['url_link'].enable();
    } else {
      this.formNotification.controls['url_link'].disable();
    }

    if (value !== 'e_wallet') {
      this.formNotification.controls['content_wallet'].disable();
      this.formNotification.controls['button_text'].disable();
    }

    if (value === 'e_wallet') {
      this.formNotification.get("content_wallet").enable();
      this.formNotification.get("static_page_body").enable();
      this.formNotification.get("button_text").enable();
    }


    if (value === 'landing_page') {
      this.formNotification.controls['landing_page_value'].setValue('');
      this.formNotification.controls['landing_page_value'].enable();
    } else {
      this.formNotification.controls['landing_page_value'].disable();
    }

    if (value === 'e_wallet') {
      this.formNotification.controls['content_wallet'].enable();
      // this.formNotification.controls['content_wallet'].setValue('OVO');
      this.formNotification.controls['button_text'].enable();
    } else {
      this.formNotification.controls['content_wallet'].disable();
      this.formNotification.controls['button_text'].disable();
    }

    if (value === 'spesific_product_b2b') {
      this.formNotification.controls['barcode'].enable();
      this.formNotification.get('barcode').setValidators([Validators.required]);
    } else {
      this.formNotification.controls['barcode'].setValue("");
      this.formNotification.controls['barcode'].disable();
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
    } else if (this.imagePrivew && !this.imageContentTypeBase64) {
      const album = {
        src: this.imagePrivew,
        caption: '',
        thumb: this.imagePrivew
      };

      this._lightbox.open([album], 0);
    } else {
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
    if (this.ALLOW_FOR_TYPE.includes(this.formNotification.get("user_group").value)) {
      let age = this.formNotification.get("age").value;
      if (age === '18+') age = '18plus';
      else if (age === '18-') age = '18min';
      else age = 'all';


      this.pagination['age'] = age;
      this.pagination['verification'] = this.formNotification.get('verification').value;
      this.pagination['subscription_status'] = this.formNotification.get('subscription_status').value;
      this.pagination['employee_filter'] = this.formNotification.get('employee_filter').value;
    }
    else {
      if (this.pagination['age']) delete this.pagination['age'];
      if (this.pagination['verification']) delete this.pagination['verification'];
      if (this.pagination['subscription_status']) delete this.pagination['subscription_status'];
      if (this.pagination['employee_filter']) delete this.pagination['employee_filter'];
    }

    if (this.formNotification.get("user_group").value === 'retailer' && this.formNotification.get("landing_page_value").value === 'pojok_modal') {
      this.pagination['type'] = 'pojok-modal'
    } else {
      delete this.pagination['type'];
    }

    //#region not used
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
    //#endregion

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

  setPagination() {
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
  }

  setPage(pageInfo) {
    this.setPagination();
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
    this.formNotification.controls.search.disable();

    this.setPagination();

    this.notificationService.getPushNotifAudience(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
      this.formNotification.controls.search.enable();
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;

    this.setPagination();

    this.formNotification.controls.search.disable();

    this.notificationService.getPushNotifAudience(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.allRowsSelected = false;
      this.audienceSelected = [];
      this.onSelect({ selected: this.audienceSelected });
      this.loadingIndicator = false;
      this.formNotification.controls.search.enable();
    });
  }

  displayCheck(row) {
    return row.name !== 'Ethel Price';
  }

  onSelectAudience(event, row) {
    let index = this.audienceSelected.findIndex(id => id === row.id);
    if (index > - 1) {
      this.audienceSelected.splice(index, 1);
      this.allRowsSelected = false;
    } else {
      this.audienceSelected.push(row.id);
    }
    this.onSelect({ selected: this.audienceSelected });
    console.log('asdasd', this.audienceSelected);
  }

  selectCheck(row, column, value) {
    console.log('selectcheck', row, column, value);
    return row.id !== null;
  }

  bindSelector(isSelected, row) {
    let index = this.audienceSelected.findIndex(id => id === row.id);
    return index > -1;
  }

  onSelectAll(allRowsSelected: boolean) {
    console.log('allRowsSelected', allRowsSelected);
    this.allRowsSelected = allRowsSelected;
    if (this.allRowsSelected) {
      this.setPagination();
      this.loadingIndicator = true;
      this.formNotification.controls.search.disable();
      this.audienceSelected = this.selected = [];
      (async () => {
        let loadMoreIds = true;
        let offset = 0;
        while (loadMoreIds) {
          let queryParams = {
            ...this.pagination,
            offset
          }
          const res = await this.notificationService.getPushNotifAudienceIDs(queryParams).toPromise();
          this.audienceSelected = [...this.audienceSelected, ...res];
          this.selected = [...this.audienceSelected];
          if (res.length >= 50000) {
            offset += res.length;
          } else {
            loadMoreIds = false;
          }
        }

        this.loadingIndicator = false;
        this.formNotification.controls.search.enable();
      })();

    } else {
      this.audienceSelected = [];
      this.onSelect({ selected: this.audienceSelected });
    }
  }

  isTargetAudience(event) {
    if (this.formNotification.get('is_target_area').value) this.formNotification.get('is_target_area').setValue(false);
    if (event.checked) this.getAudience();
  }
  isTargetArea(event) {
    if (this.formNotification.get('is_target_audience').value) this.formNotification.get('is_target_audience').setValue(false);
    if (event.checked) {
      if (this.selectedAll) {
        this.areasInit = this.selectedAllId;
      } else {
        this.areasInit = this.selectedArea;
      };
    };
  }
  sendAYOChange(event) {

  }

  async export() {
    if (this.audienceSelected.length === 0) {
      this.dialogService.openSnackBar({ message: 'Pilih audience untuk di ekspor!' });
      return;
    }
    this.dataService.showLoading(true);
    let body = this.audienceSelected;
    let age = null
    if (this.ALLOW_FOR_TYPE.includes(this.formNotification.get("user_group").value)) {
      age = this.formNotification.get("age").value;
      if (age === '18+') age = '18plus';
      else if (age === '18-') age = '18min';
      else age = 'all';
    }
    else {
      if (age) age = null;
    }
    try {
      const response = await this.notificationService.exportPushNotifAudience({ selected: body, audience: this.formNotification.get("user_group").value, age: age }).toPromise();
      console.log('he', response.headers);
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `PushNotification_${new Date().toLocaleString()}.xlsx`);
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
    dialogConfig.data = {
      audience: this.formNotification.get("user_group").value,
      api: fd => this.notificationService['importPushNotifAudience'](fd),
      fileType: 'xlsx'
    };

    this.dialogRef = this.dialog.open(ImportAudienceComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.audienceSelected = response.map(r => r.id);
        this.onSelect({ selected: this.audienceSelected });
        if (response.data) {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text8 });
        }
      }
    });
  }
  async getDetails() {
    try {
      this.dataService.showLoading(true);
      const details = await this.notificationService.show({ notification_id: this.idNotif }).toPromise();
      const { title, static_page_slug, body, age, content_type, type, subscription_status, employee_filter, type_of_recurrence, target_audience, audience, recurrence, status, notif_type, content_type_value,
        verification, send_sfmc, area_ids, is_smoking,
      } = details;
      // await this.notificationService.show({ notification_id: this.idNotif }).toPromise();
      // let staticPageDetail = null;
      let static_page_body = '';

      const url_link = (content_type === 'iframe') ? content_type_value.iframe_value : content_type_value.link_web_value;
      const landing_page_value = (content_type === 'landing_page') ? content_type_value.landing_page_value : '';
      const image_url = (content_type === 'image') ? content_type_value.image_value : [];
      const wallet_value = (content_type === 'e_wallet') ? content_type_value.target_page.wallet.app_name : '';
      const button_text = (content_type === 'e_wallet') ? content_type_value.target_page.button_text : '';
      const productInfo = (content_type === "spesific_product_b2b") ? {id:content_type_value.product_info.barcode, name:content_type_value.product_info.name} : ''
      // console.log(productInfo)
      if (static_page_slug) {
        const { body } = await this.notificationService.getPageContent(static_page_slug).toPromise();
        static_page_body = body || '';
      }
      if (image_url && image_url.length) {
        this.imagePrivew = image_url[0];
        this.imageContentTypeBase64 = image_url[0];
      }

      const frm = this.formNotification;
      frm.controls['is_smoking'].setValue(is_smoking);
      frm.controls['title'].setValue(title);
      frm.controls['body'].setValue(body);
      frm.controls['user_group'].setValue(type);
      frm.controls['subscription_status'].setValue(subscription_status ? subscription_status : 'all');
      frm.controls['employee_filter'].setValue(employee_filter ? employee_filter : 'all');
      if (age) {
        frm.controls['age'].setValue(age);
      }
      frm.controls['content_type'].setValue(content_type);
      frm.controls['static_page_title'].setValue(static_page_slug);
      frm.controls['static_page_body'].setValue(static_page_body);
      frm.controls['status'].setValue(status);
      frm.controls['verification'].setValue(verification);
      frm.controls['area_ids'].setValue(area_ids);
      if (area_ids.length > 0 && !area_ids.includes(1)) {
        frm.controls['is_target_area'].setValue(true);
        this.areasInit = frm.controls['area_ids'].value.map(item => ({ id: item }));
      }
      if (this.ALLOW_FOR_TYPE.includes(type)) {
        let send_ayo = send_sfmc == null || send_sfmc == 0 || send_sfmc == '0';
        frm.controls['send_ayo'].setValue(send_ayo);
        frm.controls['area_ids'].setValue(area_ids);
      } else {
        frm.controls['send_ayo'].setValue(true);
      }
      if(content_type === "spesific_product_b2b")
        frm.controls['barcode'].setValue(productInfo);


      setTimeout(() => {
        /**
         * dikasih timeout karena ada subscriber user_group, content_type ketika init
         */
        frm.controls['url_link'].setValue(url_link);
        frm.controls['landing_page_value'].setValue(landing_page_value);
        frm.controls['notif_type'].setValue(notif_type);
        frm.controls['content_wallet'].setValue(wallet_value);
        frm.controls['button_text'].setValue(button_text);
      }, 1000);
      if (type_of_recurrence == 'Recurring' && recurrence) {
        this.formNotification.controls.type_of_recurrence.enable();
        this.typeOfRecurrence = 'Recurring'
        this.recurrenceType = recurrence.recurrence_type

        switch (recurrence.recurrence_type) {
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
        if (recurrence.end_date) {
          frmCommon.controls['end_option'].setValue('end_date');
          frmCommon.controls['recurrence_end_date'].setValue(recurrence.end_date);
        }
        if (recurrence.end_recurrence_count) {
          frmCommon.controls['end_option'].setValue('end_count');
          frmCommon.controls['end_recurrence_count'].setValue(recurrence.end_recurrence_count);
        }
      } else {
        this.typeOfRecurrence = type_of_recurrence
      }

      if (!this.ALLOW_FOR_TYPE.includes(type) || target_audience) {
        frm.controls['is_target_audience'].setValue(target_audience ? true : false);
        if (target_audience) {
          setTimeout(() => {
            this.audienceSelected = audience;
            this.onSelect({ selected: this.audienceSelected });
          }, 400);
        }
      }
      if (this.ALLOW_FOR_TYPE.includes(type)) {
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

  checkOnetimeFrequency(typeOfRecurrence: string) {
    if (typeOfRecurrence === 'OneTime') {
      this.isActiveInactiveShow = false;
    } else {
      this.isActiveInactiveShow = true;
    }
  }

  getSelectedArea(value: any) {
    this.selectedArea = value;
  }

  getSelectedAll(value: any) {
    this.selectedAll = value;
  }

  getSelectedAllId(value: any) {
    this.selectedAllId = value;
  }
}
