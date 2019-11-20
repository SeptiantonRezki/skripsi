import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Config } from 'app/classes/config';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { NotificationService } from 'app/services/notification.service';
import { DateAdapter, MatDialogConfig, MatDialog } from '@angular/material';
import { Lightbox } from 'ngx-lightbox';
import * as moment from 'moment';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import * as _ from 'underscore';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ImportPopUpAudienceComponent } from '../import-pop-up-audience/import-pop-up-audience.component';
import { RetailerService } from 'app/services/user-management/retailer.service';

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
  listUserGroup: any[] = [{ name: "Wholesaler", value: "wholesaler" }, { name: "Retailer", value: "retailer" }, { name: "Consumer", value: "customer" }];
  listUserGroupType: any[] = [{ name: "SRC", value: "src" }, { name: "WS Downline", value: "downline" }];
  listContentType: any[] = [];
  listLandingPage: any[] = [];
  listGender: any[] = [{ name: "Semua", value: "both" }, { name: "Laki-laki", value: "male" }, { name: "Perempuan", value: "female" }];
  listSmoker: any[] = [{ name: "Semua", value: "both" }, { name: "Merokok", value: "yes" }, { name: "Tidak Merokok", value: "no" }];

  imageConverted: any;

  files: File;
  imageContentType: File;
  imageContentTypeBase64: any;
  image: any;
  validComboDrag: boolean;

  customAge: Boolean;

  formPopupGroup: FormGroup;
  formPopupErrors: any;

  public options: Object = Config.FROALA_CONFIG;

  idPopup: any;
  isDetail: Boolean;

  detailPopup: any;
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
    private retailerService: RetailerService
  ) {
    this.adapter.setLocale('id');
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];
    this.customAge = false;
    this.onLoad = true;
    // this.minDate = moment();
    // this.validComboDrag = true;

    this.listLandingPage = [{ name: "Belanja", value: "belanja" }, { name: "Misi", value: "misi" }, { name: "Pelanggan", value: "pelanggan" }, { name: "Bantuan", value: "bantuan" }, { name: "Ubah Profil", value: "profil_saya" }];

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
    this.formPopupGroup = this.formBuilder.group({
      date: [moment(), Validators.required],
      time: ["00:00", Validators.required],
      date_ws_downline: [moment(), Validators.required],
      time_ws_downline: ["00:00", Validators.required],
      positive_button: ["", Validators.required],
      negative_button: ["", Validators.required],
      title: ["", Validators.required],
      body: ["", Validators.required],
      user_group: ["", Validators.required],
      areas: this.formBuilder.array([]),
      content_type: ["", Validators.required],
      group_type: ["src"],
      landing_page: ["belanja", Validators.required],
      url_iframe: ["", [Validators.required, Validators.pattern("(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?")]],
      // is_smoker: this.formBuilder.array([]),
      is_smoker: ["both"],
      gender: ["both"],
      age_consumer_from: ["", Validators.required],
      age_consumer_to: ["", Validators.required],
      is_target_audience: [false]
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

    this.formPopupGroup.controls['user_group'].valueChanges.debounceTime(50).subscribe(res => {
      this.selected.splice(0, this.selected.length);
      this.audienceSelected = [];
      if (res === 'wholesaler') {
        this.listContentType = [{ name: "Iframe", value: "iframe" }];
        this.formPopupGroup.controls['age_consumer_from'].setValue('');
        this.formPopupGroup.controls['age_consumer_to'].setValue('');
        this.formPopupGroup.controls['landing_page'].setValue('');
        this.formPopupGroup.controls['date_ws_downline'].setValue('');

        this.formPopupGroup.controls['age_consumer_from'].disable();
        this.formPopupGroup.controls['age_consumer_to'].disable();
        this.formPopupGroup.controls['landing_page'].disable();
        this.formPopupGroup.controls['date_ws_downline'].disable();

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
        this.listContentType = [{ name: "Static Page", value: "static-page" }, { name: "Landing Page", value: "landing-page" }, { name: "Iframe", value: "iframe" }];
        this.listLandingPage = [{ name: "Kupon", value: "kupon" }, { name: "Terdekat", value: "terdekat" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Bantuan", value: "bantuan" }];
        this.formPopupGroup.controls['age_consumer_from'].enable();
        this.formPopupGroup.controls['age_consumer_to'].enable();
        this.formPopupGroup.controls['date_ws_downline'].disable();

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

      if (res === 'retailer') {
        this.listContentType = [{ name: "Static Page", value: "static-page" }, { name: "Landing Page", value: "landing-page" }, { name: "Iframe", value: "iframe" }];
        this.listLandingPage = [{ name: "Belanja", value: "belanja" }, { name: "Misi", value: "misi" }, { name: "Pelanggan", value: "pelanggan" }, { name: "Bantuan", value: "bantuan" }, { name: "Profil Saya", value: "profil_saya" }];
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

        if (this.formPopupGroup.controls['group_type'].value === 'downline') {
          this.formPopupGroup.controls['date_ws_downline'].enable();
        }
      }

      if (!this.onLoad) {
        this.formPopupGroup.controls['landing_page'].setValue('');
      }

      if (this.formPopupGroup.controls["is_target_audience"].value === true) this.getAudience();
    });

    // this.formPopupGroup.controls['user_group'].setValue('wholesaler');

    this.formPopupGroup.controls['is_smoker'].valueChanges.debounceTime(50).subscribe(res => {
      if (!this.onLoad) {
        this.formPopupGroup.controls['age_consumer_from'].setValue('');
        this.formPopupGroup.controls['age_consumer_to'].setValue('');
      }

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
        this.selected.splice(0, this.selected.length);
        this.audienceSelected = [];
      }
    })

    this.formPopupGroup.controls['age_consumer_from'].valueChanges.debounceTime(50).subscribe(res => {
      this.formPopupGroup.controls['age_consumer_to'].setValidators([Validators.required, Validators.min(res)]);
      this.formPopupGroup.updateValueAndValidity();
      if (this.formPopupGroup.get("is_target_audience").value === true) {
        this.getAudience();
        this.selected.splice(0, this.selected.length);
        this.audienceSelected = [];
      }
    })

    this.formPopupGroup.controls['url_iframe'].disable();
    this.formPopupGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formPopupGroup, this.formPopupErrors);
    })

    this.formPopupGroup.controls['group_type'].valueChanges.debounceTime(50).subscribe(res => {
      if (!this.onLoad) {
        if (res === 'downline') {
          this.formPopupGroup.controls['date_ws_downline'].enable();
        } else {
          this.formPopupGroup.controls['date_ws_downline'].setValue('');
          this.formPopupGroup.controls['date_ws_downline'].disable();
        }
      }

      if (this.formPopupGroup.get("is_target_audience").value === true) {
        this.getAudience();
        this.selected.splice(0, this.selected.length);
        this.audienceSelected = [];
      }
    });

    this.formFilter.valueChanges.subscribe(filter => {
      if (this.formPopupGroup.get("is_target_audience").value === true) this.getAudience();
    });

    this.initFilterArea();

    this.getDetails();
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

      this.formPopupGroup.controls['positive_button'].setValue(response.positive_text);
      this.formPopupGroup.controls['negative_button'].setValue(response.negative_text);
      this.formPopupGroup.controls['title'].setValue(response.title);
      this.formPopupGroup.controls['user_group'].setValue(response.type);
      this.formPopupGroup.controls['content_type'].setValue(response.action);
      if (this.detailPopup.target_audience && this.detailPopup.target_audience === 1) {
        this.formPopupGroup.controls["is_target_audience"].setValue(true);
        this.audienceSelected = this.detailPopup.audience.map(aud => ({ id: aud.audience_id }));
        console.log('this auddd', this.audienceSelected);
      }
      if (response.date) {
        const date = moment(response.date);
        this.formPopupGroup.get('date').setValue(date);
        this.formPopupGroup.get('time').setValue(date.format('HH:mm'));
      }

      if (response.type === 'retailer') {
        const group_type = response.areas.map(item => item.pivot.type)[0];
        this.formPopupGroup.get('group_type').setValue(response.retailer_type);

        if (group_type === 'downline') {
          const date_ws_downline = moment(response.date_ws_downline);
          this.formPopupGroup.get('date_ws_downline').setValue(date_ws_downline);
          this.formPopupGroup.get('time_ws_downline').setValue(date_ws_downline.format('HH:mm'));
        }
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
        this.formPopupGroup.get('is_smoker').setValue(smoker_type);
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
      }

      for (const { val, index } of response.areas.map((val, index) => ({ val, index }))) {
        const response = await this.notificationService.getParentArea({ parent: val.id }).toPromise();
        let wilayah = this.formPopupGroup.controls['areas'] as FormArray;

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
      }

      if (response.areas.length === 0) {
        this.addArea();
      }

      // if (this.detailProduct.areas.length === 0) {
      //   this.addArea();
      // }

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
    let wilayah = this.formPopupGroup.controls['areas'] as FormArray;
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
    let wilayah = this.formPopupGroup.controls['areas'] as FormArray;
    this.areaFromLogin.map(item => {
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
    let wilayah = this.formPopupGroup.controls['areas'] as FormArray;
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
    let wilayah = this.formPopupGroup.controls['areas'] as FormArray;
    wilayah.removeAt(this.indexDelete);
    this.dialogService.brodcastCloseConfirmation();
  }

  clearFormArray = (index, selection) => {
    let wilayah = this.formPopupGroup.controls['areas'] as FormArray;
    let list = wilayah.at(index).get(selection) as FormArray;
    while (list.length > 0) {
      list.removeAt(list.length - 1);
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

  submit() {
    console.log(this.formPopupGroup);
    if ((this.formPopupGroup.valid && this.imageConverted === undefined) || (this.formPopupGroup.valid && this.imageConverted)) {

      this.dataService.showLoading(true);

      let body = {
        _method: 'PUT',
        title: this.formPopupGroup.get('title').value,
        type: this.formPopupGroup.get('user_group').value,
        action: this.formPopupGroup.get('content_type').value,
        positive_text: this.formPopupGroup.get('positive_button').value,
        negative_text: this.formPopupGroup.get('negative_button').value,
      }

      if (this.imageConverted) {
        body['image'] = this.imageConverted;
      }

      if (body.type === 'retailer') {
        body['retailer_type'] = this.formPopupGroup.get('group_type').value;

        if (body['retailer_type'] === 'downline') {
          body['date_ws_downline'] = `${moment(this.formPopupGroup.get('date_ws_downline').value).format('YYYY-MM-DD')} ${this.formPopupGroup.get('time_ws_downline').value}:00`;
        } else {
          body['date'] = `${moment(this.formPopupGroup.get('date').value).format('YYYY-MM-DD')} ${this.formPopupGroup.get('time').value}:00`;
        }
      } else {
        body['date'] = `${moment(this.formPopupGroup.get('date').value).format('YYYY-MM-DD')} ${this.formPopupGroup.get('time').value}:00`;
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
      }

      if (body.action === 'static-page') {
        body['action_data'] = this.formPopupGroup.get('body').value;
      } else if (body.action === 'landing-page') {
        body['action_data'] = this.formPopupGroup.get('landing_page').value;
      } else if (body.action === 'iframe') {
        body['action_data'] = this.formPopupGroup.get('url_iframe').value;
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
        return this.dialogService.openSnackBar({ message: "Terdapat duplikat sales tree, mohon periksa kembali data anda!" });
      }

      if (body.type === 'retailer') {
        if (body['retailer_type'] === 'src') {
          body['area_id'] = areas.map(item => item.value);
        } else {
          body['area_id_downline'] = areas.map(item => item.value);
        }
      } else {
        body['area_id'] = areas.map(item => item.value);
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
          this.dialogService.openSnackBar({ message: "Data Berhasil Disimpan" });
        },
        err => {
          this.dataService.showLoading(false);
        }
      );

    } else {
      let msg;
      if (this.formPopupGroup.invalid) {
        msg = "Silakan lengkapi data terlebih dahulu!";
      } else if (!this.files) {
        msg = "Gambar popup notifikasi belum dipilih!";
      } else {
        msg = "Silakan lengkapi data terlebih dahulu!";
      }

      this.dialogService.openSnackBar({ message: msg });
      commonFormValidator.validateAllFields(this.formPopupGroup);
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

  getAudience() {
    this.dataService.showLoading(true);
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.value !== "");
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
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
    this.notificationService.getPopupAudience(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.dataService.showLoading(false);
    }, err => {
      console.log('err', err);
      this.dataService.showLoading(true);
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
    if (event.checked) this.getAudience();
  }

  async export() {
    if (this.audienceSelected.length === 0) {
      this.dialogService.openSnackBar({ message: 'Pilih audience untuk di ekspor!' });
      return;
    }
    this.dataService.showLoading(true);
    let body = this.audienceSelected.map(aud => aud.id);
    this.exportPopUpNotif = true;
    try {
      const response = await this.notificationService.exportAudience({ selected: body, audience: this.formPopupGroup.get("user_group").value }).toPromise();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `PopUpNotification_${this.formPopupGroup.get("user_group").value}_${new Date().toLocaleString()}.xls`);
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
    dialogConfig.data = { audience: this.formPopupGroup.get("user_group").value };

    this.dialogRef = this.dialog.open(ImportPopUpAudienceComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.audienceSelected = this.audienceSelected.concat(response);
        this.onSelect({ selected: this.audienceSelected });
        if (response.data) {
          this.dialogService.openSnackBar({ message: 'File berhasil diimport' });
        }
      }
    });
  }

}
