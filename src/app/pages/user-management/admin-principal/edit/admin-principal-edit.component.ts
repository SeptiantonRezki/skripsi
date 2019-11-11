import { Component } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../../../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { AdminPrincipalService } from "../../../../services/user-management/admin-principal.service";
import * as _ from 'underscore';
import { MatTabChangeEvent } from "@angular/material";

@Component({
  selector: "app-admin-principal-edit",
  templateUrl: "./admin-principal-edit.component.html",
  styleUrls: ["./admin-principal-edit.component.scss"]
})
export class AdminPrincipalEditComponent {
  formAdmin: FormGroup;
  formArea2: FormGroup;
  formdataErrors: any;

  listRole: Array<any>;
  detailAdminPrincipal: any;
  listStatus: any[] = [
    { name: "Status Aktif", value: "active" },
    { name: "Status Non Aktif", value: "inactive" }
  ];

  listLevelArea: any[];
  list: any;
  list2: any;

  typeArea: any[] = ["national", "zone", "region", "area", "salespoint", "district", "territory"];
  areaFromLogin;
  detailAreaSelected: any[];
  detailAreaSelected2: any[] = [1];

  isDetail: Boolean;
  principal_id: any;
  two_geotree: Boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private adminPrincipalService: AdminPrincipalService
  ) {
    this.activatedRoute.url.subscribe(param => {
      this.isDetail = param[1].path === 'detail' ? true : false;
      this.principal_id = param[2].path;
    });
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];
    this.listLevelArea = [
      {
        "id": 1,
        "parent_id": null,
        "code": "SLSNTL      ",
        "name": "SSLSNTL"
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

    this.formdataErrors = {
      name: {},
      username: {},
      email: {},
      role: {}
    };

    this.listRole = this.activatedRoute.snapshot.data["listRole"].data;
  }

  async ngOnInit() {
    this.formAdmin = this.formBuilder.group({
      name: ["", Validators.required],
      username: [""],
      email: ["", Validators.required],
      role: ["", Validators.required],
      status: [""],
      password: [""],
      confirmation_password: [""],
      national: ["", Validators.required],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    });

    this.formArea2 = this.formBuilder.group({
      national: [""],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    })

    try {
      const response = await this.adminPrincipalService.getDetailById({ principal_id: this.principal_id }).toPromise();
      this.detailAdminPrincipal = response;
      console.log('detail_admin principal', response);

      const parent = await this.adminPrincipalService.getParentArea({ parent: this.detailAdminPrincipal.area_id[0] }).toPromise();
      this.detailAreaSelected = parent.data;

      console.log('dtail', response.area);
      if (response && response.area_id && response.area_id.length > 1) {
        const parent2ndArea = await this.adminPrincipalService.getParentArea({ parent: response.area_id[1] }).toPromise();
        this.detailAreaSelected2 = parent2ndArea.data;
        this.two_geotree = true;
      }
      this.setDetailAdminPrincipal();
    } catch (error) {
      if (error.status === 404) {
        this.dialogService.openSnackBar({ message: "Data tidak ditemukan" });
        this.router.navigate(["user-management", "admin-principal"]);
      }
      throw error;
    }

    this.formAdmin.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formAdmin, this.formdataErrors);
    });
  }

  setDetailAdminPrincipal() {
    this.initArea();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 1) this.initArea2();
    this.initFormGroup();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 1) this.initFormGroup2();
  }

  initArea() {
    this.areaFromLogin.map(item => {
      switch (item.type.trim()) {
        case 'national':
          this.formAdmin.get('national').disable();
          break
        case 'division':
          this.formAdmin.get('zone').disable();
          break;
        case 'region':
          this.formAdmin.get('region').disable();
          break;
        case 'area':
          this.formAdmin.get('area').disable();
          break;
        case 'salespoint':
          this.formAdmin.get('salespoint').disable();
          break;
        case 'district':
          this.formAdmin.get('district').disable();
          break;
        case 'territory':
          this.formAdmin.get('territory').disable();
          break;
      }
    })
  }

  initArea2() {
    this.areaFromLogin.map(item => {
      switch (item.type.trim()) {
        case 'national':
          this.formArea2.get('national').disable();
          break
        case 'division':
          this.formArea2.get('zone').disable();
          break;
        case 'region':
          this.formArea2.get('region').disable();
          break;
        case 'area':
          this.formArea2.get('area').disable();
          break;
        case 'salespoint':
          this.formArea2.get('salespoint').disable();
          break;
        case 'district':
          this.formArea2.get('district').disable();
          break;
        case 'territory':
          this.formArea2.get('territory').disable();
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

    this.formAdmin.controls['name'].setValue(this.detailAdminPrincipal.fullname);
    this.formAdmin.controls['username'].setValue(this.detailAdminPrincipal.username);
    this.formAdmin.controls['email'].setValue(this.detailAdminPrincipal.email);
    this.formAdmin.controls['role'].setValue(this.detailAdminPrincipal.role_id);
    this.formAdmin.controls['status'].setValue(this.detailAdminPrincipal.status);
    this.formAdmin.controls['national'].setValue(this.getArea('national'));
    this.formAdmin.controls['zone'].setValue(this.getArea('division'));
    this.formAdmin.controls['region'].setValue(this.getArea('region'));
    this.formAdmin.controls['area'].setValue(this.getArea('area'));
    this.formAdmin.controls['salespoint'].setValue(this.getArea('salespoint'));
    this.formAdmin.controls['district'].setValue(this.getArea('district'));
    this.formAdmin.controls['territory'].setValue(this.getArea('teritory'));

    this.formAdmin.controls['username'].disable();
    if (this.isDetail) this.formAdmin.disable();
  }

  initFormGroup2() {
    this.detailAreaSelected2.map(item => {
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
      this.getAudienceArea2(level_desc, item.id);
    });

    this.formArea2.controls['national'].setValue(this.getArea2('national'));
    this.formArea2.controls['zone'].setValue(this.getArea2('division'));
    this.formArea2.controls['region'].setValue(this.getArea2('region'));
    this.formArea2.controls['area'].setValue(this.getArea2('area'));
    this.formArea2.controls['salespoint'].setValue(this.getArea2('salespoint'));
    this.formArea2.controls['district'].setValue(this.getArea2('district'));
    this.formArea2.controls['territory'].setValue(this.getArea2('teritory'));

    // this.formArea2.controls['username'].disable();
    if (this.isDetail) this.formArea2.disable();
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          this.list[selection] = res;
        });

        this.formAdmin.get('region').setValue('');
        this.formAdmin.get('area').setValue('');
        this.formAdmin.get('salespoint').setValue('');
        this.formAdmin.get('district').setValue('');
        this.formAdmin.get('territory').setValue('');
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
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formAdmin.get('region').setValue('');
        this.formAdmin.get('area').setValue('');
        this.formAdmin.get('salespoint').setValue('');
        this.formAdmin.get('district').setValue('');
        this.formAdmin.get('territory').setValue('');
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'area':
        item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formAdmin.get('area').setValue('');
        this.formAdmin.get('salespoint').setValue('');
        this.formAdmin.get('district').setValue('');
        this.formAdmin.get('territory').setValue('');
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'salespoint':
        item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formAdmin.get('salespoint').setValue('');
        this.formAdmin.get('district').setValue('');
        this.formAdmin.get('territory').setValue('');
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'district':
        item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formAdmin.get('district').setValue('');
        this.formAdmin.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formAdmin.get('territory').setValue('');
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
          this.list2[selection] = res;
        });

        this.formArea2.get('region').setValue('');
        this.formArea2.get('area').setValue('');
        this.formArea2.get('salespoint').setValue('');
        this.formArea2.get('district').setValue('');
        this.formArea2.get('territory').setValue('');
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
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.formArea2.get('region').setValue('');
        this.formArea2.get('area').setValue('');
        this.formArea2.get('salespoint').setValue('');
        this.formArea2.get('district').setValue('');
        this.formArea2.get('territory').setValue('');
        this.list2['area'] = [];
        this.list2['salespoint'] = [];
        this.list2['district'] = [];
        this.list2['territory'] = [];
        break;
      case 'area':
        item = this.list2['region'].length > 0 ? this.list2['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.formArea2.get('area').setValue('');
        this.formArea2.get('salespoint').setValue('');
        this.formArea2.get('district').setValue('');
        this.formArea2.get('territory').setValue('');
        this.list2['salespoint'] = [];
        this.list2['district'] = [];
        this.list2['territory'] = [];
        break;
      case 'salespoint':
        item = this.list2['area'].length > 0 ? this.list2['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.formArea2.get('salespoint').setValue('');
        this.formArea2.get('district').setValue('');
        this.formArea2.get('territory').setValue('');
        this.list2['district'] = [];
        this.list2['territory'] = [];
        break;
      case 'district':
        item = this.list2['salespoint'].length > 0 ? this.list2['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.formArea2.get('district').setValue('');
        this.formArea2.get('territory').setValue('');
        this.list2['territory'] = [];
        break;
      case 'territory':
        item = this.list2['district'].length > 0 ? this.list2['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.formArea2.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  getArea(selection) {
    return this.detailAreaSelected.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  getArea2(selection) {
    return this.detailAreaSelected2.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  submit() {
    if (this.formAdmin.valid) {
      let areas = [];
      let areas2 = [];
      let value = this.formAdmin.getRawValue();
      let area2value = this.formArea2.getRawValue();
      value = Object.entries(value).map(([key, value]) => ({ key, value }));
      area2value = Object.entries(area2value).map(([key, value]) => ({ key, value }));

      this.typeArea.map(type => {
        const filteredValue = value.filter(item => item.key === type && item.value);
        if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));

        const filteredValueArea2 = area2value.filter(item => item.key === type && item.value);
        if (filteredValueArea2.length > 0) areas2.push(parseInt(filteredValueArea2[0].value));
      })

      let area_id = [_.last(areas)];
      if (this.two_geotree) area_id.push(_.last(areas2));

      let body = {
        _method: "PUT",
        name: this.formAdmin.get("name").value,
        username: this.formAdmin.get("username").value,
        email: this.formAdmin.get("email").value,
        role_id: this.formAdmin.get("role").value,
        status: this.formAdmin.get("status").value,
        area_id: area_id
      };

      this.dataService.showLoading(true);
      this.adminPrincipalService.put(body, { principal_id: this.detailAdminPrincipal.id }).subscribe(
        res => {
          this.dialogService.openSnackBar({
            message: "Data Berhasil Diubah"
          });
          this.router.navigate(["user-management", "admin-principal"]);
          this.dataService.showLoading(false);
        },
        err => { this.dataService.showLoading(false); }
      );
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formAdmin);
    }
  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    // this.selectedTab = tabChangeEvent.index;
  }

  getToolTipData(value, array) {
    if (value && array.length) {
      let msg = array.filter(item => item.id === value)[0];
      let name = "";

      if (msg.name === "all") {
        switch (msg.level_desc) {
          case "national":
            name = "Semua Zona";
            break;

          case "division":
            name = "Semua Regional";
            break;

          case "region":
            name = "Semua Area";
            break;

          case "area":
            name = "Semua Salespoint";
            break;

          case "salespoint":
            name = "Semua District";
            break;

          case "district":
            name = "Semua Territory";
            break;
        }

        return name;
      }

      return msg.name;
    } else {
      return "";
    }
  }

  async setArea2(isRemove) {
    this.two_geotree = isRemove ? false : true;
    if (isRemove) {
      console.log('is remove', isRemove);
      if (this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 1) {
        this.detailAdminPrincipal.area_id.pop();
      }
    } else {
      try {
        const parent2ndArea = await this.adminPrincipalService.getParentArea({ parent: 1 }).toPromise();
        this.detailAreaSelected2 = parent2ndArea.data;

        this.initArea2();
        this.initFormGroup2();
      } catch (error) {
        if (error.status === 404) {
          this.dialogService.openSnackBar({ message: "Data tidak ditemukan" });
          this.router.navigate(["user-management", "admin-principal"]);
        }
        throw error;
      }
    }
  }
}
