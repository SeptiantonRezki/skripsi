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
  formdataErrors: any;

  listRole: Array<any>;
  detailAdminPrincipal: any;
  listStatus: any[] = [
    { name: "Status Aktif", value: "active" },
    { name: "Status Non Aktif", value: "inactive" }
  ];

  listLevelArea: any[];
  list: any;

  typeArea: any[] = ["national", "zone", "region", "area", "salespoint", "district", "territory"];
  areaFromLogin;
  detailAreaSelected: any[];

  isDetail: Boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private adminPrincipalService: AdminPrincipalService
  ) {
    this.areaFromLogin = this.dataService.getFromStorage('profile')['area_type'];
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

    this.formdataErrors = {
      name: {},
      username: {},
      email: {},
      role: {}
    };

    this.listRole = this.activatedRoute.snapshot.data["listRole"].data;
    this.detailAdminPrincipal = this.dataService.getFromStorage("detail_admin_principal");

    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })
  }

  ngOnInit() {
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

    this.formAdmin.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formAdmin, this.formdataErrors);
    });
    this.adminPrincipalService.getParentArea({ parent: this.detailAdminPrincipal.area_id[0] }).subscribe(res => {
      this.detailAreaSelected = res.data;

      this.setDetailAdminPrincipal();
    })
  }

  setDetailAdminPrincipal() {
    // this.formAdmin.setValue({
    //   name: this.detailAdminPrincipal.fullname,
    //   username: this.detailAdminPrincipal.username,
    //   email: this.detailAdminPrincipal.email,
    //   role: this.detailAdminPrincipal.role_id,
    //   status: this.detailAdminPrincipal.status,
    //   password: "",
    //   confirmation_password: ""
    // });

    this.initArea();
    this.initFormGroup();
  }

  initArea() {
    this.areaFromLogin.map(item => {
      switch (item.type.trim()) {
        case 'national':
          this.formAdmin.get('national').disable();
          // this.formAdmin.get('national').setValue(item.id);
          break
        case 'division':
          this.formAdmin.get('zone').disable();
          // this.formAdmin.get('national').setValue(item.id);
          break;
        case 'region':
          this.formAdmin.get('region').disable();
          // this.formAdmin.get('national').setValue(item.id);
          break;
        case 'area':
          this.formAdmin.get('area').disable();
          // this.formAdmin.get('national').setValue(item.id);
          break;
        case 'salespoint':
          this.formAdmin.get('salespoint').disable();
          // this.formAdmin.get('national').setValue(item.id);
          break;
        case 'district':
          this.formAdmin.get('district').disable();
          // this.formAdmin.get('national').setValue(item.id);
          break;
        case 'territory':
          this.formAdmin.get('territory').disable();
          // this.formAdmin.get('national').setValue(item.id);
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

    // this.formAdmin.setValue({
    //   name: this.detailAdminPrincipal.fullname,
    //   username: this.detailAdminPrincipal.username,
    //   email: this.detailAdminPrincipal.email,
    //   role: this.detailAdminPrincipal.role_id,
    //   status: this.detailAdminPrincipal.status,
    //   password: "",
    //   confirmation_password: "",
    //   national: this.getArea('national'),
    //   zone: this.getArea('division'),
    //   region: this.getArea('region'),
    //   area: this.getArea('area'),
    //   salespoint: this.getArea('salespoint'),
    //   district: this.getArea('district'),
    //   territory: this.getArea('teritory'),
    // });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
          this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            // this.list[selection] = res.filter(item => item.name !== 'all');
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
              // this.list[selection] = res.filter(item => item.name !== 'all');
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
              // this.list[selection] = res.filter(item => item.name !== 'all');
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
              // this.list[selection] = res.filter(item => item.name !== 'all');
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
              // this.list[selection] = res.filter(item => item.name !== 'all');
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
              // this.list[selection] = res.filter(item => item.name !== 'all');
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

  getArea(selection) {
    return this.detailAreaSelected.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  submit() {
    if (this.formAdmin.valid) {
      let areas = [];
      let value = this.formAdmin.getRawValue();
      value = Object.entries(value).map(([key, value]) => ({key, value}));

      this.typeArea.map(type => {
        const filteredValue = value.filter(item => item.key === type && item.value);
        if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));
      })

      let body = {
        _method: "PUT",
        name: this.formAdmin.get("name").value,
        username: this.formAdmin.get("username").value,
        email: this.formAdmin.get("email").value,
        role_id: this.formAdmin.get("role").value,
        status: this.formAdmin.get("status").value,
        area_id: _.last(areas)
      };

      this.adminPrincipalService
        .put(body, { principal_id: this.detailAdminPrincipal.id })
        .subscribe(
          res => {
            this.dialogService.openSnackBar({
              message: "Data Berhasil Diubah"
            });
            this.router.navigate(["user-management", "admin-principal"]);
            window.localStorage.removeItem("detail_admin_principal");
          },
          err => {}
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
    if (value && array.length){
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
}
