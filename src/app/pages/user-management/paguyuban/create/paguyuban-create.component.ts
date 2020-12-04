import { Component, OnInit } from '@angular/core';
import { PaguyubanService } from 'app/services/user-management/paguyuban.service';
import { FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import * as _ from 'underscore';
import { PasswordValidator } from 'app/validators/password.validator';
import { PasswordErrorMatcher } from 'app/validators/password.matcher';

export function checkPassword(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    return { 'notSame': true }
  };
}

@Component({
  selector: 'app-paguyuban-create',
  templateUrl: './paguyuban-create.component.html',
  styleUrls: ['./paguyuban-create.component.scss']
})
export class PaguyubanCreateComponent {

  verticalStepperStep1: FormGroup;
  verticalStepperStep2: FormGroup;
  wilayah: FormGroup;

  verticalStepperStep1Errors: any;
  verticalStepperStep2Errors: any;

  listAdminPrincipal: Array<any>;
  submitting: Boolean;

  listLevelArea: any[];
  list: any;

  showPassword = false;
  showConfirmPassword = false;

  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;
  passwordMatcher = new PasswordErrorMatcher();

  constructor(
    private formBuilder: FormBuilder,
    private paguyubanService: PaguyubanService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
  ) {
    this.submitting = false;
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];

    this.verticalStepperStep1Errors = {
      nama: {},
      username: {},
      email: {}
    };
    this.verticalStepperStep2Errors = {
      role: {}
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

    this.listAdminPrincipal = [];
  }

  ngOnInit() {
    this.verticalStepperStep1 = this.formBuilder.group({
      fullname: ["", Validators.required],
      group_name: ["", Validators.required],
      username: ["", Validators.required],
      password: ["", [
        Validators.required,
        PasswordValidator.strong,
        PasswordValidator.specialChar,
        Validators.minLength(8),
      ]],
      password_confirmation: ["", Validators.required],
    }, {validator: PasswordValidator.matchValues('password', 'password_confirmation')});

    this.wilayah = this.formBuilder.group({
      national: ["", Validators.required],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""],
      // latitude: [""],
      // longitude: [""]
    })

    this.wilayah.valueChanges.debounceTime(300).subscribe(res => {
      let areas = [];
      let value = this.wilayah.getRawValue();
      value = Object.entries(value).map(([key, value]) => ({ key, value }));

      this.typeArea.map(type => {
        const filteredValue = value.filter(item => item.key === type && item.value);
        if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));
      })

      this.paguyubanService.getListAdminPrincipal({ area: _.last(areas) }).subscribe(obj => {
        this.listAdminPrincipal = obj;
        this.verticalStepperStep2.controls['principal_id'].setValue('');
      })
    })

    this.verticalStepperStep2 = this.formBuilder.group({
      principal_id: ["", Validators.required]
    });

    this.verticalStepperStep1.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.verticalStepperStep1, this.verticalStepperStep1Errors);
    });

    this.verticalStepperStep2.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.verticalStepperStep2, this.verticalStepperStep2Errors);
    });

    this.verticalStepperStep1.valueChanges.debounceTime(300).subscribe(res => {
      if (res.password_confirmation) {
        if (res.password !== res.password_confirmation) {
          this.verticalStepperStep1.controls['password_confirmation'].setValidators(checkPassword());
          this.verticalStepperStep1.controls['password_confirmation'].updateValueAndValidity();
        } else {
          this.verticalStepperStep1.controls['password_confirmation'].clearValidators();
          this.verticalStepperStep1.controls['password_confirmation'].updateValueAndValidity();
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
          this.wilayah.get('national').setValue(item.id);
          this.wilayah.get('national').disable();
          break
        case 'division':
          level_desc = 'region';
          this.wilayah.get('zone').setValue(item.id);
          this.wilayah.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          this.wilayah.get('region').setValue(item.id);
          this.wilayah.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          this.wilayah.get('area').setValue(item.id);
          this.wilayah.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          this.wilayah.get('salespoint').setValue(item.id);
          this.wilayah.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          this.wilayah.get('district').setValue(item.id);
          this.wilayah.get('district').disable();
          break;
        case 'territory':
          this.wilayah.get('territory').setValue(item.id);
          this.wilayah.get('territory').disable();
          break;
      }
      this.getAudienceArea(level_desc, item.id);
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.paguyubanService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          this.list[selection] = res.map(item => { return { ...item, name: item.name === 'all' ? 'Semua Zone' : item.name } });
        });

        this.wilayah.get('region').setValue('');
        this.wilayah.get('area').setValue('');
        this.wilayah.get('salespoint').setValue('');
        this.wilayah.get('district').setValue('');
        this.wilayah.get('territory').setValue('');
        this.list['region'] = [];
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'region':
        item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua Zone') {
          this.paguyubanService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.map(item => { return { ...item, name: item.name === 'all' ? 'Semua Regional' : item.name } });
          });
        } else {
          this.list[selection] = []
        }

        this.wilayah.get('region').setValue('');
        this.wilayah.get('area').setValue('');
        this.wilayah.get('salespoint').setValue('');
        this.wilayah.get('district').setValue('');
        this.wilayah.get('territory').setValue('');
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'area':
        item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua Regional') {
          this.paguyubanService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.map(item => { return { ...item, name: item.name === 'all' ? 'Semua Area' : item.name } });
          });
        } else {
          this.list[selection] = []
        }

        this.wilayah.get('area').setValue('');
        this.wilayah.get('salespoint').setValue('');
        this.wilayah.get('district').setValue('');
        this.wilayah.get('territory').setValue('');
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'salespoint':
        item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua Area') {
          this.paguyubanService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.map(item => { return { ...item, name: item.name === 'all' ? 'Semua Salespoint' : item.name } });
          });
        } else {
          this.list[selection] = []
        }

        this.wilayah.get('salespoint').setValue('');
        this.wilayah.get('district').setValue('');
        this.wilayah.get('territory').setValue('');
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'district':
        item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua Salespoint') {
          this.paguyubanService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.map(item => { return { ...item, name: item.name === 'all' ? 'Semua District' : item.name } });
          });
        } else {
          this.list[selection] = []
        }

        this.wilayah.get('district').setValue('');
        this.wilayah.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua District') {
          this.paguyubanService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.map(item => { return { ...item, name: item.name === 'all' ? 'Semua Territory' : item.name } });
          });
        } else {
          this.list[selection] = []
        }

        this.wilayah.get('territory').setValue('');
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

  submit() {
    if (this.verticalStepperStep1.valid && this.verticalStepperStep2.valid) {
      this.submitting = true;

      let areas = [];
      let value = this.wilayah.getRawValue();
      value = Object.entries(value).map(([key, value]) => ({ key, value }));

      this.typeArea.map(type => {
        const filteredValue = value.filter(item => item.key === type && item.value);
        if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));
      })

      let body = {
        fullname: this.verticalStepperStep1.get("fullname").value,
        group_name: this.verticalStepperStep1.get("group_name").value,
        username: this.verticalStepperStep1.get("username").value,
        password: this.verticalStepperStep1.get("password").value,
        password_confirmation: this.verticalStepperStep1.get("password_confirmation").value,
        principal_id: this.verticalStepperStep2.get("principal_id").value,
        // latitude: this.wilayah.get("latitude").value,
        // longitude: this.wilayah.get("longitude").value,
        areas: [_.last(areas)],
        // status: 'active'
      };

      this.paguyubanService.create(body).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: "Data berhasil disimpan" });
          this.router.navigate(["user-management", "paguyuban"]);
        },
        err => {
          this.submitting = false;
        }
      );
    } else {
      commonFormValidator.validateAllFields(this.verticalStepperStep1);
      commonFormValidator.validateAllFields(this.verticalStepperStep2);
    }
  }

}
