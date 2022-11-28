import { Component, ViewChild, Input } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { DataService } from '../../../../services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from '../../../../services/dialog.service';
import { commonFormValidator } from '../../../../classes/commonFormValidator';
import { RetailerService } from '../../../../services/user-management/retailer.service';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { GeneralService } from 'app/services/general.service';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { PagesName } from 'app/classes/pages-name';
import { HelpService } from 'app/services/content-management/help.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Utils } from 'app/classes/utils';
import { TranslateService } from '@ngx-translate/core';

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
  Busin_code:any;
  viewPhoneNumberStatus: Boolean;
  viewBankStatus: Boolean;
  editPhoneNumberStatus: Boolean;
  editBankStatus: Boolean;
  viewPhoneNumberPBStatus: Boolean;

  detailRetailer: any;
  listStatus: any[] = [
    { name: 'Status Aktif', value: 'active' },
    { name: 'Status Non Aktif', value: 'inactive' },
    { name: 'Status Belum terdaftar', value: 'passive' }
  ];
  listStatusUser: any[] = [
    { name: 'Aktif', value: 'active' },
    { name: 'Non Aktif', value: 'inactive' }
  ];

  listType: any[] = [
    { name: 'General Trade', value: 'General Trade' },
    { name: 'Modern Trade', value: 'Modern Trade' }
  ];

  listIC: any[] = [
    { name: 'NON-SRC', value: 'NON-SRC' },
    { name: 'SRC', value: 'SRC' },
    { name: 'GT', value: 'GT' },
    { name: 'IMO', value: 'IMO' },
    { name: 'LAMP/HOP', value: 'LAMP/HOP' },
    { name: 'KA', value: 'KA' },
    { name: "Official Store", value: "Official Store"},
    { name: "RRP", value: "RRP"}
  ];

  listGSR: any[] = [
    { name: 'OFF', value: 0 },
    { name: 'ON', value: 1 }
  ];

  listGSM: any[] = [
    { name: 'OFF', value: 0 },
    { name: 'ON', value: 1 }
  ];

  listCashierAccess: any[] = [
    { name: 'YA', value: 1 },
    { name: 'TIDAK', value: 0 }
  ];

  listBankFinalValidation: any[] = [
    { name: 'FALSE', value: 0 },
    { name: 'TRUE', value: 1 }
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
  pkp: FormControl = new FormControl();
  pkpOptions: any[] = [
    { key: '', value: 'Belum Diisi' },
    { key: 0, value: 'Tidak' },
    { key: 1, value: 'Ya' }
  ];
  permission: any;
  roles: PagesName = new PagesName();

  seeStatus: boolean = true;
  seeProfile: boolean = true;
  seePhone: boolean = true;
  seeSalestree: boolean = true;
  seeRekening: boolean = true;
  seeAksesKasir: boolean = true;
  disableSubmit: boolean = false;
  listStatusChatBot: any[] = [
    { name: 'OFF', value: 0 },
    { name: 'ON', value: 1 }
  ]
  countryList: any[] = [];
  country_phone: string;
  idRetailer: any;

  formRefferalCode: FormGroup;
  
  @Input('formOnly') formOnly: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private retailerService: RetailerService,
    private generalService: GeneralService,
    private helpService: HelpService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.country_phone = this.ls.locale.global.country_calling_code;
    this.onLoad = false;
    this.permission = this.roles.getRoles('principal.retailer');
    if(this.dataService.getDecryptedProfile().country == 'PH') {
      this.listIC = [
        { name: "NON-SRC", value: "NON-SRC" },
        { name: "SRC", value: "SRC" },
        { name: "GT", value: "GT" },
        { name: "IMO", value: "IMO" },
        { name: "LAMP/HOP", value: "LAMP/HOP" },
        { name: "KA", value: "KA"},
        { name: "Official Store", value: "Official Store"},
        { name: "RRP", value: "RRP"},
        { name: "ISR", value: "ISR"}
      ]
    }

    this.viewPhoneNumberStatus = Object.values(this.permission).indexOf('principal.retailer.phone_number_view') > -1;
    this.viewBankStatus = Object.values(this.permission).indexOf('principal.retailer.rekening_toko_view') > -1;
    this.editPhoneNumberStatus = Object.values(this.permission).indexOf('principal.retailer.phone_number') > -1;
    this.editBankStatus = Object.values(this.permission).indexOf('principal.retailer.rekening_toko') > -1;
    this.viewPhoneNumberPBStatus = Object.values(this.permission).indexOf('principal.retailer.phone_number_pb_view') > -1;

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
      InternalClassification: {},
      country: {}
    };

    this.formBankAccountError = {
      account_number: {},
      account_name: {},
      bank_final_validation: {},
      bank_name: {},
      branch: {}
    };

    // this.detailRetailer = this.dataService.getFromStorage("detail_retailer");
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];

    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
      this.idRetailer = params[2].path;
    })

    this.listLevelArea = [
      {
        'id': 1,
        'parent_id': null,
        'code': 'SLSNTL      ',
        'name': 'SLSNTL'
      },
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
    this.getCountryList();
    let regex = new RegExp(/[0-9]/g);

    this.formRetailer = this.formBuilder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      business_code: ['', Validators.required],
      owner: ['', Validators.required],
      phone: ['', Validators.required],
      status: ['', Validators.required],
      status_user: ['', Validators.required],
      national: ['', Validators.required],
      zone: ['', Validators.required],
      salespoint: ['', Validators.required],
      region: ['', Validators.required],
      area: ['', Validators.required],
      district: ['', Validators.required],
      territory: ['', Validators.required],
      latitude: [''],
      longitude: [''],
      type: [''],
      is_chat_bot: [0],
      order_online: [0],
      // cashier: ["", Validators.required],
      InternalClassification: ['', Validators.required],
      gsr: [0],
      gsm_pl: [0],
      version_retailer: [''],
      version_cashier: [''],
      country: [""],
    });

    this.formBankAccount = this.formBuilder.group({
      account_number: [''],
      account_name: [''],
      bank_final_validation: [0],
      bank_name: [''],
      branch: ['']
    });

    this.formRefferalCode = this.formBuilder.group({
      ref_code: [""],
      customer_code: [""],
      customer_name: [""],
      customer_type: [""],
      date_ref_code: [""]
    });

    this.formRetailer.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formRetailer, this.formdataErrors);
    });
    this.dataService.showLoading(true);
    this.retailerService.show({ retailer_id: this.idRetailer }).subscribe(async res => {
      this.dataService.showLoading(false);
      // console.log('show', res);
      this.detailRetailer = res.data;
      console.log('detail_retailer', this.detailRetailer);
      // this.setDetailRetailer();
      try {
        if (this.detailRetailer.refferal_code) {
          const response = await this.retailerService.getConsumerList({ referral_code: this.detailRetailer.refferal_code }).toPromise();
          this.detailRetailer['customers'] = response.data;
        }
      } catch (error) {
        throw error;
      }

      if (this.detailRetailer.status === 'not-registered') {
        this.formRetailer.get('status').disable();
        this.listStatus = [
          { name: 'Status Aktif', value: 'active' },
          { name: 'Status Non Aktif', value: 'inactive' },
          { name: 'Status Belum terdaftar', value: 'not-registered' }
        ];
      } else if (this.detailRetailer.status === 'active') {
        this.formRetailer.controls['phone'].setValidators(Validators.required);
        this.formRetailer.updateValueAndValidity();
      } else if(this.detailRetailer.status === 'inactive') {
        this.formRetailer.get('status').disable();
      }
      this.onLoad = true;
      if (this.detailRetailer.area_code) {

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

      } else {
        this.initFormGroup();
        this.formRetailer.get('phone').valueChanges.debounceTime(500).subscribe(res => {
          if (res.match(regex)) {
            if (res.substring(0, 1) == '0') {
              let phone = res.substring(1);
              this.formRetailer.get('phone').setValue(phone, { emitEvent: false });
            }
          }
        })
      }

    }, error => {
      this.dataService.showLoading(false);
    });

    this.formBankAccount
      .valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(res => {
        let total = 0;
        Object.keys(res).map(frm => {
          total += (res[frm] ? res[frm].length : ''.length);
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
    if (!this.isDetail) {
      this.setFormAbility();
    }
  }

  getBanks() {
    this.generalService.getBanks()
      .subscribe(res => {
        this.listBanks = res.data;
        this.filteredBanks.next(this.listBanks.slice());
      }, err => console.log('err', err));
  }
  getCountryList(){
    this.helpService.getCountry().subscribe(
      res => {
        this.countryList = res.data;
      },
      err => {
        this.countryList = [];
        console.error(err);
      }
    );
  }

  handleCountryPhone(event){
    if(this.formRetailer.get('country').value !== 'PH'){
      this.listIC = [
        { name: "NON-SRC", value: "NON-SRC" },
        { name: "SRC", value: "SRC" },
        { name: "GT", value: "GT" },
        { name: "IMO", value: "IMO" },
        { name: "LAMP/HOP", value: "LAMP/HOP" },
        { name: "KA", value: "KA"},
        { name: "Official Store", value: "Official Store"},
        { name: "RRP", value: "RRP"}
      ]
    }
    else{
      this.listIC = [
        { name: "NON-SRC", value: "NON-SRC" },
        { name: "SRC", value: "SRC" },
        { name: "GT", value: "GT" },
        { name: "IMO", value: "IMO" },
        { name: "LAMP/HOP", value: "LAMP/HOP" },
        { name: "KA", value: "KA"},
        { name: "Official Store", value: "Official Store"},
        { name: "RRP", value: "RRP"},
        { name: "ISR", value: "ISR"}
      ]
    }
    this.country_phone = Utils.getPhoneCode(event.value);
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
          // this.formRetailer.get('national').disable();
          this.formRetailer.get('national').setValue(item.id);
          break
        case 'division':
          // this.formRetailer.get('zone').disable();
          this.formRetailer.get('national').setValue(item.id);
          break;
        case 'region':
          // this.formRetailer.get('region').disable();
          this.formRetailer.get('national').setValue(item.id);
          break;
        case 'area':
          // this.formRetailer.get('area').disable();
          this.formRetailer.get('national').setValue(item.id);
          break;
        case 'salespoint':
          // this.formRetailer.get('salespoint').disable();
          this.formRetailer.get('national').setValue(item.id);
          break;
        case 'district':
          // this.formRetailer.get('district').disable();
          this.formRetailer.get('national').setValue(item.id);
          break;
        case 'territory':
          // this.formRetailer.get('territory').disable();
          this.formRetailer.get('national').setValue(item.id);
          break;
      }
    })
  }

  initFormGroup() {
    if (this.detailAreaSelected) {

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

    }
    
    if (this.detailRetailer.country) {
      this.country_phone = Utils.getPhoneCode(this.detailRetailer.country);
    } else {
      if (this.detailRetailer.phone) {
        this.country_phone = Utils.getPhoneCode("", this.detailRetailer.phone);
      }
    }
    let phone = '';
    if (this.viewPhoneNumberStatus) {
      phone = (this.isDetail ? this.detailRetailer.phone : (this.detailRetailer.phone)? parseInt(this.detailRetailer.phone.split(this.country_phone)[1]) : '' );
    } else {
      phone = Utils.reMaskInput(this.detailRetailer.phone, 4);
    }

    this.formRetailer.setValue({
      name: this.detailRetailer.name || '',
      address: this.detailRetailer.address || '',
      business_code: this.detailRetailer.classification !== 'NON-SRC' ? this.detailRetailer.code : '',
      owner: this.detailRetailer.owner || '',
      country: this.detailRetailer.country || '',
      phone: (this.detailRetailer.phone) ? phone : '',
      status: this.detailRetailer.status || '',
      status_user: this.detailRetailer.status_user || 'active',
      latitude: this.detailRetailer.latitude || '',
      longitude: this.detailRetailer.longitude || '',
      type: this.detailRetailer.type_hms || '',
      InternalClassification: this.detailRetailer.classification || '',
      gsr: this.detailRetailer.gsr_flag ? 1 : 0,
      gsm_pl: this.detailRetailer.gsm_pl ? 1 : 0,
      national: this.getArea('national'),
      zone: this.getArea('division'),
      region: this.getArea('region'),
      area: this.getArea('area'),
      salespoint: this.getArea('salespoint'),
      district: this.getArea('district'),
      territory: this.getArea('teritory'),
      is_chat_bot: this.detailRetailer.is_chat_bot ? 1 : 0,
      order_online: this.detailRetailer.order_online ? 1 : 0,
      // cashier: this.detailRetailer.cashier || 0,
      version_retailer: this.detailRetailer.version_retailer || '',
      version_cashier: this.detailRetailer.version_cashier || '',
    });

    this.formBankAccount.setValue({
      account_number: !this.viewBankStatus ? Utils.reMaskInput(this.detailRetailer.bank_account_number, 4) : this.detailRetailer.bank_account_number || '',
      account_name: !this.viewBankStatus ? Utils.reMaskInput(this.detailRetailer.bank_account_name, 3) : this.detailRetailer.bank_account_name || '',
      bank_final_validation: this.detailRetailer.bank_final_validation ? 1 : 0,
      bank_name: this.detailRetailer.bank_name || '',
      branch: !this.viewBankStatus ? Utils.reMaskInput(this.detailRetailer.branch, 3) : this.detailRetailer.branch || '',
    });

    this.formRefferalCode.setValue({
      ref_code: this.detailRetailer.ref_identifier || "",
      customer_code: this.detailRetailer.ref_code || "",
      customer_name: this.detailRetailer.ref_name || "",
      customer_type: this.detailRetailer.ref_type || "",
      date_ref_code: this.detailRetailer.ref_submitted || ""
    })

    this.formRefferalCode.disable();
    console.log(this.detailRetailer.pkp);
    this.npwp.setValue(this.detailRetailer.npwp ? this.detailRetailer.npwp : '');
    this.pkp.setValue(this.detailRetailer.pkp !== null && this.detailRetailer.pkp !== '' ? this.detailRetailer.pkp : '');

    if (this.detailRetailer.classification === 'NON-SRC') {
      this.formRetailer.controls['business_code'].disable();
    }

    this.formRetailer.controls['version_retailer'].disable();
    this.formRetailer.controls['version_cashier'].disable();

    if (this.isDetail) {
      this.formRetailer.disable();
      this.formBankAccount.disable();
      this.npwp.disable();
      this.pkp.disable();
    }
  }

  remaskTemplate(validate, value, totalShowChar) {
    return !validate ? Utils.reMaskInput(value, totalShowChar) : value;
  }

  getAudienceArea(selection, id) {
    let item: any;
    console.log('id area get', id);
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
    if (this.detailAreaSelected) {
      let areas = this.detailAreaSelected.filter(item => item.level_desc === selection).map(item => item.id);
      return areas && areas[0] ? areas[0] : '';
    }
    return '';
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
    this.Busin_code = this.detailRetailer.code;
    if (event.value === 'NON-SRC') {
      this.formRetailer.controls['business_code'].setValue('');
      this.formRetailer.controls['business_code'].disable();
    }
    else if (event.value === 'ISR') {
      this.formRetailer.controls['business_code'].setValue(this.Busin_code);
      this.formRetailer.controls['business_code'].disable();
    }
     else {
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
      this.formBankAccount.get('account_number').setValidators(Validators.required);
      this.formBankAccount.get('account_number').updateValueAndValidity();
      this.formBankAccount.get('account_name').setValidators(Validators.required);
      this.formBankAccount.get('account_name').updateValueAndValidity();
      this.formBankAccount.get('bank_final_validation').setValidators(Validators.required);
      this.formBankAccount.get('bank_final_validation').updateValueAndValidity();
      this.formBankAccount.get('bank_name').setValidators(Validators.required);
      this.formBankAccount.get('bank_name').updateValueAndValidity();
      this.formBankAccount.get('branch').setValidators(Validators.required);
      this.formBankAccount.get('branch').updateValueAndValidity();
      commonFormValidator.validateAllFields(this.formBankAccount);
    } else {
      this.formBankAccount.get('account_number').setValidators([]);
      this.formBankAccount.get('account_number').updateValueAndValidity();
      this.formBankAccount.get('account_name').setValidators([]);
      this.formBankAccount.get('account_name').updateValueAndValidity();
      this.formBankAccount.get('bank_final_validation').setValidators([]);
      this.formBankAccount.get('bank_final_validation').updateValueAndValidity();
      this.formBankAccount.get('bank_name').setValidators([]);
      this.formBankAccount.get('bank_name').updateValueAndValidity();
      this.formBankAccount.get('branch').setValidators([]);
      this.formBankAccount.get('branch').updateValueAndValidity();
      commonFormValidator.validateAllFields(this.formBankAccount);
    }
  }

  clearBankName() {
    this.formBankAccount.get('bank_name').setValue(null);
    this.bindFormBankAccountValidator();
  }

  submit() {
    console.log('invalid form field', this.findInvalidControls());
    if (!this.formRetailer.invalid) {
      const icValue = this.formRetailer.get('InternalClassification').value;
      let generalTrade = ["NON-SRC", "SRC", "Official Store", "RRP", "ISR"];

      let body = {
        _method: 'PUT',
        name: this.formRetailer.get('name').value,
        address: this.formRetailer.get('address').value,
        business_code: this.formRetailer.get('business_code').value,
        owner: this.formRetailer.get('owner').value,
        country: this.formRetailer.get('country').value,
        phone: this.formRetailer.getRawValue()['phone'] ? this.country_phone + this.formRetailer.getRawValue()['phone'] : '',
        status: this.formRetailer.get('status').value,
        areas: [this.formRetailer.get('territory').value],
        latitude: this.formRetailer.get('latitude').value ? this.formRetailer.get('latitude').value : null,
        longitude: this.formRetailer.get('longitude').value ? this.formRetailer.get('longitude').value : null,
        type: generalTrade.indexOf(icValue) >= 0 ? "General Trade" : icValue,
        InternalClassification: icValue,
        gsr_flag: this.formRetailer.get('gsr').value,
        gsm_pl: this.formRetailer.get('gsm_pl').value,
        // cashier: this.formRetailer.get("cashier").value,
        bank_account_name: this.formBankAccount.get('account_name').value === '' ? null : this.formBankAccount.get('account_name').value,
        bank_final_validation: this.formBankAccount.get('bank_final_validation').value,
        bank_account_number: this.formBankAccount.get('account_number').value === '' ? null : this.formBankAccount.get('account_number').value,
        bank_name: this.formBankAccount.get('bank_name').value === '' ? null : this.formBankAccount.get('bank_name').value,
        branch: this.formBankAccount.get('branch').value === '' ? null : this.formBankAccount.get('branch').value,
        status_user: this.formRetailer.get('status_user').value,
        is_chat_bot: this.formRetailer.get('is_chat_bot').value,
        order_online: this.formRetailer.get('order_online').value,
      };

      if (!this.viewPhoneNumberStatus || !this.editPhoneNumberStatus) {
        delete body.phone;
      }
      if (!this.viewBankStatus || !this.editBankStatus) {
        delete body.bank_account_name;
        delete body.bank_account_number;
        delete body.bank_name;
        delete body.branch;
      }

      console.log(body);
      if (this.pkp.value === '') {
        body['pkp'] = '';
        if (body['npwp']) delete body['npwp'];
      }
      if (this.pkp.value === 0 || this.pkp.value === 1) {
        body['pkp'] = this.pkp.value;
      }

      if (this.pkp.value === 1) {
        body['npwp'] = this.npwp.value;
      }

      if (this.pkp.value === 0) {
        body['npwp'] = '';
      }

      this.retailerService.put(body, { retailer_id: this.detailRetailer.id }).subscribe(
        res => {
          this.dialogService.openSnackBar({
            message: 'Data berhasil diubah'
          });
          this.router.navigate(['user-management', 'retailer']);
          window.localStorage.removeItem('detail_retailer');
        },
        err => { }
      );
    } else {
      this.dialogService.openSnackBar({
        message: this.translate.instant('global.label.please_complete_data')
      });
      commonFormValidator.validateAllFields(this.formRetailer);
    }
  }

  getToolTipData(value, array) {
    if (value !== '' && array.length > 0) {
      let msg = array.filter(item => item.id === value)[0]['name'];
      return msg;
    } else {
      return '';
    }
  }
  isCan(roles: any[], cond: string = 'AND') {

    let permissions = [];

    permissions = Object.keys(this.permission);

    if (!permissions.length || !roles.length) return false;

    const result = [];
    roles.map(r => { result.push(permissions.includes(r)) });

    if (cond === 'AND') {

      if (result.includes(false)) return false;

      else return true;

    } else if (cond === 'OR') {
      if (!result.includes(true)) return false;
      else return true;
    }

  }

  disableFields(fields: any[], form: any = null) {
    form = (form) ? form : this.formRetailer;

    if (fields.length) fields.map(field => { form.controls[field].disable(); })
    form.updateValueAndValidity();
  }
  rmValidators(fields: any[], form: any = null) {

    form = (form) ? form : this.formRetailer;

    if (fields.length) fields.map(field => { form.controls[field].setValidators([]) });
    form.updateValueAndValidity();
  }

  setFormAbility() {

    // this.seeStatus = ( this.isCan(['lihat', 'status_user_and_business']) ) ? true : false;
    // this.seeProfile = ( this.isCan(['lihat', 'profile_toko']) ) ? true : false;
    // this.seePhone = ( this.isCan(['lihat', 'phone_number']) ) ? true : false;
    // this.seeSalestree = ( this.isCan(['lihat', 'salestree_toko']) ) ? true : false;
    // this.seeRekening = ( this.isCan(['lihat', 'rekening_toko']) ) ? true : false;
    // this.seeAksesKasir = ( this.isCan(['lihat', 'akses_kasir']) ) ? true : false;
    const ALL_ROLES = ['profile_toko', 'status_user_and_business', 'phone_number', 'gsr', 'salestree_toko', 'akses_kasir'];


    console.log('SEE', this.seePhone);

    // const fRtl = this.formRetailer;

    if (!this.isCan(['ubah', 'country'])) {
      const fields = ['country'];
      this.disableFields(fields);
    }

    if (!this.isCan(['ubah', 'profile_toko'])) {

      const fields = ['name', 'address', 'business_code', 'owner', 'latitude', 'longitude', 'InternalClassification'];

      this.disableFields(fields);
      this.rmValidators(fields);

    };

    if (!this.isCan(['ubah', 'status_user_and_business'])) {

      const fields = ['status_user', 'status'];
      this.disableFields(fields);
      this.rmValidators(fields);

    }

    if (!this.editPhoneNumberStatus) {
      this.disableFields(['phone']);
      this.rmValidators(['phone']);
    }

    if (!this.isCan(['ubah', 'gsr'])) {
      this.disableFields(['gsr']);
    }

    if (!this.isCan(['ubah', 'salestree_toko'])) {
      const fields = ['national', 'zone', 'region', 'area', 'salespoint', 'district', 'territory'];
      this.disableFields(fields);
      this.rmValidators(fields);
    }

    if (!this.editBankStatus) {
      const fields = ['account_number', 'bank_name', 'account_name', 'branch'];
      this.disableFields(fields, this.formBankAccount);
      this.rmValidators(fields, this.formBankAccount);
    }

    if (!this.isCan(['ubah', 'rekening_toko'])) {

      const fields = ['bank_final_validation'];
      this.disableFields(fields, this.formBankAccount);
      this.rmValidators(fields, this.formBankAccount);
      this.npwp.disable();
      this.npwp.setValidators([]);
      this.npwp.updateValueAndValidity();
      this.pkp.disable();
      this.pkp.setValidators([]);
      this.pkp.updateValueAndValidity();

    }
    if (!this.isCan(['gsm_pl'])) {
      this.disableFields(['gsm_pl']);
    }
    // if (!this.isCan(['ubah', 'akses_kasir'])) {
    //   const fields = ['cashier'];
    //   this.disableFields(fields);
    //   this.rmValidators(fields);
    // }
    // jika tidak memiliki submenu samasekali maka disable simpan
    if (!this.isCan(ALL_ROLES, 'OR')) {
      this.disableSubmit = true;
    }
  }
}
