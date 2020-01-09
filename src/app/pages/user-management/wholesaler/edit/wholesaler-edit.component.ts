import { Component, ViewChild } from "@angular/core";
import { Validators, FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { DataService } from "../../../../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { WholesalerService } from "../../../../services/user-management/wholesaler.service";
import { Utils } from "app/classes/utils";
import { ReplaySubject, Subject } from "rxjs";
import { MatSelect } from "@angular/material";
import { takeUntil, distinctUntilChanged, debounceTime } from "rxjs/operators";
import { GeneralService } from "app/services/general.service";

@Component({
  selector: 'app-wholesaler-edit',
  templateUrl: './wholesaler-edit.component.html',
  styleUrls: ['./wholesaler-edit.component.scss']
})
export class WholesalerEditComponent {
  formWs: FormGroup;
  formdataErrors: any;
  onLoad: Boolean;
  formBankAccount: FormGroup;
  formBankAccountError: any;
  frmTotalBranch: FormControl = new FormControl();

  detailWholesaler: any;
  listStatus: any[] = [
    { name: "Status Aktif", value: "active" },
    { name: "Status Non Aktif", value: "inactive" },
    { name: "Status Belum Terdaftar", value: "not-registered" }
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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private wholesalerService: WholesalerService,
    private generalService: GeneralService
  ) {
    this.formdataErrors = {
      name: {},
      address: {},
      code: {},
      owner: {},
      phone: {},
      status: {},
      national: {},
      zone: {},
      region: {},
      area: {},
      salespoint: {},
      district: {},
      territory: {}
    };

    this.formBankAccountError = {
      account_name: {},
      account_number: {},
      bank_name: {},
      branch: {}
    };

    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    this.detailWholesaler = this.dataService.getFromStorage("detail_wholesaler");
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];
    // console.log(this.detailWholesaler);

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
    this.getBanks();
    this.onLoad = true;
    let regex = new RegExp(/[0-9]/g);

    this.formWs = this.formBuilder.group({
      name: ["", Validators.required],
      address: ["", Validators.required],
      code: ["", Validators.required],
      owner: ["", Validators.required],
      phone: ["", Validators.required],
      status: ["", Validators.required],
      national: ["", Validators.required],
      zone: ["", Validators.required],
      salespoint: ["", Validators.required],
      region: ["", Validators.required],
      area: ["", Validators.required],
      district: ["", Validators.required],
      territory: ["", Validators.required],
      branchShop: [false],
    });

    this.formBankAccount = this.formBuilder.group({
      account_number: [""],
      account_name: [""],
      bank_name: [""],
      branch: [""]
    });

    this.formWs.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formWs, this.formdataErrors);
    });
    this.wholesalerService.show({ wholesaler_id: this.dataService.getFromStorage("id_wholesaler") }).subscribe(resWS => {
      this.detailWholesaler = resWS.data;
      console.log('wsss', this.detailWholesaler);

      this.wholesalerService.getParentArea({ parent: (this.detailWholesaler.area_code && this.detailWholesaler.area_code.length > 0) ? this.detailWholesaler.area_code[0] : null }).subscribe(res => {
        this.detailAreaSelected = res.data;
        this.onLoad = false;

        this.initArea();
        this.initFormGroup();
        this.formWs.get('phone').valueChanges.debounceTime(500).subscribe(res => {
          if (res.match(regex)) {
            if (res.substring(0, 1) == '0') {
              let phone = res.substring(1);
              this.formWs.get('phone').setValue(phone, { emitEvent: false });
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
  }

  initArea() {
    this.areaFromLogin.map(item => {
      switch (item.type.trim()) {
        case 'national':
          this.formWs.get('national').disable();
          // this.formWs.get('national').setValue(item.id);
          break
        case 'division':
          this.formWs.get('zone').disable();
          // this.formWs.get('national').setValue(item.id);
          break;
        case 'region':
          this.formWs.get('region').disable();
          // this.formWs.get('national').setValue(item.id);
          break;
        case 'area':
          this.formWs.get('area').disable();
          // this.formWs.get('national').setValue(item.id);
          break;
        case 'salespoint':
          this.formWs.get('salespoint').disable();
          // this.formWs.get('national').setValue(item.id);
          break;
        case 'district':
          this.formWs.get('district').disable();
          // this.formWs.get('national').setValue(item.id);
          break;
        case 'territory':
          this.formWs.get('territory').disable();
          // this.formWs.get('national').setValue(item.id);
          break;
      }
    })
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

    this.formWs.setValue({
      name: this.detailWholesaler.name,
      address: this.detailWholesaler.address,
      code: this.detailWholesaler.code,
      owner: this.detailWholesaler.owner,
      phone: (this.detailWholesaler.phone) ? (this.isDetail ? Utils.formatPhoneNumber(this.detailWholesaler.phone) : parseInt(this.detailWholesaler.phone.split("+62")[1])) : '',
      status: this.detailWholesaler.status,
      national: this.getArea('national') ? this.getArea('national') : '',
      zone: this.getArea('division') ? this.getArea('division') : '',
      region: this.getArea('region') ? this.getArea('region') : '',
      area: this.getArea('area') ? this.getArea('area') : '',
      salespoint: this.getArea('salespoint') ? this.getArea('salespoint') : '',
      district: this.getArea('district') ? this.getArea('district') : '',
      territory: this.getArea('teritory') ? this.getArea('teritory') : '',
      branchShop: this.detailWholesaler.has_branch === 1 ? true : false,
    });

    this.frmTotalBranch.setValue(this.detailWholesaler.total_branch ? this.detailWholesaler.total_branch : 0);

    this.formBankAccount.setValue({
      account_number: this.detailWholesaler.bank_account_number,
      account_name: this.detailWholesaler.bank_account_name,
      bank_name: this.detailWholesaler.bank_name,
      branch: this.detailWholesaler.branch
    });

    if (this.isDetail) {
      this.formWs.disable();
      this.formBankAccount.disable();
    }
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

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          this.list[selection] = res.filter(item => item.name !== 'all');
        });

        this.formWs.get('region').setValue('');
        this.formWs.get('area').setValue('');
        this.formWs.get('salespoint').setValue('');
        this.formWs.get('district').setValue('');
        this.formWs.get('territory').setValue('');
        this.list['region'] = [];
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'region':
        item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formWs.get('region').setValue('');
        this.formWs.get('area').setValue('');
        this.formWs.get('salespoint').setValue('');
        this.formWs.get('district').setValue('');
        this.formWs.get('territory').setValue('');
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'area':
        item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formWs.get('area').setValue('');
        this.formWs.get('salespoint').setValue('');
        this.formWs.get('district').setValue('');
        this.formWs.get('territory').setValue('');
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'salespoint':
        item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formWs.get('salespoint').setValue('');
        this.formWs.get('district').setValue('');
        this.formWs.get('territory').setValue('');
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'district':
        item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formWs.get('district').setValue('');
        this.formWs.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formWs.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  getArea(selection) {
    return this.detailAreaSelected.filter(item => item.level_desc === selection).map(item => item.id)[0]
  }

  public findInvalidControls() {
    const invalid = [];
    let controls = this.formWs.controls;
    controls = { ...controls, ...this.formBankAccount.controls };
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  submit() {
    // console.log(this.formWs);
    console.log('invalid form field', this.findInvalidControls());
    if (this.formWs.valid && this.formBankAccount.valid) {
      let body = {
        _method: "PUT",
        name: this.formWs.get("name").value,
        address: this.formWs.get("address").value,
        business_code: this.formWs.get("code").value,
        owner: this.formWs.get("owner").value,
        phone: '+62' + this.formWs.get("phone").value,
        areas: this.list['territory'].filter(item => item.id === this.formWs.get('territory').value).map(item => item.id),
        status: this.formWs.get("status").value,
        bank_account_name: this.formBankAccount.get("account_name").value === "" ? null : this.formBankAccount.get("account_name").value,
        bank_account_number: this.formBankAccount.get("account_number").value === "" ? null : this.formBankAccount.get("account_number").value,
        bank_name: this.formBankAccount.get("bank_name").value === "" ? null : this.formBankAccount.get("bank_name").value,
        branch: this.formBankAccount.get("branch").value === "" ? null : this.formBankAccount.get("branch").value,
      };

      if (this.formWs.get("branchShop").value === true) {
        body['has_branch'] = this.formWs.get("branchShop").value === true ? 1 : 0;
        body['total_branch'] = this.frmTotalBranch.value
      } else {
        body['has_branch'] = this.formWs.get("branchShop").value === true ? 1 : 0;
      }

      console.log(this.formWs.get("branchShop").value);
      // return;

      this.wholesalerService
        .put(body, { wholesaler_id: this.detailWholesaler.id })
        .subscribe(
          res => {
            console.log('result response update', res);
            this.dialogService.openSnackBar({
              message: "Data Berhasil Diubah"
            });
            this.router.navigate(["user-management", "wholesaler"]);
            window.localStorage.removeItem("detail_wholesaler");
          },
          err => {
            console.log('err on update', err);
          }
        );
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formWs);
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
