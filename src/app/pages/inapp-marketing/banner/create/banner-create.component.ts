import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'underscore';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { BannerService } from '../../../../services/inapp-marketing/banner.service';
import { DateAdapter } from '@angular/material';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from '../../../../services/data.service';
import { TemplateBanner } from 'app/classes/banner-template';
import * as html2canvas from 'html2canvas';

@Component({
  selector: 'app-banner-create',
  templateUrl: './banner-create.component.html',
  styleUrls: ['./banner-create.component.scss']
})
export class BannerCreateComponent {

  onLoad: boolean;
  loadingIndicator: boolean;
  showLoading: Boolean;
  listLevelArea: any[];
  list: any;
  list_region: any[];
  list_area: any[];
  list_district: any[];
  list_territory: any[];

  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;

  lvl: any[];
  minDate: any;
  listStatus: any[] = [{name: 'Status Aktif', value: 'publish'}, {name: 'Status Non Aktif', value: 'draft'}];
  listUserGroup: any[] = [{ name: "Retailer", value: "retailer" }, { name: "Customer", value: "customer" }];
  listAge: any[] = [{ name: "18+", value: "18+" }, { name: "Semua Umur", value: "18-" }];

  bannerTemplate: TemplateBanner = new TemplateBanner();
  templateBannerList: any[];
  bannerSelected: any;
  imageConverted: any;

  files: File;
  image: any;
  validComboDrag: boolean;

  statusChange: Boolean;

  formBannerGroup: FormGroup;
  formBannerErrors: any;

  public options: Object = {
    key: "mA4B4C1C3vA1E1F1C4B8D7D7E1E5D3ieeD-17A2sF-11==",
    placeholderText: "Isi Halaman",
    height: 150,
    quickInsertTags: [""],
    quickInsertButtons: [""],
    imageUpload: false,
    pasteImage: false,
    enter: "ENTER_BR",
    toolbarButtons: ['undo', 'redo' , '|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'paragraphFormat', 'align', 'formatOL', 'formatUL', '|', 'outdent', 'indent', 'clearFormatting', 'insertTable', 'quote'],
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private bannerService: BannerService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder
  ) { 
    this.adapter.setLocale('id');
    this.areaFromLogin = this.dataService.getFromStorage('profile')['area_type'];
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

    this.templateBannerList = this.bannerTemplate.getTemplateBanner('LOREM IPSUM');
  }

  ngOnInit() {
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
      national: ["", Validators.required],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""],
      banner_selected: this.formBuilder.group({
        "id": [""],
        "name": [""],
        "image": [""],
        "title": [""],
        "button_text": [""],
        "class": [""],
        "button_class": [""],
        "product": [""]
      })
    })

    this.formBannerGroup.controls['user_group'].valueChanges.debounceTime(50).subscribe(res => {
      if (res === 'retailer') {
        this.formBannerGroup.controls['age'].disable();
        this.formBannerGroup.controls['age'].setValue('18+');
      } else {
        this.formBannerGroup.controls['age'].enable();
      }
    })

    this.formBannerGroup.controls['user_group'].setValue('retailer');

    this.formBannerGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formBannerGroup, this.formBannerErrors);
    })

    this.setMinDate();
    this.initArea();
    // this.getAudienceArea('zone', this.listLevelArea[0]);

    this.formBannerGroup.get('banner_selected').valueChanges.debounceTime(300).subscribe(res => {
      this.bannerSelected = res;
    })

    this.formBannerGroup.controls['status'].valueChanges.subscribe(res => {
      this.statusChange = true;
    })
  }

  initArea() {
    this.areaFromLogin.map(item => {
      let level_desc = '';
      switch (item.type.trim()) {
        case 'national':
          level_desc = 'zone';
          this.formBannerGroup.get('national').setValue(item.id);
          this.formBannerGroup.get('national').disable();
          break
        case 'division':
          level_desc = 'region';
          this.formBannerGroup.get('zone').setValue(item.id);
          this.formBannerGroup.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          this.formBannerGroup.get('region').setValue(item.id);
          this.formBannerGroup.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          this.formBannerGroup.get('area').setValue(item.id);
          this.formBannerGroup.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          this.formBannerGroup.get('salespoint').setValue(item.id);
          this.formBannerGroup.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          this.formBannerGroup.get('district').setValue(item.id);
          this.formBannerGroup.get('district').disable();
          break;
        case 'territory':
          this.formBannerGroup.get('territory').setValue(item.id);
          this.formBannerGroup.get('territory').disable();
          break;
      }
      this.getAudienceArea(level_desc, item.id);
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
          this.bannerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
          item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.bannerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
          item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.bannerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
          item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.bannerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
          item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.bannerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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
          item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.bannerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
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

  changeImage(event) {
    this.readThis(event);
  }

  readThis(inputValue: any): void {
    var file:File = inputValue;
    var myReader:FileReader = new FileReader();
  
    myReader.onloadend = (e) => {
      this.image = myReader.result;
      if (this.bannerSelected['id'] === 5) {
        this.bannerSelected['product'] = this.image
        this.formBannerGroup.get('banner_selected').get('product').setValue(this.image);
      } else {
        this.bannerSelected['image'] = this.image;
        this.formBannerGroup.get('banner_selected').get('image').setValue(this.image);
      }
    }

    myReader.readAsDataURL(file);
  }

  selectBannerTemplate(item: any) {
    this.bannerSelected = item;
    this.formBannerGroup.get('banner_selected').setValue(item);
  }

  async submit(status?: string) {
    if (this.formBannerGroup.valid && this.bannerSelected) {

      this.showLoading = true;
      await html2canvas(document.querySelector("#banner"), { scale: 3 }).then(canvas => {
        this.imageConverted = this.convertCanvasToImage(canvas);
        this.showLoading = false;
      });

      let areas = [];
      let value = this.formBannerGroup.getRawValue();
      value = Object.entries(value).map(([key, value]) => ({key, value}));

      let fd = new FormData();
      fd.append('name', this.formBannerGroup.get('name').value);
      fd.append('image', this.imageConverted);
      fd.append('from', moment(this.formBannerGroup.get('from').value).format('YYYY-MM-DD'));
      fd.append('to', moment(this.formBannerGroup.get('to').value).format('YYYY-MM-DD'));
      fd.append('enable', this.formBannerGroup.get('enable').value);
      fd.append('target_page[type]', 'static_page');
      fd.append('status', this.statusChange ? (status === 'draft' ? status : this.formBannerGroup.get('status').value) : status);
      fd.append('title', this.formBannerGroup.get('title').value);
      fd.append('body', this.formBannerGroup.get('body').value);
      fd.append('user_group', this.formBannerGroup.get('user_group').value);
      fd.append('promo', this.formBannerGroup.get('promo').value);
      fd.append('age', this.formBannerGroup.get('age').disabled ? "18+" : this.formBannerGroup.get('age').value);
      fd.append('static_page', 'yes');

      this.typeArea.map(type => {
        const filteredValue = value.filter(item => item.key === type && item.value);
        if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));
      })

      fd.append('areas[]', _.last(areas));
      // areas.map(item => {
      //   fd.append('areas[]', item)
      // })
      
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

}
