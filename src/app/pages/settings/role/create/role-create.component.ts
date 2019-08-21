import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { AccessService } from '../../../../services/settings/access.service';
import { ActivatedRoute, Router } from '@angular/router';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';

import * as _ from 'underscore';

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

  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;

  constructor(
    private dialogService: DialogService,
    private accessService: AccessService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) {
    this.roles = this.activatedRoute.snapshot.data['menu'];
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
      // national: ["", Validators.required],
      // zone: [""],
      // region: [""],
      // area: [""],
      // salespoint: [""],
      // district: [""],
      // territory: [""]
    })

    this.formRolesGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formRolesGroup, this.formRolesError);
    })

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
        permissions: role
      }


      this.accessService.create(body).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: 'Data berhasil disimpan' });
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

}
