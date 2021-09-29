import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { RetailerService } from "../../../../services/user-management/retailer.service";
import { DialogService } from "../../../../services/dialog.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from "app/services/data.service";
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-retailer-create',
  templateUrl: './retailer-create.component.html',
  styleUrls: ['./retailer-create.component.scss']
})
export class RetailerCreateComponent {
  // Vertical Stepper
  verticalStepperStep1: FormGroup;
  verticalStepperStep2: FormGroup;
  verticalStepperStep3: FormGroup;
  verticalStepperStep4: FormGroup;

  verticalStepperStep1Errors: any;
  verticalStepperStep2Errors: any;
  verticalStepperStep3Errors: any;
  verticalStepperStep4Errors: any;

  submitting: Boolean;

  listLevelArea: any[];
  list: any;

  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;

  listType: any[] = [
    { name: "General Trade", value: "General Trade" },
    { name: "Modern Trade", value: "Modern Trade" }
  ];

  listIC: any[] = [
    { name: "NON-SRC", value: "NON-SRC" },
    { name: "SRC", value: "SRC" },
    { name: "GT", value: "GT" },
    { name: "IMO", value: "IMO" },
    { name: "LAMP/HOP", value: "LAMP/HOP" },
    { name: "KA", value: "KA"},
    { name: "Official Store", value: "Official Store"}
  ];
  country_phone: string;

  constructor(
    private formBuilder: FormBuilder,
    private retailerService: RetailerService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private ls: LanguagesService
  ) {
    this.country_phone = this.ls.locale.global.country_calling_code;
    this.submitting = false;
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];

    this.verticalStepperStep1Errors = {
      name: {},
      address: {},
      business_code: {}
    };
    this.verticalStepperStep2Errors = {
      owner: {},
      phone: {}
    };

    this.verticalStepperStep3Errors = {
      national: {},
      zone: {},
      region: {},
      area: {},
      salespoint: {},
      district: {},
      territory: {},
      latitude: {},
      longitude: {}
    };

    this.verticalStepperStep4Errors = {
      // type: {},
      InternalClassification: {}
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
    let regex = new RegExp(/[0-9]/g);

    this.verticalStepperStep1 = this.formBuilder.group({
      name: ["", Validators.required],
      address: ["", Validators.required],
      business_code: ["", Validators.required],
    });

    this.verticalStepperStep2 = this.formBuilder.group({
      owner: ["", Validators.required],
      phone: ["", Validators.required]
    });

    this.verticalStepperStep3 = this.formBuilder.group({
      national: ["", Validators.required],
      zone: ["", Validators.required],
      region: ["", Validators.required],
      area: ["", Validators.required],
      salespoint: ["", Validators.required],
      district: ["", Validators.required],
      territory: ["", Validators.required],
      latitude: [""],
      longitude: [""]
    });

    this.verticalStepperStep4 = this.formBuilder.group({
      // type: ["", Validators.required],
      InternalClassification: ["", Validators.required]
    });


    this.verticalStepperStep1.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.verticalStepperStep1,
        this.verticalStepperStep1Errors
      );
    });

    this.verticalStepperStep2.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.verticalStepperStep2,
        this.verticalStepperStep2Errors
      );
    });

    this.verticalStepperStep3.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.verticalStepperStep3,
        this.verticalStepperStep3Errors
      );
    });

    this.verticalStepperStep4.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.verticalStepperStep4,
        this.verticalStepperStep4Errors
      );
    });

    this.verticalStepperStep2.get('phone').valueChanges.debounceTime(500).subscribe(res => {
      if (res.match(regex)) {
        if (res.substring(0, 1) == '0') {
          let phone = res.substring(1);
          this.verticalStepperStep2.get('phone').setValue(phone, { emitEvent: false });
        }
      }
    })

    this.initArea();
  }

  initArea() {
    this.areaFromLogin.map(item => {
      let level_desc = '';
      switch (item.type.trim()) {
        case 'national':
          level_desc = 'zone';
          this.verticalStepperStep3.get('national').setValue(item.id);
          this.verticalStepperStep3.get('national').disable();
          break
        case 'division':
          level_desc = 'region';
          this.verticalStepperStep3.get('zone').setValue(item.id);
          this.verticalStepperStep3.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          this.verticalStepperStep3.get('region').setValue(item.id);
          this.verticalStepperStep3.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          this.verticalStepperStep3.get('area').setValue(item.id);
          this.verticalStepperStep3.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          this.verticalStepperStep3.get('salespoint').setValue(item.id);
          this.verticalStepperStep3.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          this.verticalStepperStep3.get('district').setValue(item.id);
          this.verticalStepperStep3.get('district').disable();
          break;
        case 'territory':
          this.verticalStepperStep3.get('territory').setValue(item.id);
          this.verticalStepperStep3.get('territory').disable();
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
          this.list[selection] = res.filter(item => item.name !== 'all');
        });

        this.verticalStepperStep3.get('region').setValue('');
        this.verticalStepperStep3.get('area').setValue('');
        this.verticalStepperStep3.get('salespoint').setValue('');
        this.verticalStepperStep3.get('district').setValue('');
        this.verticalStepperStep3.get('territory').setValue('');
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

        this.verticalStepperStep3.get('region').setValue('');
        this.verticalStepperStep3.get('area').setValue('');
        this.verticalStepperStep3.get('salespoint').setValue('');
        this.verticalStepperStep3.get('district').setValue('');
        this.verticalStepperStep3.get('territory').setValue('');
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

        this.verticalStepperStep3.get('area').setValue('');
        this.verticalStepperStep3.get('salespoint').setValue('');
        this.verticalStepperStep3.get('district').setValue('');
        this.verticalStepperStep3.get('territory').setValue('');
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

        this.verticalStepperStep3.get('salespoint').setValue('');
        this.verticalStepperStep3.get('district').setValue('');
        this.verticalStepperStep3.get('territory').setValue('');
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

        this.verticalStepperStep3.get('district').setValue('');
        this.verticalStepperStep3.get('territory').setValue('');
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

        this.verticalStepperStep3.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  selectionChange(event) {
    console.log(event.value);
  }

  step1() {
    commonFormValidator.validateAllFields(this.verticalStepperStep1);
  }

  step2() {
    commonFormValidator.validateAllFields(this.verticalStepperStep2);
  }

  step3() {
    commonFormValidator.validateAllFields(this.verticalStepperStep3);
  }

  step4() {
    commonFormValidator.validateAllFields(this.verticalStepperStep4);
    if (this.verticalStepperStep1.controls['business_code'].invalid) {
      this.dialogService.openSnackBar({ message: "Informasi Toko Kode Agen Wajib Diisi." });
    }
  }

  classificationSelectionChange(event) {
    if (event.value === 'NON-SRC') {
      this.verticalStepperStep1.controls['business_code'].setValue("");
      this.verticalStepperStep1.controls['business_code'].disable();
    } else {
      this.verticalStepperStep1.controls['business_code'].enable();
    }
  }

  submit() {
    if (this.verticalStepperStep1.valid && this.verticalStepperStep2.valid) {
      this.submitting = true;

      let icValue = this.verticalStepperStep4.get("InternalClassification").value;

      let body = {
        name: this.verticalStepperStep1.get("name").value,
        address: this.verticalStepperStep1.get("address").value,
        business_code: this.verticalStepperStep1.get("business_code").value,
        owner: this.verticalStepperStep2.get("owner").value,
        phone: this.country_phone + this.verticalStepperStep2.get("phone").value,
        areas: [this.verticalStepperStep3.get("territory").value],
        latitude: this.verticalStepperStep3.get("latitude").value ? this.verticalStepperStep3.get("latitude").value : null,
        longitude: this.verticalStepperStep3.get("longitude").value ? this.verticalStepperStep3.get("longitude").value : null,
        type: (icValue === 'SRC' || icValue === 'NON-SRC' || icValue === 'Official Store') ? "General Trade" : icValue,
        InternalClassification: this.verticalStepperStep4.get("InternalClassification").value
      };

      this.retailerService.create(body).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
          this.router.navigate(["user-management", "retailer"]);
        },
        err => {
          this.submitting = false;
        }
      );
    } else {
      commonFormValidator.validateAllFields(this.verticalStepperStep1);
      commonFormValidator.validateAllFields(this.verticalStepperStep2);
      commonFormValidator.validateAllFields(this.verticalStepperStep3);
      commonFormValidator.validateAllFields(this.verticalStepperStep4);
    }
  }

}
