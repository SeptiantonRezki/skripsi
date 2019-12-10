import { Component, ViewChild } from "@angular/core";
import { Validators, FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { DataService } from "../../../../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { RetailerService } from "../../../../services/user-management/retailer.service";
import { ReplaySubject, Subject } from "rxjs";
import { MatSelect } from "@angular/material";
import { GeneralService } from "app/services/general.service";
import { takeUntil, distinctUntilChanged } from "rxjs/operators";

@Component({
  selector: 'app-retailer-edit',
  templateUrl: './retailer-edit.component.html',
  styleUrls: ['./retailer-edit.component.scss']
})

export class RetailerEditComponent {
  formRetailer: FormGroup;
  formdataErrors: any;
  onLoad: Boolean;
  formBankAccount: FormGroup;
  formBankAccountError: any;

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

  listCashierAccess: any[] = [
    { name: 'YA', value: 1 },
    { name: 'TIDAK', value: 0 }
  ];

  listLevelArea: any[];
  list: any;

  areaFromLogin;
  detailAreaSelected: any[];

  isDetail: Boolean;
  listBanks: any[];
  filterBank: FormControl = new FormControl();
  filteredBanks: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  @ViewChild('singleSelect') singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();
  bankAccountLength: number = 0;

  npwp: FormControl = new FormControl();
  pkp: FormControl = new FormControl(-1);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private retailerService: RetailerService,
    private generalService: GeneralService
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

    this.formBankAccountError = {
      account_number: {},
      account_name: {},
      bank_name: {},
      branch: {}
    };

    this.detailRetailer = this.dataService.getFromStorage("detail_retailer");
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];

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
    this.getBanks();
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
      cashier: ["", Validators.required],
      InternalClassification: ["", Validators.required],
    });

    this.formBankAccount = this.formBuilder.group({
      account_number: [""],
      account_name: [""],
      bank_name: [""],
      branch: [""]
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

    this.formBankAccount
      .valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(res => {
        let total = 0;
        Object.keys(res).map(frm => {
          total += (res[frm] ? res[frm].length : "".length);
        });
        this.bankAccountLength = total;
      });

    this.filterBank.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringBanks();
      });

    this.npwp
      .valueChanges
      .debounceTime(500)
      .subscribe(res => {
        if (res) {
          let str = res.replace(/(\d{2})(\d{3})(\d{3})(\d{1})(\d{3})(\d{3})/, '$1.$2.$3.$4-$5.$6');
          this.npwp.setValue(str, { emitEvent: false });
        }
      })
  }

  getBanks() {
    this.generalService.getBanks()
      .subscribe(res => {
        this.listBanks = res.data;
        this.filteredBanks.next(this.listBanks.slice());
      }, err => console.log('err', err));
  }

  filteringBanks() {
    if (!this.listBanks) {
      return;
    }
    // get the search keyword
    let search = this.filterBank.value;
    if (!search) {
      this.filteredBanks.next(this.listBanks.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredBanks.next(
      this.listBanks.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
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
      business_code: this.detailRetailer.classification === 'SRC' ? this.detailRetailer.code : "",
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
      cashier: this.detailRetailer.cashier
    });

    this.formBankAccount.setValue({
      account_number: this.detailRetailer.bank_account_number,
      account_name: this.detailRetailer.bank_account_name,
      bank_name: this.detailRetailer.bank_name,
      branch: this.detailRetailer.branch
    });

    this.npwp.setValue(this.detailRetailer.npwp ? this.detailRetailer.npwp : '');
    this.pkp.setValue(this.detailRetailer.pkp ? this.detailRetailer.pkp : -1);

    if (this.detailRetailer.classification === 'NON-SRC') {
      this.formRetailer.controls['business_code'].disable();
    }

    if (this.isDetail) {
      this.formRetailer.disable();
      this.formBankAccount.disable();
      this.npwp.disable();
      this.pkp.disable();
    }
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


  classificationSelectionChange(event) {
    if (event.value === 'NON-SRC') {
      this.formRetailer.controls['business_code'].setValue("");
      this.formRetailer.controls['business_code'].disable();
    } else {
      this.formRetailer.controls['business_code'].enable();
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.formRetailer.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  bindFormBankAccountValidator() {
    if (this.bankAccountLength > 0) {
      this.formBankAccount.get("account_number").setValidators(Validators.required);
      this.formBankAccount.get("account_number").updateValueAndValidity();
      this.formBankAccount.get("account_name").setValidators(Validators.required);
      this.formBankAccount.get("account_name").updateValueAndValidity();
      this.formBankAccount.get("bank_name").setValidators(Validators.required);
      this.formBankAccount.get("bank_name").updateValueAndValidity();
      this.formBankAccount.get("branch").setValidators(Validators.required);
      this.formBankAccount.get("branch").updateValueAndValidity();
      commonFormValidator.validateAllFields(this.formBankAccount);
    } else {
      this.formBankAccount.get("account_number").setValidators([]);
      this.formBankAccount.get("account_number").updateValueAndValidity();
      this.formBankAccount.get("account_name").setValidators([]);
      this.formBankAccount.get("account_name").updateValueAndValidity();
      this.formBankAccount.get("bank_name").setValidators([]);
      this.formBankAccount.get("bank_name").updateValueAndValidity();
      this.formBankAccount.get("branch").setValidators([]);
      this.formBankAccount.get("branch").updateValueAndValidity();
      commonFormValidator.validateAllFields(this.formBankAccount);
    }
  }

  clearBankName() {
    this.formBankAccount.get('bank_name').setValue(null);
    this.bindFormBankAccountValidator();
  }

  submit() {
    console.log('invalid form field', this.findInvalidControls());
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
        InternalClassification: this.formRetailer.get("InternalClassification").value,
        cashier: this.formRetailer.get("cashier").value,
        bank_account_name: this.formBankAccount.get("account_name").value === "" ? null : this.formBankAccount.get("account_name").value,
        bank_account_number: this.formBankAccount.get("account_number").value === "" ? null : this.formBankAccount.get("account_number").value,
        bank_name: this.formBankAccount.get("bank_name").value === "" ? null : this.formBankAccount.get("bank_name").value,
        branch: this.formBankAccount.get("branch").value === "" ? null : this.formBankAccount.get("branch").value
      };

      console.log(body);
      if (this.pkp.value === -1) {
        if (body['pkp']) delete body['pkp'];
      }
      if (this.pkp.value === 0 || this.pkp.value === 1) {
        body['pkp'] = this.pkp.value;
      }

      if (this.pkp.value === 1) {
        body['npwp'] = this.npwp.value;
      }

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
