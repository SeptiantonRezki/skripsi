import { Component, OnInit, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import moment from 'moment';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { BannerService } from '../../../../services/inapp-marketing/banner.service';
import { DateAdapter, MatDialogConfig, MatDialog } from '@angular/material';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';
import { TemplateBanner } from 'app/classes/banner-template';
import html2canvas from 'html2canvas';
import * as _ from 'underscore';
import { Config } from 'app/classes/config';
import { Lightbox } from 'ngx-lightbox';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { GeotreeService } from 'app/services/geotree.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Page } from 'app/classes/laravel-pagination';
import { Subject } from 'rxjs';
import { ImportAudienceComponent } from 'app/shared/import-audience/import-audience.component';
import { InappMarketingValidator } from '../../InappMarketing.validator';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-banner-edit',
  templateUrl: './banner-edit.component.html',
  styleUrls: ['./banner-edit.component.scss']
})
export class BannerEditComponent {
  formFilter: FormGroup;
  onLoad: boolean;
  loadingIndicator: boolean;
  showLoading: Boolean;
  listLevelArea: any[];
  list: any;
  list_region: any[];
  list_area: any[];
  list_district: any[];
  list_territory: any[];
  detailBanner: any;
  indexDelete: any;

  typeArea: any[] = ['national', 'zone', 'region', 'area', 'salespoint', 'district', 'territory'];
  areaFromLogin;

  lvl: any[];
  minDate: any;
  listStatus: any[] = [
    { name: this.translate.instant('global.label.active_status'), value: 'publish' },
    { name: this.translate.instant('global.label.inactive_status'), value: 'draft' }
  ];
  listUserGroup: any[] = [
    { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.text11'), value: "retailer" },
    { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.text12'), value: "customer" }
  ];
  listUserGroupType: any[] = [
    { name: this.translate.instant('global.label.src'), value: "src" },
    { name: this.translate.instant('global.label.ws_downline'), value: "ws_downline" }
  ];
  listContentType: any[] = [
    { name: this.translate.instant('global.label.static_page'), value: "static_page" },
    { name: this.translate.instant('global.label.landing_page'), value: "landing_page" },
    { name: this.translate.instant('global.label.iframe'), value: "iframe" },
    { name: this.translate.instant('global.label.image'), value: "image" },
    { name: this.translate.instant('global.label.unlinked'), value: "unlinked" },
    { name: this.translate.instant('global.label.ewallet'), value: "e_wallet" },
    { name: this.translate.instant('global.label.link_to_browser'), value: "link_web" },
    { name: this.translate.instant('global.label.spesific_product_b2b'), value: "spesific_product_b2b" }
  ];
  listContentTypeCustomer: any[] = [
    { name: this.translate.instant('global.label.reguler'), value: "all" },
    { name: this.translate.instant('global.label.cc'), value: "cc" },
    { name: this.translate.instant('global.label.rrp'), value: "rrp" },
  ];
  listContentWallet: any[] = [];
  listLandingPage: any[] = [];
  // listLandingPageConsumer: any[] = [{ name: "Kupon", value: "kupon" }, { name: "Terdekat", value: "terdekat" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Bantuan", value: "bantuan" }];
  listSubscription: any[] = [
    { name: this.translate.instant('global.label.all'), value: "all" },
    { name: this.translate.instant('global.label.subscribe'), value: "yes" },
    { name: this.translate.instant('global.label.unsubscribe'), value: "no" }
  ];
  listGender: any[] = [
    { name: this.translate.instant('global.label.all'), value: "both" },
    { name: this.translate.instant('global.label.male'), value: "male" },
    { name: this.translate.instant('global.label.female'), value: "female" }
  ];
  listAge: any[] = [{ name: '18+', value: '18+' }, { name: '< 18', value: '18-' }];

  listTypeBanner: any[] = [
    { name: this.translate.instant('global.label.inapp_banner'), value: "in-app-banner" },
    { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.news'), value: "info-terkini" },
    { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.consumer_activation'), value: "aktivasi-konsumen" },
    { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.ticker'), value: "ticker" }
  ];
  listTypeBannerConsumer: any[] = [
    { name: this.translate.instant('global.label.inapp_banner'), value: "in-app-banner" },
    { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.nearby_store'), value: "toko-terdekat" },
    { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.src_info'), value: "info-src" },
    { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.flying_button'), value: "flying-button" }
  ];
  listKategori: any[] = [
    { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.ticker_red'), value: "red" },
    { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.ticker_blue'), value: "blue" },
    { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.ticker_yellow'), value: "yellow" }
  ];
  listProfile = [
    { name: this.translate.instant('global.label.update_profile'), value: "ubah_profil" },
    { name: this.translate.instant('global.label.subscription_store'), value: "toko_langganan" },
    { name: this.translate.instant('global.label.saved_location'), value: "lokasi_tersimpan" },
    { name: this.translate.instant('bantuan.text1'), value: "bantuan" },
    { name: this.translate.instant('global.label.privacy_settings'), value: "pengaturan_privasi" },
  ];
  listCustomerBanners: any[] = [];
  listEmployee: any[] = [
    { name: this.translate.instant('global.label.all'), value: "all" },
    { name: this.translate.instant('global.label.employee_only'), value: "yes" }
  ];

  bannerTemplate: TemplateBanner = new TemplateBanner();
  templateBannerList: any[];
  bannerSelected: any;
  imageConverted: any;
  detailAreaSelected: any;

  files: File;
  imageContentType: File;
  imageContentTypeBase64: any;
  image: any;
  validComboDrag: boolean;

  statusChange: Boolean;
  customAge: Boolean;

  formBannerGroup: FormGroup;
  formBannerErrors: any;

  isDetail: Boolean;
  imageContentTypeFromDetail: any;

  public options: Object = Config.FROALA_CONFIG;

  audienceSelected: any[] = [];

  selectedArea: any[] = [];
  selectedAll: boolean = false;
  selectedAllId: any[] = [];
  targetAreaIds: any[] = [];

  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild('activeCell')
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
  dialogRef: any;

  pageName = this.translate.instant('iklan_dalam_aplikasi.spanduk_online.text1')

  titleParam = {
    entity: this.pageName
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private bannerService: BannerService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private _lightbox: Lightbox,
    private geotreeService: GeotreeService,
    private dialog: MatDialog,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.adapter.setLocale('id');
    this.detailBanner = dataService.getFromStorage('detail_banner');
    console.log(this.detailBanner)
    this.areaType = this.dataService.getDecryptedProfile()['area_type'];
    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    this.customAge = false;
    // this.validComboDrag = true;

    if (this.detailBanner.user_group === 'retailer') {
      this.listLandingPage = [
        { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.shopping'), value: "belanja" },
        { name: this.translate.instant('global.label.mission'), value: "misi" },
        { name: this.translate.instant('global.label.customer'), value: "pelanggan" },
        { name: this.translate.instant('bantuan.text1'), value: "bantuan" },
        { name: this.translate.instant('global.label.my_profile'), value: "profil_saya" },
        { name: this.translate.instant('global.label.capital_corner'), value: "pojok_modal" },
        { name: this.translate.instant('global.label.src_catalog'), value: "src_katalog" },
        { name: this.translate.instant('global.label.pay_corner'), value: "pojok_bayar" },
        { name: 'App Link', value: "app_link" }
      ];
    } else {
      this.listLandingPage = [
        { name: this.translate.instant('cn_reward.b2c_voucher.text26'), value: "pesan_antar" },
        { name: this.translate.instant('global.label.nearby'), value: "terdekat" },
        { name: this.translate.instant('global.label.play_together'), value: "main_bareng" },
        { name: this.translate.instant('global.label.challenge'), value: "tantangan" },
        { name: this.translate.instant('global.label.opportunity'), value: "peluang" },
        { name: this.translate.instant('global.label.capital_corner'), value: "pojok_modal" },
        { name: this.translate.instant('global.label.my_profile'), value: "profil_saya" },
        { name: this.translate.instant('bantuan.text1'), value: "bantuan" },
        { name: this.translate.instant('global.label.coupon'), value: "kupon" },
        { name: this.translate.instant('global.label.voucher'), value: "voucher_kupon" },
      ];
    }

    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    this.formBannerErrors = {
      name: '',
      from: '',
      to: '',
      enable: '',
      // target_page: '',
    }

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
    }

    this.templateBannerList = this.bannerTemplate.getTemplateBanner('LOREM IPSUM');
  }

  ngOnInit() {
    var urlvalidation = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i

    this.formBannerGroup = this.formBuilder.group({
      name: ['', Validators.required],
      from: [moment(), Validators.required],
      to: ['', Validators.required],
      enable: [1, Validators.required],
      title: ['', Validators.required],
      body: ['', Validators.required],
      status: ['', Validators.required],
      user_group: ['retailer', Validators.required],
      age: ['18+'],
      areas: this.formBuilder.array([]),
      content_type: ['static_page', Validators.required],
      content_wallet: ['ovo', Validators.required],
      button_text: ['', [Validators.maxLength(30)]],
      group_type: ['src'],
      landing_page: ['belanja'],
      profile: [''],
      url_iframe: ['', [Validators.required, Validators.pattern(urlvalidation)]],
      // is_smoker: this.formBuilder.array([]),
      employee: ['all'],
      gender: ['both'],
      promo: ['yes', Validators.required],
      transfer_token: ['yes', Validators.required],
      is_target_audience: [false],
      is_target_area: [false],
      banner_selected: this.formBuilder.group({
        'id': [''],
        'name': [''],
        'image': [''],
        'title': [''],
        'class': [''],
      }),
      type_banner: '',
      banner_customer_id: [null, [
        InappMarketingValidator.requiredIf(() => this.formBannerGroup.get('type_banner').value === 'aktivasi-konsumen')
      ]],
      banner_customer_body: ['', [
        InappMarketingValidator.requiredIf(() => this.formBannerGroup.get('type_banner').value === 'aktivasi-konsumen')
      ]],
      subscription: ['all'],
      barcode: [""],
      kategori: null,
      ticker_body: [""],
      ticker_title: [""],
      content_type_customer: ['all'],
      app_link: [""],
    })

    this.formFilter = this.formBuilder.group({
      national: [''],
      zone: [''],
      region: [''],
      area: [''],
      salespoint: [''],
      district: [''],
      territory: ['']
    })

    this.formBannerGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formBannerGroup, this.formBannerErrors);
    })

    this.setMinDate();
    this.getDetails();

    this.formBannerGroup.controls['user_group'].valueChanges.debounceTime(50).subscribe(res => {
      this.selected.splice(0, this.selected.length);
      this.audienceSelected = [];
      if (res === 'retailer') {
        this.listLandingPage = [
          { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.shopping'), value: "belanja" },
          { name: this.translate.instant('global.label.mission'), value: "misi" },
          { name: this.translate.instant('global.label.customer'), value: "pelanggan" },
          { name: this.translate.instant('bantuan.text1'), value: "bantuan" },
          { name: this.translate.instant('global.label.my_profile'), value: "profil_saya" },
          { name: this.translate.instant('global.label.capital_corner'), value: "pojok_modal" },
          { name: this.translate.instant('global.label.src_catalog'), value: "src_katalog" },
          { name: this.translate.instant('global.label.pay_corner'), value: "pojok_bayar" },
          { name: 'App Link', value: "app_link" }
        ];
        this.listContentType = this.listContentType.filter(list => list.value !== 'e_wallet');
        // this.formBannerGroup.controls['type_banner'].setValue('in-app-banner');
      } else {
        this.listLandingPage = [
          { name: this.translate.instant('cn_reward.b2c_voucher.text26'), value: "pesan_antar" },
          { name: this.translate.instant('global.label.nearby'), value: "terdekat" },
          { name: this.translate.instant('global.label.play_together'), value: "main_bareng" },
          { name: this.translate.instant('global.label.challenge'), value: "tantangan" },
          { name: this.translate.instant('global.label.opportunity'), value: "peluang" },
          { name: this.translate.instant('global.label.capital_corner'), value: "pojok_modal" },
          { name: this.translate.instant('global.label.my_profile'), value: "profil_saya" },
          { name: this.translate.instant('bantuan.text1'), value: "bantuan" },
          { name: this.translate.instant('global.label.coupon'), value: "kupon" },
          { name: this.translate.instant('global.label.voucher'), value: "voucher_kupon" },
        ];
        this.listContentType.push({ name: this.translate.instant('global.label.ewallet'), value: 'e_wallet' });
        // this.formBannerGroup.controls['type_banner'].setValue('in-app-banner');
      }

      if (this.formBannerGroup.controls['is_target_audience'].value === true) this.getAudience();

      this.formBannerGroup.controls['landing_page'].setValue('');
    });

    this.formBannerGroup.get('landing_page').valueChanges.debounceTime(50).subscribe((res) => {
      if (res === 'profil_saya') {
        this.formBannerGroup.get('profile').setValidators([Validators.required]);
      } else {
        this.formBannerGroup.get('profile').setValidators([]);
      }
    });

    // this.formBannerGroup.controls['url_iframe'].disable();

    this.formBannerGroup.controls['content_type'].valueChanges.debounceTime(50).subscribe(res => {
      if (res === 'iframe' || res === 'link_web') {
        this.formBannerGroup.controls['url_iframe'].enable();
      }
    })

    if (this.detailBanner.target_audience === 0) {
      console.log('get parent area', this.detailBanner.area_id[0]);
      this.bannerService.getParentArea({ parent: this.detailBanner.area_id[0] ? this.detailBanner.area_id[0] : 1 }).subscribe(res => {
        this.detailAreaSelected = res.data;
      })
    }

    this.formBannerGroup.controls['group_type'].valueChanges.debounceTime(50).subscribe(res => {
      if (this.formBannerGroup.get('is_target_audience').value === true) {
        this.getAudience();
        this.selected.splice(0, this.selected.length);
        this.audienceSelected = [];
      }
    });

    this.bannerService.getListWallet().subscribe(res => {
      this.listContentWallet = res.data;
    });
    this.bannerService.getListBannerCustomer().subscribe(({ data }) => {
      this.listCustomerBanners = data || [];
    })

    this.formBannerGroup.get('banner_selected').valueChanges.debounceTime(300).subscribe(res => {
      this.bannerSelected = res;
    })

    this.formBannerGroup.controls['status'].valueChanges.subscribe(res => {
      this.statusChange = true;
    })

    this.initAreaV2();
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

    this.formBannerGroup.controls['type_banner'].valueChanges.debounceTime(50).subscribe(typeBannerVal => {

      if (typeBannerVal !== 'aktivasi-konsumen') {
        this.formBannerGroup.controls['banner_customer_id'].setValue(null),
          this.formBannerGroup.controls['banner_customer_body'].setValue(''),
          this.formBannerGroup.updateValueAndValidity();
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
    let levelAreas = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
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
      if (areaSelected[0].value !== '') {
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
        if (areaSelected[0].value !== '') {
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

  handleSearchProduct(event) {
    console.log(
      this.formBannerGroup.get("barcode").value
    )
    if (event.id)
      this.formBannerGroup.get("barcode").setValue(event)
    else
      this.formBannerGroup.get("barcode").setValue("")
  }

  async getDetails() {
    this.formBannerGroup.get('name').setValue(this.detailBanner.name);
    this.formBannerGroup.get('from').setValue(this.detailBanner.from);
    this.formBannerGroup.get('to').setValue(this.detailBanner.to);
    this.formBannerGroup.get('enable').setValue(this.detailBanner.enable);
    this.formBannerGroup.get('user_group').setValue(this.detailBanner.user_group);
    this.formBannerGroup.get('promo').setValue(this.detailBanner.promo);
    this.formBannerGroup.get('status').setValue(this.detailBanner.status);
    this.formBannerGroup.get('content_type').setValue(this.detailBanner.target_page.type);
    console.log(this.detailBanner.target_page.type, this.formBannerGroup.get('content_type').value)
    this.formBannerGroup.get('is_target_audience').setValue(this.detailBanner.target_audience === 0 ? false : true);
    if (this.detailBanner.target_audience && this.detailBanner.target_audience === 1) {
      this.formBannerGroup.controls['is_target_audience'].setValue(true);
      this.audienceSelected = this.detailBanner.targeted_audiences.map(aud => ({ id: aud.audience_id }));
      this.onSelect({ selected: this.audienceSelected });
      console.log('this auddd', this.audienceSelected);
    }
    console.log('this detailBanner', this.detailBanner);

    if (this.detailBanner.user_group === 'retailer') {
      this.formBannerGroup.get('age').setValue(this.detailBanner.age);

      if (this.detailBanner.target_audience === 0) {
        const group_type = this.detailBanner.areas.map(item => item.type)[0];
        this.formBannerGroup.get('group_type').setValue(group_type);
      } else {
        this.formBannerGroup.get('group_type').setValue(this.detailBanner.business_type);
      }
      setTimeout(() => {
        this.formBannerGroup.get('type_banner').setValue((this.detailBanner.type_banner) ? this.detailBanner.type_banner : 'in-app-banner');
        if (this.formBannerGroup.get('type_banner').value === 'ticker') {
          this.formBannerGroup.get('kategori').setValue((this.detailBanner.type_ticker) ? this.detailBanner.type_ticker : 'red');
          this.formBannerGroup.get('ticker_title').setValue(this.detailBanner.ticker_title);
          this.formBannerGroup.get('ticker_body').setValue(this.detailBanner.ticker_contents);
        }

      }, 50);
    }

    if (this.detailBanner.user_group === 'customer') {
      this.formBannerGroup.get('gender').setValue(this.detailBanner.gender || 'both');
      this.formBannerGroup.get('employee').setValue(this.detailBanner.employee || 'all');
      this.formBannerGroup.get('subscription').setValue(this.detailBanner.subscription);
      this.formBannerGroup.get('employee').setValidators([Validators.required]);
      this.formBannerGroup.get('type_banner').setValue(this.detailBanner.type_banner);
      this.formBannerGroup.get('landing_page').setValue(this.detailBanner.target_page.page);
      this.formBannerGroup.get('profile').setValue(this.detailBanner.target_page.menu);
      setTimeout(() => {
        this.formBannerGroup.get('type_banner').setValue((this.detailBanner.type_banner) ? this.detailBanner.type_banner : 'in-app-banner');
      }, 50);
      this.formBannerGroup.get('content_type_customer').setValue(this.detailBanner.user_type);
      this.formBannerGroup.updateValueAndValidity();

      if (!this.detailBanner.target_audience && this.detailBanner.areas.length) {
        this.formBannerGroup.get('is_target_area').setValue(true);
        this.targetAreaIds = this.detailBanner.area_id.map((item) => ({ id: item }));
      }
    }

    if (this.detailBanner.target_page.type === 'static_page') {
      this.formBannerGroup.get('title').setValue(this.detailBanner.title);
      this.formBannerGroup.get('body').setValue(this.detailBanner.body);
    } else {
      this.formBannerGroup.get('title').disable();
      this.formBannerGroup.get('body').disable();
    }

    if (this.detailBanner.target_page.type === 'landing_page') {
      this.formBannerGroup.get('landing_page').setValue(this.detailBanner.target_page.page);

      if(this.detailBanner.target_page.url_app){
        this.formBannerGroup.get('app_link').setValue(this.detailBanner.target_page.url_app);
      }
    }

    if (this.detailBanner.target_page.type === 'spesific_product_b2b') {
      this.formBannerGroup.get('barcode').setValue({ id: this.detailBanner.target_page.product_info.barcode, name: this.detailBanner.target_page.product_info.name });
      this.formBannerGroup.controls['barcode'].setValidators([Validators.required])
    }

    if (this.detailBanner.target_page.type === 'iframe' || this.detailBanner.target_page.type === 'link_web') {
      this.formBannerGroup.get('url_iframe').enable();
      this.formBannerGroup.get('url_iframe').setValue(this.detailBanner.target_page.url);
      this.formBannerGroup.get('transfer_token').setValue(this.detailBanner.transfer_token);
    } else {
      this.formBannerGroup.controls['url_iframe'].disable();
      this.formBannerGroup.controls['transfer_token'].disable();
    }

    if (this.detailBanner.target_page.type === 'e_wallet') {
      this.formBannerGroup.get('body').enable();
      this.formBannerGroup.get('body').setValue(this.detailBanner.target_page.body);
      this.formBannerGroup.get('content_wallet').setValue(this.detailBanner.target_page.wallet.id);
      this.formBannerGroup.get('button_text').setValue(this.detailBanner.target_page.button_text);
    }

    if (this.detailBanner.target_page.type === 'image') {
      this.imageContentTypeFromDetail = this.detailBanner.target_page.url;
    }
    if (this.detailBanner.target_audience === 0) {
      for (const { val, index } of this.detailBanner.areas.map((val, index) => ({ val, index }))) {
        const response = await this.bannerService.getParentArea({ parent: val.area_id }).toPromise();
        let wilayah = this.formBannerGroup.controls['areas'] as FormArray;

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
        }))

        this.initArea(index);
        this.initFormGroup(response, index);

        if (this.detailBanner.areas.length === (index + 1)) {
          this.onLoad = false;
        }
      }
    }

    // if (this.detailProduct.areas.length === 0) {
    //   this.addArea();
    // }

    setTimeout(() => {
      this.onLoad = false;
      if (this.formBannerGroup.controls['is_target_audience'].value === true) this.getAudience();

    }, 500);
    if (this.detailBanner.type_banner === 'aktivasi-konsumen') {
      this.formBannerGroup.controls['banner_customer_id'].setValue(this.detailBanner.banner_customer_id);
      this.formBannerGroup.controls['banner_customer_body'].setValue(this.detailBanner.banner_customer_body);
    }

    if (this.isDetail) this.formBannerGroup.disable();
  }

  // initFormGroup() {
  //   this.detailAreaSelected.map(item => {
  //     let level_desc = '';
  //     switch (item.level_desc.trim()) {
  //       case 'national':
  //         level_desc = 'zone';
  //         break
  //       case 'division':
  //         level_desc = 'region';
  //         break;
  //       case 'region':
  //         level_desc = 'area';
  //         break;
  //       case 'area':
  //         level_desc = 'salespoint';
  //         break;
  //       case 'salespoint':
  //         level_desc = 'district';
  //         break;
  //       case 'district':
  //         level_desc = 'territory';
  //         break;
  //     }
  //     this.getAudienceArea(level_desc, item.id);
  //   });

  //   this.formBannerGroup.get('name').setValue(this.detailBanner.name);
  //   this.formBannerGroup.get('from').setValue(this.detailBanner.from);
  //   this.formBannerGroup.get('to').setValue(this.detailBanner.to);
  //   this.formBannerGroup.get('enable').setValue(this.detailBanner.enable);
  //   this.formBannerGroup.get('title').setValue(this.detailBanner.title);
  //   this.formBannerGroup.get('body').setValue(this.detailBanner.body);
  //   this.formBannerGroup.get('user_group').setValue(this.detailBanner.user_group);
  //   this.formBannerGroup.get('promo').setValue(this.detailBanner.promo);
  //   this.formBannerGroup.get('age').setValue(this.detailBanner.age);
  //   this.formBannerGroup.get('status').setValue(this.detailBanner.status);

  //   this.formBannerGroup.get('zone').setValue(this.getArea('division'));
  //   this.formBannerGroup.get('region').setValue(this.getArea('region'));
  //   this.formBannerGroup.get('area').setValue(this.getArea('area'));
  //   this.formBannerGroup.get('salespoint').setValue(this.getArea('salespoint'));
  //   this.formBannerGroup.get('district').setValue(this.getArea('district'));
  //   this.formBannerGroup.get('territory').setValue(this.getArea('teritory'));

  //   if (this.isDetail) this.formBannerGroup.disable();
  // }

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
    })
  }

  addArea() {
    let wilayah = this.formBannerGroup.controls['areas'] as FormArray;
    wilayah.push(this.createArea());
    const index = wilayah.length > 0 ? (wilayah.length - 1) : 0
    this.initArea(index);
    this.generataList('zone', 1, index, 'render');
  }

  deleteArea(idx) {
    this.indexDelete = idx;
    let data = {
      titleDialog: this.translate.instant('global.message.delete_data', { entity: this.translate.instant('global.area.geotree') }),
      captionDialog: this.translate.instant('global.message.delete_confirm', { entity: this.translate.instant('global.area.geotree'), index: idx + 1 }),
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  initArea(index) {
    let wilayah = this.formBannerGroup.controls['areas'] as FormArray;
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
    console.log('init form group', response);
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
    let item: any;
    let wilayah = this.formBannerGroup.controls['areas'] as FormArray;
    console.log('wilayah', wilayah);
    switch (selection) {
      case 'zone':
        const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
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
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
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
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
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
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
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
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
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
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
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
    let wilayah = this.formBannerGroup.controls['areas'] as FormArray;
    wilayah.removeAt(this.indexDelete);
    this.dialogService.brodcastCloseConfirmation();
  }

  clearFormArray = (index, selection) => {
    let wilayah = this.formBannerGroup.controls['areas'] as FormArray;
    let list = wilayah.at(index).get(selection) as FormArray;
    while (list.length > 0) {
      list.removeAt(list.length - 1);
    }
  }

  removeImage(): void {
    this.files = undefined;
  }

  setMinDate(): void {
    this.formBannerGroup.get('to').setValue('');
    this.minDate = this.formBannerGroup.get('from').value;
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.id === o2.id && o1.level === o2.id;
  }

  changeImage(event) {
    this.readThis(event);
  }

  readThis(inputValue: any): void {
    var file: File = inputValue;
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.image = myReader.result;
      this.bannerSelected['image'] = this.image;
      this.formBannerGroup.get('banner_selected').get('image').setValue(this.image);
    }

    myReader.readAsDataURL(file);
  }

  selectBannerTemplate(item: any) {
    this.bannerSelected = item;
    this.formBannerGroup.get('banner_selected').setValue(item);
  }

  async submit(status?: string) {
    console.log(this.formBannerGroup)
    if ((this.formBannerGroup.valid && this.bannerSelected == undefined) || (this.formBannerGroup.valid && this.bannerSelected)) {

      if (this.bannerSelected) {
        this.dataService.showLoading(true);
        await html2canvas(document.querySelector('#banner'), { scale: 3 }).then(canvas => {
          this.imageConverted = this.convertCanvasToImage(canvas);
          this.dataService.showLoading(false);
        });
      }

      let body = {
        user_group: this.formBannerGroup.get('user_group').value,
        content_type: this.formBannerGroup.get('content_type').value
      }

      let fd = new FormData();
      fd.append('_method', 'PUT');
      body['_method'] = 'PUT';
      fd.append('name', this.formBannerGroup.get('name').value);
      body['name'] = this.formBannerGroup.get('name').value;
      fd.append('from', moment(this.formBannerGroup.get('from').value).format('YYYY-MM-DD'));
      body['from'] = moment(this.formBannerGroup.get('from').value).format('YYYY-MM-DD');
      fd.append('to', moment(this.formBannerGroup.get('to').value).format('YYYY-MM-DD'));
      body['to'] = moment(this.formBannerGroup.get('to').value).format('YYYY-MM-DD');
      fd.append('enable', this.formBannerGroup.get('enable').value);
      body['enable'] = this.formBannerGroup.get('enable').value;
      fd.append('status', this.statusChange ? (status === 'draft' ? status : this.formBannerGroup.get('status').value) : status);
      body['status'] = this.statusChange ? (status === 'draft' ? status : this.formBannerGroup.get('status').value) : status;
      fd.append('user_group', this.formBannerGroup.get('user_group').value);
      body['user_group'] = this.formBannerGroup.get('user_group').value;
      fd.append('promo', this.formBannerGroup.get('promo').value);
      body['promo'] = this.formBannerGroup.get('promo').value;
      fd.append('content_type', body.content_type);
      if (this.formBannerGroup.get('type_banner').value == 'ticker') {
        fd.append('ticker_title', this.formBannerGroup.get('ticker_title').value);
        body['ticker_title'] = this.formBannerGroup.get('ticker_title').value;
        fd.append('ticker_contents', this.formBannerGroup.get('ticker_body').value);
        body['ticker_contents'] = this.formBannerGroup.get('ticker_body').value;
      }

      if (this.bannerSelected) {
        fd.append('image', this.imageConverted);
        body['image'] = this.imageConverted;
      }

      if (body.content_type === 'static_page') {
        fd.append('title', this.formBannerGroup.get('title').value);
        body['title'] = this.formBannerGroup.get('title').value;
        fd.append('body', this.formBannerGroup.get('body').value);
        body['body'] = this.formBannerGroup.get('body').value;
      } else if (body.content_type === 'landing_page') {
        fd.append('landing_page', this.formBannerGroup.get('landing_page').value);
        body['landing_page'] = this.formBannerGroup.get('landing_page').value;
      } else if (body.content_type === 'iframe') {
        fd.append('iframe', this.formBannerGroup.get('url_iframe').value);
        body['iframe'] = this.formBannerGroup.get('url_iframe').value;
        fd.append('transfer_token', this.formBannerGroup.get('transfer_token').value);
        body['transfer_token'] = this.formBannerGroup.get('transfer_token').value;
      } else if (body.content_type === 'image') {
        if (this.imageContentTypeFromDetail) {
          if (this.imageContentTypeBase64) {
            fd.append('content_image', this.imageContentTypeBase64);
            body['content_image'] = this.imageContentTypeBase64;
          }
        } else {
          if (this.imageContentTypeBase64) {
            fd.append('content_image', this.imageContentTypeBase64);
            body['content_image'] = this.imageContentTypeBase64;
          }
          else return this.dialogService.openSnackBar({ message: 'Konten image belum dipilih' });
        }
      } else if (body.content_type === 'e_wallet') {
        fd.append('body', this.formBannerGroup.get('body').value);
        body['body'] = this.formBannerGroup.get('body').value;
        fd.append('content_wallet', this.formBannerGroup.get('content_wallet').value);
        body['content_wallet'] = this.formBannerGroup.get('content_wallet').value;
        fd.append('button_text', this.formBannerGroup.get('button_text').value);
        body['button_text'] = this.formBannerGroup.get('button_text').value;
      } else if (body.content_type === 'link_web') {
        fd.append('url_link', this.formBannerGroup.get('url_iframe').value);
        body['url_link'] = this.formBannerGroup.get('url_iframe').value;
        fd.append('transfer_token', this.formBannerGroup.get('transfer_token').value);
        body['transfer_token'] = this.formBannerGroup.get('transfer_token').value;
      } else if (body.content_type === 'spesific_product_b2b') {
        fd.append('barcode', this.formBannerGroup.get('barcode').value.id);
        body['barcode'] = this.formBannerGroup.get('barcode').value.id;
        fd.append('name_product', this.formBannerGroup.get('barcode').value.name);
        body['name_product'] = this.formBannerGroup.get('barcode').value.name;
      }
      else {

      }

      if (body.user_group === 'retailer') {
        fd.append('age', this.formBannerGroup.get('age').value);
        body['age'] = this.formBannerGroup.get('age').value;
        fd.append('type_banner', this.formBannerGroup.get('type_banner').value);
        body['type_banner'] = this.formBannerGroup.get('type_banner').value;
        if (this.formBannerGroup.get('type_banner').value === 'ticker') {
          fd.append('type_ticker', this.formBannerGroup.get('kategori').value);
          body['type_ticker'] = this.formBannerGroup.get('kategori').value;
        }
        if (this.formBannerGroup.get('landing_page').value === 'app_link' && body.content_type === 'landing_page') {
          let urlAPP = this.formBannerGroup.get('app_link').value;
          fd.append('url_app', urlAPP);
          body['url_app'] = urlAPP;
        }else{
          fd.append('url_app', null);
          body['url_app'] = null;
        }
      }

      if (body.user_group === 'customer') {
        fd.append('gender', this.formBannerGroup.get('gender').value);
        body['gender'] = this.formBannerGroup.get('gender').value;
        fd.append('employee', this.formBannerGroup.get('employee').value);
        body['employee'] = this.formBannerGroup.get('employee').value;
        fd.append('type_banner', this.formBannerGroup.get('type_banner').value);
        body['type_banner'] = this.formBannerGroup.get('type_banner').value;
        if (this.formBannerGroup.get('content_type').value === 'landing_page' && this.formBannerGroup.get('landing_page').value === 'profil_saya') {
          fd.append('profile', this.formBannerGroup.get('profile').value);
          body['profile'] = this.formBannerGroup.get('profile').value;
        }
        fd.append('subscription', this.formBannerGroup.get('subscription').value);
        body['subscription'] = this.formBannerGroup.get('subscription').value;
        fd.append('user_type', this.formBannerGroup.get('content_type_customer').value);
        body['user_type'] = this.formBannerGroup.get('content_type_customer').value;
      }

      if (this.formBannerGroup.get('type_banner').value === 'aktivasi-konsumen') {
        fd.append('banner_customer_id', this.formBannerGroup.get('banner_customer_id').value);
        body['banner_customer_id'] = this.formBannerGroup.get('banner_customer_id').value;
        fd.append('banner_customer_body', this.formBannerGroup.get('banner_customer_body').value);
        body['banner_customer_body'] = this.formBannerGroup.get('banner_customer_body').value;
      } else {
        fd.append('banner_customer_id', null);
        body['banner_customer_id'] = null;
        fd.append('banner_customer_body', null);
        body['banner_customer_body'] = null;
      }

      if (this.formBannerGroup.get('is_target_area').value) {
        let ids = [];
        if (this.selectedAll) {
          ids = this.selectedAllId;
        } else {
          ids = this.selectedArea.filter((item) => item.id.toString() !== '1').map((item) => item.id);
        }
        console.log(ids);
        ids.forEach((item) => {
          fd.append('areas[]', item);
        });
      } else {
        let _areas = [];
        let areas = [];
        let value = this.formBannerGroup.getRawValue();

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
          return this.dialogService.openSnackBar({
            message: this.translate.instant('global.label.duplicate_data', { entity: this.translate.instant('global.label.salestree') })
          });
        }

        areas.map(item => {
          if (body.user_group === 'retailer') {
            if (this.formBannerGroup.controls['group_type'].value === 'src') {
              fd.append('areas[src][]', item.value);
              body['areas[src][]'] = item.value;
            } else {
              fd.append('areas[ws_downline][]', item.value);
              body['areas[ws_downline][]'] = item.value;
            }
          } else {
            fd.append('areas[]', item.value);
            body['areas[]'] = item.value;
          }
        })
      }

      if (this.bannerSelected) {
        fd.append('image', this.imageConverted);
        body['image'] = this.imageConverted;
      }

      // this.typeArea.map(type => {
      //   const filteredValue = value.filter(item => item.key === type && item.value);
      //   if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value))
      // })

      // fd.append('areas[]', _.last(areas));
      // areas.map(item => {
      //   fd.append('areas[]', item)
      // })

      if (body.user_group === 'retailer') {
        fd.append('business_type', this.formBannerGroup.controls['group_type'].value);
        body['business_type'] = this.formBannerGroup.controls['group_type'].value;
      }

      if (this.formBannerGroup.get('is_target_audience').value) {
        fd.append('target_audience', '1');
        body['target_audience'] = '1';
        this.audienceSelected.map(aud => {
          // fd.append('target_audiences[]', aud.id)
          // body['target_audiences[]'] = '1';
        });
        fd.append('target_audiences[]', JSON.stringify(this.audienceSelected.map(aud => aud.id)));
        body['target_audiences'] = this.audienceSelected.map(aud => aud.id);
        this.bannerService.put(body, { banner_id: this.detailBanner.id }).subscribe(
          res => {
            this.loadingIndicator = false;
            this.router.navigate(['advertisement', 'banner']);
            this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text2') });
          },
          err => {
            this.dataService.showLoading(false);
            this.onLoad = false;
            this.loadingIndicator = false;
          }
        );
      } else {
        fd.append('target_audience', '0');
        body['target_audience'] = '0';
        this.bannerService.put(fd, { banner_id: this.detailBanner.id }).subscribe(
          res => {
            this.loadingIndicator = false;
            this.router.navigate(['advertisement', 'banner']);
            this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text2') });
          },
          err => {
            this.dataService.showLoading(false);
            this.onLoad = false;
            this.loadingIndicator = false;
          }
        );
      }



    } else {
      let msg;
      if (this.formBannerGroup.invalid) {
        msg = this.translate.instant('global.label.please_complete_data');
      } else if (!this.bannerSelected) {
        msg = this.translate.instant('global.label.no_selected_image', { type: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.text1') });
      } else {
        msg = this.translate.instant('global.label.please_complete_data');
      }

      this.dialogService.openSnackBar({ message: msg });
      commonFormValidator.validateAllFields(this.formBannerGroup);
    }
  }

  convertCanvasToImage(canvas) {
    let image = new Image();
    image.src = canvas.toDataURL('image/jpeg');

    return image.src;
  }

  contentType(value) {
    if (this.imageContentTypeBase64 && this.imageContentType) {
      this.imageContentType = undefined;
      this.imageContentTypeBase64 = undefined;
    }

    if (value !== 'static_page') {
      this.formBannerGroup.controls['title'].setValue('');
      this.formBannerGroup.controls['body'].setValue('');
      this.formBannerGroup.controls['title'].disable();
      this.formBannerGroup.controls['body'].disable();
    } else {
      this.formBannerGroup.controls['title'].enable();
      this.formBannerGroup.controls['body'].enable();
    }

    if (value === 'iframe' || value === 'link_web') {
      this.formBannerGroup.controls['url_iframe'].enable();
    } else {
      this.formBannerGroup.controls['url_iframe'].setValue('');
      this.formBannerGroup.controls['url_iframe'].disable();
    }

    if (value !== 'e_wallet') {
      this.formBannerGroup.controls['content_wallet'].disable();
      this.formBannerGroup.controls['button_text'].disable();
    }

    if (value === "spesific_product_b2b") {
      this.formBannerGroup.controls['barcode'].setValidators([Validators.required])
      this.formBannerGroup.controls['barcode'].enable()
    } else {
      this.formBannerGroup.controls['barcode'].setValue("")
      this.formBannerGroup.controls['barcode'].disable()
    }

    if (value === 'landing_page') {
      this.formBannerGroup.controls['landing_page'].setValue('');
    }
    
    if(
      value === 'landing_page' && 
      this.formBannerGroup.get('user_group').value === 'retailer'
    ){
      this.formBannerGroup.get('app_link').setValidators(Validators.required);
    } else {
      this.formBannerGroup.get('app_link').clearValidators();
      this.formBannerGroup.get('app_link').updateValueAndValidity();
    }
  }

  landingPageChange(value) {
    if(
      value === 'app_link' && 
      this.formBannerGroup.get('user_group').value === 'retailer'
    ){
      this.formBannerGroup.get('app_link').setValidators(Validators.required);
    } else {
      this.formBannerGroup.get('app_link').clearValidators();
      this.formBannerGroup.get('app_link').updateValueAndValidity();
      this.formBannerGroup.controls['app_link'].setValue('');
    }
  }

  getToolTipData(value, array) {
    if (value && array.length) {
      let msg = array.filter(item => item.id === value)[0]['name'];
      return msg;
    } else {
      return '';
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

  imagesContentType(image) {
    var file: File = image;
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.imageContentTypeBase64 = myReader.result;
    }

    myReader.readAsDataURL(file);
  }

  previewImage() {
    let album = {
      src: this.imageContentTypeBase64 ? this.imageContentTypeBase64 : this.detailBanner.target_page.url,
      caption: '',
      thumb: this.imageContentTypeBase64 ? this.imageContentTypeBase64 : this.detailBanner.target_page.url
    };

    this._lightbox.open([album], 0);
  }

  checkAreaLocation(area, lastSelfArea) {
    let lastLevelFromLogin = this.parseArea(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
    let areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
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
    let keyAudience = this.formBannerGroup.get('user_group').value === 'retailer' ? 'getAudience' : 'getCustomerAudience';
    this.dataService.showLoading(true);
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== '' && item.value.length !== 0);
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
    let areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];

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

    this.pagination['audience'] = this.formBannerGroup.get('user_group').value;
    if (this.formBannerGroup.controls['user_group'].value === 'retailer') {
      this.pagination['type'] = this.formBannerGroup.controls['group_type'].value;
    } else {
      if (this.pagination['type']) delete this.pagination['type'];
    }

    if (this.formBannerGroup.get('user_group').value === 'retailer') {
      // this.pagination['retailer_type'] = this.formBannerGroup.get("group_type").value;
      delete this.pagination['customer_smoking'];
      delete this.pagination['customer_gender'];
      delete this.pagination['customer_age_from'];
      delete this.pagination['customer_age_to'];
    }
    if (this.formBannerGroup.get('user_group').value === 'customer') {
      delete this.pagination['customer_smoking'];
      delete this.pagination['customer_gender'];
      delete this.pagination['customer_age_from'];
      delete this.pagination['customer_age_to'];
      delete this.pagination['retailer_type'];
    }
    if (this.formBannerGroup.get('user_group').value === 'customer') {
      delete this.pagination['type'];
      this.pagination['customer_gender'] = this.formBannerGroup.get('gender').value;
    }

    this.bannerService[keyAudience](this.pagination).subscribe(res => {
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
    let keyAudience = this.formBannerGroup.get('user_group').value === 'retailer' ? 'getAudience' : 'getCustomerAudience';
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;
    this.bannerService[keyAudience](this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    let keyAudience = this.formBannerGroup.get('user_group').value === 'retailer' ? 'getAudience' : 'getCustomerAudience';
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.bannerService[keyAudience](this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    let keyAudience = this.formBannerGroup.get('user_group').value === 'retailer' ? 'getAudience' : 'getCustomerAudience';
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;


    this.bannerService[keyAudience](this.pagination).subscribe(res => {
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
      this.formBannerGroup.get('is_target_area').setValue(false);
      this.getAudience();
    }
  }

  isTargetArea(event) {
    if (event.checked) {
      this.formBannerGroup.get('is_target_audience').setValue(false);
    }
  }

  async export() {
    let keyAudience = this.formBannerGroup.get('user_group').value === 'retailer' ? 'exportAudience' : 'exportCustomerAudience';
    if (this.audienceSelected.length === 0) {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.select_data_to_export', { entity: this.translate.instant('dte.audience.text1') }) });
      return;
    }
    this.dataService.showLoading(true);
    let body = this.audienceSelected.map(aud => aud.id);
    // this.exportPopUpNotif = true;
    try {
      const response = await this.bannerService[keyAudience]({ selected: body, audience: this.formBannerGroup.get('user_group').value }).toPromise();
      this.downLoadFile(response, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', `Banner_${this.formBannerGroup.get('user_group').value}_${new Date().toLocaleString()}.xlsx`);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
      // this.exportPopUpNotif = false;
      this.dataService.showLoading(false);
    } catch (error) {
      // this.exportPopUpNotif = false;
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
      audience: this.formBannerGroup.get('user_group').value,
      api: fd => this.bannerService[this.formBannerGroup.get("user_group").value === 'retailer' ? 'importAudience' : 'importCustomerAudience'](fd),
      fileType: 'xlsx'
    };

    this.dialogRef = this.dialog.open(ImportAudienceComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.audienceSelected = response;
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

}
