import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { AccessService } from '../../../../services/settings/access.service';
import { ActivatedRoute, Router } from '@angular/router';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';

import * as _ from 'underscore';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

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
    private ls: LanguagesService,
    private translate: TranslateService,
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
    const country = localStorage.getItem('user_country');
    const wholesalerRole = _.find(this.roles, { nama: (country === 'km') ? 'ការគ្រប់គ្រងអ្នកប្រើប្រាស់' : country === 'en-ph' ? 'User Management' :  'management pengguna' }),
      wholesalerMenu = wholesalerRole && _.find(wholesalerRole.menu, { nama: (country === 'km') ? 'អ្នកលក់ដុំ' : 'wholesaler' }),
      wholesalerExportToggle = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.button.export' }),
      wholesalerViewToggle = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.lihat' }),
      phoneNumberToggle = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.submenu.phone_number' }),
      rekeningToggle = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.submenu.rekening_toko' }),
      phoneNumberToggleView = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.submenu.view_phone_number' }),
      rekeningToggleView = wholesalerMenu && _.find(wholesalerMenu.value, { value: 'principal.wholesaler.submenu.view_rekening_toko' }),

      customerRole = wholesalerRole && _.find(wholesalerRole.menu, { nama: (country === 'km') ? 'អតិថិជន' : 'customer' }),
      phoneDOBToggle = customerRole && _.find(customerRole.value, { value: 'principal.customer.phone_number_and_dob_view' }),

      retailerRole = _.find(this.roles, { nama: 'retailer' }),
      retailerMenu = retailerRole && _.find(retailerRole.menu, { nama: 'Daftar Retailer' }),
      retailerPhoneNumberToggleView = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.submenu.phone_number_view' }),
      retailerRekeningToggleView = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.submenu.rekening_toko_view' }),
      retailerExportToggle = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.button.export' }),
      retailerViewToggle = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.lihat' }),
      retailerPhoneNumberToggle = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.submenu.phone_number' }),
      retailerRekeningToggle = retailerMenu && _.find(retailerMenu.value, { value: 'principal.retailer.submenu.rekening_toko' }),
      verifikasiFotoMenu = _.find(retailerRole.menu, item => _.find(item.value, {value: 'principal.retailer.submenu.lihat_verifikasi_foto'})),
      viewVerifFotoToggle = verifikasiFotoMenu && _.find(verifikasiFotoMenu.value, {value: 'principal.retailer.submenu.lihat_verifikasi_foto'}),
      verifFotoToggle = verifikasiFotoMenu && _.find(verifikasiFotoMenu.value, {value: 'principal.retailer.submenu.verifikasi_foto'}),
      editVerifFotoToggle = verifikasiFotoMenu && _.find(verifikasiFotoMenu.value, {value: 'principal.retailer.submenu.edit_verifikasi_foto'});

      phoneNumberToggle.disabled = true;
      rekeningToggle.disabled = true;
      retailerPhoneNumberToggle.disabled = true;
      retailerRekeningToggle.disabled = true;

      phoneNumberToggleView.disabled = true;
      rekeningToggleView.disabled = true;
      retailerPhoneNumberToggleView.disabled = true;
      retailerRekeningToggleView.disabled = true;
      retailerRekeningToggleView.disabled = true;
      console.log('datanya', this.roles);
      phoneDOBToggle.disabled = true;

    if (wholesalerExportToggle && wholesalerViewToggle && wholesalerViewToggle.status == false) {
      wholesalerExportToggle.disabled = true;
      wholesalerExportToggle.status = false;
    }

    if (retailerExportToggle && retailerViewToggle && retailerViewToggle.status == false) {
      retailerExportToggle.disabled = true;
      retailerExportToggle.status = false;
    }
    if(viewVerifFotoToggle && verifFotoToggle && editVerifFotoToggle && viewVerifFotoToggle.status == false) {
      verifFotoToggle.status = false;
      verifFotoToggle.disabled = true;
      editVerifFotoToggle.status = false;
      editVerifFotoToggle.disabled = true;
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
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') })
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

      if (!hasActiveParents.includes(true) && targetItem.value !== 'principal.wholesaler.submenu.view_phone_number' && targetItem.value !== 'principal.wholesaler.submenu.view_rekening_toko' && targetItem.value !== 'principal.wholesaler.submenu.phone_number' && targetItem.value !== 'principal.wholesaler.submenu.rekening_toko') {

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

    // Start Wholesaler Feature
    if (targetItem.value == 'principal.wholesaler.submenu.view_phone_number') {
      const phoneNumberToggle = targetItems.value.find(item => {
        return item.value == 'principal.wholesaler.submenu.phone_number';
      });

      if (!phoneNumberToggle) {
        return;
      }

      if (event.checked) {
        const ubahToggle = targetItems.value.find(item => {
          return item.value == 'principal.wholesaler.ubah';
        });
        if (ubahToggle.status === true) {
          phoneNumberToggle.disabled = false;
        }
      }
      if (!event.checked) {
        phoneNumberToggle.disabled = true;
        phoneNumberToggle.status = false;
      }
    }

    if (targetItem.value == 'principal.wholesaler.submenu.view_rekening_toko') {
      const rekeningToggle = targetItems.value.find(item => {
        return item.value == 'principal.wholesaler.submenu.rekening_toko';
      });

      if (!rekeningToggle) {
        return;
      }

      if (event.checked) {
        const ubahToggle = targetItems.value.find(item => {
          return item.value == 'principal.wholesaler.ubah';
        });
        if (ubahToggle.status === true) {
          rekeningToggle.disabled = false;
        }
      }
      if (!event.checked) {
        rekeningToggle.disabled = true;
        rekeningToggle.status = false;
      }
    }

    if (targetItem.value == 'principal.wholesaler.ubah' || targetItem.value == 'principal.wholesaler.lihat') {
      const viewRekeningToggle = targetItems.value.find(item => {
        return item.value == 'principal.wholesaler.submenu.view_rekening_toko';
      });
      const editRekeningToggle = targetItems.value.find(item => {
        return item.value == 'principal.wholesaler.submenu.rekening_toko';
      });
      const viewPhoneToggle = targetItems.value.find(item => {
        return item.value == 'principal.wholesaler.submenu.view_phone_number';
      });
      const editPhoneToggle = targetItems.value.find(item => {
        return item.value == 'principal.wholesaler.submenu.phone_number';
      });

      if (event.checked) {
        if (targetItem.value == 'principal.wholesaler.ubah') {
          if (viewPhoneToggle.status === true) {
            editPhoneToggle.disabled = false;
          }
          if (viewRekeningToggle.status === true) {
            editRekeningToggle.disabled = false;
          }
        }
        viewRekeningToggle.disabled = false;
        viewPhoneToggle.disabled = false;
      }
      if (!event.checked) {
        if (targetItem.value == 'principal.wholesaler.ubah') {
          editPhoneToggle.status = false;
          editPhoneToggle.disabled = true;
          editRekeningToggle.status = false;
          editRekeningToggle.disabled = true;
        }
        const lihatToggle = targetItems.value.find(item => {
          return item.value == 'principal.wholesaler.lihat';
        });
        const ubahToggle = targetItems.value.find(item => {
          return item.value == 'principal.wholesaler.ubah';
        });
        if (lihatToggle.status === false && ubahToggle.status === false) {
          viewRekeningToggle.status = false;
          viewRekeningToggle.disabled = true;
          editRekeningToggle.status = false;
          editRekeningToggle.disabled = true;

          viewPhoneToggle.status = false;
          viewPhoneToggle.disabled = true;
          editPhoneToggle.status = false;
          editPhoneToggle.disabled = true;
        }
      }
    }
    // End Wholesaler Feature

    // Start Retailer Feature
    if (targetItem.value == 'principal.retailer.lihat') {
      const exportRetailerToggle = targetItems.value.find(item => {
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
      const phoneNumberToggle = targetItems.value.find(item => {
        return item.value == 'principal.retailer.submenu.phone_number';
      });

      if (!phoneNumberToggle) {
        return;
      }

      if (event.checked) {
        const ubahToggle = targetItems.value.find(item => {
          return item.value == 'principal.retailer.ubah';
        });
        if (ubahToggle.status === true) {
          phoneNumberToggle.disabled = false;
        }
      }
      if (!event.checked) {
        phoneNumberToggle.disabled = true;
        phoneNumberToggle.status = false;
      }
    }

    if (targetItem.value == 'principal.retailer.submenu.rekening_toko_view') {
      const rekeningToggle = targetItems.value.find(item => {
        return item.value == 'principal.retailer.submenu.rekening_toko';
      });

      if (!rekeningToggle) {
        return;
      }

      if (event.checked) {
        const ubahToggle = targetItems.value.find(item => {
          return item.value == 'principal.retailer.ubah';
        });
        if (ubahToggle.status === true) {
          rekeningToggle.disabled = false;
        }
      }
      if (!event.checked) {
        rekeningToggle.disabled = true;
        rekeningToggle.status = false;
      }
    }

    if (targetItem.value == 'principal.retailer.ubah' || targetItem.value == 'principal.retailer.lihat') {
      const viewRekeningToggle = targetItems.value.find(item => {
        return item.value == 'principal.retailer.submenu.rekening_toko_view';
      });
      const editRekeningToggle = targetItems.value.find(item => {
        return item.value == 'principal.retailer.submenu.rekening_toko';
      });
      const viewPhoneToggle = targetItems.value.find(item => {
        return item.value == 'principal.retailer.submenu.phone_number_view';
      });
      const editPhoneToggle = targetItems.value.find(item => {
        return item.value == 'principal.retailer.submenu.phone_number';
      });

      if (event.checked) {
        if (targetItem.value == 'principal.retailer.ubah') {
          if (viewPhoneToggle.status === true) {
            editPhoneToggle.disabled = false;
          }
          if (viewRekeningToggle.status === true) {
            editRekeningToggle.disabled = false;
          }
        }
        viewRekeningToggle.disabled = false;
        viewPhoneToggle.disabled = false;
      }
      if (!event.checked) {
        if (targetItem.value == 'principal.retailer.ubah') {
          editPhoneToggle.status = false;
          editPhoneToggle.disabled = true;
          editRekeningToggle.status = false;
          editRekeningToggle.disabled = true;
        }
        const lihatToggle = targetItems.value.find(item => {
          return item.value == 'principal.retailer.lihat';
        });
        const ubahToggle = targetItems.value.find(item => {
          return item.value == 'principal.retailer.ubah';
        });
        if (lihatToggle.status === false && ubahToggle.status === false) {
          viewRekeningToggle.status = false;
          viewRekeningToggle.disabled = true;
          editRekeningToggle.status = false;
          editRekeningToggle.disabled = true;

          viewPhoneToggle.status = false;
          viewPhoneToggle.disabled = true;
          editPhoneToggle.status = false;
          editPhoneToggle.disabled = true;
        }
      }
    }
    // End Retailer Feature

    // Start Customer Feature
    if (targetItem.value == 'principal.customer.lihat') {
      const phoneNumberToggle = targetItems.value.find(item => {
        return item.value == 'principal.customer.phone_number_and_dob_view';
      });

      if (event.checked === false) {
        phoneNumberToggle.status = false;
        phoneNumberToggle.disabled = true;
      } else {
        phoneNumberToggle.disabled = false;
      }
    }

    if (targetItem.value == 'principal.customer.phone_number_and_dob_view') {
      const seeToggle = targetItems.value.find(item => {
        return item.value == 'principal.customer.lihat';
      });
      if (seeToggle.status === false) {
        event.source.checked = false;
      }
    }
    // End Customer Feature

    // Start Verifikasi Foto
    if(targetItem.value === 'principal.retailer.submenu.lihat_verifikasi_foto') {
      const verifToggle = targetItems.value.find(item => item.value === 'principal.retailer.submenu.verifikasi_foto');
      const editToggle = targetItems.value.find(item => item.value === 'principal.retailer.submenu.edit_verifikasi_foto');
      
      verifToggle.status = !event.checked ? false : true;
      verifToggle.disabled = !event.checked ? true : false;
      editToggle.status = !event.checked ? false : true;
      editToggle.disabled = !event.checked ? true : false;
      
    }
    if(targetItem.value === 'principal.retailer.submenu.verifikasi_foto') {
      const editToggle = targetItems.value.find(item => item.value === 'principal.retailer.submenu.edit_verifikasi_foto');
      editToggle.status = !event.checked ? false : true;
      editToggle.disabled = !event.checked ? true : false;
      
    }
  }

  async getCountry() {

    await this.accessService.getCountry().subscribe(
      res => {
        this.Country = res.data;
      },
      err => {
        console.error(err);
      }
    );
    console.log("COUNTRY2", this.Country);

  }

  setTargetSubmenu(targetRole, targetItems, status) {

    // drill until target submenu found, then set all submenu status to false
    this.roles.map((roleValue) => {

      if (roleValue['value'] === targetRole['value']) {

        if (roleValue['nama'] === targetRole['nama']) {
          
          roleValue['menu'].map((menuValue) => {

            if (menuValue.nama === targetItems.nama) {

              menuValue['value'].map((targetValue) => {
                
                if (targetValue.submenu && targetValue.value !== 'principal.wholesaler.submenu.view_phone_number' && targetValue.value !== 'principal.wholesaler.submenu.view_rekening_toko' && targetValue.value !== 'principal.wholesaler.submenu.phone_number' && targetValue.value !== 'principal.wholesaler.submenu.rekening_toko') {

                  targetValue.status = status;
                  targetValue.disabled = !status;
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
