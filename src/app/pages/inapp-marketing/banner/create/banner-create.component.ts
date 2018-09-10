import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'underscore';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { BannerService } from '../../../../services/inapp-marketing/banner.service';
import { DateAdapter } from '@angular/material';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-banner-create',
  templateUrl: './banner-create.component.html',
  styleUrls: ['./banner-create.component.scss']
})
export class BannerCreateComponent {

  onLoad: boolean;
  loadingIndicator: boolean;
  listLevelArea: any[];
  list: any;
  list_region: any[];
  list_area: any[];
  list_district: any[];
  list_territory: any[];

  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];

  lvl: any[];
  minDate: any;
  listStatus: any[] = [{name: 'Status Aktif', value: 1}, {name: 'Status Non Aktif', value: 0}];
  listUserGroup: any[] = [{ name: "Retailer", value: "retailer" }, { name: "Customer", value: "customer" }];
  listAge: any[] = [{ name: "18+", value: "18+" }, { name: "< 18", value: "18-" }];

  files: File;
  validComboDrag: boolean;

  formBannerGroup: FormGroup;
  formBannerErrors: any;

  public options: Object = {
    placeholderText: "Isi Halaman",
    height: 150,
    quickInsertTags: [""],
    quickInsertButtons: [""],
    imageUpload: false,
    pasteImage: false,
    toolbarButtons: ['undo', 'redo' , '|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'outdent', 'indent', 'clearFormatting', 'insertTable', 'html'],
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private bannerService: BannerService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder
  ) { 
    this.adapter.setLocale('id');
    // this.validComboDrag = true;

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
    this.formBannerGroup = this.formBuilder.group({
      name: ["", Validators.required],
      from: [moment(), Validators.required],
      to: ["", Validators.required],
      enable: [1, Validators.required],
      title: ["", Validators.required],
      body: ["", Validators.required],
      user_group: ["retailer", Validators.required],
      age: ["18+", Validators.required],
      promo: ["yes", Validators.required],
      national: [this.listLevelArea[0], Validators.required],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })

    this.formBannerGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formBannerGroup, this.formBannerErrors);
    })

    this.setMinDate();
    this.getAudienceArea('zone', this.listLevelArea[0]);
  }

  getAudienceArea(selection, item) {
    switch (selection) {
      case 'zone':
          this.bannerService.getListOtherChildren({ parent_id: item.id }).subscribe(res => {
            this.list[selection] = res;
          });

          this.formBannerGroup.get('region').setValue('');
          this.formBannerGroup.get('area').setValue('');
          this.formBannerGroup.get('salespoint').setValue('');
          this.formBannerGroup.get('district').setValue('');
          this.formBannerGroup.get('territory').setValue('');
          this.list['region'] = [];
          this.list['area'] = [];
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'region':
          if (item.name !== 'all') {
            this.bannerService.getListOtherChildren({ parent_id: item.id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = []
          }

          this.formBannerGroup.get('region').setValue('');
          this.formBannerGroup.get('area').setValue('');
          this.formBannerGroup.get('salespoint').setValue('');
          this.formBannerGroup.get('district').setValue('');
          this.formBannerGroup.get('territory').setValue('');
          this.list['area'] = [];
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'area':
          if (item.name !== 'all') {
            this.bannerService.getListOtherChildren({ parent_id: item.id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = []
          }

          this.formBannerGroup.get('area').setValue('');
          this.formBannerGroup.get('salespoint').setValue('');
          this.formBannerGroup.get('district').setValue('');
          this.formBannerGroup.get('territory').setValue('');
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'salespoint':
          if (item.name !== 'all') {
            this.bannerService.getListOtherChildren({ parent_id: item.id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = []
          }

          this.formBannerGroup.get('salespoint').setValue('');
          this.formBannerGroup.get('district').setValue('');
          this.formBannerGroup.get('territory').setValue('');
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'district':
          if (item.name !== 'all') {
            this.bannerService.getListOtherChildren({ parent_id: item.id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = []
          }

          this.formBannerGroup.get('district').setValue('');
          this.formBannerGroup.get('territory').setValue('');
          this.list['territory'] = [];
        break;
      case 'territory':
          if (item.name !== 'all') {
            this.bannerService.getListOtherChildren({ parent_id: item.id }).subscribe(res => {
              this.list[selection] = res;
            });
          } else {
            this.list[selection] = []
          }

          this.formBannerGroup.get('territory').setValue('');
        break;
    
      default:
        break;
    }
  }

  removeImage(): void {
    this.files = undefined;
  }

  setMinDate(): void {
    this.formBannerGroup.get("to").setValue("");
    this.minDate = this.formBannerGroup.get("from").value;
  }

  submit(status?: string): void {
    if (this.formBannerGroup.valid && this.files && this.files.size < 2000000) {

      let areas = [];
      let value = this.formBannerGroup.value;
      value = Object.entries(value).map(([key, value]) => ({key, value}));

      let fd = new FormData();
      fd.append('name', this.formBannerGroup.get('name').value);
      fd.append('image', this.files);
      fd.append('from', moment(this.formBannerGroup.get('from').value).format('YYYY-MM-DD'));
      fd.append('to', moment(this.formBannerGroup.get('to').value).format('YYYY-MM-DD'));
      fd.append('enable', this.formBannerGroup.get('enable').value);
      fd.append('target_page[type]', 'static_page');
      fd.append('status', status);
      fd.append('title', this.formBannerGroup.get('title').value);
      fd.append('body', this.formBannerGroup.get('body').value);
      fd.append('user_group', this.formBannerGroup.get('user_group').value);
      fd.append('promo', this.formBannerGroup.get('promo').value);
      fd.append('age', this.formBannerGroup.get('age').value);

      this.typeArea.map(type => {
        const filteredValue = value.filter(item => item.key === type && item.value);
        if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value.id))
      })
      
      areas.map(item => {
        fd.append('areas[]', item)
      })
      
      this.bannerService.create(fd).subscribe(
        res => {
          this.loadingIndicator = false;
          this.router.navigate(["advertisement", "banner"]);
          this.dialogService.openSnackBar({ message: "Data Berhasil Disimpan" });
        },
        err => {
          this.dialogService.openSnackBar({ message: err.error.message });
          this.loadingIndicator = false;
        }
      );

    } else {
      let msg;
      if (!this.formBannerGroup.valid) {
        msg = "Silakan lengkapi data terlebih dahulu!";
      } else if (!this.files) {
        msg = "Gambar spanduk belum dipilih!";
      } else if (this.files.size > 2000000) {
        msg = "Ukuran gambar tidak boleh melebihi 2mb!";
      } else {
        msg = "Silakan lengkapi data terlebih dahulu!";
      }

      this.dialogService.openSnackBar({ message: msg });
    }
  }

}
