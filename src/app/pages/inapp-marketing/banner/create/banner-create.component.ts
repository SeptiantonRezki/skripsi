import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'underscore';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { BannerService } from '../../../../services/inapp-marketing/banner.service';
import { DateAdapter, MatDialogConfig, MatDialog } from '@angular/material';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from '../../../../services/data.service';
import { TemplateBanner } from 'app/classes/banner-template';
import html2canvas from 'html2canvas';
import { Config } from 'app/classes/config';
import { Lightbox } from 'ngx-lightbox';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { Subject } from 'rxjs';
import { RetailerService } from 'app/services/user-management/retailer.service';
import { CustomerService } from 'app/services/user-management/customer.service';
import { WholesalerService } from 'app/services/user-management/wholesaler.service';
import { GeotreeService } from 'app/services/geotree.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ImportAudienceBannerDialogComponent } from '../import-audience-banner-dialog/import-audience-banner-dialog.component';
import { InappMarketingValidator } from '../../InappMarketing.validator';

@Component({
  selector: 'app-banner-create',
  templateUrl: './banner-create.component.html',
  styleUrls: ['./banner-create.component.scss']
})
export class BannerCreateComponent {
  formFilter: FormGroup;
  onLoad: boolean;
  loadingIndicator: boolean;
  showLoading: Boolean;
  listLevelArea: any[];
  list: any;
  indexDelete: any;

  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;

  lvl: any[];
  minDate: any;
  listStatus: any[] = [{ name: 'Status Aktif', value: 'publish' }, { name: 'Status Non Aktif', value: 'draft' }];
  listUserGroup: any[] = [{ name: "Retailer", value: "retailer" }, { name: "Consumer", value: "customer" }];
  listUserGroupType: any[] = [{ name: "SRC", value: "src" }, { name: "WS Downline", value: "ws_downline" }];
  listContentType: any[] = [{ name: "Static Page", value: "static_page" }, { name: "Landing Page", value: "landing_page" }, { name: "Iframe", value: "iframe" }, { name: "Image", value: "image" }, { name: "Unlinked", value: "unlinked" }, { name: "E-Wallet", value: "e_wallet" },
  { name: "Link to Web Browser", value: "link_web" }
  ];
  listContentWallet: any[];
  listLandingPage: any[] = [];
  // listLandingPageConsumer: any[] = [{ name: "Kupon", value: "kupon" }, { name: "Terdekat", value: "terdekat" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Bantuan", value: "bantuan" }];
  listJenisKonsumen: any[] = [{ name: "Semua", value: "all" }, { name: "Terverifikasi", value: "verified" }];
  listSmoker: any[] = [{ name: "Semua", value: "both" }, { name: "Merokok", value: "yes" }, { name: "Tidak Merokok", value: "no" }];
  listGender: any[] = [{ name: "Semua", value: "both" }, { name: "Laki-laki", value: "male" }, { name: "Perempuan", value: "female" }];
  listAge: any[] = [{ name: "18+", value: "18+" }, { name: "< 18", value: "18-" }];
  
  listTypeBanner: any[] = [{ name: "In-App Banner", value: "in-app-banner" }, { name: "Info Terkini", value: "info-terkini" }, { name: "Aktivasi Konsumen", value: "aktivasi-konsumen" }];
  listCustomerBanners: any[] = [];
  listEmployee: any[] = [{ name: "Semua", value: "all" }, { name: "Employee Only", value: "yes" }];

  bannerTemplate: TemplateBanner = new TemplateBanner();
  templateBannerList: any[];
  bannerSelected: any;
  imageConverted: any;

  files: File;
  imageContentType: File;
  imageContentTypeBase64: any;
  image: any;
  validComboDrag: boolean;

  statusChange: Boolean;
  customAge: Boolean;

  formBannerGroup: FormGroup;
  formBannerErrors: any;

  public options: Object = Config.FROALA_CONFIG;
  audienceSelected: any[] = [];
  dialogRef: any;

  selectedArea: any[] = [];
  selectedAll: boolean = false;
  selectedAllId: any[] = [];

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


  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private dataService: DataService,
    private bannerService: BannerService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private _lightbox: Lightbox,
    private retailerService: RetailerService,
    private customerService: CustomerService,
    private wholesalerService: WholesalerService,
    private geotreeService: GeotreeService
  ) {
    this.adapter.setLocale('id');
    this.areaType = this.dataService.getDecryptedProfile()['area_type'];
    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    this.customAge = false;
    // this.validComboDrag = true;

    this.listLandingPage = [
      { name: "Belanja", value: "belanja" },
      { name: "Misi", value: "misi" },
      { name: "Pelanggan", value: "pelanggan" },
      { name: "Bantuan", value: "bantuan" },
      { name: "Profil Saya", value: "profil_saya" },
      { name: "Pojok Modal", value: "pojok_modal" },
      { name: "SRC Katalog", value: "src_katalog" },
      { name: "Pojok Bayar", value: "pojok_bayar" },
    ];

    this.formBannerErrors = {
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

    this.templateBannerList = this.bannerTemplate.getTemplateBanner('LOREM IPSUM');
  }

  ngOnInit() {
    var urlvalidation = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i
    this.formBannerGroup = this.formBuilder.group({
      name: ["", Validators.required],
      from: [moment(), Validators.required],
      to: ["", Validators.required],
      enable: [1, Validators.required],
      title: ["", Validators.required],
      body: ["", Validators.required],
      user_group: ["", Validators.required],
      age: ["18+", Validators.required],
      status: ["publish", Validators.required],
      promo: ["yes", Validators.required],
      transfer_token: ["yes", Validators.required],
      areas: this.formBuilder.array([]),
      content_type: ["static_page", Validators.required],
      content_wallet: ["ovo", Validators.required],
      button_text: ["", [Validators.maxLength(30)]],
      group_type: ["src"],
      landing_page: ["belanja"],
      url_iframe: ["", [Validators.required, Validators.pattern(urlvalidation)]],
      // is_smoker: this.formBuilder.array([]),
      verification: ["all"],
      employee: ["all"],
      is_smoker: ["both"],
      gender: ["both"],
      age_consumer_from: [""],
      age_consumer_to: [""],
      is_target_audience: [false],
      is_target_area: [false],
      banner_selected: this.formBuilder.group({
        "id": [""],
        "name": [""],
        "image": [""],
        "title": [""],
        "class": [""]
      }),
      type_banner: null,
      banner_customer_id: [null, [
        InappMarketingValidator.requiredIf(() => this.formBannerGroup.get('type_banner').value === 'aktivasi-konsumen')
      ]],
      banner_customer_body: ['', [
        InappMarketingValidator.requiredIf(() => this.formBannerGroup.get('type_banner').value === 'aktivasi-konsumen')
      ]]
    })

    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })

    this.formBannerGroup.controls['user_group'].valueChanges.debounceTime(50).subscribe(res => {
      this.selected.splice(0, this.selected.length);
      this.audienceSelected = [];
      if (res === 'retailer') {
        this.listLandingPage = [
          { name: "Belanja", value: "belanja" }, { name: "Misi", value: "misi" }, { name: "Pelanggan", value: "pelanggan" }, { name: "Bantuan", value: "bantuan" }, { name: "Profil Saya", value: "profil_saya" },
          { name: "Pojok Modal", value: "pojok_modal" },
          { name: "SRC Katalog", value: "src_katalog" },
          { name: "Pojok Bayar", value: "pojok_bayar" },
        ];
        this.formBannerGroup.controls['age_consumer_from'].disable();
        this.formBannerGroup.controls['age_consumer_to'].disable();
        this.listContentType = this.listContentType.filter(list => !['e_wallet', 'link_web'].includes(list.value));
        this.formBannerGroup.controls['type_banner'].setValue('in-app-banner');
        console.log('HERE');
      } else {
        this.listLandingPage = [
          { name: "Kupon", value: "kupon" }, { name: "Terdekat", value: "terdekat" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Bantuan", value: "bantuan" },
          { name: "Pesan Antar", value: "pesan_antar" },
          { name: "Tantangan", value: "tantangan" },
          { name: "Peluang", value: "peluang" },
          { name: "Main Bareng", value: "main_bareng" }
        ];
        this.formBannerGroup.controls['age_consumer_from'].enable();
        this.formBannerGroup.controls['age_consumer_to'].enable();
        this.listContentType.push(
          { name: "E-Wallet", value: "e_wallet" },
          { name: "Link to Web Browser", value: "link_web" }
        );
        this.formBannerGroup.controls['type_banner'].setValue('');
      }
      if (this.formBannerGroup.get("is_target_audience").value === true) {
        this.getAudience();
      };
      this.formBannerGroup.controls['landing_page'].setValue('');
    });

    this.formBannerGroup.controls['user_group'].setValue('retailer');
    this.formBannerGroup.controls['type_banner'].setValue('in-app-banner');

    this.formBannerGroup.controls['is_smoker'].valueChanges.debounceTime(50).subscribe(res => {
      // const yes = res.find(item => item === 'yes');
      // const no = res.find(item => item === 'no');

      // if (yes && no) {
      //   this.customAge = false;
      //   this.formBannerGroup.controls['age_consumer_from'].clearValidators();
      //   this.formBannerGroup.controls['age_consumer_to'].clearValidators();
      //   this.formBannerGroup.updateValueAndValidity();
      //   console.log('yes & no');
      // } else if (yes && !no) {
      //   this.customAge = true;
      //   this.formBannerGroup.controls['age_consumer_from'].setValidators([Validators.required, Validators.min(18)]);
      //   this.formBannerGroup.controls['age_consumer_to'].setValidators([Validators.required]);
      //   this.formBannerGroup.updateValueAndValidity();
      //   console.log('yes only');
      // } else if (!yes && no) {
      //   this.customAge = false;
      //   this.formBannerGroup.controls['age_consumer_from'].clearValidators();
      //   this.formBannerGroup.controls['age_consumer_to'].clearValidators();
      //   this.formBannerGroup.updateValueAndValidity();
      //   console.log('no only');
      // } else {
      //   this.customAge = false;
      //   this.formBannerGroup.controls['age_consumer_from'].clearValidators();
      //   this.formBannerGroup.controls['age_consumer_to'].clearValidators();
      //   this.formBannerGroup.updateValueAndValidity();
      // }

      if (res === 'yes') {
        this.formBannerGroup.controls['age_consumer_from'].setValidators([Validators.required, Validators.min(18)]);
        this.formBannerGroup.controls['age_consumer_to'].setValidators([Validators.required]);
        this.formBannerGroup.updateValueAndValidity();
      } else {
        this.formBannerGroup.controls['age_consumer_from'].setValidators([Validators.required, Validators.min(0)]);
        this.formBannerGroup.controls['age_consumer_to'].setValidators([Validators.required]);
        this.formBannerGroup.updateValueAndValidity();
      }
      if (this.formBannerGroup.get("is_target_audience").value === true) {
        this.getAudience();
        this.selected.splice(0, this.selected.length);
        this.audienceSelected = [];
      }
    })

    this.formBannerGroup.controls['age_consumer_from'].valueChanges.debounceTime(50).subscribe(res => {
      this.formBannerGroup.controls['age_consumer_to'].setValidators([Validators.required, Validators.min(res)]);
      this.formBannerGroup.updateValueAndValidity();
      if (this.formBannerGroup.get("is_target_audience").value === true) {
        this.getAudience();
        this.selected.splice(0, this.selected.length);
        this.audienceSelected = [];
      }
    })

    this.formBannerGroup.controls['url_iframe'].disable();
    this.formBannerGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formBannerGroup, this.formBannerErrors);
    })

    this.setMinDate();
    this.addArea();
    this.initAreaV2();
    this.bannerService.getListWallet().subscribe(res => {
      this.listContentWallet = res.data;
    });
    this.bannerService.getListBannerCustomer().subscribe(({data}) => {
      this.listCustomerBanners = data || [];
    })
    // this.getAudienceArea('zone', this.listLevelArea[0]);

    this.formBannerGroup.get('banner_selected').valueChanges.debounceTime(300).subscribe(res => {
      this.bannerSelected = res;
    })

    this.formBannerGroup.controls['status'].valueChanges.subscribe(res => {
      this.statusChange = true;
    });

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
    let wilayah = this.formBannerGroup.controls['areas'] as FormArray;
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
    switch (selection) {
      case 'zone':
        const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
        console.log('zone response', response);
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
    this.formBannerGroup.get("to").setValue("");
    this.minDate = this.formBannerGroup.get("from").value;
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
      this.formBannerGroup.controls['url_iframe'].disable();
    }

    if (value !== 'e_wallet') {
      this.formBannerGroup.controls['content_wallet'].disable();
      this.formBannerGroup.controls['button_text'].disable();
    }

    if (value === 'landing_page') {
      this.formBannerGroup.controls['landing_page'].setValue('');
    }
  }

  findInvalidControls() {
    const invalid = [];
    const controls = this.formBannerGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  async submit(status?: string) {
    console.log(this.formBannerGroup);
    let invalids = this.findInvalidControls();
    console.log('invalid form', invalids);
    if (this.formBannerGroup.valid && this.bannerSelected) {

      this.dataService.showLoading(true);
      await html2canvas(document.querySelector("#banner"), { scale: 3 }).then(canvas => {
        this.imageConverted = this.convertCanvasToImage(canvas);
        this.dataService.showLoading(false);
      });

      let body = {
        user_group: this.formBannerGroup.get('user_group').value,
        content_type: this.formBannerGroup.get('content_type').value
      }

      let fd = new FormData();
      fd.append('name', this.formBannerGroup.get('name').value);
      fd.append('image', this.imageConverted);
      fd.append('from', moment(this.formBannerGroup.get('from').value).format('YYYY-MM-DD'));
      fd.append('to', moment(this.formBannerGroup.get('to').value).format('YYYY-MM-DD'));
      fd.append('enable', this.formBannerGroup.get('enable').value);
      fd.append('status', this.statusChange ? (status === 'draft' ? status : this.formBannerGroup.get('status').value) : status);
      fd.append('user_group', this.formBannerGroup.get('user_group').value);
      fd.append('promo', this.formBannerGroup.get('promo').value);
      fd.append('content_type', body.content_type);

      if (body.content_type === 'static_page') {
        fd.append('title', this.formBannerGroup.get('title').value);
        fd.append('body', this.formBannerGroup.get('body').value);
      } else if (body.content_type === 'landing_page') {
        fd.append('landing_page', this.formBannerGroup.get('landing_page').value);
      } else if (body.content_type === 'iframe') {
        fd.append('iframe', this.formBannerGroup.get('url_iframe').value);
        fd.append('transfer_token', this.formBannerGroup.get('transfer_token').value);
      } else if (body.content_type === 'image') {
        if (this.imageContentTypeBase64) {
          fd.append('content_image', this.imageContentTypeBase64);
        } else {
          return this.dialogService.openSnackBar({ message: "Konten image belum dipilih" });
        }
      } else if (body.content_type === "e_wallet") {
        fd.append('body', this.formBannerGroup.get('body').value);
        fd.append('content_wallet', this.formBannerGroup.get('content_wallet').value);
        fd.append('button_text', this.formBannerGroup.get('button_text').value);
      } else if (body.content_type === 'link_web') {
        fd.append('url_link', this.formBannerGroup.get('url_iframe').value);
        fd.append('transfer_token', this.formBannerGroup.get('transfer_token').value);
      }
      else {

      }

      if (body.user_group === 'retailer') {
        fd.append('age', this.formBannerGroup.get('age').value);
        fd.append('type_banner', this.formBannerGroup.get('type_banner').value);
      }

      if (body.user_group === 'customer') {
        fd.append('gender', this.formBannerGroup.get('gender').value);
        fd.append('age_from', this.formBannerGroup.get('age_consumer_from').value);
        fd.append('age_to', this.formBannerGroup.get('age_consumer_to').value);
        fd.append('employee', this.formBannerGroup.get('employee').value);
        fd.append('smoker', this.formBannerGroup.get('is_smoker').value);
        fd.append('type_banner', null);
        if (this.formBannerGroup.get('is_smoker').value !== 'yes') {
          fd.append('verification', this.formBannerGroup.get('verification').value);
        }
      }

      if (this.formBannerGroup.get('type_banner').value === 'aktivasi-konsumen') {
        fd.append('banner_customer_id', this.formBannerGroup.get('banner_customer_id').value);
        fd.append('banner_customer_body', this.formBannerGroup.get('banner_customer_body').value);
      } else {
        fd.append('banner_customer_id', null);
        fd.append('banner_customer_body', null);
      }


      if (this.formBannerGroup.get('is_target_area').value) {
        if (body.user_group === "customer") {
          let ids = [];
          if (this.selectedAll) {
            ids = this.selectedAllId;
          } else {
            ids = this.selectedArea.map((item) => item.id);
          }
          ids.forEach((item) => {
            fd.append("areas[]", item);
          });
        }
      } else {
        let _areas = [];
        let areas = [];
        let value = this.formBannerGroup.getRawValue();

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

        areas.map(item => {
          if (body.user_group === 'retailer') {
            if (this.formBannerGroup.controls['group_type'].value === 'src') {
              fd.append("areas[src][]", item.value);
            } else {
              fd.append("areas[ws_downline][]", item.value);
            }
          } else {
            fd.append("areas[]", item.value);
          }
        })

      }

      // let areas = [];
      // let value = this.formBannerGroup.getRawValue();
      // value = Object.entries(value).map(([key, value]) => ({key, value}));

      // this.typeArea.map(type => {
      //   const filteredValue = value.filter(item => item.key === type && item.value);
      //   if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));
      // })

      // fd.append('areas[]', _.last(areas));
      // areas.map(item => {
      //   fd.append('areas[]', item)
      // })
      if (body.user_group === 'retailer') {
        fd.append("business_type", this.formBannerGroup.controls['group_type'].value);
      }

      if (this.formBannerGroup.get("is_target_audience").value) {
        fd.append('target_audience', "1");
        this.audienceSelected.map(aud => {
          fd.append('target_audiences[]', aud.id)
        });
      } else {
        fd.append('target_audience', "0");
      }

      this.bannerService.create(fd).subscribe(
        res => {
          this.loadingIndicator = false;
          this.router.navigate(["advertisement", "banner"]);
          this.dialogService.openSnackBar({ message: "Data Berhasil Disimpan" });
        }
      );

    } else {
      let msg;
      if (this.formBannerGroup.invalid) {
        msg = "Silakan lengkapi data terlebih dahulu!";
      } else if (!this.bannerSelected) {
        msg = "Gambar spanduk belum dipilih!";
      } else {
        msg = "Silakan lengkapi data terlebih dahulu!";
      }

      this.dialogService.openSnackBar({ message: msg });
      commonFormValidator.validateAllFields(this.formBannerGroup);
    }
  }

  convertCanvasToImage(canvas) {
    let image = new Image();
    image.src = canvas.toDataURL("image/jpeg");

    return image.src;
  }

  onChangeCheckbox(event) {
    const isSmoker = this.formBannerGroup.get('is_smoker') as FormArray;

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
      src: this.imageContentTypeBase64,
      caption: '',
      thumb: this.imageContentTypeBase64
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
    let keyAudience = this.formBannerGroup.get('user_group').value === 'retailer' ? 'getAudience' : 'getCustomerAudience';
    console.log('keyAudience', keyAudience);
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

    this.pagination['audience'] = this.formBannerGroup.get("user_group").value;
    if (this.formBannerGroup.controls['user_group'].value === 'retailer') {
      this.pagination["type"] = this.formBannerGroup.controls['group_type'].value;
    } else {
      if (this.pagination["type"]) delete this.pagination["type"];
    }

    if (this.formBannerGroup.get("user_group").value === 'retailer') {
      // this.pagination['retailer_type'] = this.formBannerGroup.get("group_type").value;
      delete this.pagination['customer_smoking'];
      delete this.pagination['customer_gender'];
      delete this.pagination['customer_age_from'];
      delete this.pagination['customer_age_to'];
    }
    if (this.formBannerGroup.get("user_group").value === 'customer') {
      delete this.pagination['customer_smoking'];
      delete this.pagination['customer_gender'];
      delete this.pagination['customer_age_from'];
      delete this.pagination['customer_age_to'];
      delete this.pagination['retailer_type'];
    }
    if (this.formBannerGroup.get("user_group").value === 'customer') {
      delete this.pagination['type'];
      this.pagination['customer_smoking'] = this.formBannerGroup.get("is_smoker").value;
      this.pagination['customer_gender'] = this.formBannerGroup.get("gender").value;
      this.pagination['customer_age_from'] = this.formBannerGroup.get("age_consumer_from").value;
      this.pagination['customer_age_to'] = this.formBannerGroup.get("age_consumer_to").value;
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
      this.dialogService.openSnackBar({ message: 'Pilih audience untuk di ekspor!' });
      return;
    }
    this.dataService.showLoading(true);
    let body = this.audienceSelected.map(aud => aud.id);
    // this.exportAccessCashier = true;
    try {
      const response = await this.bannerService[keyAudience]({ selected: body, audience: this.formBannerGroup.get("user_group").value }).toPromise();
      console.log('he', response.headers);
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `Banner_${this.formBannerGroup.get("user_group").value}_${new Date().toLocaleString()}.xls`);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
      // this.exportAccessCashier = false;
      this.dataService.showLoading(false);
    } catch (error) {
      // this.exportAccessCashier = false;
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
    dialogConfig.data = { audience: this.formBannerGroup.get("user_group").value };

    this.dialogRef = this.dialog.open(ImportAudienceBannerDialogComponent, dialogConfig);

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
