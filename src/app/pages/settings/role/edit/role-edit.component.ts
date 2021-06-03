import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { AccessService } from '../../../../services/settings/access.service';
import { ActivatedRoute, Router } from '@angular/router';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';
import { RetailerService } from '../../../../services/user-management/retailer.service';

import * as _ from 'underscore';

@Component({
  selector: 'app-role-edit',
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.scss']
})
export class RoleEditComponent {

  roles: Array<any>[];
  formRolesGroup: FormGroup;
  formRolesError: any;
  roleId: any;
  onLoad: boolean;

  listLevelArea: any[];
  list: any;
  detailRoles: any;
  isDetail: Boolean;

  typeArea: any[] = ["national", "zone", "region", "area", "salespoint", "district", "territory"];
  areaFromLogin;

  constructor(
    private dialogService: DialogService,
    private dataService: DataService,
    private accessService: AccessService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private retailerService: RetailerService,
  ) {
    this.onLoad = true;
    this.roles = this.activatedRoute.snapshot.data['menu'];
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];

    this.formRolesError = {
      name: ''
    }

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

    this.activatedRoute.url.subscribe(param => {
      this.roleId = param[2].path;
      this.isDetail = param[1].path === 'detail' ? true : false;
    });
  }

  ngOnInit() {
    this.formRolesGroup = this.formBuilder.group({
      name: ["", Validators.required],
      national: ["", Validators.required],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    })

    this.formRolesGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formRolesGroup, this.formRolesError);
    })

    this.getDetailRole();
  }

  getDetailRole(): void {
    this.accessService.getDetail({ role_id: this.roleId }).subscribe(res => {
      this.detailRoles = res;
      this.roles = res.role;

      this.onLoad = false;
      this.initArea();
      this.initFormGroup();
    })
  }

  initArea() {
    this.areaFromLogin.map(item => {
      switch (item.type.trim()) {
        case 'national':
          this.formRolesGroup.get('national').disable();
          // this.formRolesGroup.get('national').setValue(item.id);
          break
        case 'division':
          this.formRolesGroup.get('zone').disable();
          // this.formRolesGroup.get('national').setValue(item.id);
          break;
        case 'region':
          this.formRolesGroup.get('region').disable();
          // this.formRolesGroup.get('national').setValue(item.id);
          break;
        case 'area':
          this.formRolesGroup.get('area').disable();
          // this.formRolesGroup.get('national').setValue(item.id);
          break;
        case 'salespoint':
          this.formRolesGroup.get('salespoint').disable();
          // this.formRolesGroup.get('national').setValue(item.id);
          break;
        case 'district':
          this.formRolesGroup.get('district').disable();
          // this.formRolesGroup.get('national').setValue(item.id);
          break;
        case 'territory':
          this.formRolesGroup.get('territory').disable();
          // this.formRolesGroup.get('national').setValue(item.id);
          break;
      }
    })
  }

  initFormGroup() {
    (this.detailRoles.areas || []).map(item => {
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

    this.formRolesGroup.get('name').setValue(this.detailRoles.nama_akses);
    this.formRolesGroup.get('national').setValue(this.getArea('national'));
    this.formRolesGroup.get('zone').setValue(this.getArea('division'));
    this.formRolesGroup.get('region').setValue(this.getArea('region'));
    this.formRolesGroup.get('area').setValue(this.getArea('area'));
    this.formRolesGroup.get('salespoint').setValue(this.getArea('salespoint'));
    this.formRolesGroup.get('district').setValue(this.getArea('district'));
    this.formRolesGroup.get('territory').setValue(this.getArea('teritory'));

    if (this.isDetail) this.formRolesGroup.disable();
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.accessService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          this.list[selection] = res;
        });

        this.formRolesGroup.get('region').setValue('');
        this.formRolesGroup.get('area').setValue('');
        this.formRolesGroup.get('salespoint').setValue('');
        this.formRolesGroup.get('district').setValue('');
        this.formRolesGroup.get('territory').setValue('');
        this.list['region'] = [];
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'region':
        item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.accessService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formRolesGroup.get('region').setValue('');
        this.formRolesGroup.get('area').setValue('');
        this.formRolesGroup.get('salespoint').setValue('');
        this.formRolesGroup.get('district').setValue('');
        this.formRolesGroup.get('territory').setValue('');
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'area':
        item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.accessService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formRolesGroup.get('area').setValue('');
        this.formRolesGroup.get('salespoint').setValue('');
        this.formRolesGroup.get('district').setValue('');
        this.formRolesGroup.get('territory').setValue('');
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'salespoint':
        item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.accessService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formRolesGroup.get('salespoint').setValue('');
        this.formRolesGroup.get('district').setValue('');
        this.formRolesGroup.get('territory').setValue('');
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'district':
        item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.accessService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formRolesGroup.get('district').setValue('');
        this.formRolesGroup.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.accessService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res;
          });
        } else {
          this.list[selection] = []
        }

        this.formRolesGroup.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  getArea(selection) {
    return (this.detailRoles.areas || []).filter(item => item.level_desc === selection).map(item => item.id)[0]
  }

  submit(): void {
    if (this.formRolesGroup.status === 'VALID') {

      let areas = [];
      let value = this.formRolesGroup.getRawValue();
      value = Object.entries(value).map(([key, value]) => ({ key, value }));

      this.typeArea.map(type => {
        const filteredValue = value.filter(item => item.key === type && item.value);
        if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));
      })

      let role = [];
      for (const classification of this.roles) {
        for (const menu of classification['menu']) {
          for (const values of menu['value']) {
            if (values['status']) {
              role.push(values['value'])
            }
          }
        }
      }

      let body = {
        _method: 'PUT',
        name: this.formRolesGroup.get('name').value,
        area_id: _.last(areas),
        permissions: role
      }

      this.accessService.put(body, { role_id: this.roleId }).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: 'Data berhasil disimpan' });
          this.router.navigate(['settings', 'access']);
          this.dataService.setEncryptedPermissions(body.permissions);
        },
        err => {
          console.log(err.error.message);
        }
      )
    } else {
      this.dialogService.openSnackBar({ message: 'Silakan lengkapi data terlebih dahulu!' })
    }
  }

  setTargetSubmenu(targetRole, targetItems, status) {

    // drill until target submenu found, then set all submenu status to false
    this.roles.map((roleValue) => {

      if (roleValue['nama'] === targetRole['nama']) {


        roleValue['menu'].map((menuValue) => {

          if (menuValue.nama === targetItems.nama) {


            menuValue['value'].map((targetValue) => {

              if (targetValue.submenu) {

                targetValue.status = status;
                return targetValue;

              }

            });

          }

        })
      }
    });
  }

  clearParents(targetRole, targetItems, name) {
    this.roles.map((roleValue) => {

      if (roleValue['nama'] === targetRole['nama']) {


        roleValue['menu'].map((menuValue) => {

          if (menuValue.nama === targetItems.nama) {

            menuValue['value'].map((targetValue) => {
              if (targetValue['nama'] === name) {
                targetValue.status = false;
                return targetValue;
              }
            });

          }

        })
      }
    });
  }

  onToggleChange(targetItem, targetItems, targetRole, event) {
    console.log("targetsss", targetItem, targetItems, targetRole);
    let hasActiveParents = [];
    let hasActiveChildren = [];

    _.map(targetItems.value, (val) => {
      if (!val.submenu) {
        if (val.nama === 'ubah') {
          hasActiveParents.push(val.status);
        }
      }
      else { hasActiveChildren.push(val.status); }
    });

    // if target is submenu, then target dont have active parents, then avoid action
    if (targetItem.submenu) {

      if (!hasActiveParents.includes(true)) {

        console.log({ event });
        event.source.checked = false;

      }
      else if (!hasActiveChildren.includes(true)) {
        this.clearParents(targetRole, targetItems, 'ubah');
      }

    }
    else if (targetItem.nama === 'ubah' && event.checked) {

      this.setTargetSubmenu(targetRole, targetItems, true);

    }
    // else targetItem is not submenu but have any submenu activated and dont have active parents, then clear all submenu
    else {

      if (!hasActiveParents.includes(true)) {
        // deactive all submenu
        this.setTargetSubmenu(targetRole, targetItems, false);
      }
    }

  }

}
