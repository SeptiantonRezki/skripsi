import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { PaguyubanService } from 'app/services/user-management/paguyuban.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import * as _ from 'underscore';
import { PasswordValidator } from 'app/validators/password.validator';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-paguyuban-edit',
  templateUrl: './paguyuban-edit.component.html',
  styleUrls: ['./paguyuban-edit.component.scss']
})
export class PaguyubanEditComponent {

  formPaguyuban: FormGroup;
  formdataErrors: any;

  listAdminPrincipal: Array<any>;
  detailPaguyuban: any;
  listStatus: any[] = [
    { name: "Status Aktif", value: "active" },
    { name: "Status Non Aktif", value: "inactive" }
  ];

  listLevelArea: any[];
  list: any;

  typeArea: any[] = ["national", "zone", "region", "area", "salespoint", "district", "territory"];
  areaFromLogin;
  detailAreaSelected: any[];

  showPassword = false;
  showConfirmPassword = false;

  isDetail: Boolean;
  firstInit: Boolean;
  submitting: Boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private paguyubanService: PaguyubanService,
    private ls: LanguagesService
  ) {
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];
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

    this.formdataErrors = {
      fullname: {},
      username: {},
      group_name: {},
      principal_id: {}
    };

    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    // this.listAdminPrincipal = this.activatedRoute.snapshot.data["listAdminPrincipal"].data;
    this.detailPaguyuban = this.dataService.getFromStorage("detail_paguyuban");
    this.firstInit = true;
  }

  ngOnInit() {
    this.formPaguyuban = this.formBuilder.group({
      fullname: ["", Validators.required],
      username: ["", Validators.required],
      group_name: ["", Validators.required],
      principal_id: ["", Validators.required],
      status: [""],
      password: ["", [
        Validators.required,
        PasswordValidator.strong,
        // commonFormValidator.passwordRequirement
      ]],
      password_confirmation: ["", Validators.required],
      national: ["", Validators.required],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    }, { validator: PasswordValidator.matchValues('password', 'password_confirmation') });

    this.formPaguyuban.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formPaguyuban, this.formdataErrors);
    });
    this.paguyubanService.getParentArea({ parent: this.detailPaguyuban.area_id }).subscribe(res => {
      this.detailAreaSelected = res.data;

      this.setDetailPaguyuban();
    })

    let areas = [];
    let value = this.formPaguyuban.getRawValue();
    value = Object.entries(value).map(([key, value]) => ({ key, value }));

    this.typeArea.map(type => {
      const filteredValue = value.filter(item => item.key === type && item.value);
      if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));
    })

    this.paguyubanService.getListAdminPrincipal({ area: this.detailPaguyuban.area_id }).subscribe(obj => {
      this.listAdminPrincipal = obj;
      this.firstInit = false;

      let valid = _.contains(this.listAdminPrincipal.map(obj => obj["id"]), this.detailPaguyuban.principal_id);
      if (valid) {
        this.formPaguyuban.controls['principal_id'].setValue(this.detailPaguyuban.principal_id);
      }
    })
  }

  setDetailPaguyuban() {
    this.initArea();
    this.initFormGroup();
  }

  initArea() {
    this.areaFromLogin.map(item => {
      switch (item.type.trim()) {
        case 'national':
          this.formPaguyuban.get('national').disable();
          break
        case 'division':
          this.formPaguyuban.get('zone').disable();
          break;
        case 'region':
          this.formPaguyuban.get('region').disable();
          break;
        case 'area':
          this.formPaguyuban.get('area').disable();
          break;
        case 'salespoint':
          this.formPaguyuban.get('salespoint').disable();
          break;
        case 'district':
          this.formPaguyuban.get('district').disable();
          break;
        case 'territory':
          this.formPaguyuban.get('territory').disable();
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

    this.formPaguyuban.controls['fullname'].setValue(this.detailPaguyuban['paguyuban'].fullname ? this.detailPaguyuban['paguyuban'].fullname : '');
    this.formPaguyuban.controls['group_name'].setValue(this.detailPaguyuban.name);
    this.formPaguyuban.controls['username'].setValue(this.detailPaguyuban['paguyuban'].username);
    this.formPaguyuban.controls['status'].setValue(this.detailPaguyuban['paguyuban'].status);
    this.formPaguyuban.controls['national'].setValue(this.getArea('national'));
    this.formPaguyuban.controls['zone'].setValue(this.getArea('division'));
    this.formPaguyuban.controls['region'].setValue(this.getArea('region'));
    this.formPaguyuban.controls['area'].setValue(this.getArea('area'));
    this.formPaguyuban.controls['salespoint'].setValue(this.getArea('salespoint'));
    this.formPaguyuban.controls['district'].setValue(this.getArea('district'));
    this.formPaguyuban.controls['territory'].setValue(this.getArea('teritory'));

    if (this.isDetail) this.formPaguyuban.disable();
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.paguyubanService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          this.list[selection] = res.map(item => { return { ...item, name: item.name === 'all' ? 'Semua Zone' : item.name } });
        });

        this.formPaguyuban.get('region').setValue('');
        this.formPaguyuban.get('area').setValue('');
        this.formPaguyuban.get('salespoint').setValue('');
        this.formPaguyuban.get('district').setValue('');
        this.formPaguyuban.get('territory').setValue('');
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

        this.formPaguyuban.get('region').setValue('');
        this.formPaguyuban.get('area').setValue('');
        this.formPaguyuban.get('salespoint').setValue('');
        this.formPaguyuban.get('district').setValue('');
        this.formPaguyuban.get('territory').setValue('');
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

        this.formPaguyuban.get('area').setValue('');
        this.formPaguyuban.get('salespoint').setValue('');
        this.formPaguyuban.get('district').setValue('');
        this.formPaguyuban.get('territory').setValue('');
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

        this.formPaguyuban.get('salespoint').setValue('');
        this.formPaguyuban.get('district').setValue('');
        this.formPaguyuban.get('territory').setValue('');
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

        this.formPaguyuban.get('district').setValue('');
        this.formPaguyuban.get('territory').setValue('');
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

        this.formPaguyuban.get('territory').setValue('');
        break;

      default:
        break;
    }

    if (!this.firstInit) {
      this.paguyubanService.getListAdminPrincipal({ area: id }).subscribe(obj => {
        this.listAdminPrincipal = obj;
        this.formPaguyuban.controls['principal_id'].setValue('');
      })
    }
  }

  getArea(selection) {
    return this.detailAreaSelected.filter(item => item.level_desc === selection).map(item => item.id)[0]
  }

  submit() {
    if (this.formPaguyuban.valid) {
      let areas = [];
      let value = this.formPaguyuban.getRawValue();
      value = Object.entries(value).map(([key, value]) => ({ key, value }));

      this.typeArea.map(type => {
        const filteredValue = value.filter(item => item.key === type && item.value);
        if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));
      })

      let body = {
        _method: "PUT",
        fullname: this.formPaguyuban.get("fullname").value,
        group_name: this.formPaguyuban.get("group_name").value,
        username: this.formPaguyuban.get("username").value,
        principal_id: this.formPaguyuban.get("principal_id").value,
        status: this.formPaguyuban.get("status").value,
        areas: [_.last(areas)],
        password: this.formPaguyuban.get('password').value,
        password_confirmation: this.formPaguyuban.get('password_confirmation').value
      };

      if (body['password'] && !body['password_confirmation']) return this.dialogService.openSnackBar({ message: 'Konfirmasi Kata Sandi harus diisi!' });
      else if (!body['password'] && body['password_confirmation']) return this.dialogService.openSnackBar({ message: 'Kata Sandi harus diisi!' });
      else if (body['password'] !== body['password_confirmation']) return this.dialogService.openSnackBar({ message: 'Konfirmasi Kata Sandi tidak sesuai!' });

      this.submitting = true;
      console.log('body', body);
      if (body['password'] == null || body['password'] == "") delete body['password'];
      if (body['password_confirmation'] == null || body['password_confirmation'] == "") delete body['password_confirmation'];
      this.paguyubanService.put(body, { paguyuban_id: this.detailPaguyuban.id }).subscribe(
        res => {
          this.dialogService.openSnackBar({
            message: "Data berhasil diubah"
          });
          this.router.navigate(["user-management", "paguyuban"]);
          window.localStorage.removeItem("detail_paguyuban");
          this.submitting = false;
        },
        err => { this.submitting = false; }
      );
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formPaguyuban);
    }
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
}
