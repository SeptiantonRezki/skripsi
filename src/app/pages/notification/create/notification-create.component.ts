import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { NotificationService } from 'app/services/notification.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';
import { Lightbox } from 'ngx-lightbox';

import * as _ from 'underscore';
import { Config } from 'app/classes/config';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { Subject } from 'rxjs';
import { RetailerService } from 'app/services/user-management/retailer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { ImportPopUpAudienceComponent } from 'app/pages/popup-notification/import-pop-up-audience/import-pop-up-audience.component';

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

  userGroup: any[] = [
    { name: "Field Force", value: "field-force" },
    { name: "Wholesaler", value: "wholesaler" },
    { name: "Retailer", value: "retailer" },
    // { name: "Paguyuban", value: "paguyuban" },
    { name: "Customer", value: "customer" }
  ];

  dialogRef: any;
  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;
  indexDelete: any;

  listLevelArea: any[];
  list: any;
  listUserGroup: any[] = [{ name: "Retailer", value: "retailer" }, { name: "Customer", value: "customer" }];
  listAge: any[] = [{ name: "18+", value: "18+" }, { name: "< 18", value: "18-" }];
  listLandingPage: any[] = [];
  listContentType: any[] = [{ name: "Static Page", value: "static_page" }, { name: "Landing Page", value: "landing_page" }, { name: "Iframe", value: "iframe" }, { name: "Image", value: "image" }, { name: "Unlinked", value: "unlinked" }];

  files: File;
  imageContentType: File;
  imageContentTypeBase64: any;
  public options: Object = Config.FROALA_CONFIG;

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
    private formBuilder: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private _lightbox: Lightbox,
    private retailerService: RetailerService,
    private dialog: MatDialog
  ) {
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];
    this.formNotificationError = {
      title: {},
      body: {},
      user: {},
      user_group: {},
      age: {}
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
  }

  ngOnInit() {
    this.formNotification = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      user_group: ["retailer", Validators.required],
      age: ["18+", Validators.required],
      content_type: ["static_page", Validators.required],
      static_page_title: ["", Validators.required],
      static_page_body: ["", Validators.required],
      landing_page_value: ["belanja", Validators.required],
      url_iframe: ["", [Validators.required, Validators.pattern("(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?")]],
      areas: this.formBuilder.array([])
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

    this.formNotification.controls['user_group'].valueChanges.debounceTime(50).subscribe(res => {
      if (res === 'retailer') {
        this.listLandingPage = [{ name: "Belanja", value: "belanja" }, { name: "Misi", value: "misi" }, { name: "Pelanggan", value: "pelanggan" }, { name: "Bantuan", value: "bantuan" }, { name: "Profil Saya", value: "profil_saya" }];
        // this.formNotification.controls['landing_page_value'].disable();
        this.getAudience();
      } else {
        this.listLandingPage = [{ name: "Kupon", value: "kupon" }, { name: "Terdekat", value: "terdekat" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Bantuan", value: "bantuan" }];
        // this.formNotification.controls['landing_page_value'].enable();
        this.getAudience();
      }

      this.contentType(this.formNotification.controls['content_type'].value);
    });

    this.formNotification.controls['age'].valueChanges.debounceTime(50).subscribe(res => {
      this.getAudience();
    });

    this.formNotification.controls['user_group'].setValue('retailer');
    this.formNotification.controls['url_iframe'].disable();

    this.formNotification.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formNotification, this.formNotificationError);
    });

    this.formFilter.valueChanges.subscribe(filter => {
      this.getAudience();
    });

    this.addArea();
    this.initFilterArea();
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
    // this.getAudience();
  }

  async generataList(selection, id, index, type) {
    let item: any;
    let wilayah = this.formNotification.controls['areas'] as FormArray;
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

  removeImage(): void {
    this.files = undefined;
  }

  submit(): void {
    console.log(this.formNotification)
    if (this.formNotification.valid) {
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

      let body = {
        title: this.formNotification.get("title").value,
        body: this.formNotification.get("body").value,
        type: this.formNotification.get("user_group").value,
        content_type: this.formNotification.get('content_type').value,
        area_id: areas[0].value
      };

      if (body.type === 'customer') {
        body['age'] = this.formNotification.get("age").value;
      }

      if (body.content_type === 'static_page') {
        body['static_page_title'] = this.formNotification.get("static_page_title").value
        body['static_page_body'] = this.formNotification.get("static_page_body").value
      } else if (body.content_type === 'landing_page') {
        body['landing_page_value'] = this.formNotification.get('landing_page_value').value;
      } else if (body.content_type === 'iframe') {
        body['iframe_value'] = this.formNotification.get('url_iframe').value;
      } else if (body.content_type === 'image') {
        if (this.imageContentTypeBase64) {
          body['image_value'] = this.imageContentTypeBase64;
        } else {
          return this.dialogService.openSnackBar({ message: "Konten image belum dipilih" });
        }
      }

      body['target_audience'] = 1;
      body['target_audiences'] = this.audienceSelected.map(aud => aud.id);

      this.dataService.showLoading(true);
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
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formNotification);
    }
  }

  contentType(value) {
    if (this.imageContentTypeBase64 && this.imageContentType) {
      this.imageContentType = undefined;
      this.imageContentTypeBase64 = undefined;
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

  // Targeted Audience

  getAudience() {
    this.dataService.showLoading(true);
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.value !== "");
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
    this.pagination['audience'] = this.formNotification.get("user_group").value;
    if (this.formNotification.get("user_group").value === 'customer') {
      let age = this.formNotification.get("age").value === "18+" ? "18plus" : "18min";
      this.pagination['age'] = age;
    }
    else {
      if (this.pagination['age']) delete this.pagination['age'];
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
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.value !== "");
    this.pagination.area = areaSelected[areaSelected.length - 1].value;
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
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.value !== "");
    this.pagination.area = areaSelected[areaSelected.length - 1].value;

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
    let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.value !== "");
    this.pagination.area = areaSelected[areaSelected.length - 1].value;

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
    if (this.formNotification.get("user_group").value === 'customer') age = this.formNotification.get("age").value
    else {
      if (age) age = null
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
    dialogConfig.data = { audience: this.formNotification.get("user_group").value, type: 'push_notification' };

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
