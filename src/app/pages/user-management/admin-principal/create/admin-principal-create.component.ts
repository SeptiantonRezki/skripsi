import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { AdminPrincipalService } from "../../../../services/user-management/admin-principal.service";
import { DialogService } from "../../../../services/dialog.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from "app/services/data.service";
import * as _ from 'underscore';

@Component({
  selector: "app-admin-principal-create",
  templateUrl: "./admin-principal-create.component.html",
  styleUrls: ["./admin-principal-create.component.scss"]
})
export class AdminPrincipalCreateComponent {
  // Vertical Stepper
  verticalStepperStep1: FormGroup;
  verticalStepperStep2: FormGroup;
  wilayah: FormGroup;
  wilayah_2: FormGroup;

  verticalStepperStep1Errors: any;
  verticalStepperStep2Errors: any;

  listRole: Array<any>;
  submitting: Boolean;

  listLevelArea: any[];
  list: any;
  list2: any;

  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;

  constructor(
    private formBuilder: FormBuilder,
    private adminPrincipalService: AdminPrincipalService,
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
    this.list2 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.listRole = this.activatedRoute.snapshot.data["listRole"].data;
    console.log('listROLE__', this.listRole);
  }

  ngOnInit() {
    this.verticalStepperStep1 = this.formBuilder.group({
      nama: ["", Validators.required],
      username: [""],
      email: ["", Validators.required]
    });

    this.wilayah = this.formBuilder.group({
      national: ["", Validators.required],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })

    this.wilayah_2 = this.formBuilder.group({
      national: ["", Validators.required],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })

    this.verticalStepperStep2 = this.formBuilder.group({
      role: ["", Validators.required]
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

    this.initArea();
    this.initArea2();
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

  initArea2() {
    this.areaFromLogin.map(item => {
      let level_desc = '';
      switch (item.type.trim()) {
        case 'national':
          level_desc = 'zone';
          this.wilayah_2.get('national').setValue(item.id);
          this.wilayah_2.get('national').disable();
          break
        case 'division':
          level_desc = 'region';
          this.wilayah_2.get('zone').setValue(item.id);
          this.wilayah_2.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          this.wilayah_2.get('region').setValue(item.id);
          this.wilayah_2.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          this.wilayah_2.get('area').setValue(item.id);
          this.wilayah_2.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          this.wilayah_2.get('salespoint').setValue(item.id);
          this.wilayah_2.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          this.wilayah_2.get('district').setValue(item.id);
          this.wilayah_2.get('district').disable();
          break;
        case 'territory':
          this.wilayah_2.get('territory').setValue(item.id);
          this.wilayah_2.get('territory').disable();
          break;
      }
      this.getAudienceArea2(level_desc, item.id);
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          // this.list[selection] = res.filter(item => item.name !== 'all');
          this.list[selection] = res;
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
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list[selection] = res.filter(item => item.name !== 'all');
            this.list[selection] = res;
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
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list[selection] = res.filter(item => item.name !== 'all');
            this.list[selection] = res;
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
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list[selection] = res.filter(item => item.name !== 'all');
            this.list[selection] = res;
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
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list[selection] = res.filter(item => item.name !== 'all');
            this.list[selection] = res;
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
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list[selection] = res.filter(item => item.name !== 'all');
            this.list[selection] = res;
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

  getAudienceArea2(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          // this.list2[selection] = res.filter(item => item.name !== 'all');
          this.list2[selection] = res;
        });

        this.wilayah_2.get('region').setValue('');
        this.wilayah_2.get('area').setValue('');
        this.wilayah_2.get('salespoint').setValue('');
        this.wilayah_2.get('district').setValue('');
        this.wilayah_2.get('territory').setValue('');
        this.list2['region'] = [];
        this.list2['area'] = [];
        this.list2['salespoint'] = [];
        this.list2['district'] = [];
        this.list2['territory'] = [];
        break;
      case 'region':
        item = this.list2['zone'].length > 0 ? this.list2['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list2[selection] = res.filter(item => item.name !== 'all');
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.wilayah_2.get('region').setValue('');
        this.wilayah_2.get('area').setValue('');
        this.wilayah_2.get('salespoint').setValue('');
        this.wilayah_2.get('district').setValue('');
        this.wilayah_2.get('territory').setValue('');
        this.list2['area'] = [];
        this.list2['salespoint'] = [];
        this.list2['district'] = [];
        this.list2['territory'] = [];
        break;
      case 'area':
        item = this.list2['region'].length > 0 ? this.list2['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list2[selection] = res.filter(item => item.name !== 'all');
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.wilayah_2.get('area').setValue('');
        this.wilayah_2.get('salespoint').setValue('');
        this.wilayah_2.get('district').setValue('');
        this.wilayah_2.get('territory').setValue('');
        this.list2['salespoint'] = [];
        this.list2['district'] = [];
        this.list2['territory'] = [];
        break;
      case 'salespoint':
        item = this.list2['area'].length > 0 ? this.list2['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list2[selection] = res.filter(item => item.name !== 'all');
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.wilayah_2.get('salespoint').setValue('');
        this.wilayah_2.get('district').setValue('');
        this.wilayah_2.get('territory').setValue('');
        this.list2['district'] = [];
        this.list2['territory'] = [];
        break;
      case 'district':
        item = this.list2['salespoint'].length > 0 ? this.list2['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list2[selection] = res.filter(item => item.name !== 'all');
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.wilayah_2.get('district').setValue('');
        this.wilayah_2.get('territory').setValue('');
        this.list2['territory'] = [];
        break;
      case 'territory':
        item = this.list2['district'].length > 0 ? this.list2['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list2[selection] = res.filter(item => item.name !== 'all');
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.wilayah_2.get('territory').setValue('');
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
      let areas2 = [];
      let value = this.wilayah.getRawValue();
      let area2Value = this.wilayah_2.getRawValue();
      value = Object.entries(value).map(([key, value]) => ({ key, value }));
      area2Value = Object.entries(area2Value).map(([key, value]) => ({ key, value }));

      this.typeArea.map(type => {
        const filteredValue = value.filter(item => item.key === type && item.value);
        if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));
        const filteredValueArea2 = area2Value.filter(item => item.key === type && item.value);
        if (filteredValueArea2.length > 0) areas2.push(parseInt(filteredValueArea2[0].value));
      });

      let body = {
        name: this.verticalStepperStep1.get("nama").value,
        username: this.verticalStepperStep1.get("username").value,
        email: this.verticalStepperStep1.get("email").value,
        role_id: this.verticalStepperStep2.get("role").value,
        area_id: [_.last(areas), _.last(areas2)],
        status: 'active'
      };
      console.log('body', body);

      this.adminPrincipalService.create(body).subscribe(
        res => {
          this.dialogService.openSnackBar({
            message: "Data Berhasil Disimpan"
          });
          this.router.navigate(["user-management", "admin-principal"]);
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
