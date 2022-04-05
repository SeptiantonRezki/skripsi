import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { AccessService } from '../../../../services/settings/access.service';
import { ActivatedRoute, Router } from '@angular/router';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';

import * as _ from 'underscore';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-role-create',
  templateUrl: './role-create.component.html',
  styleUrls: ['./role-create.component.scss']
})
export class RoleCreateComponent {

  roles: Array<any>[];
  formRolesGroup: FormGroup;
  formRolesError: any;

  listLevelArea: any[];
  list: any;
  Country: any[];

  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;
  is_otp: FormControl = new FormControl("0");

  constructor(
    private dialogService: DialogService,
    private accessService: AccessService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
    private ls: LanguagesService
  ) {
    this.roles = this.activatedRoute.snapshot.data['menu'];
    console.log(this.roles);
    // this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];

    this.formRolesError = {
      name: ''
    }

    // this.listLevelArea = [
    //   {
    //     "id": 1,
    //     "parent_id": null,
    //     "code": "SLSNTL      ",
    //     "name": "Sales National"
    //   }
    // ];

    // this.list = {
    //   zone: [],
    //   region: [],
    //   area: [],
    //   salespoint: [],
    //   district: [],
    //   territory: []
    // }
  }

  ngOnInit() {
    this.formRolesGroup = this.formBuilder.group({
      name: ['', Validators.required],
      country: [""]
      // national: ["", Validators.required],
      // zone: [""],
      // region: [""],
      // area: [""],
      // salespoint: [""],
      // district: [""],
      // territory: [""]
    })

    let wholesalerRole = _.find(this.roles, { nama: 'management pengguna' }),
      wholesalerMenu = wholesalerRole && _.find(wholesalerRole.menu, { nama: 'wholesaler' }),
      wholesalerExportToggle = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.button.export' }),
      wholesalerViewToggle = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.lihat' }),

      retailerRole = _.find(this.roles, { nama: 'retailer' }),
      retailerMenu = retailerRole && _.find(retailerRole.menu, { nama: 'Daftar Retailer' }),
      retailerExportToggle = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.button.export' }),
      retailerViewToggle = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.lihat' });

    if (wholesalerExportToggle && wholesalerViewToggle && wholesalerViewToggle.status == false) {
      wholesalerExportToggle.disabled = true;
      wholesalerExportToggle.status = false;
    }

    if (retailerExportToggle && retailerViewToggle && retailerViewToggle.status == false) {
      retailerExportToggle.disabled = true;
      retailerExportToggle.status = false;
    }

    this.formRolesGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formRolesGroup, this.formRolesError);
    })
    this.getCountry();
    // this.initArea();
  }

  // initArea() {
  //   this.areaFromLogin.map(item => {
  //     let level_desc = '';
  //     switch (item.type.trim()) {
  //       case 'national':
  //         level_desc = 'zone';
  //         this.formRolesGroup.get('national').setValue(item.id);
  //         this.formRolesGroup.get('national').disable();
  //         break
  //       case 'division':
  //         level_desc = 'region';
  //         this.formRolesGroup.get('zone').setValue(item.id);
  //         this.formRolesGroup.get('zone').disable();
  //         break;
  //       case 'region':
  //         level_desc = 'area';
  //         this.formRolesGroup.get('region').setValue(item.id);
  //         this.formRolesGroup.get('region').disable();
  //         break;
  //       case 'area':
  //         level_desc = 'salespoint';
  //         this.formRolesGroup.get('area').setValue(item.id);
  //         this.formRolesGroup.get('area').disable();
  //         break;
  //       case 'salespoint':
  //         level_desc = 'district';
  //         this.formRolesGroup.get('salespoint').setValue(item.id);
  //         this.formRolesGroup.get('salespoint').disable();
  //         break;
  //       case 'district':
  //         level_desc = 'territory';
  //         this.formRolesGroup.get('district').setValue(item.id);
  //         this.formRolesGroup.get('district').disable();
  //         break;
  //       case 'territory':
  //         this.formRolesGroup.get('territory').setValue(item.id);
  //         this.formRolesGroup.get('territory').disable();
  //         break;
  //     }
  //     this.getAudienceArea(level_desc, item.id);
  //   });
  // }

  // getAudienceArea(selection, id) {
  //   let item: any;
  //   switch (selection) {
  //     case 'zone':
  //         this.accessService.getListOtherChildren({ parent_id: id }).subscribe(res => {
  //           this.list[selection] = res.filter(item => item.name !== 'all');
  //         });

  //         this.formRolesGroup.get('region').setValue('');
  //         this.formRolesGroup.get('area').setValue('');
  //         this.formRolesGroup.get('salespoint').setValue('');
  //         this.formRolesGroup.get('district').setValue('');
  //         this.formRolesGroup.get('territory').setValue('');
  //         this.list['region'] = [];
  //         this.list['area'] = [];
  //         this.list['salespoint'] = [];
  //         this.list['district'] = [];
  //         this.list['territory'] = [];
  //       break;
  //     case 'region':
  //         item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
  //         if (item.name !== 'all') {
  //           this.accessService.getListOtherChildren({ parent_id: id }).subscribe(res => {
  //             this.list[selection] = res.filter(item => item.name !== 'all');
  //           });
  //         } else {
  //           this.list[selection] = []
  //         }

  //         this.formRolesGroup.get('region').setValue('');
  //         this.formRolesGroup.get('area').setValue('');
  //         this.formRolesGroup.get('salespoint').setValue('');
  //         this.formRolesGroup.get('district').setValue('');
  //         this.formRolesGroup.get('territory').setValue('');
  //         this.list['area'] = [];
  //         this.list['salespoint'] = [];
  //         this.list['district'] = [];
  //         this.list['territory'] = [];
  //       break;
  //     case 'area':
  //         item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
  //         if (item.name !== 'all') {
  //           this.accessService.getListOtherChildren({ parent_id: id }).subscribe(res => {
  //             this.list[selection] = res.filter(item => item.name !== 'all');
  //           });
  //         } else {
  //           this.list[selection] = []
  //         }

  //         this.formRolesGroup.get('area').setValue('');
  //         this.formRolesGroup.get('salespoint').setValue('');
  //         this.formRolesGroup.get('district').setValue('');
  //         this.formRolesGroup.get('territory').setValue('');
  //         this.list['salespoint'] = [];
  //         this.list['district'] = [];
  //         this.list['territory'] = [];
  //       break;
  //     case 'salespoint':
  //         item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
  //         if (item.name !== 'all') {
  //           this.accessService.getListOtherChildren({ parent_id: id }).subscribe(res => {
  //             this.list[selection] = res.filter(item => item.name !== 'all');
  //           });
  //         } else {
  //           this.list[selection] = []
  //         }

  //         this.formRolesGroup.get('salespoint').setValue('');
  //         this.formRolesGroup.get('district').setValue('');
  //         this.formRolesGroup.get('territory').setValue('');
  //         this.list['district'] = [];
  //         this.list['territory'] = [];
  //       break;
  //     case 'district':
  //         item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
  //         if (item.name !== 'all') {
  //           this.accessService.getListOtherChildren({ parent_id: id }).subscribe(res => {
  //             this.list[selection] = res.filter(item => item.name !== 'all');
  //           });
  //         } else {
  //           this.list[selection] = []
  //         }

  //         this.formRolesGroup.get('district').setValue('');
  //         this.formRolesGroup.get('territory').setValue('');
  //         this.list['territory'] = [];
  //       break;
  //     case 'territory':
  //         item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
  //         if (item.name !== 'all') {
  //           this.accessService.getListOtherChildren({ parent_id: id }).subscribe(res => {
  //             this.list[selection] = res.filter(item => item.name !== 'all');
  //           });
  //         } else {
  //           this.list[selection] = []
  //         }

  //         this.formRolesGroup.get('territory').setValue('');
  //       break;

  //     default:
  //       break;
  //   }
  // }

  submit(): void {
    if (this.formRolesGroup.status === 'VALID') {

      // let areas = [];
      // let value = this.formRolesGroup.getRawValue();
      // value = Object.entries(value).map(([key, value]) => ({key, value}));

      // this.typeArea.map(type => {
      //   const filteredValue = value.filter(item => item.key === type && item.value);
      //   if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));
      // })

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
        name: this.formRolesGroup.get('name').value,
        // area_id: _.last(areas),
        permissions: role,
        country: this.formRolesGroup.get('country').value,
        is_otp: this.is_otp.value
      }


      this.accessService.create(body).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
          this.router.navigate(['settings', 'access']);
        },
        err => {
          console.log(err.error.message);
        }
      )
    } else {
      this.dialogService.openSnackBar({ message: 'Silakan lengkapi data terlebih dahulu!' })
      commonFormValidator.validateAllFields(this.formRolesGroup);
    }
  }

  clearTargetSubmenu(targetRole, targetItems) {

    // drill until target submenu found, then set all submenu status to false
    this.roles.map((roleValue) => {

      if (roleValue['nama'] === targetRole['nama']) {


        roleValue['menu'].map((menuValue) => {

          if (menuValue.nama === targetItems.nama) {


            menuValue['value'].map((targetValue) => {

              if (targetValue.submenu) {

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

    let hasActiveParents = [];
    let hasActiveChildren = [];


    _.map(targetItems.value, (val) => {
      if (!val.submenu) hasActiveParents.push(val.status);
      else { hasActiveChildren.push(val.status); }
    });

    // if target is submenu, then target dont have active parents, then avoid action
    if (targetItem.submenu) {

      if (!hasActiveParents.includes(true)) {

        console.log({ event });
        event.source.checked = false;

      }

    }
    // else targetItem is not submenu but have any submenu activated and dont have active parents, then clear all submenu
    else {

      if (!hasActiveParents.includes(true)) {
        // deactive all submenu
        this.clearTargetSubmenu(targetRole, targetItems);

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

}
