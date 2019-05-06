import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'underscore';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { BannerService } from '../../../../services/inapp-marketing/banner.service';
import { DateAdapter } from '@angular/material';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from '../../../../services/data.service';
import { TemplateBanner } from 'app/classes/banner-template';
import * as html2canvas from 'html2canvas';
import { Config } from 'app/classes/config';
import { Lightbox } from 'ngx-lightbox';

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
  indexDelete: any;

  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;

  lvl: any[];
  minDate: any;
  listStatus: any[] = [{name: 'Status Aktif', value: 'publish'}, {name: 'Status Non Aktif', value: 'draft'}];
  listUserGroup: any[] = [{ name: "Retailer", value: "retailer" }, { name: "Consumer", value: "customer" }];
  listUserGroupType: any[] = [{ name: "SRC", value: "src" }, { name: "WS Downline", value: "ws_downline" }];
  listContentType: any[] = [{ name: "Static Page", value: "static_page" }, { name: "Landing Page", value: "landing_page" }, { name: "Iframe", value: "iframe" }, { name: "Image", value: "image" }, { name: "Unlinked", value: "unlinked" }];
  listLandingPage: any[] = [];
  // listLandingPageConsumer: any[] = [{ name: "Kupon", value: "kupon" }, { name: "Terdekat", value: "terdekat" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Bantuan", value: "bantuan" }];
  listSmoker: any[] = [{ name: "Semua", value: "both" }, { name: "Merokok", value: "yes" }, { name: "Tidak Merokok", value: "no" }];
  listGender: any[] = [{ name: "Semua", value: "both" }, { name: "Laki-laki", value: "male" }, { name: "Perempuan", value: "female" }];
  listAge: any[] = [{ name: "18+", value: "18+" }, { name: "< 18", value: "18-" }];

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private bannerService: BannerService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private _lightbox: Lightbox
  ) { 
    this.adapter.setLocale('id');
    this.areaFromLogin = this.dataService.getFromStorage('profile')['area_type'];
    this.customAge = false;
    // this.validComboDrag = true;

    this.listLandingPage = [{ name: "Belanja", value: "belanja" }, { name: "Misi", value: "misi" }, { name: "Pelanggan", value: "pelanggan" }, { name: "Bantuan", value: "bantuan" }, { name: "Profil Saya", value: "profil_saya" }];

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
      areas: this.formBuilder.array([]),
      content_type: ["static_page", Validators.required],
      group_type: ["src"],
      landing_page: ["belanja"],
      url_iframe: ["", [Validators.required, Validators.pattern("(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?")]],
      // is_smoker: this.formBuilder.array([]),
      is_smoker: ["both"],
      gender: ["both"],
      age_consumer_from: ["", Validators.required],
      age_consumer_to: ["", Validators.required],
      banner_selected: this.formBuilder.group({
        "id": [""],
        "name": [""],
        "image": [""],
        "title": [""],
        "class": [""]
      })
    })

    this.formBannerGroup.controls['user_group'].valueChanges.debounceTime(50).subscribe(res => {
      if (res === 'retailer') {
        this.listLandingPage = [{ name: "Belanja", value: "belanja" }, { name: "Misi", value: "misi" }, { name: "Pelanggan", value: "pelanggan" }, { name: "Bantuan", value: "bantuan" }, { name: "Profil Saya", value: "profil_saya" }];
        this.formBannerGroup.controls['age_consumer_from'].disable();
        this.formBannerGroup.controls['age_consumer_to'].disable();
      } else {
        this.listLandingPage = [{ name: "Kupon", value: "kupon" }, { name: "Terdekat", value: "terdekat" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Bantuan", value: "bantuan" }];
        this.formBannerGroup.controls['age_consumer_from'].enable();
        this.formBannerGroup.controls['age_consumer_to'].enable();
      }

      this.formBannerGroup.controls['landing_page'].setValue('');
    });

    this.formBannerGroup.controls['user_group'].setValue('retailer');

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
    })

    this.formBannerGroup.controls['age_consumer_from'].valueChanges.debounceTime(50).subscribe(res => {
      this.formBannerGroup.controls['age_consumer_to'].setValidators([Validators.required, Validators.min(res)]);
      this.formBannerGroup.updateValueAndValidity();
    })

    this.formBannerGroup.controls['url_iframe'].disable();
    this.formBannerGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formBannerGroup, this.formBannerErrors);
    })

    this.setMinDate();
    this.addArea();
    // this.getAudienceArea('zone', this.listLevelArea[0]);

    this.formBannerGroup.get('banner_selected').valueChanges.debounceTime(300).subscribe(res => {
      this.bannerSelected = res;
    })

    this.formBannerGroup.controls['status'].valueChanges.subscribe(res => {
      this.statusChange = true;
    })
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
      captionDialog: `Apakah anda yakin untuk menghapus Salestree ${idx+1} ?`,
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  initArea(index) {
    let wilayah = this.formBannerGroup.controls['areas'] as FormArray;
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
    let wilayah = this.formBannerGroup.controls['areas'] as FormArray;
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

    if (value === 'iframe') {
      this.formBannerGroup.controls['url_iframe'].enable();
    } else {
      this.formBannerGroup.controls['url_iframe'].disable();
    }

    if (value === 'landing_page') {
      this.formBannerGroup.controls['landing_page'].setValue('');
    }
  }

  async submit(status?: string) {
    console.log(this.formBannerGroup)
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
      } else if (body.content_type === 'image') {
        if (this.imageContentTypeBase64) {
          fd.append('content_image', this.imageContentTypeBase64);
        } else {
          return this.dialogService.openSnackBar({ message: "Konten image belum dipilih" });
        }
      } else {

      }

      if (body.user_group === 'retailer') {
        fd.append('age', this.formBannerGroup.get('age').value);
      }
      
      if (body.user_group === 'customer') {
        fd.append('gender', this.formBannerGroup.get('gender').value);
        fd.append('age_from', this.formBannerGroup.get('age_consumer_from').value);
        fd.append('age_to', this.formBannerGroup.get('age_consumer_to').value);
        fd.append('smoker', this.formBannerGroup.get('is_smoker').value);
      }

      let _areas = [];
      let areas = [];
      let value = this.formBannerGroup.getRawValue();

      value.areas.map(item => {
        let obj = Object.entries(item).map(([key, value]) => ({key, value}))
        for (const val of this.typeArea) {
          const filteredValue = obj.find(xyz => val === xyz.key && xyz.value !== "");
          if (filteredValue) _areas.push(filteredValue)
        }

        areas.push(_.last(_areas));
        _areas = [];
      })

      let same = this.findDuplicate(areas.map(item => item.value));
      if (same.length > 0) {
        return this.dialogService.openSnackBar({ message: "Terdapat duplikat sales tree, mohon periksa kembali data anda!"});
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
    if (value && array.length){
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
      if(!object[item])
          object[item] = 0;
        object[item] += 1;
    })

    for (var prop in object) {
       if(object[prop] >= 2) {
           result.push(prop);
       }
    }

    return result;
  }

  imagesContentType(image) {
    var file:File = image;
    var myReader:FileReader = new FileReader();
  
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

}
