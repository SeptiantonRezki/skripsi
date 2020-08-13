import { Component, OnInit } from '@angular/core';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { VendorsService } from 'app/services/src-catalogue/vendors.service';
import { AdminPrincipalService } from 'app/services/user-management/admin-principal.service';
import * as _ from "lodash";

@Component({
  selector: 'app-vendors-edit',
  templateUrl: './vendors-edit.component.html',
  styleUrls: ['./vendors-edit.component.scss']
})
export class VendorsEditComponent implements OnInit {

  // Vertical Stepper
  formVendor: FormGroup;
  formWilayah: FormGroup;
  formArea2: FormGroup;


  formVendorErrors: any;

  submitting: Boolean;

  listLevelArea: any[];
  list: any;
  list2: any;

  listIC: any[] = [
    { name: "NON-SRC", value: "NON-SRC" },
    { name: "SRC", value: "SRC" },
    { name: "GT", value: "GT" },
    { name: "IMO", value: "IMO" },
    { name: "LAMP/HOP", value: "LAMP/HOP" }
  ];


  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;
  detailVendor: any;
  shortDetail: any;
  isDetail: Boolean;
  detailArea: any[] = [];
  detailAreaSelected2: any[] = [1];

  two_geotree: Boolean;
  first_geotree: Boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private vendorsService: VendorsService,
    private adminPrincipalService: AdminPrincipalService
  ) {
    this.submitting = false;
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];
    this.shortDetail = this.dataService.getFromStorage("detail_vendor");
    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })
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
  }

  getToolTipData(value, array) {
    if (value && array.length) {
      let msg = array.filter(item => item.id === value)[0]['name'];
      return msg;
    } else {
      return "";
    }
  }

  ngOnInit() {
    this.formVendor = this.formBuilder.group({
      nama: ["", Validators.required],
      address: ["", Validators.required],
      pic_name: [""],
      pic_email: ["", Validators.required],
      phone: ["", Validators.required],
      InternalClassification: ["", Validators.required],
    });

    this.formWilayah = this.formBuilder.group({
      national: ["", Validators.required],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })

    this.formArea2 = this.formBuilder.group({
      national: [""],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    })

    this.formVendor.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.formVendor,
        this.formVendorErrors
      );
    });

    let regex = new RegExp(/[0-9]/g);
    this.formVendor.get('phone').valueChanges.debounceTime(500).subscribe(res => {
      if (res.match(regex)) {
        if (res.substring(0, 1) == '0') {
          let phone = res.substring(1);
          this.formVendor.get('phone').setValue(phone, { emitEvent: false });
        }
      }
    })
    this.adminPrincipalService.getParentArea({ parent: this.shortDetail.area_id }).subscribe(resArea => {
      this.detailArea = resArea.data;
    })
    this.getDetail();
    // this.initArea();
  }

  getDetail() {
    this.detailArea.map(item => {
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
    this.vendorsService.show({ vendor_id: this.shortDetail.id }).subscribe(async res => {
      this.detailVendor = res.data;
      this.formVendor.get('nama').setValue(res.data.name);
      this.formVendor.get('address').setValue(res.data.address);
      this.formVendor.get('pic_name').setValue(res.data.pic_name);
      this.formVendor.get('pic_email').setValue(res.data.pic_email);
      this.formVendor.get('phone').setValue(res.data.phone_number && res.data.phone_number.split("+62")[1] ? res.data.phone_number.split("+62")[1] : res.data.phone_number);
      this.formVendor.get('InternalClassification').setValue(this.detailVendor.classification || '');

      try {

        if (this.detailVendor.area[0]) this.first_geotree = true;
        console.log('this frist', this.first_geotree);

        const parent = await this.adminPrincipalService.getParentArea({ parent: this.detailVendor.area[0] ? this.detailVendor.area[0] : 1 }).toPromise();
        this.detailArea = parent.data;

        console.log('dtail', res.data.area);
        if (res.data && res.data.area && res.data.area.length > 1) {
          const parent2ndArea = await this.adminPrincipalService.getParentArea({ parent: res.data.area[1] }).toPromise();
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
      // this.formWilayah.get('national').setValue(this.getArea('national'));
      // this.formWilayah.get('zone').setValue(this.getArea('division'));
      // this.formWilayah.get('region').setValue(this.getArea('region'));
      // this.formWilayah.get('area').setValue(this.getArea('area'));
      // this.formWilayah.get('salespoint').setValue(this.getArea('salespoint'));
      // this.formWilayah.get('district').setValue(this.getArea('district'));
      // this.formWilayah.get('territory').setValue(this.getArea('teritory'));

      if (this.isDetail) {
        this.formVendor.disable();
        this.formWilayah.disable();
      }
      console.log('res vendor', res);
    })
  }

  setDetailAdminPrincipal() {
    this.initArea();
    if (this.detailVendor && this.detailVendor.area_id && this.detailVendor.area_id.length > 1) this.initArea2();
    this.initFormGroup();
    if (this.detailVendor && this.detailVendor.area_id && this.detailVendor.area_id.length > 1) this.initFormGroup2();
  }

  getArea(selection) {
    return this.detailArea.filter(item => item.level_desc === selection).map(item => item.id)[0]
  }

  initArea() {
    this.areaFromLogin.map(item => {
      let level_desc = '';
      switch (item.type.trim()) {
        case 'national':
          level_desc = 'zone';
          this.formWilayah.get('national').setValue(item.id);
          this.formWilayah.get('national').disable();
          break
        case 'division':
          level_desc = 'region';
          this.formWilayah.get('zone').setValue(item.id);
          this.formWilayah.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          this.formWilayah.get('region').setValue(item.id);
          this.formWilayah.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          this.formWilayah.get('area').setValue(item.id);
          this.formWilayah.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          this.formWilayah.get('salespoint').setValue(item.id);
          this.formWilayah.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          this.formWilayah.get('district').setValue(item.id);
          this.formWilayah.get('district').disable();
          break;
        case 'territory':
          this.formWilayah.get('territory').setValue(item.id);
          this.formWilayah.get('territory').disable();
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
          this.formArea2.get('national').setValue(item.id);
          this.formArea2.get('national').disable();
          break
        case 'division':
          level_desc = 'region';
          this.formArea2.get('zone').setValue(item.id);
          this.formArea2.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          this.formArea2.get('region').setValue(item.id);
          this.formArea2.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          this.formArea2.get('area').setValue(item.id);
          this.formArea2.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          this.formArea2.get('salespoint').setValue(item.id);
          this.formArea2.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          this.formArea2.get('district').setValue(item.id);
          this.formArea2.get('district').disable();
          break;
        case 'territory':
          this.formArea2.get('territory').setValue(item.id);
          this.formArea2.get('territory').disable();
          break;
      }
      this.getAudienceArea2(level_desc, item.id);
    })
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          // this.list[selection] = res.filter(item => item.name !== 'all');
          this.list[selection] = res;
        });

        this.formWilayah.get('region').setValue('');
        this.formWilayah.get('area').setValue('');
        this.formWilayah.get('salespoint').setValue('');
        this.formWilayah.get('district').setValue('');
        this.formWilayah.get('territory').setValue('');
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

        this.formWilayah.get('region').setValue('');
        this.formWilayah.get('area').setValue('');
        this.formWilayah.get('salespoint').setValue('');
        this.formWilayah.get('district').setValue('');
        this.formWilayah.get('territory').setValue('');
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

        this.formWilayah.get('area').setValue('');
        this.formWilayah.get('salespoint').setValue('');
        this.formWilayah.get('district').setValue('');
        this.formWilayah.get('territory').setValue('');
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

        this.formWilayah.get('salespoint').setValue('');
        this.formWilayah.get('district').setValue('');
        this.formWilayah.get('territory').setValue('');
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

        this.formWilayah.get('district').setValue('');
        this.formWilayah.get('territory').setValue('');
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

        this.formWilayah.get('territory').setValue('');
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

  initFormGroup() {
    this.detailArea.map(item => {
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

    this.formWilayah.controls['national'].setValue(this.getArea('national'));
    this.formWilayah.controls['zone'].setValue(this.getArea('division'));
    this.formWilayah.controls['region'].setValue(this.getArea('region'));
    this.formWilayah.controls['area'].setValue(this.getArea('area'));
    this.formWilayah.controls['salespoint'].setValue(this.getArea('salespoint'));
    this.formWilayah.controls['district'].setValue(this.getArea('district'));
    this.formWilayah.controls['territory'].setValue(this.getArea('teritory'));

    if (this.isDetail) this.formWilayah.disable();
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

  getArea2(selection) {
    return this.detailAreaSelected2.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  submit(force = false) {
    if (this.formVendor.valid) {
      this.dataService.showLoading(true);
      this.submitting = true;

      let areas = [];
      let areas2 = [];
      let value = this.formWilayah.getRawValue();
      let area2value = this.formArea2.getRawValue();
      value = Object.entries(value).map(([key, value]) => ({ key, value }));
      area2value = Object.entries(area2value).map(([key, value]) => ({ key, value }));

      this.typeArea.map(type => {
        const filteredValue = value.filter(item => item.key === type && item.value);
        if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));

        const filteredValueArea2 = area2value.filter(item => item.key === type && item.value);
        if (filteredValueArea2.length > 0) areas2.push(parseInt(filteredValueArea2[0].value));
      })

      let area_id = [];
      if (this.first_geotree) area_id.unshift(_.last(areas));
      if (this.two_geotree) area_id.push(_.last(areas2));

      let body = {
        name: this.formVendor.get("nama").value,
        pic_name: this.formVendor.get("pic_name").value,
        pic_email: this.formVendor.get("pic_email").value,
        area_id: area_id,
        address: this.formVendor.get("address").value,
        phone_number: "+62" + this.formVendor.get("phone").value,
        status: 'active',
        classification: this.formVendor.get("InternalClassification").value
      };

      if (!this.first_geotree && !this.two_geotree) delete body['area_id'];

      console.log('body', body);
      if (!force) {
        this.vendorsService.update({ vendor_id: this.detailVendor.id }, body).subscribe(
          res => {
            this.dataService.showLoading(false);
            this.dialogService.openSnackBar({
              message: "Data Berhasil Disimpan"
            });
            this.router.navigate(["src-catalogue", "vendors"]);
          },
          err => {
            if (err && err.status === 403) {
              this.dialogService.brodcastCloseConfirmation();
              let data = {
                titleDialog: "Hapus Vendor secara Paksa",
                captionDialog: "Apakah anda yakin untuk menghapus Vendor ini ? Dikarenakan Vendor memiliki Pesanan yang sedang berjalan",
                confirmCallback: this.forceUpdate.bind(this),
                buttonText: ["Hapus Sekarang", "Batal"]
              };
              this.dialogService.openCustomConfirmationDialog(data);
            }
            this.submitting = false;
            this.dataService.showLoading(false);
          }
        );
      } else {
        this.vendorsService.updateWithParams({ vendor_id: this.detailVendor.id }, body, { force_update: 1 }).subscribe(
          res => {
            this.dataService.showLoading(false);
            this.dialogService.openSnackBar({
              message: "Data Berhasil Disimpan"
            });
            this.router.navigate(["src-catalogue", "vendors"]);
          },
          err => {
            this.submitting = false;
            this.dataService.showLoading(false);
          }
        );
      }

    } else {
      commonFormValidator.validateAllFields(this.formVendor);
    }
  }

  forceUpdate() {
    this.submit(true);
  }

  async setArea2(isRemove) {
    this.two_geotree = isRemove ? false : true;
    if (isRemove) {
      console.log('is remove', isRemove);
      if (this.detailVendor.area_id && this.detailVendor.area_id.length > 0) {
        this.detailVendor.area_id.pop();
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

  async setArea1(isRemove) {
    this.first_geotree = isRemove ? false : true;
    if (isRemove) {
      if (this.detailVendor.area_id && this.detailVendor.area_id.length > 0) {
        this.detailVendor.area_id.shift();
      }
    } else {
      try {
        const parent = await this.adminPrincipalService.getParentArea({ parent: 1 }).toPromise();
        this.detailArea = parent.data;

        this.initArea();
        this.initFormGroup();
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
