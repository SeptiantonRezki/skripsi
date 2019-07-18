import { Component } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../../../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { RetailerService } from "../../../../services/user-management/retailer.service";

@Component({
  selector: 'app-retailer-edit',
  templateUrl: './retailer-edit.component.html',
  styleUrls: ['./retailer-edit.component.scss']
})

export class RetailerEditComponent {
  formRetailer: FormGroup;
  formdataErrors: any;
  onLoad: Boolean;

  detailRetailer: any;
  listStatus: any[] = [
    { name: "Status Aktif", value: "active" },
    { name: "Status Non Aktif", value: "inactive" },
    { name: "Status Belum terdaftar", value: "passive" }
  ];

  listType: any[] = [
    { name: "General Trade", value: "General Trade" },
    { name: "Modern Trade", value: "Modern Trade" }
  ];

  listIC: any[] = [
    { name: "NON-SRC", value: "NON-SRC" },
    { name: "SRC", value: "SRC" }
  ];

  listLevelArea: any[];
  list: any;

  areaFromLogin;
  detailAreaSelected: any[];

  isDetail: Boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private retailerService: RetailerService
  ) {
    this.onLoad = false;
    this.formdataErrors = {
      name: {},
      address: {},
      business_code: {},
      owner: {},
      // phone: {},
      status: {},
      area: {},
      latitude: {},
      longitude: {},
      // type: {},
      InternalClassification: {}
    };
    this.detailRetailer = this.dataService.getFromStorage("detail_retailer");
    this.areaFromLogin = this.dataService.getFromStorage('profile')['area_type'];

    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

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

  async ngOnInit() {
    let regex = new RegExp(/[0-9]/g);

    this.formRetailer = this.formBuilder.group({
      name: ["", Validators.required],
      address: ["", Validators.required],
      business_code: ["", Validators.required],
      owner: ["", Validators.required],
      phone: [""],
      status: ["", Validators.required],
      national: ["", Validators.required],
      zone: ["", Validators.required],
      salespoint: ["", Validators.required],
      region: ["", Validators.required],
      area: ["", Validators.required],
      district: ["", Validators.required],
      territory: ["", Validators.required],
      latitude: [""],
      longitude: [""],
      type: [""],
      InternalClassification: ["", Validators.required]
    });
    this.formRetailer.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formRetailer, this.formdataErrors);
    });

    this.retailerService.show({ retailer_id: this.dataService.getFromStorage("id_retailer") }).subscribe(async res => {

      // console.log('show', res);
      this.detailRetailer = res.data;
      console.log('detail_retailer', this.detailRetailer);
      // this.setDetailRetailer();
      try {
        if (this.detailRetailer.refferal_code) {
          const response = await this.retailerService.getConsumerList({ referral_code: this.detailRetailer.refferal_code }).toPromise();
          this.detailRetailer["customers"] = response.data;
        }
      } catch (error) {
        throw error;
      }

      if (this.detailRetailer.status === 'not-registered') {
        this.formRetailer.get('status').disable();
        this.listStatus = [
          { name: "Status Aktif", value: "active" },
          { name: "Status Non Aktif", value: "inactive" },
          { name: "Status Belum terdaftar", value: "not-registered" }
        ];
      } else if (this.detailRetailer.status === 'active') {
        this.formRetailer.controls['phone'].setValidators(Validators.required);
        this.formRetailer.updateValueAndValidity();
      }
      this.onLoad = true;
      this.retailerService.getParentArea({ parent: this.detailRetailer.area_code[0] }).subscribe(res => {
        this.detailAreaSelected = res.data;
        this.onLoad = false;

        this.initArea();
        this.initFormGroup();

        this.formRetailer.get('phone').valueChanges.debounceTime(500).subscribe(res => {
          if (res.match(regex)) {
            if (res.substring(0, 1) == '0') {
              let phone = res.substring(1);
              this.formRetailer.get('phone').setValue(phone, { emitEvent: false });
            }
          }
        })
      })
    });
  }

  initArea() {
    this.areaFromLogin.map(item => {
      console.log('item', item);
      switch (item.type.trim()) {
        case 'national':
          this.formRetailer.get('national').disable();
          // this.formRetailer.get('national').setValue(item.id);
          break
        case 'division':
          this.formRetailer.get('zone').disable();
          // this.formRetailer.get('national').setValue(item.id);
          break;
        case 'region':
          this.formRetailer.get('region').disable();
          // this.formRetailer.get('national').setValue(item.id);
          break;
        case 'area':
          this.formRetailer.get('area').disable();
          // this.formRetailer.get('national').setValue(item.id);
          break;
        case 'salespoint':
          this.formRetailer.get('salespoint').disable();
          // this.formRetailer.get('national').setValue(item.id);
          break;
        case 'district':
          this.formRetailer.get('district').disable();
          // this.formRetailer.get('national').setValue(item.id);
          break;
        case 'territory':
          this.formRetailer.get('territory').disable();
          // this.formRetailer.get('national').setValue(item.id);
          break;
      }
    })
  }

  initFormGroup() {
    this.detailAreaSelected.map(item => {
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
      this.getAudienceArea(level_desc, item.id);
    });
    console.log(this.detailRetailer.phone);
    this.formRetailer.setValue({
      name: this.detailRetailer.name,
      address: this.detailRetailer.address,
      business_code: this.detailRetailer.code,
      owner: this.detailRetailer.owner,
      phone: (this.detailRetailer.phone) ? (this.isDetail ? this.detailRetailer.phone : this.detailRetailer.phone.split("+62")[1]) : '',
      status: this.detailRetailer.status,
      latitude: this.detailRetailer.latitude,
      longitude: this.detailRetailer.longitude,
      type: this.detailRetailer.type_hms,
      InternalClassification: this.detailRetailer.classification,
      national: this.getArea('national'),
      zone: this.getArea('division'),
      region: this.getArea('region'),
      area: this.getArea('area'),
      salespoint: this.getArea('salespoint'),
      district: this.getArea('district'),
      territory: this.getArea('teritory'),
    });

    console.log(this.formRetailer);

    if (this.isDetail) this.formRetailer.disable();
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          this.list[selection] = res.filter(item => item.name !== 'all');
        });

        this.formRetailer.get('region').setValue('');
        this.formRetailer.get('area').setValue('');
        this.formRetailer.get('salespoint').setValue('');
        this.formRetailer.get('district').setValue('');
        this.formRetailer.get('territory').setValue('');
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
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formRetailer.get('region').setValue('');
        this.formRetailer.get('area').setValue('');
        this.formRetailer.get('salespoint').setValue('');
        this.formRetailer.get('district').setValue('');
        this.formRetailer.get('territory').setValue('');
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'area':
        item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formRetailer.get('area').setValue('');
        this.formRetailer.get('salespoint').setValue('');
        this.formRetailer.get('district').setValue('');
        this.formRetailer.get('territory').setValue('');
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'salespoint':
        item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formRetailer.get('salespoint').setValue('');
        this.formRetailer.get('district').setValue('');
        this.formRetailer.get('territory').setValue('');
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'district':
        item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formRetailer.get('district').setValue('');
        this.formRetailer.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formRetailer.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  getArea(selection) {
    return this.detailAreaSelected.filter(item => item.level_desc === selection).map(item => item.id)[0]
  }

  // setDetailRetailer() {
  //   this.formRetailer.setValue({
  //     name: this.detailRetailer.name,
  //     address: this.detailRetailer.address,
  //     business_code: this.detailRetailer.code,
  //     owner: this.detailRetailer.owner,
  //     phone: this.detailRetailer.phone.replace('+62', ''),
  //     status: this.detailRetailer.status,
  //     area: this.detailRetailer.area_id[0],
  //     latitude: this.detailRetailer.latitude,
  //     longitude: this.detailRetailer.longitude,
  //     type: this.detailRetailer.type_hms,
  //     InternalClassification: this.detailRetailer.classification
  //   });

  //   // console.log(this.formRetailer.get('status').value);
  // }

  submit() {
    if (this.formRetailer.valid) {
      let body = {
        _method: "PUT",
        name: this.formRetailer.get("name").value,
        address: this.formRetailer.get("address").value,
        business_code: this.formRetailer.get("business_code").value,
        owner: this.formRetailer.get("owner").value,
        phone: this.formRetailer.getRawValue()["phone"] ? `+62${this.formRetailer.getRawValue()["phone"]}` : '',
        status: this.formRetailer.get("status").value,
        areas: [this.formRetailer.get("territory").value],
        latitude: this.formRetailer.get("latitude").value ? this.formRetailer.get("latitude").value : null,
        longitude: this.formRetailer.get("longitude").value ? this.formRetailer.get("longitude").value : null,
        type: "General Trade",
        InternalClassification: this.formRetailer.get("InternalClassification").value
      };

      this.retailerService.put(body, { retailer_id: this.detailRetailer.id }).subscribe(
        res => {
          this.dialogService.openSnackBar({
            message: "Data berhasil diubah"
          });
          this.router.navigate(["user-management", "retailer"]);
          window.localStorage.removeItem("detail_retailer");
        },
        err => { }
      );
    } else {
      this.dialogService.openSnackBar({
        message: "Silakan lengkapi data terlebih dahulu!"
      });
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
}
