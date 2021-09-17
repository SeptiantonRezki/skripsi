import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { FieldForceService } from 'app/services/user-management/field-force.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import * as _ from 'underscore';

@Component({
  selector: 'app-field-force-edit',
  templateUrl: './field-force-edit.component.html',
  styleUrls: ['./field-force-edit.component.scss']
})
export class FieldForceEditComponent {
  formFF: FormGroup;
  formdataErrors: any;
  onLoad: Boolean;
  showPassword = false;
  showConfirmPassword = false;
  indexDelete: any;

  detailFF: any;
  listStatus: any[] = [
    { name: "Status Aktif", value: "active" },
    { name: "Status Non Aktif", value: "inactive" }
  ];

  listClassification: any = [
    {
      id: 1,
      name : "REE"
    },
    {
      id: 2,
      name : "WEE"
    }
  ];
  listLevelArea: any[];
  list: any;

  areaFromLogin;
  detailAreaSelected: any[];

  isDetail: Boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private fieldforceService: FieldForceService,
  ) {
    this.formdataErrors = {
      status: {},
      national: {},
      zone: {},
      region: {},
      area: {},
      salespoint: {},
      district: {},
      territory: {}
    };

    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    this.detailFF = this.dataService.getFromStorage("detail_field_force");
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
  }

  ngOnInit() {
    this.onLoad = true;

    this.formFF = this.formBuilder.group({
      fullname: [""],
      username: [""],
      status: ["", Validators.required],
      wilayah: this.formBuilder.array([], Validators.required),
      password: [""],
      password_confirmation: [""],
      version: [""],
      classification: [""]
    });

    this.formFF.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formFF, this.formdataErrors);
    });

    this.formFF.get('fullname').disable();
    this.formFF.get('username').disable();

    this.setDetail();
  }

  async setDetail() {

    this.formFF.controls['fullname'].setValue(this.detailFF.fullname);
    this.formFF.controls['username'].setValue(this.detailFF.username);
    this.formFF.controls['status'].setValue(this.detailFF.status);
    this.formFF.controls['version'].setValue(this.detailFF.version);
    this.formFF.controls['classification'].setValue(this.detailFF.classification);

    for (const { val, index } of this.detailFF.area_code.map((val, index) => ({ val, index }))) {
      const response = await this.fieldforceService.getParentByCode({ parent: val }).toPromise();
      let wilayah = this.formFF.controls['wilayah'] as FormArray;

      wilayah.push(this.formBuilder.group({
        national: [this.getArea(response, 'national'), Validators.required],
        zone: [this.getArea(response, 'division'), Validators.required],
        region: [this.getArea(response, 'region'), Validators.required],
        area: [this.getArea(response, 'area'), Validators.required],
        salespoint: [this.getArea(response, 'salespoint'), Validators.required],
        district: [this.getArea(response, 'district'), Validators.required],
        territory: [this.getArea(response, 'teritory'), Validators.required],
        list_national: this.formBuilder.array(this.listLevelArea),
        list_zone: this.formBuilder.array([]),
        list_region: this.formBuilder.array([]),
        list_area: this.formBuilder.array([]),
        list_salespoint: this.formBuilder.array([]),
        list_district: this.formBuilder.array([]),
        list_territory: this.formBuilder.array([])
      }))

      this.initArea(index);
      this.initFormGroup(response, index);

      if (this.detailFF.area_code.length === (index + 1)) {
        this.onLoad = false;
        if (this.isDetail) this.formFF.disable();
      }
    }
    this.formFF.controls['version'].disable();
    // this.formFF.controls['classification'].disable();

  }

  createWilayah(): FormGroup {
    return this.formBuilder.group({
      national: [1, Validators.required],
      zone: ["", Validators.required],
      salespoint: ["", Validators.required],
      region: ["", Validators.required],
      area: ["", Validators.required],
      district: ["", Validators.required],
      territory: ["", Validators.required],
      list_national: this.formBuilder.array(this.listLevelArea),
      list_zone: this.formBuilder.array([]),
      list_region: this.formBuilder.array([]),
      list_area: this.formBuilder.array([]),
      list_salespoint: this.formBuilder.array([]),
      list_district: this.formBuilder.array([]),
      list_territory: this.formBuilder.array([])
    })
  }

  initArea(index) {
    let wilayah = this.formFF.controls['wilayah'] as FormArray;
    this.areaFromLogin.map(item => {
      switch (item.type.trim()) {
        case 'national':
          console.log(wilayah.at(index));
          wilayah.at(index).get('national').disable();
          break
        case 'division':
          wilayah.at(index).get('zone').disable();
          break;
        case 'region':
          wilayah.at(index).get('region').disable();
          break;
        case 'area':
          wilayah.at(index).get('area').disable();
          break;
        case 'salespoint':
          wilayah.at(index).get('salespoint').disable();
          break;
        case 'district':
          wilayah.at(index).get('district').disable();
          break;
        case 'territory':
          wilayah.at(index).get('territory').disable();
          break;
      }
    })
  }

  initFormGroup(response, index) {
    response.data.map(item => {
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
      this.generataList(level_desc, item.id, index, 'render');
    });
  }

  async generataList(selection, id, index, type) {
    let item: any;
    let wilayah = this.formFF.controls['wilayah'] as FormArray;
    switch (selection) {
      case 'zone':
        const response = await this.fieldforceService.getListOtherChildren({ parent_id: id }).toPromise();
        let list = wilayah.at(index).get(`list_${selection}`) as FormArray;

        while (list.length > 0) {
          list.removeAt(list.length - 1);
        }

        _.clone(response.filter(item => item.name !== 'all') || []).map(item => {
          list.push(this.formBuilder.group(item));
        });

        if (type !== 'render') {
          wilayah.at(index).get('region').setValue(null);
          wilayah.at(index).get('area').setValue('');
          wilayah.at(index).get('salespoint').setValue('');
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          this.clearFormArray(index, 'list_region');
          this.clearFormArray(index, 'list_area');
          this.clearFormArray(index, 'list_salespoint');
          this.clearFormArray(index, 'list_district');
          this.clearFormArray(index, 'list_territory');
        }
        break;
      case 'region':
        item = wilayah.at(index).get('list_zone').value.length > 0 ? wilayah.at(index).get('list_zone').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          const response = await this.fieldforceService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response.filter(item => item.name !== 'all') || []).map(item => {
            list.push(this.formBuilder.group(item));
          });
        } else {
          wilayah.at(index).get(`list_${selection}`).setValue([]);
        }

        if (type !== 'render') {
          wilayah.at(index).get('region').setValue('');
          wilayah.at(index).get('area').setValue('');
          wilayah.at(index).get('salespoint').setValue('');
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          this.clearFormArray(index, 'list_area');
          this.clearFormArray(index, 'list_salespoint');
          this.clearFormArray(index, 'list_district');
          this.clearFormArray(index, 'list_territory');
        }
        break;
      case 'area':
        item = wilayah.at(index).get('list_region').value.length > 0 ? wilayah.at(index).get('list_region').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          const response = await this.fieldforceService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response.filter(item => item.name !== 'all') || []).map(item => {
            list.push(this.formBuilder.group(item));
          });
        } else {
          wilayah.at(index).get(`list_${selection}`).setValue([]);
        }

        if (type !== 'render') {
          wilayah.at(index).get('area').setValue('');
          wilayah.at(index).get('salespoint').setValue('');
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          this.clearFormArray(index, 'list_salespoint');
          this.clearFormArray(index, 'list_district');
          this.clearFormArray(index, 'list_territory');
        }
        break;
      case 'salespoint':
        item = wilayah.at(index).get('list_area').value.length > 0 ? wilayah.at(index).get('list_area').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          const response = await this.fieldforceService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response.filter(item => item.name !== 'all') || []).map(item => {
            list.push(this.formBuilder.group(item));
          });
        } else {
          wilayah.at(index).get(`list_${selection}`).setValue([]);
        }

        if (type !== 'render') {
          wilayah.at(index).get('salespoint').setValue('');
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          this.clearFormArray(index, 'list_district');
          this.clearFormArray(index, 'list_territory');
        }
        break;
      case 'district':
        item = wilayah.at(index).get('list_salespoint').value.length > 0 ? wilayah.at(index).get('list_salespoint').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          const response = await this.fieldforceService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response.filter(item => item.name !== 'all') || []).map(item => {
            list.push(this.formBuilder.group(item));
          });
        } else {
          wilayah.at(index).get(`list_${selection}`).setValue([]);
        }

        if (type !== 'render') {
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          this.clearFormArray(index, 'list_territory');
        }
        break;
      case 'territory':
        item = wilayah.at(index).get('list_district').value.length > 0 ? wilayah.at(index).get('list_district').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          const response = await this.fieldforceService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response.filter(item => item.name !== 'all') || []).map(item => {
            list.push(this.formBuilder.group(item));
          });
        } else {
          wilayah.at(index).get(`list_${selection}`).setValue([]);
        }

        if (type !== 'render') {
          wilayah.at(index).get('territory').setValue('');
        }
        break;

      default:
        break;
    }
  }

  getArea(response, selection) {
    return response.data.filter(item => item.level_desc === selection).map(item => item.id)[0]
  }

  submit() {
    if (this.formFF.valid) {
      let wilayah = this.formFF.controls['wilayah'] as FormArray;

      let body = {
        _method: "PUT",
        username: this.formFF.get("username").value,
        name: this.formFF.get("fullname").value,
        areas: wilayah.value.map(item => item.territory),
        status: this.formFF.get("status").value,
        classification: this.formFF.get("classification").value
      };

      if (this.formFF.get("password").value)
        body['password'] = this.formFF.get("password").value;

      if (this.formFF.get("password_confirmation").value)
        body['password_confirmation'] = this.formFF.get("password_confirmation").value;

      this.fieldforceService.put(body, { fieldforce_id: this.detailFF.id }).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: "Data Berhasil Diubah" });
          this.router.navigate(["user-management", "field-force"]);
          window.localStorage.removeItem("detail_field_force");
        },
        err => { }
      );
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formFF);
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

  addWilayah() {
    let wilayah = this.formFF.controls['wilayah'] as FormArray;
    // if (wilayah.length < 2) {
    wilayah.push(this.createWilayah());
    const index = wilayah.length > 0 ? (wilayah.length - 1) : 0
    this.initArea(index);
    this.generataList('zone', 1, index, 'render');
    // }
  }

  deleteWilayah(idx) {
    this.indexDelete = idx;
    let data = {
      titleDialog: "Hapus Geotree",
      captionDialog: `Apakah anda yakin untuk menghapus Geotree ${idx + 1} ?`,
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    let wilayah = this.formFF.controls['wilayah'] as FormArray;
    wilayah.removeAt(this.indexDelete);
    this.dialogService.brodcastCloseConfirmation();
  }

  clearFormArray = (index, selection) => {
    let wilayah = this.formFF.controls['wilayah'] as FormArray;
    let list = wilayah.at(index).get(selection) as FormArray;
    while (list.length > 0) {
      list.removeAt(list.length - 1);
    }
  }

}
