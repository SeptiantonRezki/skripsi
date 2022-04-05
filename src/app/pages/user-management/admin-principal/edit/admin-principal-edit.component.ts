import { Component } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { DataService } from "../../../../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { AdminPrincipalService } from "../../../../services/user-management/admin-principal.service";
import * as _ from 'underscore';
import { MatTabChangeEvent } from "@angular/material";
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: "app-admin-principal-edit",
  templateUrl: "./admin-principal-edit.component.html",
  styleUrls: ["./admin-principal-edit.component.scss"]
})
export class AdminPrincipalEditComponent {
  formAdmin: FormGroup;
  formArea2: FormGroup;
  formArea3: FormGroup;
  formArea4: FormGroup;
  formArea5: FormGroup;
  formArea6: FormGroup;
  formArea7: FormGroup;
  formArea8: FormGroup;
  formArea9: FormGroup;
  formArea10: FormGroup;
  formdataErrors: any;

  listRole: Array<any>;
  listCountry: Array<any>;
  detailAdminPrincipal: any;
  listStatus: any[] = [
    { name: this.ls.locale.global.label.status + " " + this.ls.locale.global.label.active, value: "active" },
    { name: this.ls.locale.global.label.status + " " + this.ls.locale.global.label.inactive, value: "inactive" }
  ];

  listLevelArea: any[];
  list: any;
  list2: any;
  list3: any;
  list4: any;
  list5: any;
  list6: any;
  list7: any;
  list8: any;
  list9: any;
  list10: any;

  typeArea: any[] = ["national", "zone", "region", "area", "salespoint", "district", "territory"];
  areaFromLogin;
  detailAreaSelected: any[];
  detailAreaSelected2: any[] = [1];
  detailAreaSelected3: any[] = [1];
  detailAreaSelected4: any[] = [1];
  detailAreaSelected5: any[] = [1];
  detailAreaSelected6: any[] = [1];
  detailAreaSelected7: any[] = [1];
  detailAreaSelected8: any[] = [1];
  detailAreaSelected9: any[] = [1];
  detailAreaSelected10: any[] = [1];

  isDetail: Boolean;
  principal_id: any;
  two_geotree: Boolean;
  first_geotree: Boolean = false;
  three_geotree: Boolean;
  four_geotree: Boolean;
  five_geotree: Boolean;
  six_geotree: Boolean;
  seven_geotree: Boolean;
  eight_geotree: Boolean;
  nine_geotree: Boolean;
  ten_geotree: Boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private adminPrincipalService: AdminPrincipalService,
    private ls: LanguagesService
  ) {
    this.activatedRoute.url.subscribe(param => {
      this.isDetail = param[1].path === 'detail' ? true : false;
      this.principal_id = param[2].path;
    });
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];
    this.listLevelArea = [
      {
        "id": 1,
        "parent_id": null,
        "code": "SLSNTL      ",
        "name": "SSLSNTL"
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

    this.list3 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list4 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list5 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list6 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list7 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list8 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list9 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list10 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.formdataErrors = {
      name: {},
      username: {},
      email: {},
      role: {}
    };

    this.listRole = this.activatedRoute.snapshot.data["listRole"].data;
  }

  async ngOnInit() {
    this.getCountry();
    this.formAdmin = this.formBuilder.group({
      name: ["", Validators.required],
      username: [""],
      email: ["", Validators.required],
      role: ["", Validators.required],
      country: [""],
      countryname: [""],
      status: [""],
      password: [""],
      confirmation_password: [""],
      national: ["", Validators.required],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    });

    this.formArea2 = this.formBuilder.group({
      national: [""],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    })
    this.formArea3 = this.formBuilder.group({
      national: [""],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    })

    this.formArea4 = this.formBuilder.group({
      national: [""],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    })

    this.formArea5 = this.formBuilder.group({
      national: [""],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    })

    this.formArea6 = this.formBuilder.group({
      national: [""],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    })

    this.formArea7 = this.formBuilder.group({
      national: [""],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    })

    this.formArea8 = this.formBuilder.group({
      national: [""],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    })

    this.formArea9 = this.formBuilder.group({
      national: [""],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    })

    this.formArea10 = this.formBuilder.group({
      national: [""],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""]
    })

    try {
      const response = await this.adminPrincipalService.getDetailById({ principal_id: this.principal_id }).toPromise();
      this.detailAdminPrincipal = response;
      this.getRole();

      const parent = await this.adminPrincipalService.getParentArea({ parent: this.detailAdminPrincipal.area_id[0] }).toPromise();
      this.detailAreaSelected = parent.data;
      if (this.detailAdminPrincipal.area_id[0]) this.first_geotree = true;
      console.log('this frist', this.first_geotree);

      console.log('dtail', response.area);
      if (response && response.area_id && response.area_id.length > 1) {
        const parent2ndArea = await this.adminPrincipalService.getParentArea({ parent: response.area_id[1] }).toPromise();
        this.detailAreaSelected2 = parent2ndArea.data;
        this.two_geotree = true;
        if (response.area_id.length > 2) {
          const parent3rdArea = await this.adminPrincipalService.getParentArea({ parent: response.area_id[2] }).toPromise();
          this.detailAreaSelected3 = parent3rdArea.data;
          this.three_geotree = true;
          }
          if (response.area_id.length > 3) {
          const parent4thArea = await this.adminPrincipalService.getParentArea({ parent: response.area_id[3] }).toPromise();
          this.detailAreaSelected4 = parent4thArea.data;
          this.four_geotree = true;
          }
          if (response.area_id.length > 4) {
          const parent5thArea = await this.adminPrincipalService.getParentArea({ parent: response.area_id[4] }).toPromise();
          this.detailAreaSelected5 = parent5thArea.data;
          this.five_geotree = true;
          }
          if (response.area_id.length > 5) {
          const parent6thArea = await this.adminPrincipalService.getParentArea({ parent: response.area_id[5] }).toPromise();
          this.detailAreaSelected6 = parent6thArea.data;
          this.six_geotree = true;
          }
          if (response.area_id.length > 6) {
          const parent7thArea = await this.adminPrincipalService.getParentArea({ parent: response.area_id[6] }).toPromise();
          this.detailAreaSelected7 = parent7thArea.data;
          this.seven_geotree = true;
          }
          if (response.area_id.length > 7) {
          const parent8thArea = await this.adminPrincipalService.getParentArea({ parent: response.area_id[7] }).toPromise();
          this.detailAreaSelected8 = parent8thArea.data;
          this.eight_geotree = true;
          }
          if (response.area_id.length > 8) {
          const parent9thArea = await this.adminPrincipalService.getParentArea({ parent: response.area_id[8] }).toPromise();
          this.detailAreaSelected9 = parent9thArea.data;
          this.nine_geotree = true;
          }
          if (response.area_id.length > 9) {
          const parent10thArea = await this.adminPrincipalService.getParentArea({ parent: response.area_id[9] }).toPromise();
          this.detailAreaSelected10 = parent10thArea.data;
          this.ten_geotree = true;
          }
      }
      this.setDetailAdminPrincipal();
    } catch (error) {
      if (error.status === 404) {
        this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.data_not_found });
        this.router.navigate(["user-management", "admin-principal"]);
      }
      throw error;
    }

    this.formAdmin.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formAdmin, this.formdataErrors);
    });
  }

  setDetailAdminPrincipal() {
    //this.initArea();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 1){} //this.initArea2();
    this.initFormGroup();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 1) this.initFormGroup2();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 2) //this.initArea3();
    this.initFormGroup();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 2) this.initFormGroup3();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 3) //this.initArea4();
    this.initFormGroup();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 3) this.initFormGroup4();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 4) //this.initArea5();
    this.initFormGroup();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 4) this.initFormGroup5();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 5) //this.initArea6();
    this.initFormGroup();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 5) this.initFormGroup6();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 6) //this.initArea7();
    this.initFormGroup();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 6) this.initFormGroup7();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 7) //this.initArea8();
    this.initFormGroup();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 7) this.initFormGroup8();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 8) //this.initArea9();
    this.initFormGroup();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 8) this.initFormGroup9();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 9) //this.initArea10();
    this.initFormGroup();
    if (this.detailAdminPrincipal && this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 9) this.initFormGroup10();
  }

  // initArea() {
  //   this.areaFromLogin.map(item => {
  //     switch (item.type.trim()) {
  //       case 'national':
  //         this.formAdmin.get('national').disable();
  //         break
  //       case 'division':
  //         this.formAdmin.get('zone').disable();
  //         break;
  //       case 'region':
  //         this.formAdmin.get('region').disable();
  //         break;
  //       case 'area':
  //         this.formAdmin.get('area').disable();
  //         break;
  //       case 'salespoint':
  //         this.formAdmin.get('salespoint').disable();
  //         break;
  //       case 'district':
  //         this.formAdmin.get('district').disable();
  //         break;
  //       case 'territory':
  //         this.formAdmin.get('territory').disable();
  //         break;
  //     }
  //   })
  // }

  // initArea2() {
  //   this.areaFromLogin.map(item => {
  //     switch (item.type.trim()) {
  //       case 'national':
  //         this.formArea2.get('national').disable();
  //         break
  //       case 'division':
  //         this.formArea2.get('zone').disable();
  //         break;
  //       case 'region':
  //         this.formArea2.get('region').disable();
  //         break;
  //       case 'area':
  //         this.formArea2.get('area').disable();
  //         break;
  //       case 'salespoint':
  //         this.formArea2.get('salespoint').disable();
  //         break;
  //       case 'district':
  //         this.formArea2.get('district').disable();
  //         break;
  //       case 'territory':
  //         this.formArea2.get('territory').disable();
  //         break;
  //     }
  //   })
  // }

  // initArea3() {
  //   this.areaFromLogin.map(item => {
  //     switch (item.type.trim()) {
  //       case 'national':
  //         this.formArea3.get('national').disable();
  //         break
  //       case 'division':
  //         this.formArea3.get('zone').disable();
  //         break;
  //       case 'region':
  //         this.formArea3.get('region').disable();
  //         break;
  //       case 'area':
  //         this.formArea3.get('area').disable();
  //         break;
  //       case 'salespoint':
  //         this.formArea3.get('salespoint').disable();
  //         break;
  //       case 'district':
  //         this.formArea3.get('district').disable();
  //         break;
  //       case 'territory':
  //         this.formArea3.get('territory').disable();
  //         break;
  //     }
  //   });
  // }

  // initArea4() {
  //   this.areaFromLogin.map(item => {
  //     switch (item.type.trim()) {
  //       case 'national':
  //         this.formArea4.get('national').disable();
  //         break
  //       case 'division':
  //         this.formArea4.get('zone').disable();
  //         break;
  //       case 'region':
  //         this.formArea4.get('region').disable();
  //         break;
  //       case 'area':
  //         this.formArea4.get('area').disable();
  //         break;
  //       case 'salespoint':
  //         this.formArea4.get('salespoint').disable();
  //         break;
  //       case 'district':
  //         this.formArea4.get('district').disable();
  //         break;
  //       case 'territory':
  //         this.formArea4.get('territory').disable();
  //         break;
  //     }
  //   });
  // }

  // initArea5() {
  //   this.areaFromLogin.map(item => {
  //     switch (item.type.trim()) {
  //       case 'national':
  //         this.formArea5.get('national').disable();
  //         break
  //       case 'division':
  //         this.formArea5.get('zone').disable();
  //         break;
  //       case 'region':
  //         this.formArea5.get('region').disable();
  //         break;
  //       case 'area':
  //         this.formArea5.get('area').disable();
  //         break;
  //       case 'salespoint':
  //         this.formArea5.get('salespoint').disable();
  //         break;
  //       case 'district':
  //         this.formArea5.get('district').disable();
  //         break;
  //       case 'territory':
  //         this.formArea5.get('territory').disable();
  //         break;
  //     }
  //   })
  // }

  // initArea6() {
  //   this.areaFromLogin.map(item => {
  //     switch (item.type.trim()) {
  //       case 'national':
  //         this.formArea6.get('national').disable();
  //         break
  //       case 'division':
  //         this.formArea6.get('zone').disable();
  //         break;
  //       case 'region':
  //         this.formArea6.get('region').disable();
  //         break;
  //       case 'area':
  //         this.formArea6.get('area').disable();
  //         break;
  //       case 'salespoint':
  //         this.formArea6.get('salespoint').disable();
  //         break;
  //       case 'district':
  //         this.formArea6.get('district').disable();
  //         break;
  //       case 'territory':
  //         this.formArea6.get('territory').disable();
  //         break;
  //     }
  //   })
  // }

  // initArea7() {
  //   this.areaFromLogin.map(item => {
  //     switch (item.type.trim()) {
  //       case 'national':
  //         this.formArea7.get('national').disable();
  //         break
  //       case 'division':
  //         this.formArea7.get('zone').disable();
  //         break;
  //       case 'region':
  //         this.formArea7.get('region').disable();
  //         break;
  //       case 'area':
  //         this.formArea7.get('area').disable();
  //         break;
  //       case 'salespoint':
  //         this.formArea7.get('salespoint').disable();
  //         break;
  //       case 'district':
  //         this.formArea7.get('district').disable();
  //         break;
  //       case 'territory':
  //         this.formArea7.get('territory').disable();
  //         break;
  //     }
  //   })
  // }

  // initArea8() {
  //   this.areaFromLogin.map(item => {
  //     switch (item.type.trim()) {
  //       case 'national':
  //         this.formArea8.get('national').disable();
  //         break
  //       case 'division':
  //         this.formArea8.get('zone').disable();
  //         break;
  //       case 'region':
  //         this.formArea8.get('region').disable();
  //         break;
  //       case 'area':
  //         this.formArea8.get('area').disable();
  //         break;
  //       case 'salespoint':
  //         this.formArea8.get('salespoint').disable();
  //         break;
  //       case 'district':
  //         this.formArea8.get('district').disable();
  //         break;
  //       case 'territory':
  //         this.formArea8.get('territory').disable();
  //         break;
  //     }
  //   })
  // }

  // initArea9() {
  //   this.areaFromLogin.map(item => {
  //     switch (item.type.trim()) {
  //       case 'national':
  //         this.formArea9.get('national').disable();
  //         break
  //       case 'division':
  //         this.formArea9.get('zone').disable();
  //         break;
  //       case 'region':
  //         this.formArea9.get('region').disable();
  //         break;
  //       case 'area':
  //         this.formArea9.get('area').disable();
  //         break;
  //       case 'salespoint':
  //         this.formArea9.get('salespoint').disable();
  //         break;
  //       case 'district':
  //         this.formArea9.get('district').disable();
  //         break;
  //       case 'territory':
  //         this.formArea9.get('territory').disable();
  //         break;
  //     }
  //   })
  // }

  // initArea10() {
  //   this.areaFromLogin.map(item => {
  //     switch (item.type.trim()) {
  //       case 'national':
  //         this.formArea10.get('national').disable();
  //         break
  //       case 'division':
  //         this.formArea10.get('zone').disable();
  //         break;
  //       case 'region':
  //         this.formArea10.get('region').disable();
  //         break;
  //       case 'area':
  //         this.formArea10.get('area').disable();
  //         break;
  //       case 'salespoint':
  //         this.formArea10.get('salespoint').disable();
  //         break;
  //       case 'district':
  //         this.formArea10.get('district').disable();
  //         break;
  //       case 'territory':
  //         this.formArea10.get('territory').disable();
  //         break;
  //     }
  //   })
  // }

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

    this.formAdmin.controls['name'].setValue(this.detailAdminPrincipal.fullname);
    this.formAdmin.controls['username'].setValue(this.detailAdminPrincipal.username);
    this.formAdmin.controls['email'].setValue(this.detailAdminPrincipal.email);
    this.formAdmin.controls['role'].setValue(this.detailAdminPrincipal.role_id);
    this.formAdmin.controls['country'].setValue(this.detailAdminPrincipal.country);
    
    if(this.detailAdminPrincipal.country == 'ID' ){
      this.formAdmin.controls['countryname'].setValue("Indonesia");
    }
    else if(this.detailAdminPrincipal.country == 'KH'){
      this.formAdmin.controls['countryname'].setValue("Cambodia");
    }
    else if(this.detailAdminPrincipal.country == 'PH'){
      this.formAdmin.controls['countryname'].setValue("Philippines");
    }
    this.formAdmin.controls['countryname'].disable()
    // this.formAdmin.controls['role'].setValue(this.detailAdminPrincipal.country);
    this.formAdmin.controls['status'].setValue(this.detailAdminPrincipal.status);
    this.formAdmin.controls['national'].setValue(this.getArea('national'));
    this.formAdmin.controls['zone'].setValue(this.getArea('division'));
    this.formAdmin.controls['region'].setValue(this.getArea('region'));
    this.formAdmin.controls['area'].setValue(this.getArea('area'));
    this.formAdmin.controls['salespoint'].setValue(this.getArea('salespoint'));
    this.formAdmin.controls['district'].setValue(this.getArea('district'));
    this.formAdmin.controls['territory'].setValue(this.getArea('teritory'));

    this.formAdmin.controls['username'].disable();
    if (this.isDetail) this.formAdmin.disable();
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

  initFormGroup3() {
    this.detailAreaSelected3.map(item => {
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
      this.getAudienceArea3(level_desc, item.id);
    });

    this.formArea3.controls['national'].setValue(this.getArea3('national'));
    this.formArea3.controls['zone'].setValue(this.getArea3('division'));
    this.formArea3.controls['region'].setValue(this.getArea3('region'));
    this.formArea3.controls['area'].setValue(this.getArea3('area'));
    this.formArea3.controls['salespoint'].setValue(this.getArea3('salespoint'));
    this.formArea3.controls['district'].setValue(this.getArea3('district'));
    this.formArea3.controls['territory'].setValue(this.getArea3('teritory'));

    // this.formArea2.controls['username'].disable();
    if (this.isDetail) this.formArea3.disable();
  }

  initFormGroup4() {
    this.detailAreaSelected4.map(item => {
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
      this.getAudienceArea4(level_desc, item.id);
    });

    this.formArea4.controls['national'].setValue(this.getArea4('national'));
    this.formArea4.controls['zone'].setValue(this.getArea4('division'));
    this.formArea4.controls['region'].setValue(this.getArea4('region'));
    this.formArea4.controls['area'].setValue(this.getArea4('area'));
    this.formArea4.controls['salespoint'].setValue(this.getArea4('salespoint'));
    this.formArea4.controls['district'].setValue(this.getArea4('district'));
    this.formArea4.controls['territory'].setValue(this.getArea4('teritory'));

    // this.formArea2.controls['username'].disable();
    if (this.isDetail) this.formArea4.disable();
  }

  initFormGroup5() {
    this.detailAreaSelected5.map(item => {
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
      this.getAudienceArea5(level_desc, item.id);
    });

    this.formArea5.controls['national'].setValue(this.getArea5('national'));
    this.formArea5.controls['zone'].setValue(this.getArea5('division'));
    this.formArea5.controls['region'].setValue(this.getArea5('region'));
    this.formArea5.controls['area'].setValue(this.getArea5('area'));
    this.formArea5.controls['salespoint'].setValue(this.getArea5('salespoint'));
    this.formArea5.controls['district'].setValue(this.getArea5('district'));
    this.formArea5.controls['territory'].setValue(this.getArea5('teritory'));

    // this.formArea2.controls['username'].disable();
    if (this.isDetail) this.formArea5.disable();
  }

  initFormGroup6() {
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
      this.getAudienceArea6(level_desc, item.id);
    });

    this.formArea6.controls['national'].setValue(this.getArea6('national'));
    this.formArea6.controls['zone'].setValue(this.getArea6('division'));
    this.formArea6.controls['region'].setValue(this.getArea6('region'));
    this.formArea6.controls['area'].setValue(this.getArea6('area'));
    this.formArea6.controls['salespoint'].setValue(this.getArea6('salespoint'));
    this.formArea6.controls['district'].setValue(this.getArea6('district'));
    this.formArea6.controls['territory'].setValue(this.getArea6('teritory'));

    // this.formArea2.controls['username'].disable();
    if (this.isDetail) this.formArea6.disable();
  }

  initFormGroup7() {
    this.detailAreaSelected7.map(item => {
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
      this.getAudienceArea7(level_desc, item.id);
    });

    this.formArea7.controls['national'].setValue(this.getArea7('national'));
    this.formArea7.controls['zone'].setValue(this.getArea7('division'));
    this.formArea7.controls['region'].setValue(this.getArea7('region'));
    this.formArea7.controls['area'].setValue(this.getArea7('area'));
    this.formArea7.controls['salespoint'].setValue(this.getArea7('salespoint'));
    this.formArea7.controls['district'].setValue(this.getArea7('district'));
    this.formArea7.controls['territory'].setValue(this.getArea7('teritory'));

    // this.formArea2.controls['username'].disable();
    if (this.isDetail) this.formArea7.disable();
  }
  initFormGroup8() {
    this.detailAreaSelected8.map(item => {
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
      this.getAudienceArea8(level_desc, item.id);
    });

    this.formArea8.controls['national'].setValue(this.getArea8('national'));
    this.formArea8.controls['zone'].setValue(this.getArea8('division'));
    this.formArea8.controls['region'].setValue(this.getArea8('region'));
    this.formArea8.controls['area'].setValue(this.getArea8('area'));
    this.formArea8.controls['salespoint'].setValue(this.getArea8('salespoint'));
    this.formArea8.controls['district'].setValue(this.getArea8('district'));
    this.formArea8.controls['territory'].setValue(this.getArea8('teritory'));

    // this.formArea2.controls['username'].disable();
    if (this.isDetail) this.formArea8.disable();
  }
  initFormGroup9() {
    this.detailAreaSelected9.map(item => {
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
      this.getAudienceArea9(level_desc, item.id);
    });

    this.formArea9.controls['national'].setValue(this.getArea9('national'));
    this.formArea9.controls['zone'].setValue(this.getArea9('division'));
    this.formArea9.controls['region'].setValue(this.getArea9('region'));
    this.formArea9.controls['area'].setValue(this.getArea9('area'));
    this.formArea9.controls['salespoint'].setValue(this.getArea9('salespoint'));
    this.formArea9.controls['district'].setValue(this.getArea9('district'));
    this.formArea9.controls['territory'].setValue(this.getArea9('teritory'));

    // this.formArea2.controls['username'].disable();
    if (this.isDetail) this.formArea9.disable();
  }
  initFormGroup10() {
    this.detailAreaSelected10.map(item => {
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
      this.getAudienceArea10(level_desc, item.id);
    });

    this.formArea10.controls['national'].setValue(this.getArea10('national'));
    this.formArea10.controls['zone'].setValue(this.getArea10('division'));
    this.formArea10.controls['region'].setValue(this.getArea10('region'));
    this.formArea10.controls['area'].setValue(this.getArea10('area'));
    this.formArea10.controls['salespoint'].setValue(this.getArea10('salespoint'));
    this.formArea10.controls['district'].setValue(this.getArea10('district'));
    this.formArea10.controls['territory'].setValue(this.getArea10('teritory'));

    // this.formArea2.controls['username'].disable();
    if (this.isDetail) this.formArea10.disable();
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
          if(res.status == false)
            {}
            else{
          this.list[selection] = res;
            }
        });

        this.formAdmin.get('region').setValue('');
        this.formAdmin.get('area').setValue('');
        this.formAdmin.get('salespoint').setValue('');
        this.formAdmin.get('district').setValue('');
        this.formAdmin.get('territory').setValue('');
        this.list['region'] = [];
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'region':
        item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list[selection] = res;
            }
          });
        } else {
          this.list[selection] = []
        }

        this.formAdmin.get('region').setValue('');
        this.formAdmin.get('area').setValue('');
        this.formAdmin.get('salespoint').setValue('');
        this.formAdmin.get('district').setValue('');
        this.formAdmin.get('territory').setValue('');
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'area':
        item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list[selection] = res;
            }
          });
        } else {
          this.list[selection] = []
        }

        this.formAdmin.get('area').setValue('');
        this.formAdmin.get('salespoint').setValue('');
        this.formAdmin.get('district').setValue('');
        this.formAdmin.get('territory').setValue('');
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'salespoint':
        item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list[selection] = res;
            }
          });
        } else {
          this.list[selection] = []
        }

        this.formAdmin.get('salespoint').setValue('');
        this.formAdmin.get('district').setValue('');
        this.formAdmin.get('territory').setValue('');
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'district':
        item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list[selection] = res;
            }
          });
        } else {
          this.list[selection] = []
        }

        this.formAdmin.get('district').setValue('');
        this.formAdmin.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list[selection] = res;
            }
          });
        } else {
          this.list[selection] = []
        }

        this.formAdmin.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  getAudienceArea2(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
          if(res.status == false)
            {}
            else{
          this.list2[selection] = res;
            }
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
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list2[selection] = res;
            }
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
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list2[selection] = res;
            }
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
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list2[selection] = res;
            }
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
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list2[selection] = res;
            }
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
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list2[selection] = res;
            }
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

  getAudienceArea3(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
          if(res.status == false)
            {}
            else{
          this.list3[selection] = res;
            }
        });

        this.formArea3.get('region').setValue('');
        this.formArea3.get('area').setValue('');
        this.formArea3.get('salespoint').setValue('');
        this.formArea3.get('district').setValue('');
        this.formArea3.get('territory').setValue('');
        this.list3['region'] = [];
        this.list3['area'] = [];
        this.list3['salespoint'] = [];
        this.list3['district'] = [];
        this.list3['territory'] = [];
        break;
      case 'region':
        item = this.list3['zone'].length > 0 ? this.list3['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list3[selection] = res;
            }
          });
        } else {
          this.list3[selection] = []
        }

        this.formArea3.get('region').setValue('');
        this.formArea3.get('area').setValue('');
        this.formArea3.get('salespoint').setValue('');
        this.formArea3.get('district').setValue('');
        this.formArea3.get('territory').setValue('');
        this.list3['area'] = [];
        this.list3['salespoint'] = [];
        this.list3['district'] = [];
        this.list3['territory'] = [];
        break;
      case 'area':
        item = this.list3['region'].length > 0 ? this.list3['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list3[selection] = res;
            }
          });
        } else {
          this.list3[selection] = []
        }

        this.formArea3.get('area').setValue('');
        this.formArea3.get('salespoint').setValue('');
        this.formArea3.get('district').setValue('');
        this.formArea3.get('territory').setValue('');
        this.list3['salespoint'] = [];
        this.list3['district'] = [];
        this.list3['territory'] = [];
        break;
      case 'salespoint':
        item = this.list3['area'].length > 0 ? this.list3['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list3[selection] = res;
            }
          });
        } else {
          this.list3[selection] = []
        }

        this.formArea3.get('salespoint').setValue('');
        this.formArea3.get('district').setValue('');
        this.formArea3.get('territory').setValue('');
        this.list3['district'] = [];
        this.list3['territory'] = [];
        break;
      case 'district':
        item = this.list3['salespoint'].length > 0 ? this.list3['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list3[selection] = res;
            }
          });
        } else {
          this.list3[selection] = []
        }

        this.formArea3.get('district').setValue('');
        this.formArea3.get('territory').setValue('');
        this.list3['territory'] = [];
        break;
      case 'territory':
        item = this.list3['district'].length > 0 ? this.list3['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list3[selection] = res;
            }
          });
        } else {
          this.list3[selection] = []
        }

        this.formArea3.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  getAudienceArea4(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
          if(res.status == false)
            {}
            else{
          this.list4[selection] = res;
            }
        });

        this.formArea4.get('region').setValue('');
        this.formArea4.get('area').setValue('');
        this.formArea4.get('salespoint').setValue('');
        this.formArea4.get('district').setValue('');
        this.formArea4.get('territory').setValue('');
        this.list4['region'] = [];
        this.list4['area'] = [];
        this.list4['salespoint'] = [];
        this.list4['district'] = [];
        this.list4['territory'] = [];
        break;
      case 'region':
        item = this.list4['zone'].length > 0 ? this.list4['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list4[selection] = res;
            }
          });
        } else {
          this.list4[selection] = []
        }

        this.formArea4.get('region').setValue('');
        this.formArea4.get('area').setValue('');
        this.formArea4.get('salespoint').setValue('');
        this.formArea4.get('district').setValue('');
        this.formArea4.get('territory').setValue('');
        this.list4['area'] = [];
        this.list4['salespoint'] = [];
        this.list4['district'] = [];
        this.list4['territory'] = [];
        break;
      case 'area':
        item = this.list4['region'].length > 0 ? this.list4['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list4[selection] = res;
            }
          });
        } else {
          this.list4[selection] = []
        }

        this.formArea4.get('area').setValue('');
        this.formArea4.get('salespoint').setValue('');
        this.formArea4.get('district').setValue('');
        this.formArea4.get('territory').setValue('');
        this.list4['salespoint'] = [];
        this.list4['district'] = [];
        this.list4['territory'] = [];
        break;
      case 'salespoint':
        item = this.list4['area'].length > 0 ? this.list4['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list4[selection] = res;
            }
          });
        } else {
          this.list4[selection] = []
        }

        this.formArea4.get('salespoint').setValue('');
        this.formArea4.get('district').setValue('');
        this.formArea4.get('territory').setValue('');
        this.list4['district'] = [];
        this.list4['territory'] = [];
        break;
      case 'district':
        item = this.list4['salespoint'].length > 0 ? this.list4['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list4[selection] = res;
            }
          });
        } else {
          this.list4[selection] = []
        }

        this.formArea4.get('district').setValue('');
        this.formArea4.get('territory').setValue('');
        this.list4['territory'] = [];
        break;
      case 'territory':
        item = this.list4['district'].length > 0 ? this.list4['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list4[selection] = res;
            }
          });
        } else {
          this.list4[selection] = []
        }

        this.formArea4.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  getAudienceArea5(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
          if(res.status == false)
            {}
            else{
          this.list5[selection] = res;
            }
        });

        this.formArea5.get('region').setValue('');
        this.formArea5.get('area').setValue('');
        this.formArea5.get('salespoint').setValue('');
        this.formArea5.get('district').setValue('');
        this.formArea5.get('territory').setValue('');
        this.list5['region'] = [];
        this.list5['area'] = [];
        this.list5['salespoint'] = [];
        this.list5['district'] = [];
        this.list5['territory'] = [];
        break;
      case 'region':
        item = this.list5['zone'].length > 0 ? this.list5['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list5[selection] = res;
            }
          });
        } else {
          this.list5[selection] = []
        }

        this.formArea5.get('region').setValue('');
        this.formArea5.get('area').setValue('');
        this.formArea5.get('salespoint').setValue('');
        this.formArea5.get('district').setValue('');
        this.formArea5.get('territory').setValue('');
        this.list5['area'] = [];
        this.list5['salespoint'] = [];
        this.list5['district'] = [];
        this.list5['territory'] = [];
        break;
      case 'area':
        item = this.list5['region'].length > 0 ? this.list5['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list5[selection] = res;
            }
          });
        } else {
          this.list5[selection] = []
        }

        this.formArea5.get('area').setValue('');
        this.formArea5.get('salespoint').setValue('');
        this.formArea5.get('district').setValue('');
        this.formArea5.get('territory').setValue('');
        this.list5['salespoint'] = [];
        this.list5['district'] = [];
        this.list5['territory'] = [];
        break;
      case 'salespoint':
        item = this.list5['area'].length > 0 ? this.list5['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list5[selection] = res;
            }
          });
        } else {
          this.list5[selection] = []
        }

        this.formArea5.get('salespoint').setValue('');
        this.formArea5.get('district').setValue('');
        this.formArea5.get('territory').setValue('');
        this.list5['district'] = [];
        this.list5['territory'] = [];
        break;
      case 'district':
        item = this.list5['salespoint'].length > 0 ? this.list5['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list5[selection] = res;
            }
          });
        } else {
          this.list5[selection] = []
        }

        this.formArea5.get('district').setValue('');
        this.formArea5.get('territory').setValue('');
        this.list5['territory'] = [];
        break;
      case 'territory':
        item = this.list5['district'].length > 0 ? this.list5['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list5[selection] = res;
            }
          });
        } else {
          this.list5[selection] = []
        }

        this.formArea5.get('territory').setValue('');
        break;

      default:
        break;
    }
  }
  getAudienceArea6(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
          if(res.status == false)
            {}
            else{
          this.list6[selection] = res;
            }
        });

        this.formArea6.get('region').setValue('');
        this.formArea6.get('area').setValue('');
        this.formArea6.get('salespoint').setValue('');
        this.formArea6.get('district').setValue('');
        this.formArea6.get('territory').setValue('');
        this.list6['region'] = [];
        this.list6['area'] = [];
        this.list6['salespoint'] = [];
        this.list6['district'] = [];
        this.list6['territory'] = [];
        break;
      case 'region':
        item = this.list6['zone'].length > 0 ? this.list6['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list6[selection] = res;
            }
          });
        } else {
          this.list6[selection] = []
        }

        this.formArea6.get('region').setValue('');
        this.formArea6.get('area').setValue('');
        this.formArea6.get('salespoint').setValue('');
        this.formArea6.get('district').setValue('');
        this.formArea6.get('territory').setValue('');
        this.list6['area'] = [];
        this.list6['salespoint'] = [];
        this.list6['district'] = [];
        this.list6['territory'] = [];
        break;
      case 'area':
        item = this.list6['region'].length > 0 ? this.list6['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list6[selection] = res;
            }
          });
        } else {
          this.list6[selection] = []
        }

        this.formArea6.get('area').setValue('');
        this.formArea6.get('salespoint').setValue('');
        this.formArea6.get('district').setValue('');
        this.formArea6.get('territory').setValue('');
        this.list6['salespoint'] = [];
        this.list6['district'] = [];
        this.list6['territory'] = [];
        break;
      case 'salespoint':
        item = this.list6['area'].length > 0 ? this.list6['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list6[selection] = res;
            }
          });
        } else {
          this.list6[selection] = []
        }

        this.formArea6.get('salespoint').setValue('');
        this.formArea6.get('district').setValue('');
        this.formArea6.get('territory').setValue('');
        this.list6['district'] = [];
        this.list6['territory'] = [];
        break;
      case 'district':
        item = this.list6['salespoint'].length > 0 ? this.list6['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list6[selection] = res;
            }
          });
        } else {
          this.list6[selection] = []
        }

        this.formArea6.get('district').setValue('');
        this.formArea6.get('territory').setValue('');
        this.list6['territory'] = [];
        break;
      case 'territory':
        item = this.list6['district'].length > 0 ? this.list6['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list6[selection] = res;
            }
          });
        } else {
          this.list6[selection] = []
        }

        this.formArea6.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  getAudienceArea7(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
          if(res.status == false)
            {}
            else{
          this.list7[selection] = res;
            }
        });

        this.formArea7.get('region').setValue('');
        this.formArea7.get('area').setValue('');
        this.formArea7.get('salespoint').setValue('');
        this.formArea7.get('district').setValue('');
        this.formArea7.get('territory').setValue('');
        this.list7['region'] = [];
        this.list7['area'] = [];
        this.list7['salespoint'] = [];
        this.list7['district'] = [];
        this.list7['territory'] = [];
        break;
      case 'region':
        item = this.list7['zone'].length > 0 ? this.list7['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list7[selection] = res;
            }
          });
        } else {
          this.list7[selection] = []
        }

        this.formArea7.get('region').setValue('');
        this.formArea7.get('area').setValue('');
        this.formArea7.get('salespoint').setValue('');
        this.formArea7.get('district').setValue('');
        this.formArea7.get('territory').setValue('');
        this.list7['area'] = [];
        this.list7['salespoint'] = [];
        this.list7['district'] = [];
        this.list7['territory'] = [];
        break;
      case 'area':
        item = this.list7['region'].length > 0 ? this.list7['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list7[selection] = res;
            }
          });
        } else {
          this.list7[selection] = []
        }

        this.formArea7.get('area').setValue('');
        this.formArea7.get('salespoint').setValue('');
        this.formArea7.get('district').setValue('');
        this.formArea7.get('territory').setValue('');
        this.list7['salespoint'] = [];
        this.list7['district'] = [];
        this.list7['territory'] = [];
        break;
      case 'salespoint':
        item = this.list7['area'].length > 0 ? this.list7['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list7[selection] = res;
            }
          });
        } else {
          this.list7[selection] = []
        }

        this.formArea7.get('salespoint').setValue('');
        this.formArea7.get('district').setValue('');
        this.formArea7.get('territory').setValue('');
        this.list7['district'] = [];
        this.list7['territory'] = [];
        break;
      case 'district':
        item = this.list7['salespoint'].length > 0 ? this.list7['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list7[selection] = res;
            }
          });
        } else {
          this.list7[selection] = []
        }

        this.formArea7.get('district').setValue('');
        this.formArea7.get('territory').setValue('');
        this.list7['territory'] = [];
        break;
      case 'territory':
        item = this.list7['district'].length > 0 ? this.list7['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list7[selection] = res;
            }
          });
        } else {
          this.list7[selection] = []
        }

        this.formArea7.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  getAudienceArea8(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
          if(res.status == false)
            {}
            else{
          this.list8[selection] = res;
            }
        });

        this.formArea8.get('region').setValue('');
        this.formArea8.get('area').setValue('');
        this.formArea8.get('salespoint').setValue('');
        this.formArea8.get('district').setValue('');
        this.formArea8.get('territory').setValue('');
        this.list8['region'] = [];
        this.list8['area'] = [];
        this.list8['salespoint'] = [];
        this.list8['district'] = [];
        this.list8['territory'] = [];
        break;
      case 'region':
        item = this.list8['zone'].length > 0 ? this.list8['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list8[selection] = res;
            }
          });
        } else {
          this.list8[selection] = []
        }

        this.formArea8.get('region').setValue('');
        this.formArea8.get('area').setValue('');
        this.formArea8.get('salespoint').setValue('');
        this.formArea8.get('district').setValue('');
        this.formArea8.get('territory').setValue('');
        this.list8['area'] = [];
        this.list8['salespoint'] = [];
        this.list8['district'] = [];
        this.list8['territory'] = [];
        break;
      case 'area':
        item = this.list8['region'].length > 0 ? this.list8['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list8[selection] = res;
            }
          });
        } else {
          this.list8[selection] = []
        }

        this.formArea8.get('area').setValue('');
        this.formArea8.get('salespoint').setValue('');
        this.formArea8.get('district').setValue('');
        this.formArea8.get('territory').setValue('');
        this.list8['salespoint'] = [];
        this.list8['district'] = [];
        this.list8['territory'] = [];
        break;
      case 'salespoint':
        item = this.list8['area'].length > 0 ? this.list8['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list8[selection] = res;
            }
          });
        } else {
          this.list8[selection] = []
        }

        this.formArea8.get('salespoint').setValue('');
        this.formArea8.get('district').setValue('');
        this.formArea8.get('territory').setValue('');
        this.list8['district'] = [];
        this.list8['territory'] = [];
        break;
      case 'district':
        item = this.list8['salespoint'].length > 0 ? this.list8['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list8[selection] = res;
            }
          });
        } else {
          this.list8[selection] = []
        }

        this.formArea8.get('district').setValue('');
        this.formArea8.get('territory').setValue('');
        this.list8['territory'] = [];
        break;
      case 'territory':
        item = this.list8['district'].length > 0 ? this.list8['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list8[selection] = res;
            }
          });
        } else {
          this.list8[selection] = []
        }

        this.formArea8.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  getAudienceArea9(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
          if(res.status == false)
            {}
            else{
          this.list9[selection] = res;
            }
        });

        this.formArea9.get('region').setValue('');
        this.formArea9.get('area').setValue('');
        this.formArea9.get('salespoint').setValue('');
        this.formArea9.get('district').setValue('');
        this.formArea9.get('territory').setValue('');
        this.list9['region'] = [];
        this.list9['area'] = [];
        this.list9['salespoint'] = [];
        this.list9['district'] = [];
        this.list9['territory'] = [];
        break;
      case 'region':
        item = this.list9['zone'].length > 0 ? this.list9['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list9[selection] = res;
            }
          });
        } else {
          this.list9[selection] = []
        }

        this.formArea9.get('region').setValue('');
        this.formArea9.get('area').setValue('');
        this.formArea9.get('salespoint').setValue('');
        this.formArea9.get('district').setValue('');
        this.formArea9.get('territory').setValue('');
        this.list9['area'] = [];
        this.list9['salespoint'] = [];
        this.list9['district'] = [];
        this.list9['territory'] = [];
        break;
      case 'area':
        item = this.list9['region'].length > 0 ? this.list9['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list9[selection] = res;
            }
          });
        } else {
          this.list9[selection] = []
        }

        this.formArea9.get('area').setValue('');
        this.formArea9.get('salespoint').setValue('');
        this.formArea9.get('district').setValue('');
        this.formArea9.get('territory').setValue('');
        this.list9['salespoint'] = [];
        this.list9['district'] = [];
        this.list9['territory'] = [];
        break;
      case 'salespoint':
        item = this.list9['area'].length > 0 ? this.list9['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list9[selection] = res;
            }
          });
        } else {
          this.list9[selection] = []
        }

        this.formArea9.get('salespoint').setValue('');
        this.formArea9.get('district').setValue('');
        this.formArea9.get('territory').setValue('');
        this.list9['district'] = [];
        this.list9['territory'] = [];
        break;
      case 'district':
        item = this.list9['salespoint'].length > 0 ? this.list9['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list9[selection] = res;
            }
          });
        } else {
          this.list9[selection] = []
        }

        this.formArea9.get('district').setValue('');
        this.formArea9.get('territory').setValue('');
        this.list9['territory'] = [];
        break;
      case 'territory':
        item = this.list9['district'].length > 0 ? this.list9['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list9[selection] = res;
            }
          });
        } else {
          this.list9[selection] = []
        }

        this.formArea9.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  getAudienceArea10(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
          if(res.status == false)
            {}
            else{
          this.list10[selection] = res;
            }
        });

        this.formArea10.get('region').setValue('');
        this.formArea10.get('area').setValue('');
        this.formArea10.get('salespoint').setValue('');
        this.formArea10.get('district').setValue('');
        this.formArea10.get('territory').setValue('');
        this.list10['region'] = [];
        this.list10['area'] = [];
        this.list10['salespoint'] = [];
        this.list10['district'] = [];
        this.list10['territory'] = [];
        break;
      case 'region':
        item = this.list10['zone'].length > 0 ? this.list10['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list10[selection] = res;
            }
          });
        } else {
          this.list10[selection] = []
        }

        this.formArea10.get('region').setValue('');
        this.formArea10.get('area').setValue('');
        this.formArea10.get('salespoint').setValue('');
        this.formArea10.get('district').setValue('');
        this.formArea10.get('territory').setValue('');
        this.list10['area'] = [];
        this.list10['salespoint'] = [];
        this.list10['district'] = [];
        this.list10['territory'] = [];
        break;
      case 'area':
        item = this.list10['region'].length > 0 ? this.list10['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list10[selection] = res;
            }
          });
        } else {
          this.list10[selection] = []
        }

        this.formArea10.get('area').setValue('');
        this.formArea10.get('salespoint').setValue('');
        this.formArea10.get('district').setValue('');
        this.formArea10.get('territory').setValue('');
        this.list10['salespoint'] = [];
        this.list10['district'] = [];
        this.list10['territory'] = [];
        break;
      case 'salespoint':
        item = this.list10['area'].length > 0 ? this.list10['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list10[selection] = res;
            }
          });
        } else {
          this.list10[selection] = []
        }

        this.formArea10.get('salespoint').setValue('');
        this.formArea10.get('district').setValue('');
        this.formArea10.get('territory').setValue('');
        this.list10['district'] = [];
        this.list10['territory'] = [];
        break;
      case 'district':
        item = this.list10['salespoint'].length > 0 ? this.list10['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list10[selection] = res;
            }
          });
        } else {
          this.list10[selection] = []
        }

        this.formArea10.get('district').setValue('');
        this.formArea10.get('territory').setValue('');
        this.list10['territory'] = [];
        break;
      case 'territory':
        item = this.list10['district'].length > 0 ? this.list10['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.detailAdminPrincipal.country }).subscribe(res => {
            if(res.status == false)
            {}
            else{
            this.list10[selection] = res;
            }
          });
        } else {
          this.list10[selection] = []
        }

        this.formArea10.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  getArea(selection) {
    return this.detailAreaSelected.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  getArea2(selection) {
    return this.detailAreaSelected2.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  getArea3(selection) {
    return this.detailAreaSelected3.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  getArea4(selection) {
    return this.detailAreaSelected4.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  getArea5(selection) {
    return this.detailAreaSelected5.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  getArea6(selection) {
    return this.detailAreaSelected6.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  getArea7(selection) {
    return this.detailAreaSelected7.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  getArea8(selection) {
    return this.detailAreaSelected8.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  getArea9(selection) {
    return this.detailAreaSelected9.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  getArea10(selection) {
    return this.detailAreaSelected10.filter(item => item.level_desc === selection).map(item => item.id)[0];
  }

  submit() {
    if (this.formAdmin.valid) {
      let areas = [];
      let areas2 = [];
      let areas3 = [];
      let areas4 = [];
      let areas5 = [];
      let areas6 = [];
      let areas7 = [];
      let areas8 = [];
      let areas9 = [];
      let areas10 = [];
      let value = this.formAdmin.getRawValue();
      let area2value = this.formArea2.getRawValue();
      let area3value = this.formArea3.getRawValue();
      let area4value = this.formArea4.getRawValue();
      let area5value = this.formArea5.getRawValue();
      let area6value = this.formArea6.getRawValue();
      let area7value = this.formArea7.getRawValue();
      let area8value = this.formArea8.getRawValue();
      let area9value = this.formArea9.getRawValue();
      let area10value = this.formArea10.getRawValue();
      value = Object.entries(value).map(([key, value]) => ({ key, value }));
      area2value = Object.entries(area2value).map(([key, value]) => ({ key, value }));
      area3value = Object.entries(area3value).map(([key, value]) => ({ key, value }));
      area4value = Object.entries(area4value).map(([key, value]) => ({ key, value }));
      area5value = Object.entries(area5value).map(([key, value]) => ({ key, value }));
      area6value = Object.entries(area6value).map(([key, value]) => ({ key, value }));
      area7value = Object.entries(area7value).map(([key, value]) => ({ key, value }));
      area8value = Object.entries(area8value).map(([key, value]) => ({ key, value }));
      area9value = Object.entries(area9value).map(([key, value]) => ({ key, value }));
      area10value = Object.entries(area10value).map(([key, value]) => ({ key, value }));

      this.typeArea.map(type => {
        const filteredValue = value.filter(item => item.key === type && item.value);
        if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));

        const filteredValueArea2 = area2value.filter(item => item.key === type && item.value);
        if (filteredValueArea2.length > 0) areas2.push(parseInt(filteredValueArea2[0].value));
        const filteredValueArea3 = area3value.filter(item => item.key === type && item.value);
        if (filteredValueArea3.length > 0) areas3.push(parseInt(filteredValueArea3[0].value));
        const filteredValueArea4 = area4value.filter(item => item.key === type && item.value);
        if (filteredValueArea4.length > 0) areas4.push(parseInt(filteredValueArea4[0].value));
        const filteredValueArea5 = area5value.filter(item => item.key === type && item.value);
        if (filteredValueArea5.length > 0) areas5.push(parseInt(filteredValueArea5[0].value));
        const filteredValueArea6 = area6value.filter(item => item.key === type && item.value);
        if (filteredValueArea6.length > 0) areas6.push(parseInt(filteredValueArea6[0].value));
        const filteredValueArea7 = area7value.filter(item => item.key === type && item.value);
        if (filteredValueArea7.length > 0) areas7.push(parseInt(filteredValueArea7[0].value));
        const filteredValueArea8 = area8value.filter(item => item.key === type && item.value);
        if (filteredValueArea8.length > 0) areas8.push(parseInt(filteredValueArea8[0].value));
        const filteredValueArea9 = area9value.filter(item => item.key === type && item.value);
        if (filteredValueArea9.length > 0) areas9.push(parseInt(filteredValueArea9[0].value));
        const filteredValueArea10 = area10value.filter(item => item.key === type && item.value);
        if (filteredValueArea10.length > 0) areas10.push(parseInt(filteredValueArea10[0].value));
      })

      let area_id = [];
      if (this.first_geotree) area_id.unshift(_.last(areas));
      if (this.two_geotree) area_id.push(_.last(areas2));
      if (this.three_geotree) area_id.push(_.last(areas3));
      if (this.four_geotree) area_id.push(_.last(areas4));
      if (this.five_geotree) area_id.push(_.last(areas5));
      if (this.six_geotree) area_id.push(_.last(areas6));
      if (this.seven_geotree) area_id.push(_.last(areas7));
      if (this.eight_geotree) area_id.push(_.last(areas8));
      if (this.nine_geotree) area_id.push(_.last(areas9));
      if (this.ten_geotree) area_id.push(_.last(areas10));

      let body = {
        _method: "PUT",
        name: this.formAdmin.get("name").value,
        username: this.formAdmin.get("username").value,
        email: this.formAdmin.get("email").value,
        role_id: this.formAdmin.get("role").value,
        country: this.formAdmin.get("country").value,
        status: this.formAdmin.get("status").value,
        area_id: area_id
      };

      if (!this.first_geotree && !this.two_geotree ) delete body['area_id'];

      this.dataService.showLoading(true);
      this.adminPrincipalService.put(body, { principal_id: this.detailAdminPrincipal.id }).subscribe(
        res => {
          this.dialogService.openSnackBar({
            message: this.ls.locale.global.messages.text2
          });
          this.router.navigate(["user-management", "admin-principal"]);
          this.dataService.showLoading(false);
        },
        err => { this.dataService.showLoading(false); }
      );
    } else {
      this.dialogService.openSnackBar({ message: this.ls.locale.dte.template_tugas.text39 });
      commonFormValidator.validateAllFields(this.formAdmin);
    }
  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    // this.selectedTab = tabChangeEvent.index;
  }

  getToolTipData(value, array) {

    if (value && array.length) {
      let msg = array.filter(item => item.id === value)[0];
      let name = "";

      if (msg.name === "all") {
        switch (msg.level_desc) {
          case "national":
            name = `${this.ls.locale.global.label.all} ${this.ls.locale.global.area.national}`;
            break;

          case "division":
            name = `${this.ls.locale.global.label.all} ${this.ls.locale.global.area.regional}`;
            break;

          case "region":
            name = `${this.ls.locale.global.label.all} ${this.ls.locale.global.area.area}`;
            break;

          case "area":
            name = `${this.ls.locale.global.label.all} ${this.ls.locale.global.area.salespoint}`;
            break;

          case "salespoint":
            name = `${this.ls.locale.global.label.all} ${this.ls.locale.global.area.district}`;
            break;

          case "district":
            name = `${this.ls.locale.global.label.all} ${this.ls.locale.global.area.territory}`;
            break;
        }

        return name;
      }

      return msg.name;
    } else {
      return "";
    }
  }

  async setArea2(isRemove) {
    this.two_geotree = isRemove ? false : true;
    if (isRemove) {
      console.log('is remove', isRemove);
      if (this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 0) {
        this.detailAdminPrincipal.area_id.pop();
      }
    } else {
      try {
        const parent2ndArea = await this.adminPrincipalService.getParentArea({ parent: 1 }).toPromise();
        this.detailAreaSelected2 = parent2ndArea.data;

        // this.initArea2();
        this.initFormGroup2();
      } catch (error) {
        if (error.status === 404) {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.data_not_found });
          this.router.navigate(["user-management", "admin-principal"]);
        }
        throw error;
      }
    }
  }

  async setArea3(isRemove) {
    this.three_geotree = isRemove ? false : true;
    if (isRemove) {
      console.log('is remove', isRemove);
      if (this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 0) {
        this.detailAdminPrincipal.area_id.pop();
      }
    } else {
      try {
        const parent3rdArea = await this.adminPrincipalService.getParentArea({ parent: 1 }).toPromise();
        this.detailAreaSelected3 = parent3rdArea.data;

        // this.initArea3();
        this.initFormGroup3();
      } catch (error) {
        if (error.status === 404) {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.data_not_found });
          this.router.navigate(["user-management", "admin-principal"]);
        }
        throw error;
      }
    }
  }

  async setArea4(isRemove) {
    this.four_geotree = isRemove ? false : true;
    if (isRemove) {
      console.log('is remove', isRemove);
      if (this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 0) {
        this.detailAdminPrincipal.area_id.pop();
      }
    } else {
      try {
        const parent4thArea = await this.adminPrincipalService.getParentArea({ parent: 1 }).toPromise();
        this.detailAreaSelected4 = parent4thArea.data;

        // this.initArea4();
        this.initFormGroup4();
      } catch (error) {
        if (error.status === 404) {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.data_not_found });
          this.router.navigate(["user-management", "admin-principal"]);
        }
        throw error;
      }
    }
  }

  async setArea5(isRemove) {
    this.five_geotree = isRemove ? false : true;
    if (isRemove) {
      console.log('is remove', isRemove);
      if (this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 0) {
        this.detailAdminPrincipal.area_id.pop();
      }
    } else {
      try {
        const parent3rdArea = await this.adminPrincipalService.getParentArea({ parent: 1 }).toPromise();
        this.detailAreaSelected5 = parent3rdArea.data;

        // this.initArea5();
        this.initFormGroup5();
      } catch (error) {
        if (error.status === 404) {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.data_not_found });
          this.router.navigate(["user-management", "admin-principal"]);
        }
        throw error;
      }
    }
  }

  async setArea6(isRemove) {
    this.six_geotree = isRemove ? false : true;
    if (isRemove) {
      console.log('is remove', isRemove);
      if (this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 0) {
        this.detailAdminPrincipal.area_id.pop();
      }
    } else {
      try {
        const parent3rdArea = await this.adminPrincipalService.getParentArea({ parent: 1 }).toPromise();
        this.detailAreaSelected6 = parent3rdArea.data;

        // this.initArea6();
        this.initFormGroup6();
      } catch (error) {
        if (error.status === 404) {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.data_not_found });
          this.router.navigate(["user-management", "admin-principal"]);
        }
        throw error;
      }
    }
  }

  async setArea7(isRemove) {
    this.seven_geotree = isRemove ? false : true;
    if (isRemove) {
      console.log('is remove', isRemove);
      if (this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 0) {
        this.detailAdminPrincipal.area_id.pop();
      }
    } else {
      try {
        const parent3rdArea = await this.adminPrincipalService.getParentArea({ parent: 1 }).toPromise();
        this.detailAreaSelected7 = parent3rdArea.data;

        // this.initArea7();
        this.initFormGroup7();
      } catch (error) {
        if (error.status === 404) {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.data_not_found });
          this.router.navigate(["user-management", "admin-principal"]);
        }
        throw error;
      }
    }
  }

  async setArea8(isRemove) {
    this.eight_geotree = isRemove ? false : true;
    if (isRemove) {
      console.log('is remove', isRemove);
      if (this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 0) {
        this.detailAdminPrincipal.area_id.pop();
      }
    } else {
      try {
        const parent3rdArea = await this.adminPrincipalService.getParentArea({ parent: 1 }).toPromise();
        this.detailAreaSelected8 = parent3rdArea.data;

        // this.initArea8();
        this.initFormGroup8();
      } catch (error) {
        if (error.status === 404) {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.data_not_found });
          this.router.navigate(["user-management", "admin-principal"]);
        }
        throw error;
      }
    }
  }

  async setArea9(isRemove) {
    this.nine_geotree = isRemove ? false : true;
    if (isRemove) {
      console.log('is remove', isRemove);
      if (this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 0) {
        this.detailAdminPrincipal.area_id.pop();
      }
    } else {
      try {
        const parent3rdArea = await this.adminPrincipalService.getParentArea({ parent: 1 }).toPromise();
        this.detailAreaSelected9 = parent3rdArea.data;

        // this.initArea9();
        this.initFormGroup9();
      } catch (error) {
        if (error.status === 404) {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.data_not_found });
          this.router.navigate(["user-management", "admin-principal"]);
        }
        throw error;
      }
    }
  }

  async setArea10(isRemove) {
    this.ten_geotree = isRemove ? false : true;
    if (isRemove) {
      console.log('is remove', isRemove);
      if (this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 0) {
        this.detailAdminPrincipal.area_id.pop();
      }
    } else {
      try {
        const parent10thArea = await this.adminPrincipalService.getParentArea({ parent: 1 }).toPromise();
        this.detailAreaSelected10 = parent10thArea.data;

        // this.initArea10();
        this.initFormGroup10();
      } catch (error) {
        if (error.status === 404) {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.data_not_found });
          this.router.navigate(["user-management", "admin-principal"]);
        }
        throw error;
      }
    }
  }

  async setArea1(isRemove) {
    this.first_geotree = isRemove ? false : true;
    if (isRemove) {
      if (this.detailAdminPrincipal.area_id && this.detailAdminPrincipal.area_id.length > 0) {
        this.detailAdminPrincipal.area_id.shift();
      }
    } else {
      try {
        const parent = await this.adminPrincipalService.getParentArea({ parent: 1 }).toPromise();
        this.detailAreaSelected = parent.data;

        // this.initArea();
        this.initFormGroup();
      } catch (error) {
        if (error.status === 404) {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.data_not_found });
          this.router.navigate(["user-management", "admin-principal"]);
        }
        throw error;
      }
    }
  }

  getCountry() {

    this.adminPrincipalService.getCountry().subscribe(
      res => {
        this.listCountry = res.data;
      },
      err => {
        console.error(err);
      }
    );
   

  }

  getRole() {

    this.adminPrincipalService.getListRoleCountry({country: this.detailAdminPrincipal.country }).subscribe(
      res => {
        this.listRole = res.data;
      },
      err => {
        console.error(err);
      }
    );

  }
}
