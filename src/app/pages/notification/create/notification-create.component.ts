import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { NotificationService } from 'app/services/notification.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';

import * as _ from 'underscore';

@Component({
  selector: 'app-notification-create',
  templateUrl: './notification-create.component.html',
  styleUrls: ['./notification-create.component.scss']
})
export class NotificationCreateComponent {

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

  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;

  listLevelArea: any[];
  list: any;
  createLandingPage: any[] = [{ name: "Ya", value: 1 }, { name: "Tidak", value: 0 }];
  listUserGroup: any[] = [{ name: "Retailer", value: "retailer" }, { name: "Customer", value: "customer" }];
  listAge: any[] = [{ name: "18+", value: "18+" }, { name: "< 18", value: "18-" }];

  files: File;
  public options: Object = {
    placeholderText: "Isi Konten",
    height: 150,
    quickInsertTags: [""],
    quickInsertButtons: [""],
    imageUpload: false,
    pasteImage: false,
    enter: "ENTER_BR",
    toolbarButtons: ['undo', 'redo' , '|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'paragraphFormat', 'align', 'formatOL', 'formatUL', '|', 'outdent', 'indent', 'clearFormatting', 'insertTable', 'quote', 'html'],
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private notificationService: NotificationService
  ) {
    this.areaFromLogin = this.dataService.getFromStorage('profile')['area_type'];
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
        "name": "Sales National"
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
      static_page: [0, Validators.required],
      static_page_title: ["", Validators.required],
      static_page_body: ["", Validators.required],
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    });

    this.initArea();
    
    this.formNotification.get("static_page_title").disable();
    this.formNotification.get("static_page_body").disable();

    this.formNotification.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formNotification, this.formNotificationError);
    });
  }

  initArea() {
    this.areaFromLogin.map(item => {
      let level_desc = '';
      switch (item.type.trim()) {
        case 'national':
          level_desc = 'zone';
          this.formNotification.get('national').setValue(item.id);
          this.formNotification.get('national').disable();
          break
        case 'division':
          level_desc = 'region';
          this.formNotification.get('zone').setValue(item.id);
          this.formNotification.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          this.formNotification.get('region').setValue(item.id);
          this.formNotification.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          this.formNotification.get('area').setValue(item.id);
          this.formNotification.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          this.formNotification.get('salespoint').setValue(item.id);
          this.formNotification.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          this.formNotification.get('district').setValue(item.id);
          this.formNotification.get('district').disable();
          break;
        case 'territory':
          this.formNotification.get('territory').setValue(item.id);
          this.formNotification.get('territory').disable();
          break;
      }
      this.getAudienceArea(level_desc, item.id);
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
          this.notificationService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });

          this.formNotification.get('region').setValue('');
          this.formNotification.get('area').setValue('');
          this.formNotification.get('salespoint').setValue('');
          this.formNotification.get('district').setValue('');
          this.formNotification.get('territory').setValue('');
          this.list['region'] = [];
          this.list['area'] = [];
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'region':
          item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.notificationService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formNotification.get('region').setValue('');
          this.formNotification.get('area').setValue('');
          this.formNotification.get('salespoint').setValue('');
          this.formNotification.get('district').setValue('');
          this.formNotification.get('territory').setValue('');
          this.list['area'] = [];
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'area':
          item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.notificationService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formNotification.get('area').setValue('');
          this.formNotification.get('salespoint').setValue('');
          this.formNotification.get('district').setValue('');
          this.formNotification.get('territory').setValue('');
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'salespoint':
          item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.notificationService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formNotification.get('salespoint').setValue('');
          this.formNotification.get('district').setValue('');
          this.formNotification.get('territory').setValue('');
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'district':
          item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.notificationService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formNotification.get('district').setValue('');
          this.formNotification.get('territory').setValue('');
          this.list['territory'] = [];
        break;
      case 'territory':
          item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.notificationService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formNotification.get('territory').setValue('');
        break;
    
      default:
        break;
    }
  }

  removeImage(): void {
    this.files = undefined;
  }

  changeValue(): void {
    if (this.formNotification.get("static_page").value === 1) {
      this.formNotification.get("static_page_title").enable();
      this.formNotification.get("static_page_body").enable();
    } else {
      this.formNotification.get("static_page_title").disable();
      this.formNotification.get("static_page_body").disable();
      this.formNotification.get("static_page_title").setValue('');
      this.formNotification.get("static_page_body").setValue('');
    }
  }

  submit(): void {
    if (this.formNotification.valid) {
      let areas = [];
      let value = this.formNotification.getRawValue();
      value = Object.entries(value).map(([key, value]) => ({key, value}));
  
      this.typeArea.map(type => {
        const filteredValue = value.filter(item => item.key === type && item.value);
        if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));
      })

      let body: Object = {
        title: this.formNotification.get("title").value,
        body: this.formNotification.get("body").value,
        type: this.formNotification.get("user_group").value,
        age: this.formNotification.get("age").value,
        static_page: this.formNotification.get("static_page").value,
        // static_page_title: this.formNotification.get("static_page_title").value,
        // static_page_body: this.formNotification.get("static_page_body").value,
        area_id : _.last(areas)
      };

      if (body['static_page']) {
        body['static_page_title'] = this.formNotification.get("static_page_title").value;
        body['static_page_body'] = this.formNotification.get("static_page_body").value;
      }

      this.notificationService.create(body).subscribe(
        res => {
          this.router.navigate(["notifications"]);
          this.dialogService.openSnackBar({ message: "Data berhasil disimpan" });
        },
        err => {
          // this.dialogService.openSnackBar({ message: err.error.message });
          // this.loadingIndicator = false;
        }
      );
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formNotification);
    }
  }

}
