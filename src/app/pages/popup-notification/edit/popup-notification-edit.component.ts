import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Config } from 'app/classes/config';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { NotificationService } from 'app/services/notification.service';
import { DateAdapter, MatDialogConfig, MatDialog } from '@angular/material';
import { Lightbox } from 'ngx-lightbox';
import moment from 'moment';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import * as _ from 'underscore';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { ReplaySubject, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ImportAudienceComponent } from 'app/shared/import-audience/import-audience.component';
import { RetailerService } from 'app/services/user-management/retailer.service';
import { GeotreeService } from 'app/services/geotree.service';
import { isThisSecond } from 'date-fns';
import { ProductService } from 'app/services/sku-management/product.service';
import { takeUntil } from 'rxjs/operators';
import { B2BVoucherInjectService } from 'app/services/b2b-voucher-inject.service';
import { PagesName } from 'app/classes/pages-name';
import { BannerService } from 'app/services/inapp-marketing/banner.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-popup-notification-edit',
  templateUrl: './popup-notification-edit.component.html',
  styleUrls: ['./popup-notification-edit.component.scss']
})
export class PopupNotificationEditComponent {
  formFilter: FormGroup;
  onLoad: boolean;
  loadingIndicator: boolean;
  showLoading: Boolean;
  listLevelArea: any[];
  list: any;
  indexDelete: any;
  dialogRef: any;
  exportPopUpNotif: Boolean;

  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;

  lvl: any[];
  minDate: any;
  listJenisKonsumen: any[] = [{ name: this.translate.instant('global.label.all'), value: "all" }, { name: this.translate.instant('global.label.verified'), value: "verified" }];
  listSubscription: any[] = [{ name: this.translate.instant('global.label.all'), value: "all" }, { name: this.translate.instant('global.label.subscribe'), value: "yes" }, { name: this.translate.instant('global.label.unsubscribe'), value: "no" }];
  // listUserGroup: any[] = [{ name: "Wholesaler", value: "wholesaler" }, { name: "Retailer", value: "retailer" }, { name: "Consumer", value: "customer" }, { name: "TSM", value: "tsm"}];
  listUserGroup: any[] = [];
  listUserGroupType: any[] = [{ name: this.translate.instant('global.label.src'), value: "src" }, { name: this.translate.instant('global.label.ws_downline'), value: "downline" }];
  listContentType: any[] = [];
  listLandingPage: any[] = [];
  listGender: any[] = [{ name: this.translate.instant('global.label.all'), value: "both" }, { name: this.translate.instant('global.label.male'), value: "male" }, { name: this.translate.instant('global.label.female'), value: "female" }];
  listSmoker: any[] = [{ name: this.translate.instant('global.label.all'), value: "both" }, { name: this.translate.instant('global.label.smoking'), value: "yes" }, { name: this.translate.instant('global.label.not_smoke'), value: "no" }];
  listEmployee: any[] = [{ name: this.translate.instant('global.label.all'), value: "all" }, { name: this.translate.instant('global.label.employee_only'), value: "yes" }];
  listTypeOfRecurrence: Object[] = [
    { id: 'once', name: this.translate.instant('notification.popup_notifikasi.label1') },
    { id: 'recurring', name: this.translate.instant('notification.popup_notifikasi.label2') },
  ];
  listRecurrenceTypes: Object[] = [
    { id: 'daily', name: this.translate.instant('global.calendar.daily') },
    { id: 'weekly', name: this.translate.instant('global.calendar.weekly') },
    { id: 'monthly', name: this.translate.instant('global.calendar.monthly') },
    { id: 'yearly', name: this.translate.instant('global.calendar.yearly') }
  ];
  listWeekDays: any[] = [
    { id: 1, name: this.translate.instant('global.calendar.monday') },
    { id: 2, name: this.translate.instant('global.calendar.tuesday') },
    { id: 3, name: this.translate.instant('global.calendar.wednesday') },
    { id: 4, name: this.translate.instant('global.calendar.thursday') },
    { id: 5, name: this.translate.instant('global.calendar.friday') },
    { id: 6, name: this.translate.instant('global.calendar.saturday') },
    { id: 0, name: this.translate.instant('global.calendar.sunday') }
  ];
  listDates: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  listMonths: Object[] = [
    { id: 1, name: this.translate.instant('global.calendar.january') },
    { id: 2, name: this.translate.instant('global.calendar.february') },
    { id: 3, name: this.translate.instant('global.calendar.march') },
    { id: 4, name: this.translate.instant('global.calendar.april') },
    { id: 5, name: this.translate.instant('global.calendar.may') },
    { id: 6, name: this.translate.instant('global.calendar.june') },
    { id: 7, name: this.translate.instant('global.calendar.july') },
    { id: 8, name: this.translate.instant('global.calendar.august') },
    { id: 9, name: this.translate.instant('global.calendar.september') },
    { id: 10, name: this.translate.instant('global.calendar.october') },
    { id: 11, name: this.translate.instant('global.calendar.november') },
    { id: 12, name: this.translate.instant('global.calendar.december') },
  ]

  // Attribute for Content New Product
  public filterProduct: FormControl = new FormControl();
  filteredProduct: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  listProducts: any[] = [];

  imageConverted: any;

  files: File;
  imageContentType: File;
  imageContentTypeBase64: any;
  image: any;
  validComboDrag: boolean;

  validDragContentImage: boolean;
  fileContentImage: File;
  convertedContentImage: any;

  customAge: Boolean;

  formPopupGroup: FormGroup;
  formWeeklyRecurrence: FormGroup;
  formMonthlyRecurrence: FormGroup;
  formYearlyRecurrence: FormGroup;
  listDateChosen: FormControl = new FormControl([], Validators.required);
  formPopupErrors: any;

  public options: Object = {...Config.FROALA_CONFIG, placeholderText: this.translate.instant('notification.buat_notifikasi.text11') };

  idPopup: any;
  isDetail: Boolean;

  detailPopup: any;
  audienceSelected: any[] = [];

  selectedArea: any[] = [];
  selectedAll: boolean = false;
  selectedAllId: any[] = [];
  targetAreaIds: any[] = [];

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
  paginationProduct: Page = new Page();

  keyUp = new Subject<string>();
  areaType: any[] = [];
  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;

  listContentWallet: any[] = [];

  is_mission_builder: FormControl = new FormControl(false);
  private _onDestroy = new Subject<void>();
  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private notificationService: NotificationService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private _lightbox: Lightbox,
    private dialog: MatDialog,
    private retailerService: RetailerService,
    private geotreeService: GeotreeService,
    private b2bInjectVoucherService: B2BVoucherInjectService,
    private bannerService: BannerService,
    private ls: LanguagesService,
    private translate: TranslateService
  ) {
    this.adapter.setLocale('id');
    this.areaType = this.dataService.getDecryptedProfile()['area_type'];
    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    this.customAge = false;
    this.onLoad = true;
    this.permission = this.roles.getRoles('principal.popupnotification');
    // this.minDate = moment();
    // this.validComboDrag = true;

    this.listLandingPage = [
      { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.shopping'), value: "belanja" }, 
      { name: this.translate.instant('global.label.mission'), value: "misi" }, 
      { name: this.translate.instant('global.label.customer'), value: "pelanggan" }, 
      { name: this.translate.instant('global.label.help'), value: "bantuan" }, 
      { name: this.translate.instant('global.label.update_profile'), value: "profil_saya" }, 
      { name: this.translate.instant('global.label.capital_corner'), value: "pojok_modal" }
    ];

    this.formPopupErrors = {
      name: '',
      from: '',
      to: '',
      enable: '',
      // target_page: '',
    }

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

    activatedRoute.url.subscribe(params => {
      this.idPopup = params[2].path;
      this.isDetail = params[1].path === 'detail' ? true : false;
    })
  }

  ngOnInit() {
    var urlvalidation = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i

    this.formPopupGroup = this.formBuilder.group({
      date: [moment(), Validators.required],
      enddate: [moment(), Validators.required],
      time: ["00:00", Validators.required],
      endtime: ["00:00", Validators.required],
      positive_button: ["", Validators.required],
      negative_button: ["", Validators.required],
      title: ["", Validators.required],
      body: ["", Validators.required],
      user_group: ["", Validators.required],
      areas: this.formBuilder.array([]),
      content_type: ["", Validators.required],
      group_type: ["src"],
      landing_page: ["belanja", Validators.required],
      url_iframe: ["", [Validators.required, Validators.pattern(urlvalidation)]],
      url_web: ["", [Validators.required, Validators.pattern(urlvalidation)]],
      button_text: ["", [Validators.required, Validators.maxLength(30)]],
      content_wallet: ["", Validators.required],
      body_wallet: ["", Validators.required],
      verification: ["all"],
      employee: ["all"],
      is_smoker: ["both"],
      gender: ["both"],
      age_consumer_from: ["", Validators.required],
      age_consumer_to: ["", Validators.required],
      is_target_audience: [false],
      is_target_area: [false],
      transfer_token: ["yes", Validators.required],
      is_mission_builder: this.is_mission_builder,
      product: [""],
      subscription: ["all"],
      type_of_recurrence: ["once", Validators.required],
      recurrence_type: ["daily", Validators.required],
    });

    this.formWeeklyRecurrence = this.formBuilder.group({});
    this.listWeekDays.forEach(day => this.formWeeklyRecurrence.addControl(day.id, new FormControl(false)));

    this.formMonthlyRecurrence = this.formBuilder.group({
      recurrence_date: [[], Validators.required]
    });

    this.formYearlyRecurrence = this.formBuilder.group({
      recurrence_date: [null, Validators.required],
      recurrence_month: [null, Validators.required]
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

    this.bannerService.getListWallet().subscribe(res => {
      this.listContentWallet = res.data;
    });

    if (this.formPopupGroup.value.is_mission_builder === true) {
      this.listUserGroup = [{ name: this.translate.instant('manajemen_barang_sku.manajemen_koin.text3'), value: "tsm" }];
      this.formPopupGroup.controls['user_group'].setValue('tsm');
    } else {
      this.listUserGroup = [
        { name: this.translate.instant('global.menu.wholesaler'), value: "wholesaler" }, 
        { name: this.translate.instant('global.menu.retailer'), value: "retailer" }, 
        { name: this.translate.instant('global.label.consumer'), value: "customer" }
      ];
    }

    this.formPopupGroup.controls['user_group'].valueChanges.debounceTime(50).subscribe(res => {
      this.formPopupGroup.get("url_web").disable();
      this.formPopupGroup.get("content_wallet").disable();
      this.formPopupGroup.get("body_wallet").disable();
      this.formPopupGroup.get("button_text").disable();

      if (this.detailPopup && this.detailPopup.audience && this.formPopupGroup.get('user_group').value === this.detailPopup.type) {
        this.onSelect({ selected: this.detailPopup.audience.map(aud => ({ id: aud.audience_id })) });
        this.audienceSelected = this.detailPopup.audience.map(aud => ({ id: aud.audience_id }));
      } else {
        this.selected.splice(0, this.selected.length);
        this.audienceSelected = [];
      }

      if (res === 'tsm') {
        this.listContentType = [
          { name: this.translate.instant('global.label.static_page'), value: "static-page" }, 
          { name: this.translate.instant('global.label.landing_page'), value: "landing-page" }, 
          { name: this.translate.instant('global.label.iframe'), value: "iframe" }
        ];
        this.listLandingPage = [
          { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.shopping'), value: "belanja" }, 
          { name: this.translate.instant('global.label.mission'), value: "misi" }, 
          { name: this.translate.instant('global.label.customer'), value: "pelanggan" }, 
          { name: this.translate.instant('global.label.help'), value: "bantuan" }, 
          { name: this.translate.instant('global.label.update_profile'), value: "profil_saya" }
        ];
        this.formPopupGroup.controls['age_consumer_from'].disable();
        this.formPopupGroup.controls['age_consumer_to'].disable();

        if (this.formPopupGroup.controls['content_type'].value === 'static-page') {
          this.formPopupGroup.controls['body'].enable();
        }

        if (this.formPopupGroup.controls['content_type'].value === 'landing-page') {
          this.formPopupGroup.controls['landing_page'].enable();
        }

        if (this.formPopupGroup.controls['content_type'].value === 'iframe') {
          this.formPopupGroup.controls['url_iframe'].enable();
        }
      }

      if (res === 'wholesaler') {
        this.listContentType = [
          { name: this.translate.instant('global.label.iframe'), value: "iframe" }
        ];
        if (this.permission.new_product) {
          this.listContentType = [{ name: "Iframe", value: "iframe" }, { name: "New Product", value: "new-product" }];
        }
        this.formPopupGroup.controls['age_consumer_from'].setValue('');
        this.formPopupGroup.controls['age_consumer_to'].setValue('');
        this.formPopupGroup.controls['landing_page'].setValue('');

        this.formPopupGroup.controls['age_consumer_from'].disable();
        this.formPopupGroup.controls['age_consumer_to'].disable();
        this.formPopupGroup.controls['landing_page'].disable();

        // this.formPopupGroup.controls['body'].setValue('');
        this.formPopupGroup.controls['body'].disable();

        // this.formPopupGroup.controls['url_iframe'].setValue('');
        this.formPopupGroup.controls['url_iframe'].disable();

        if (this.formPopupGroup.controls['content_type'].value === 'static-page') {
          this.formPopupGroup.controls['body'].enable();
        }

        if (this.formPopupGroup.controls['content_type'].value === 'iframe') {
          this.formPopupGroup.controls['url_iframe'].enable();
        }
      }

      if (res === 'customer') {
        this.listContentType = [
          { name: this.translate.instant('global.label.static_page'), value: "static-page" },
          { name: this.translate.instant('global.label.landing_page'), value: "landing-page" },
          { name: this.translate.instant('global.label.iframe'), value: "iframe" },
          { name: this.translate.instant('global.label.image'),value:"image" },
          { name: this.translate.instant('global.label.unlinked'), value: "unlinked" },
          { name: this.translate.instant('global.label.ewallet'), value: "e_wallet" },
          { name: this.translate.instant('global.label.link_to_browser'), value: "link_to_web_browser" }
        ];
        this.listLandingPage = [
          { name: this.translate.instant('global.label.coupon'), value: "kupon" },
          { name: this.translate.instant('global.label.nearby'), value: "terdekat" },
          { name: this.translate.instant('global.label.my_profile'), value: "profil_saya" },
          { name: this.translate.instant('bantuan.text1'), value: "bantuan" },
          { name: this.translate.instant('cn_reward.b2c_voucher.text26'), value: "pesan_antar" },
          { name: this.translate.instant('global.label.challenge'), value: "tantangan" },
          { name: this.translate.instant('global.label.opportunity'), value: "peluang" },
          { name: this.translate.instant('global.label.play_together'), value: "main_bareng" }
        ];

        this.formPopupGroup.controls['age_consumer_from'].enable();
        this.formPopupGroup.controls['age_consumer_to'].enable();

        if (this.formPopupGroup.controls['content_type'].value === 'static-page') {
          this.formPopupGroup.controls['body'].enable();
        }

        if (this.formPopupGroup.controls['content_type'].value === 'landing-page') {
          this.formPopupGroup.controls['landing_page'].enable();
        }

        if (this.formPopupGroup.controls['content_type'].value === 'iframe') {
          this.formPopupGroup.controls['url_iframe'].enable();
        }

        if (this.formPopupGroup.controls['content_type'].value === "link_to_web_browser") {
          this.formPopupGroup.get("url_web").enable();
        }
  
        if (this.formPopupGroup.controls['content_type'].value === "e_wallet") {
          this.formPopupGroup.get("content_wallet").enable();
          this.formPopupGroup.get("body_wallet").enable();
          this.formPopupGroup.get("button_text").enable();
        }
      }

      if (res === 'retailer') {
        this.listContentType = [
          { name: this.translate.instant('global.label.static_page'), value: "static-page" },
          { name: this.translate.instant('global.label.landing_page'), value: "landing-page" },
          { name: this.translate.instant('global.label.iframe'), value: "iframe" }
        ];
        this.listLandingPage = [
          { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.shopping'), value: "belanja" }, 
          { name: this.translate.instant('global.label.mission'), value: "misi" }, 
          { name: this.translate.instant('global.label.customer'), value: "pelanggan" }, 
          { name: this.translate.instant('bantuan.text1'), value: "bantuan" }, 
          { name: this.translate.instant('global.label.update_profile'), value: "profil_saya" }, 
          { name: this.translate.instant('global.label.capital_corner'), value: "pojok_modal" }
        ];
        this.formPopupGroup.controls['age_consumer_from'].disable();
        this.formPopupGroup.controls['age_consumer_to'].disable();

        if (this.formPopupGroup.controls['content_type'].value === 'static-page') {
          this.formPopupGroup.controls['body'].enable();
        }

        if (this.formPopupGroup.controls['content_type'].value === 'landing-page') {
          this.formPopupGroup.controls['landing_page'].enable();
        }

        if (this.formPopupGroup.controls['content_type'].value === 'iframe') {
          this.formPopupGroup.controls['url_iframe'].enable();
        }
      }

      if (!this.onLoad) {
        // this.formPopupGroup.controls['landing_page'].setValue('');
      }

      if (this.formPopupGroup.controls["is_target_audience"].value === true) this.getAudience();

      this.formPopupGroup.updateValueAndValidity();
    });

    // this.formPopupGroup.controls['user_group'].setValue('wholesaler');

    this.formPopupGroup.controls['is_smoker'].valueChanges.debounceTime(50).subscribe(res => {
      // if (!this.onLoad) {
      //   this.formPopupGroup.controls['age_consumer_from'].setValue('');
      //   this.formPopupGroup.controls['age_consumer_to'].setValue('');
      // }

      if (res === 'yes') {
        this.formPopupGroup.controls['age_consumer_from'].setValidators([Validators.required, Validators.min(18)]);
        this.formPopupGroup.controls['age_consumer_to'].setValidators([Validators.required]);
        this.formPopupGroup.updateValueAndValidity();
      } else {
        this.formPopupGroup.controls['age_consumer_from'].setValidators([Validators.required, Validators.min(0)]);
        this.formPopupGroup.controls['age_consumer_to'].setValidators([Validators.required]);
        this.formPopupGroup.updateValueAndValidity();
      }

      if (this.formPopupGroup.get("is_target_audience").value === true) {
        this.getAudience();
        if (this.detailPopup && this.detailPopup.audience && this.formPopupGroup.get('user_group').value === this.detailPopup.type) {
          this.onSelect({ selected: this.detailPopup.audience.map(aud => ({ id: aud.audience_id })) });
          this.audienceSelected = this.detailPopup.audience.map(aud => ({ id: aud.audience_id }));
        } else {
          this.selected.splice(0, this.selected.length);
          this.audienceSelected = [];
        }
      }
    })

    this.formPopupGroup.controls['age_consumer_from'].valueChanges.debounceTime(50).subscribe(res => {
      this.formPopupGroup.controls['age_consumer_to'].setValidators([Validators.required, Validators.min(res)]);
      this.formPopupGroup.updateValueAndValidity();
      if (this.formPopupGroup.get("is_target_audience").value === true) {
        this.getAudience();
        if (this.detailPopup && this.detailPopup.audience && this.formPopupGroup.get('user_group').value === this.detailPopup.type) {
          this.onSelect({ selected: this.detailPopup.audience.map(aud => ({ id: aud.audience_id })) });
          this.audienceSelected = this.detailPopup.audience.map(aud => ({ id: aud.audience_id }));
        } else {
          this.selected.splice(0, this.selected.length);
          this.audienceSelected = [];
        }
      }
    })

    this.formPopupGroup.controls['url_iframe'].disable();
    this.formPopupGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formPopupGroup, this.formPopupErrors);
    })

    this.formPopupGroup.controls['group_type'].valueChanges.debounceTime(50).subscribe(res => {
      if (this.formPopupGroup.get("is_target_audience").value === true) {
        this.getAudience();
        if (this.detailPopup && this.detailPopup.audience && this.formPopupGroup.get('user_group').value === this.detailPopup.type) {
          this.onSelect({ selected: this.detailPopup.audience.map(aud => ({ id: aud.audience_id })) });
          this.audienceSelected = this.detailPopup.audience.map(aud => ({ id: aud.audience_id }));
        } else {
          this.selected.splice(0, this.selected.length);
          this.audienceSelected = [];
        }
      }
    });

    // this.formFilter.valueChanges.subscribe(filter => {
    //   if (this.formPopupGroup.get("is_target_audience").value === false) this.getAudience();
    // });

    // this.initFilterArea();
    this.initAreaV2();
    this.getDetails();

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

    this.formPopupGroup.get('content_type').valueChanges.subscribe(value => {
      this.formPopupGroup.get("product").setValidators(null);
      this.formPopupGroup.get("url_web").disable();
      this.formPopupGroup.get("content_wallet").disable();
      this.formPopupGroup.get("body_wallet").disable();
      this.formPopupGroup.get("button_text").disable();

      if (value === "new-product") {
        this.formPopupGroup.get("product").setValidators([Validators.required])
      }

      if (value === "link_to_web_browser") {
        this.formPopupGroup.get("url_web").enable();
      }

      if (value === "e_wallet") {
        this.formPopupGroup.get("content_wallet").enable();
        this.formPopupGroup.get("body_wallet").enable();
        this.formPopupGroup.get("button_text").enable();
      }

      this.formPopupGroup.updateValueAndValidity();
    });

    this.filterProduct
      .valueChanges
      .debounceTime(500)
      .pipe(
        takeUntil(this._onDestroy)
      )
      .subscribe((val) => {
        if (val.length > 2) {
          this._filterProducts()
        }
      });

    this.getProducts();
  }

  getProducts() {
    this.b2bInjectVoucherService.getProductList({ per_page: 50 }).subscribe(
      (res) => {
        this.listProducts = res.data;
        this.filteredProduct.next(this.listProducts.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );
  }

  _filterProducts() {
    if (this.listProducts.length === 0) {
      return;
    }
    // get the search keyword
    let search = this.filterProduct.value;
    this.paginationProduct.per_page = 30;
    this.paginationProduct.search = search;
    if (this.paginationProduct['id']) {
      delete this.paginationProduct['id'];
    }
    this.b2bInjectVoucherService.getProductList(this.paginationProduct).subscribe(
      (res) => {
        this.listProducts = res.data;
        this.filteredProduct.next(this.listProducts.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );
    // filter the products
    this.filteredProduct.next(
      this.listProducts.filter(product => product.name.toLowerCase().indexOf(search) > -1)
    );
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

  async getDetails() {
    try {
      const response = await this.notificationService.getById({}, { popup_notif_id: this.idPopup }).toPromise();
      this.detailPopup = response;

      console.log(response.is_mission_builder);

      if (response.is_mission_builder === 1) {
        this.formPopupGroup.controls["is_mission_builder"].setValue(true);
        this.listUserGroup = [
          { name: this.translate.instant('manajemen_barang_sku.manajemen_koin.text3'), value: "tsm" }
        ];
      } else {
        this.formPopupGroup.controls["is_mission_builder"].setValue(false);
        this.listUserGroup = [
          { name: this.translate.instant('global.menu.wholesaler'), value: "wholesaler" }, 
          { name: this.translate.instant('global.menu.retailer'), value: "retailer" }, 
          { name: this.translate.instant('global.label.consumer'), value: "customer" }
        ];
      }

      this.formPopupGroup.controls['positive_button'].setValue(response.positive_text);
      this.formPopupGroup.controls['negative_button'].setValue(response.negative_text);
      this.formPopupGroup.controls['title'].setValue(response.title);
      this.formPopupGroup.controls['user_group'].setValue(response.type);
      this.formPopupGroup.controls['content_type'].setValue(response.action);

      if(response.recurring.length > 0) {
        this.formPopupGroup.controls['type_of_recurrence'].setValue('recurring');
        let frequency = response.recurring.map(item => item.frequency);
        this.formPopupGroup.controls['recurrence_type'].setValue(frequency[0]);
        if(frequency[0] == 'weekly') {
          response.recurring.map(item => this.formWeeklyRecurrence.controls[item.day_of_week].setValue(true));
        } else if(frequency[0] == 'monthly') {
          this.formMonthlyRecurrence.controls['recurrence_date'].setValue(response.recurring.map(item => item.day));
        } else if(frequency[0] == 'yearly') {
          let months = [
            this.translate.instant('global.calendar.jan_s'),
            this.translate.instant('global.calendar.feb_s'),
            this.translate.instant('global.calendar.mar_s'),
            this.translate.instant('global.calendar.apr_s'),
            this.translate.instant('global.calendar.may_s'),
            this.translate.instant('global.calendar.jun_s'),
            this.translate.instant('global.calendar.jul_s'),
            this.translate.instant('global.calendar.aug_s'),
            this.translate.instant('global.calendar.sep_s'),
            this.translate.instant('global.calendar.oct_s'),
            this.translate.instant('global.calendar.nov_s'),
            this.translate.instant('global.calendar.dec_s')
          ];
          let chosen = response.recurring.map(item => ({
            name: `${item.day} ${months[item.month - 1]}`,
            date: item.day,
            month: item.month
          }));
          this.listDateChosen.setValue(chosen);
        };
      } else {
        this.formPopupGroup.controls['type_of_recurrence'].setValue('once');
      };
      

      if (this.detailPopup.target_audience && this.detailPopup.target_audience === 1) {
        this.formPopupGroup.controls["is_target_audience"].setValue(true);
        this.audienceSelected = this.detailPopup.audience.map(id => ({ id: id.audience_id }));
        this.onSelect({ selected: this.detailPopup.audience.map(id => ({ id: id.audience_id })) })
        console.log('this auddd', this.audienceSelected);
      }
      if (response.date) {
        const date = moment(response.date);
        this.formPopupGroup.get('date').setValue(date);
        this.formPopupGroup.get('time').setValue(date.format('HH:mm'));
      }
      if (response.end_date) {
        const date = moment(response.end_date);
        this.formPopupGroup.get('enddate').setValue(date);
        this.formPopupGroup.get('endtime').setValue(date.format('HH:mm'));
      }

      if (response.type === 'retailer') {
        const group_type = response.areas.map(item => item.pivot.type)[0];
        this.formPopupGroup.get('group_type').setValue(response.retailer_type);
      }

      if (response.type === 'customer') {
        let smoker_type = '';
        if (response.smoker_type === 'smoker') {
          smoker_type = 'yes';
        } else if (response.smoker_type === 'non-smoker') {
          smoker_type = 'no';
        } else {
          smoker_type = 'both';
        }

        this.formPopupGroup.get('gender').setValue(response.gender || 'both');
        this.formPopupGroup.get('age_consumer_from').setValue(response.age_from);
        this.formPopupGroup.get('age_consumer_to').setValue(response.age_to);
        this.formPopupGroup.get('employee').setValue(response.employee);
        this.formPopupGroup.get('is_smoker').setValue(smoker_type);
        this.formPopupGroup.get('subscription').setValue(response.subscription);
        if (smoker_type !== 'yes') {
          this.formPopupGroup.get('verification').setValue(response.verification || 'all');
        }

        if (!response.target_audience && response.areas.length) {
          this.formPopupGroup.get('is_target_area').setValue(true);
          this.targetAreaIds = response.areas;
        }
      }

      if (response.action === 'static-page') {
        this.formPopupGroup.get('body').setValue(response.action_data);
      } else {
        this.formPopupGroup.get('body').disable();
      }

      if (response.action === 'landing-page') {
        this.formPopupGroup.get('landing_page').setValue(response.action_data);
      }

      if (response.action === 'iframe') {
        this.formPopupGroup.get('url_iframe').setValue(response.action_data);
        this.formPopupGroup.get('transfer_token').setValue(response.transfer_token);
      }

      if (response.action === 'image') {
        this.convertedContentImage = response.action_data;
      }

      if (response.action === 'link_to_web_browser') {
        this.formPopupGroup.get('url_web').setValue(response.action_data);
      }

      if (response.action === 'e_wallet') {
        const e_wallet = JSON.parse(response.action_data) || {};
        this.formPopupGroup.get('content_wallet').setValue(parseInt(e_wallet.wallet_id));
        this.formPopupGroup.get('body_wallet').setValue(e_wallet.body);
        this.formPopupGroup.get('button_text').setValue(e_wallet.button_text);
      }

      if (response.action === 'new-product') {
        this.filterProduct.setValue(response.action_data.name)
        this.formPopupGroup.get('product').setValue(response.action_data.sku_id);
        // this.filterProduct.setValue(response.action_data);
        // this._filterProducts()
      }

      setTimeout(() => {
        this.onLoad = false;
      }, 500);

      if (this.isDetail) this.formPopupGroup.disable();

      this.onLoad = false;
    } catch (error) {
      this.onLoad = false;
      throw error;
    }
  }

  removeImage(): void {
    this.files = undefined;
    this.imageConverted = undefined;
  }

  changeImage(event) {
    this.readThis(event);
  }

  readThis(inputValue: any): void {
    var file: File = inputValue;
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.imageConverted = myReader.result;
    }

    myReader.readAsDataURL(file);
  }

  fileChangeContentImage(value: any): void {
    var image: File = value;
    var file: FileReader = new FileReader();
    file.onloadend = () => {
      this.convertedContentImage = file.result;
    }
    file.readAsDataURL(image);
  }

  contentType(value) {
    if (value === 'static-page') {
      this.formPopupGroup.controls['body'].enable();
    } else {
      this.formPopupGroup.controls['body'].setValue('');
      this.formPopupGroup.controls['body'].disable();
    }

    if (value === 'iframe') {
      this.formPopupGroup.controls['url_iframe'].enable();
    } else {
      this.formPopupGroup.controls['url_iframe'].setValue('');
      this.formPopupGroup.controls['url_iframe'].disable();
    }

    if (value === 'landing-page') {
      this.formPopupGroup.controls['landing_page'].enable();
    } else {
      this.formPopupGroup.controls['landing_page'].setValue('');
      this.formPopupGroup.controls['landing_page'].disable();
    }
  }

  selectChange(e: any) {
    if (e.source.name === 'is_mission_builder' && e.checked) {
      this.formPopupGroup.get('is_mission_builder').patchValue(true);
      this.listUserGroup = [{ name: "TSM", value: "tsm" }];
    } else {
      this.formPopupGroup.get('is_mission_builder').patchValue(false);
      this.listUserGroup = [{ name: "Wholesaler", value: "wholesaler" }, { name: "Retailer", value: "retailer" }, { name: "Consumer", value: "customer" }];
    }
    console.log(this.formPopupGroup.value.is_mission_builder);
  }

  submit() {
    console.log(this.formPopupGroup);
    if ((this.formPopupGroup.valid && this.imageConverted === undefined) || (this.formPopupGroup.valid && this.imageConverted)) {

      this.dataService.showLoading(true);

      this.formPopupGroup.get('is_mission_builder').patchValue(
        this.formPopupGroup.value.is_mission_builder === false ? 0 : 1
      );

      let body = {
        _method: 'PUT',
        title: this.formPopupGroup.get('title').value,
        type: this.formPopupGroup.get('user_group').value,
        action: this.formPopupGroup.get('content_type').value,
        positive_text: this.formPopupGroup.get('positive_button').value,
        negative_text: this.formPopupGroup.get('negative_button').value,
        is_mission_builder: this.formPopupGroup.get('is_mission_builder').value,
        recurring_type: this.formPopupGroup.get('type_of_recurrence').value,
      }

      if (this.imageConverted) {
        body['image'] = this.imageConverted;
      }

      if (body.type === 'retailer') {
        body['retailer_type'] = this.formPopupGroup.get('group_type').value;
      }

      body['date'] = `${moment(this.formPopupGroup.get('date').value).format('YYYY-MM-DD')} ${this.formPopupGroup.get('time').value}:00`;
      body['end_date'] = `${moment(this.formPopupGroup.get('enddate').value).format('YYYY-MM-DD')} ${this.formPopupGroup.get('endtime').value}:00`;

      if(body.recurring_type === 'recurring') {
        body['recurring_frequency'] = this.formPopupGroup.get('recurrence_type').value;
      }

      if(this.formPopupGroup.get('recurrence_type').value === 'weekly') {
        let recurrenceDayValues = this.formWeeklyRecurrence.value;
        let selectedWeekDays = Object.keys(recurrenceDayValues).filter(key => recurrenceDayValues[key]).map(item => parseInt(item));
        if(selectedWeekDays.length == 0) {
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar({ message: this.translate.instant('notification.popup_notifikasi.message1') });
          return;
        }
        body['recurring_day_of_week'] = selectedWeekDays;
      }

      if(this.formPopupGroup.get('recurrence_type').value === 'monthly') {
        let monthlyRecurrence = this.formMonthlyRecurrence.get('recurrence_date').value;
        if(monthlyRecurrence.length == 0) {
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar({ message: this.translate.instant('notification.popup_notifikasi.message2') });
          commonFormValidator.validateAllFields(this.formMonthlyRecurrence);
          return;
        }
        body['recurring_day'] = monthlyRecurrence;
      }
      
      if(this.formPopupGroup.get('recurrence_type').value === 'yearly') {
        let yearlyRecurrence = this.listDateChosen.value;
        if(yearlyRecurrence.length == 0) {
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar({ message: this.translate.instant('notification.popup_notifikasi.message3') });
          commonFormValidator.validateFormControl(this.listDateChosen);
          return;
        }
        body['recurring_day'] = yearlyRecurrence.map(item => item.date);
        body['recurring_month'] = yearlyRecurrence.map(item => item.month);
      }

      if (body.type === 'customer') {
        let smoker_type = '';
        let is_smoker = this.formPopupGroup.get('is_smoker').value;
        if (is_smoker === 'yes') {
          smoker_type = 'smoker';
        } else if (is_smoker === 'no') {
          smoker_type = 'non-smoker';
        } else {
          smoker_type = 'both';
        }

        body['smoker_type'] = smoker_type;
        body['age_from'] = this.formPopupGroup.get('age_consumer_from').value;
        body['age_to'] = this.formPopupGroup.get('age_consumer_to').value;
        body['gender'] = this.formPopupGroup.get('gender').value;
        body['employee'] = this.formPopupGroup.get('employee').value;
        body['subscription'] = this.formPopupGroup.get('subscription').value;

        if (this.formPopupGroup.get('is_smoker').value !== 'yes') {
          body['verification'] = this.formPopupGroup.get('verification').value;
        }
      }

      if (body.action === 'new-product') {
        body['action_data'] = this.formPopupGroup.get('product').value;
      }

      if (body.action === 'static-page') {
        body['action_data'] = this.formPopupGroup.get('body').value;
      }

      if (body.action === 'landing-page') {
        body['action_data'] = this.formPopupGroup.get('landing_page').value;
      }

      if (body.action === 'iframe') {
        body['action_data'] = this.formPopupGroup.get('url_iframe').value;
        body['transfer_token'] = this.formPopupGroup.get('transfer_token').value;
      }

      if (body.type === "customer") {
        if (body.action === 'image') {
          body['action_data'] = this.convertedContentImage;
        }
        if (body.action === 'link_to_web_browser') {
          body['action_data'] = this.formPopupGroup.get('url_web').value;
        }
        if (body.action === 'e_wallet') {
          body['wallet_id'] = this.formPopupGroup.get('content_wallet').value;
          body['body'] = this.formPopupGroup.get('body_wallet').value;
          body['button_text'] = this.formPopupGroup.get('button_text').value;
        }
      }

      let _areas = [];
      let areas = [];
      let value = this.formPopupGroup.getRawValue();

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
        this.dataService.showLoading(false);
        return this.dialogService.openSnackBar({ message: this.translate.instant('global.message.text28') });
      }

      if (body.type === 'retailer') {
        if (body['retailer_type'] === 'src') {
          body['area_id'] = areas.map(item => item.value);
        } else {
          body['area_id_downline'] = areas.map(item => item.value);
        }
      } else {
        if (!this.formPopupGroup.get("is_target_area").value) body['area_id'] = areas.map(item => item.value);
      }
      if (body.type === 'customer' && this.formPopupGroup.get("is_target_area").value) {
        if (this.selectedAll) {
          body['area_id'] = this.selectedAllId;
        } else {
          let area_id = this.selectedArea.filter((item) => (item.id && item.id.toString() !== "1")).map((item) => item.id);
          if (area_id.length) {
            body['area_id'] = area_id;
          } else {
            this.dataService.showLoading(false);
            this.formPopupGroup.get('is_mission_builder').patchValue(false);
            return this.dialogService.openSnackBar({ message: this.translate.instant('notification.popup_notifikasi.message4') });
          }
        }
      }

      if (this.formPopupGroup.get("is_target_audience").value) {
        body['target_audience'] = 1;
        body['target_audiences'] = this.audienceSelected.map(aud => aud.id);
      } else {
        if (body['target_audience']) delete body['target_audience'];
      }

      this.notificationService.updatePopup(body, { popup_notif_id: this.idPopup }).subscribe(
        res => {
          this.dataService.showLoading(false);
          this.router.navigate(["notifications", "popup-notification"]);
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
        },
        err => {
          this.dataService.showLoading(false);
        }
      );

    } else {
      let msg;
      if (this.formPopupGroup.invalid) {
        msg = this.translate.instant('global.label.please_complete_data');
      } else if (!this.files) {
        msg = this.translate.instant('global.label.no_selected_image', {
          type: this.translate.instant('notification.popup_notifikasi.page_name')
        });
      } else {
        msg = this.translate.instant('global.label.please_complete_data');
      }

      this.dialogService.openSnackBar({ message: msg });
      commonFormValidator.validateAllFields(this.formPopupGroup);
      if(this.formPopupGroup.get('recurrence_type').value === 'monthly' && this.formMonthlyRecurrence.get('date').value.length == 0) {
        commonFormValidator.validateAllFields(this.formMonthlyRecurrence);
      }
      if(this.formPopupGroup.get('recurrence_type').value === 'yearly' && this.listDateChosen.value.length == 0) {
        commonFormValidator.validateFormControl(this.listDateChosen);
      }
    }
  }

  onChangeCheckbox(event) {
    const isSmoker = this.formPopupGroup.get('is_smoker') as FormArray;

    if (event.checked) {
      isSmoker.push(new FormControl(event.source.value))
    } else {
      const i = isSmoker.controls.findIndex(x => x.value === event.source.value);
      isSmoker.removeAt(i);
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

  previewImage(data) {
    let album = {
      src: data,
      caption: '',
      thumb: data
    };

    this._lightbox.open([album], 0);
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
    console.log('audience', this.audienceSelected, this.selected);
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

    this.pagination['audience'] = this.formPopupGroup.get("user_group").value;
    if (this.formPopupGroup.get("user_group").value === 'retailer') {
      this.pagination['retailer_type'] = this.formPopupGroup.get("group_type").value;
      delete this.pagination['customer_smoking'];
      delete this.pagination['customer_gender'];
      delete this.pagination['customer_age_from'];
      delete this.pagination['customer_age_to'];
    }
    if (this.formPopupGroup.get("user_group").value === 'customer') {
      delete this.pagination['customer_smoking'];
      delete this.pagination['customer_gender'];
      delete this.pagination['customer_age_from'];
      delete this.pagination['customer_age_to'];
      delete this.pagination['retailer_type'];
    }
    if (this.formPopupGroup.get("user_group").value === 'customer') {
      delete this.pagination['retailer_type'];
      this.pagination['customer_smoking'] = this.formPopupGroup.get("is_smoker").value;
      this.pagination['customer_gender'] = this.formPopupGroup.get("gender").value;
      this.pagination['customer_age_from'] = this.formPopupGroup.get("age_consumer_from").value;
      this.pagination['customer_age_to'] = this.formPopupGroup.get("age_consumer_to").value;
    }
    if (this.formPopupGroup.get("user_group").value === 'retailer' && this.formPopupGroup.get("landing_page").value === 'pojok-modal') {
      this.pagination['type'] = 'pojok-modal'
    } else {
      delete this.pagination['type'];
    }
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

  bindSelector(isSelected, row) {
    let index = this.audienceSelected.findIndex(r => r.id === row.id);
    if (index > - 1) {
      return true;
    }
    return false;
  }

  isTargetAudience(event) {
    if (event.checked) {
      this.formPopupGroup.get('is_target_area').setValue(false);
      this.getAudience();
    }
  }

  isTargetArea(event) {
    if (event.checked) {
      this.formPopupGroup.get('is_target_audience').setValue(false);
    }
  }

  async export() {
    if (this.audienceSelected.length === 0) {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.message.text27') });
      return;
    }
    this.dataService.showLoading(true);
    let body = this.audienceSelected.map(aud => aud.id);
    this.exportPopUpNotif = true;
    try {
      const response = await this.notificationService.exportAudience({ selected: body, audience: this.formPopupGroup.get("user_group").value }).toPromise();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `PopUpNotification_${this.formPopupGroup.get("user_group").value}_${new Date().toLocaleString()}.xlsx`);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
      this.exportPopUpNotif = false;
      this.dataService.showLoading(false);
    } catch (error) {
      this.exportPopUpNotif = false;
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
      audience: this.formPopupGroup.get("user_group").value,
      api: fd => this.notificationService['importAudience'](fd),
      fileType: 'xlsx'
    };

    this.dialogRef = this.dialog.open(ImportAudienceComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.audienceSelected = this.audienceSelected.concat(response);
        this.onSelect({ selected: this.audienceSelected });
        if (response.data) {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text8 });
        }
      }
    });
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

  removeDateChosen(value: any) {
    this.listDateChosen.setValue(this.listDateChosen.value.filter(item => item.name !== value.name));
  }

  addRecurrenceDate() {
    if(this.formYearlyRecurrence.get('recurrence_date').value && this.formYearlyRecurrence.get('recurrence_month').value) {
      let months = [
        this.translate.instant('global.calendar.jan_s'),
        this.translate.instant('global.calendar.feb_s'),
        this.translate.instant('global.calendar.mar_s'),
        this.translate.instant('global.calendar.apr_s'),
        this.translate.instant('global.calendar.may_s'),
        this.translate.instant('global.calendar.jun_s'),
        this.translate.instant('global.calendar.jul_s'),
        this.translate.instant('global.calendar.aug_s'),
        this.translate.instant('global.calendar.sep_s'),
        this.translate.instant('global.calendar.oct_s'),
        this.translate.instant('global.calendar.nov_s'),
        this.translate.instant('global.calendar.dec_s')
      ];
      const chosenValue = `${this.formYearlyRecurrence.get('recurrence_date').value} ${months[this.formYearlyRecurrence.get('recurrence_month').value - 1]}`;
      if(this.listDateChosen.value.length > 0 && this.listDateChosen.value.map(item => item.name).includes(chosenValue)) {
        this.dialogService.openSnackBar({ message: 'Tanggal dan bulan pengulangan sudah dipilih.' });
      } else {
        let dateChosen = this.listDateChosen.value;
        dateChosen.push({
          name: chosenValue,
          date: this.formYearlyRecurrence.get('recurrence_date').value,
          month: this.formYearlyRecurrence.get('recurrence_month').value
        });
        this.listDateChosen.setValue(dateChosen);
      };
    } else {
      this.dialogService.openSnackBar({ message: this.translate.instant('notification.popup_notifikasi.message5') });
      commonFormValidator.validateAllFields(this.formYearlyRecurrence);
    };
  }
}
