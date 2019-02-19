import { Component } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../../../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { WholesalerService } from "../../../../services/user-management/wholesaler.service";

@Component({
  selector: 'app-wholesaler-edit',
  templateUrl: './wholesaler-edit.component.html',
  styleUrls: ['./wholesaler-edit.component.scss']
})
export class WholesalerEditComponent{
  formWs: FormGroup;
  formdataErrors: any;
  onLoad: Boolean;

  detailWholesaler: any;
  listStatus: any[] = [
    { name: "Status Aktif", value: "A" },
    { name: "Status Non Aktif", value: "I" },
    { name: "Status Belum Terdaftar", value: "P" }
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
    private wholesalerService: WholesalerService,
  ) {
    this.formdataErrors = {
      name: {},
      address: {},
      code: {},
      owner: {},
      phone: {},
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

    this.detailWholesaler = this.dataService.getFromStorage("detail_wholesaler");
    this.areaFromLogin = this.dataService.getFromStorage('profile')['area_type'];
    // console.log(this.detailWholesaler);

    this.listLevelArea = [
      {
        "id": 1,
        "parent_id": null,
        "code": "SLSNTL      ",
        "name": "Sales National"
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
    let regex = new RegExp(/[0-9]/g);

    this.formWs = this.formBuilder.group({
      name: ["", Validators.required],
      address: ["", Validators.required],
      code: ["", Validators.required],
      owner: ["", Validators.required],
      phone: ["", Validators.required],
      status: ["", Validators.required],
      national: ["", Validators.required],
      zone: ["", Validators.required],
      salespoint: ["", Validators.required],
      region: ["", Validators.required],
      area: ["", Validators.required],
      district: ["", Validators.required],
      territory: ["", Validators.required]
    });

    this.formWs.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formWs, this.formdataErrors);
    });

    this.wholesalerService.getParentArea({ parent: this.detailWholesaler.area_code }).subscribe(res => {
      this.detailAreaSelected = res.data;
      this.onLoad = false;

      this.initArea();
      this.initFormGroup();

      this.formWs.get('phone').valueChanges.debounceTime(500).subscribe(res => {
        if(res.match(regex)) {
          if(res.substring(0, 1) == '0'){
            let phone = res.substring(1);
            this.formWs.get('phone').setValue(phone, { emitEvent: false });
          }
        }
      })
    })
  }

  initArea() {
    this.areaFromLogin.map(item => {
      switch (item.type.trim()) {
        case 'national':
          this.formWs.get('national').disable();
          // this.formWs.get('national').setValue(item.id);
          break
        case 'division':
          this.formWs.get('zone').disable();
          // this.formWs.get('national').setValue(item.id);
          break;
        case 'region':
          this.formWs.get('region').disable();
          // this.formWs.get('national').setValue(item.id);
          break;
        case 'area':
          this.formWs.get('area').disable();
          // this.formWs.get('national').setValue(item.id);
          break;
        case 'salespoint':
          this.formWs.get('salespoint').disable();
          // this.formWs.get('national').setValue(item.id);
          break;
        case 'district':
          this.formWs.get('district').disable();
          // this.formWs.get('national').setValue(item.id);
          break;
        case 'territory':
          this.formWs.get('territory').disable();
          // this.formWs.get('national').setValue(item.id);
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

    this.formWs.setValue({
      name: this.detailWholesaler.name,
      address: this.detailWholesaler.address,
      code: this.detailWholesaler.code,
      owner: this.detailWholesaler.owner,
      phone: (this.detailWholesaler.phone) ? (this.isDetail ? `+62${parseInt(this.detailWholesaler.phone)}` : parseInt(this.detailWholesaler.phone)) : '',
      status: this.detailWholesaler.status,
      national: this.getArea('national'),
      zone: this.getArea('division'),
      region: this.getArea('region'),
      area: this.getArea('area'),
      salespoint: this.getArea('salespoint'),
      district: this.getArea('district'),
      territory: this.getArea('teritory'),
    });

    if (this.isDetail) this.formWs.disable();
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });

          this.formWs.get('region').setValue('');
          this.formWs.get('area').setValue('');
          this.formWs.get('salespoint').setValue('');
          this.formWs.get('district').setValue('');
          this.formWs.get('territory').setValue('');
          this.list['region'] = [];
          this.list['area'] = [];
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'region':
          item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formWs.get('region').setValue('');
          this.formWs.get('area').setValue('');
          this.formWs.get('salespoint').setValue('');
          this.formWs.get('district').setValue('');
          this.formWs.get('territory').setValue('');
          this.list['area'] = [];
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'area':
          item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formWs.get('area').setValue('');
          this.formWs.get('salespoint').setValue('');
          this.formWs.get('district').setValue('');
          this.formWs.get('territory').setValue('');
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'salespoint':
          item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formWs.get('salespoint').setValue('');
          this.formWs.get('district').setValue('');
          this.formWs.get('territory').setValue('');
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'district':
          item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formWs.get('district').setValue('');
          this.formWs.get('territory').setValue('');
          this.list['territory'] = [];
        break;
      case 'territory':
          item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formWs.get('territory').setValue('');
        break;
    
      default:
        break;
    }
  }

  getArea(selection) {
    return this.detailAreaSelected.filter(item => item.level_desc === selection).map(item => item.id)[0]
  }

  submit() {
    // console.log(this.formWs);
    if (this.formWs.valid) {
      let body = {
        _method: "PUT",
        name: this.formWs.get("name").value,
        address: this.formWs.get("address").value,
        business_code: this.formWs.get("code").value,
        owner: this.formWs.get("owner").value,
        phone: '0' + this.formWs.get("phone").value,
        areas: this.list['territory'].filter(item => item.id === this.formWs.get('territory').value).map(item => item.code),
        status: this.formWs.get("status").value
      };

      this.wholesalerService
        .put(body, { wholesaler_id: this.detailWholesaler.id })
        .subscribe(
          res => {
            this.dialogService.openSnackBar({
              message: "Data Berhasil Diubah"
            });
            this.router.navigate(["user-management", "wholesaler"]);
            window.localStorage.removeItem("detail_wholesaler");
          },
          err => {}
        );
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formWs);
    }
  }

  getToolTipData(value, array) {
    if (value && array.length){
      let msg = array.filter(item => item.id === value)[0]['name'];
      return msg;
    } else {
      return "";
    }
  }
}
