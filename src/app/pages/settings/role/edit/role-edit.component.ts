import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { AccessService } from '../../../../services/settings/access.service';
import { ActivatedRoute, Router } from '@angular/router';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';
import { RetailerService } from '../../../../services/user-management/retailer.service';

import * as _ from 'underscore';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

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
  Country: any[];

  listLevelArea: any[];
  list: any;
  detailRoles: any;
  isDetail: Boolean;

  typeArea: any[] = ["national", "zone", "region", "area", "salespoint", "district", "territory"];
  areaFromLogin;
  is_otp: FormControl = new FormControl("0");

  constructor(
    private dialogService: DialogService,
    private dataService: DataService,
    private accessService: AccessService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private retailerService: RetailerService,
    private ls: LanguagesService,
    private translate: TranslateService,
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
      territory: [""],
      country: [""]
    })

    this.formRolesGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formRolesGroup, this.formRolesError);
    })

    this.getCountry();
    this.getDetailRole();
  }

  getDetailRole(): void {
    this.accessService.getDetail({ role_id: this.roleId }).subscribe(res => {
      this.detailRoles = res;
      this.roles = res.role;

      let wholesalerRole = _.find(this.roles, { nama: 'management pengguna' }),
        wholesalerMenu = wholesalerRole && _.find(wholesalerRole.menu, { nama: 'wholesaler' }),
        wholesalerExportToggle = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.button.export' }),
        wholesalerViewToggle = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.lihat' }),
        phoneNumberToggleView = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.submenu.view_phone_number' }),
        rekeningToggleView = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.submenu.view_Rekening_toko' }),
        phoneNumberToggle = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.submenu.phone_number' }),
        rekeningToggle = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.submenu.Rekening_toko' }),

        retailerRole = _.find(this.roles, { nama: 'retailer' }),
        retailerMenu = retailerRole && _.find(retailerRole.menu, { nama: 'Daftar Retailer' }),
        retailerExportToggle = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.button.export' }),
        retailerViewToggle = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.lihat' }),
        retailerPhoneNumberToggleView = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.submenu.phone_number_view' }),
        retailerRekeningToggleView = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.submenu.rekening_toko_view' }),
        retailerPhoneNumberToggle = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.export.phone_number' }),
        retailerRekeningToggle = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.export.rekening_toko' });

      if (wholesalerExportToggle && wholesalerViewToggle && wholesalerViewToggle.status == false) {
        wholesalerExportToggle.disabled = true;
        wholesalerExportToggle.status = false;
      }

      if (phoneNumberToggleView.status == false) {
        phoneNumberToggle.disabled = true;
      }

      if (rekeningToggleView.status == false) {
        rekeningToggle.disabled = true;
      }
      if (retailerPhoneNumberToggleView.status == false) {
        retailerPhoneNumberToggle.disabled = true;
      }

      if (retailerRekeningToggleView.status == false) {
        retailerRekeningToggle.disabled = true;
      }

      if (retailerExportToggle && retailerViewToggle && retailerViewToggle.status == false) {
        retailerExportToggle.disabled = true;
        retailerExportToggle.status = false;
      }

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
    this.formRolesGroup.get('country').setValue(this.detailRoles.country);
    this.formRolesGroup.get('zone').setValue(this.getArea('division'));
    this.formRolesGroup.get('region').setValue(this.getArea('region'));
    this.formRolesGroup.get('area').setValue(this.getArea('area'));
    this.formRolesGroup.get('salespoint').setValue(this.getArea('salespoint'));
    this.formRolesGroup.get('district').setValue(this.getArea('district'));
    this.formRolesGroup.get('territory').setValue(this.getArea('teritory'));
    this.is_otp.setValue(this.detailRoles.is_otp + "");
    console.log("detail roles", this.detailRoles.is_otp)

    if (this.isDetail) this.formRolesGroup.disable();
    if (this.isDetail) this.is_otp.disable();
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
              role.push(values['value']);
            }
          }
        }
      }

      let body = {
        _method: 'PUT',
        name: this.formRolesGroup.get('name').value,
        country: this.formRolesGroup.get('country').value,
        area_id: _.last(areas),
        permissions: role,
        is_otp: this.is_otp.value
      }

      this.accessService.put(body, { role_id: this.roleId }).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
          this.router.navigate(['settings', 'access']);
          if (this.dataService.getDecryptedProfile().role_id == this.roleId) {
            this.dataService.setEncryptedPermissions(body.permissions);
          }
        },
        err => {
          console.log(err.error.message);
        }
      )
    } else {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') })
    }
  }

  setTargetSubmenu(targetRole, targetItems, status) {

    // drill until target submenu found, then set all submenu status to false
    this.roles.map((roleValue) => {

      if (roleValue['value'] === targetRole['value']) {

        if (roleValue['nama'] === targetRole['nama']) {
          
          roleValue['menu'].map((menuValue) => {

            if (menuValue.nama === targetItems.nama) {

              menuValue['value'].map((targetValue) => {
                
                if (targetValue.submenu && targetValue.value !== 'principal.wholesaler.submenu.view_phone_number' && targetValue.value !== 'principal.wholesaler.submenu.view_Rekening_toko' && targetValue.value !== 'principal.wholesaler.submenu.phone_number' && targetValue.value !== 'principal.wholesaler.submenu.Rekening_toko') {

                  targetValue.status = status;
                  return targetValue;

                }

              });

            }

          })

        }

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

      if (!hasActiveParents.includes(true) && targetItem.value !== 'principal.wholesaler.submenu.view_phone_number' && targetItem.value !== 'principal.wholesaler.submenu.view_Rekening_toko' && targetItem.value !== 'principal.wholesaler.submenu.phone_number' && targetItem.value !== 'principal.wholesaler.submenu.Rekening_toko') {

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

    if (targetItem.value == 'principal.wholesaler.lihat') {
      let exportWholesalerToggle = targetItems.value.find(item => {
        return item.value == 'principal.wholesaler.button.export';
      });

      if (!exportWholesalerToggle) {
        return;
      }

      if (event.checked) {
        exportWholesalerToggle.disabled = false;
      }
      if (!event.checked) {
        exportWholesalerToggle.disabled = true;
        exportWholesalerToggle.status = false;
      }
    }

    let checkWholesaler = targetItems.value.find(item => {
      return item.value == 'principal.wholesaler.ubah';
    });

    let checkRetailer = targetItems.value.find(item => {
      return item.value == 'principal.retailer.ubah';
    });

    let checkCustomer = targetItems.value.find(item => {
      return item.value == 'principal.customer.lihat';
    });

    // Start Wholesaler Feature
    if (targetItem.value == 'principal.wholesaler.submenu.view_phone_number') {
      let phoneNumberToggle = targetItems.value.find(item => {
        return item.value == 'principal.wholesaler.submenu.phone_number';
      });

      if (!phoneNumberToggle) {
        return;
      }

      if (event.checked) {
        phoneNumberToggle.disabled = false;
      }
      if (!event.checked) {
        phoneNumberToggle.disabled = true;
        phoneNumberToggle.status = false;
      }
    }

    if (targetItem.value == 'principal.wholesaler.submenu.view_Rekening_toko') {
      let rekeningToggle = targetItems.value.find(item => {
        return item.value == 'principal.wholesaler.submenu.Rekening_toko';
      });

      if (!rekeningToggle) {
        return;
      }

      if (event.checked) {
        rekeningToggle.disabled = false;
      }
      if (!event.checked) {
        rekeningToggle.disabled = true;
        rekeningToggle.status = false;
      }
    }
    // End Wholesaler Feature

    // Start Retailer Feature
    if (targetItem.value == 'principal.retailer.lihat') {
      let exportRetailerToggle = targetItems.value.find(item => {
        return item.value == 'principal.retailer.button.export';
      });

      if (!exportRetailerToggle) {
        return;
      }

      if (event.checked) {
        exportRetailerToggle.disabled = false;
      }
      if (!event.checked) {
        exportRetailerToggle.disabled = true;
        exportRetailerToggle.status = false;
      }
    }

    if (targetItem.value == 'principal.retailer.submenu.phone_number_view') {
      let phoneNumberToggle = targetItems.value.find(item => {
        return item.value == 'principal.retailer.export.phone_number';
      });

      if (!phoneNumberToggle) {
        return;
      }

      if (event.checked) {
        phoneNumberToggle.disabled = false;
      }
      if (!event.checked) {
        phoneNumberToggle.disabled = true;
        phoneNumberToggle.status = false;
      }
    }

    if (targetItem.value == 'principal.retailer.submenu.rekening_toko_view') {
      let rekeningToggle = targetItems.value.find(item => {
        return item.value == 'principal.retailer.export.rekening_toko';
      });

      if (!rekeningToggle) {
        return;
      }

      if (event.checked) {
        rekeningToggle.disabled = false;
      }
      if (!event.checked) {
        rekeningToggle.disabled = true;
        rekeningToggle.status = false;
      }
    }
    // End Retailer Feature

    // Start Customer Feature
    if (targetItem.value == 'principal.customer.lihat') {
      let phoneNumberToggle = targetItems.value.find(item => {
        return item.value == 'principal.customer.phone_number_and_DOB_view';
      });

      if (event.checked === false) {
        phoneNumberToggle.status = false;
        phoneNumberToggle.disabled = true;
      } else {
        phoneNumberToggle.disabled = false;
      }
    }

    if (targetItem.value == 'principal.customer.phone_number_and_DOB_view') {
      const seeToggle = targetItems.value.find(item => {
        return item.value == 'principal.customer.lihat';
      });
      if (seeToggle.status === false) {
        event.source.checked = false;
      }
    }
    // End Customer Feature
  }

  getCountry() {

    this.accessService.getCountry().subscribe(
      res => {
        this.Country = res.data;
      },
      err => {
        console.error(err);
      }
    );
    console.log("COUNTRY2", this.Country);

  }

  renameTitle(title) {
    let value = '';
    if (title.toLowerCase() === 'rekening toko') {
      value = 'Rek. Edit';
    } else if (title.toLowerCase() === 'phone number') {
      value = 'Phone Edit';
    } else if (title.toLowerCase() === 'phone number and dob view') {
      value = 'Phone & DOB View';
    } else if (title.toLowerCase() === 'view rekening toko') {
      value = 'Rek. View';
    } else if (title.toLowerCase() === 'view phone number') {
      value = 'Phone View';
    } else if (title.toLowerCase() === 'phone number pb view') {
      value = 'Phone PB View';
    } else if (title.toLowerCase() === 'rekening toko view') {
      value = 'Rek. View';
    } else if (title.toLowerCase() === 'phone number view') {
      value = 'Phone View';
    } else {
      value = title;
    }
    return value;
  }

}
