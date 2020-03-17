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

  formVendorErrors: any;

  submitting: Boolean;

  listLevelArea: any[];
  list: any;

  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;
  detailVendor: any;
  shortDetail: any;
  isDetail: Boolean;
  detailArea: any[] = [];

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
      phone: ["", Validators.required]
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
    this.initArea();
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
    this.vendorsService.show({ vendor_id: this.shortDetail.id }).subscribe(res => {
      this.detailVendor = res.data;
      this.formVendor.get('nama').setValue(res.data.name);
      this.formVendor.get('address').setValue(res.data.address);
      this.formVendor.get('pic_name').setValue(res.data.pic_name);
      this.formVendor.get('pic_email').setValue(res.data.pic_email);
      this.formVendor.get('phone').setValue(res.data.phone_number && res.data.phone_number.split("+62")[1] ? res.data.phone_number.split("+62")[1] : res.data.phone_number);

      this.formWilayah.get('national').setValue(this.getArea('national'));
      this.formWilayah.get('zone').setValue(this.getArea('division'));
      this.formWilayah.get('region').setValue(this.getArea('region'));
      this.formWilayah.get('area').setValue(this.getArea('area'));
      this.formWilayah.get('salespoint').setValue(this.getArea('salespoint'));
      this.formWilayah.get('district').setValue(this.getArea('district'));
      this.formWilayah.get('territory').setValue(this.getArea('teritory'));

      if (this.isDetail) {
        this.formVendor.disable();
        this.formWilayah.disable();
      }
      console.log('res vendor', res);
    })
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

  submit() {
    if (this.formVendor.valid) {
      this.dataService.showLoading(true);
      this.submitting = true;

      let areas = [];
      let value = this.formWilayah.getRawValue();
      value = Object.entries(value).map(([key, value]) => ({ key, value }));

      this.typeArea.map(type => {
        const filteredValue = value.filter(item => item.key === type && item.value);
        if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));
      });

      let body = {
        name: this.formVendor.get("nama").value,
        pic_name: this.formVendor.get("pic_name").value,
        pic_email: this.formVendor.get("pic_email").value,
        area_id: _.last(areas),
        address: this.formVendor.get("address").value,
        phone_number: "+62" + this.formVendor.get("phone").value,
        status: 'active'
      };
      console.log('body', body);

      this.vendorsService.update({ vendor_id: this.detailVendor.id }, body).subscribe(
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
    } else {
      commonFormValidator.validateAllFields(this.formVendor);
    }
  }

}
