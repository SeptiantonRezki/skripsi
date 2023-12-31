import { Component, OnInit, ViewChild, ElementRef, TemplateRef, Input, Output, EventEmitter } from "@angular/core";
import { Page } from "app/classes/laravel-pagination";
import { Subject, Observable, ReplaySubject } from "rxjs";
import { DatatableComponent, SelectionType } from "@swimlane/ngx-datatable";
import { Router } from "@angular/router";
import { DialogService } from "app/services/dialog.service";
import { DataService } from "app/services/data.service";
import { DSDMulticategoryService } from "app/services/dsd-multicategory.service";
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { PagesName } from "app/classes/pages-name";
import { HttpErrorResponse } from "@angular/common/http";
import { GeotreeService } from "app/services/geotree.service";
import { LanguagesService } from "app/services/languages/languages.service";
import moment from 'moment';
import { GenerateTRS } from "app/classes/generate-trs";

import { NewSignService } from 'app/services/settings/new-sign.service';
import { NotificationService } from 'app/services/notification.service';
import { RetailerService } from 'app/services/user-management/retailer.service';
import * as _ from "lodash";
import { PengaturanDsdExecutorComponent } from "../component/pengaturan-dsd-executor.component";
import { PengaturanDsdKecamatanComponent } from "../component/pengaturan-dsd-kecamatan.component";
import { PengaturanDsdProductComponent } from "../component/pengaturan-dsd-product.component";
import { TrsCancelReasonComponent } from "../component/trs-cancel-reason.component";
import { commonFormValidator } from 'app/classes/commonFormValidator';

import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";

@Component({
  selector: 'app-pengaturan-dsd-edit',
  templateUrl: './pengaturan-dsd-edit.component.html',
  styleUrls: ['./pengaturan-dsd-edit.component.scss']
})
export class PengaturanDsdEditComponent implements OnInit {
  formCreateProposal: FormGroup;
  formFilter: FormGroup;
  onLoad: boolean;
  loadingIndicator: boolean;
  showLoading: Boolean;
  listLevelArea: any[];
  indexDelete: any;
  list: any;
  typeArea: any[] = ["area", "salespoint"];
  areaFromLogin;

  rows: any[];
  selected: any[] = [];
  id: any[];
  reorderable = true;
  pagination: Page = new Page();

  keyUp = new Subject<string>();
  areaType: any[] = [];

  permission: any;
  roles: PagesName = new PagesName();

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;
  menuList: any[] = [];
  iconList: any[] = [];
  areaIdNonTargetAudience: any = 1;

  opsiGeotagging = [
    { name: 'Wajib', value: 'wajib' },
    { name: 'Optional', value: 'optional' },
  ];

  keyUpCust1 = new Subject<string>();
  keyUpCust2 = new Subject<string>();

  dialogRef: any;
  importingDataStatus = {
    import_audience_status: null,
    import_audience_status_type: null
  }

  todayDate: any = new Date();
  minDateProposal: any;
  minMaxDateProposal: any;
  maxDateProposal: any;
  maxPeriodProposal: any;

  selectedArea: any = [""];
  selectedSalesPoint: any = "";

  selectedArea_code: any = "";
  selectedSalesPoint_code: any = "";

  selectedExecutor: any = [];
  selectedKecamatan: any = [];
  selectedProduct: any = [];

  executor_selected_array: any = [];
  product_selected_array: any = [];

  imageSku: any;
  files: File;
  fileList: Array<File> = [];
  deleteFile: any = [];
  validComboDrag: Boolean;

  proposalData: any;
  trs_program_code: any;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private newSignService: NewSignService,
    private geotreeService: GeotreeService,
    private TRSService: DSDMulticategoryService,
    private notificationService: NotificationService,
    private retailerService: RetailerService,
    private dialog: MatDialog,
    private router: Router,
    private ls: LanguagesService
  ) {
    this.areaType = this.dataService.getDecryptedProfile()['area_type'];
    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];

    //HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
    //let areas = this.dataService.getDecryptedProfile()['areas'] || [];

    this.permission = this.roles.getRoles('principal.pengaturandsd');
    this.selected = [];

    this.list = {
      salespoint: [],
    }
  }

  ngOnInit() {

    this.formCreateProposal = this.formBuilder.group({
      areas: this.formBuilder.array([]),
      
      executor: [""],
      product: [""],

      area: [""],
      salespoint: [""],
    })

    // =========== GET AREA AWAL ===========
    let areas = this.dataService.getDecryptedProfile()['area_id'];

    let request = {
      level: 4, // area
      area_id: areas
    };

    const thisURL = this.router.url;
    this.trs_program_code = thisURL.split('/').pop();

    this.dataService.showLoading(true);
    this.TRSService.getProposalDetail(this.trs_program_code).subscribe(resProposal => {

      this.proposalData = resProposal.data;

      if (resProposal.status == 'empty'){
        alert("belum ada data tersimpan untuk area ini");

        this.dataService.showLoading(false);
        this.selectedArea = resProposal.area_id;
        this.selectedSalesPoint = resProposal.salespoint_id;
        this.proposalData.area_id = resProposal.area_id;

      } else {
        console.log('lalalalala');
        /*
        this.formCreateProposal.patchValue({
          executor_selected: this.proposalData.textarea_executors,
          product_selected: this.proposalData.textarea_products,
        });
        */

        this.selectedArea = this.proposalData.area_id;

        this.selectedExecutor = this.proposalData.selected_executors;
        this.selectedProduct = this.proposalData.selected_products;

        this.executor_selected_array = (JSON.parse(this.proposalData.textarea_executors)).sort();
        this.product_selected_array = (JSON.parse(this.proposalData.textarea_products)).sort();
      }

      this.dataService.showLoading(true);
      this.TRSService.getAreaByUser(request).subscribe(res => {

        let array_area = res.data.map(function (obj) {
          return obj.id;
        });
        if (array_area.includes(this.selectedArea)){

        } else {
          alert('Anda tidak memiliki akses untuk merubah area ini');

          var str =  window.location.href;
          var lastIndex = str.lastIndexOf("/");
          var path = str.substring(0, lastIndex);
          lastIndex = path.lastIndexOf("/");
          path = path.substring(0, lastIndex);

          window.location.assign(path);
        }

        this.listLevelArea = res.data;
        this.addArea();
        this.dataService.showLoading(false);
      }, err => {
        console.log('err occured', err);
        this.dataService.showLoading(false);
      });

    }, err => {
      this.dataService.showLoading(false);
      console.log('err occured', err);
    })
  }

  
  changeFile(evt) {
    this.readThis(evt);
  }

  readThis(inputValue: any): void {
    var file: File = inputValue;
    if (file.size > 2000000) {
      this.dialogService.openSnackBar({
        message: "File melebihi maksimum 2mb!"
      });
      return;
    }
    this.fileList = [
      ...this.fileList,
      file
    ];

    console.log("this.fileList");
    console.log(this.fileList);
  }

  removeImage(idx) {
    console.log('index you find!', idx);
    this.fileList.splice(idx, 1);
  }

  removeExistingImage(idx, id) {
    this.proposalData.attachments.splice(idx, 1);
    this.deleteFile.push(id);
  }

  submit(mode) {
    console.log("qqqq");
    if (this.formCreateProposal.valid) {
      if (this.selectedExecutor.length > 0 && this.selectedProduct.length > 0){
        this.dataService.showLoading(true);
        let fd = new FormData();
        //fd.append('program_code', "XXX_Coba1"); generate di backend saja
        fd.append('area_id', this.selectedArea);
        
        fd.append('executors', this.selectedExecutor);
        fd.append('products', this.selectedProduct);
  
        this.TRSService.putProposalDetail(fd, this.trs_program_code).subscribe(res => {
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar({
            message: this.ls.locale.notification.popup_notifikasi.text22
          });
          //location.reload();
        }, err => {
          this.dataService.showLoading(false);
        })
      } else {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Executor dan Product wajib dipilih minimal 1"
        });
      }
    } else {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      });
      commonFormValidator.validateAllFields(this.formCreateProposal);
    }
  }

  modalExecutor() {
    if (this.selectedArea == ""){
      alert("Tunggu, data Area sedang di load");
    } else {
      const dialogConfig = new MatDialogConfig();
      const formCreateProposal = this.formCreateProposal.getRawValue();
  
      dialogConfig.maxWidth = "90vw";
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.panelClass = 'scrumboard-card-dialog';
      dialogConfig.data = {
        password: 'P@ssw0rd',
        IMPORT_FROM_METHOD: 'CREATE',
        max: 100000,
        area: this.selectedArea,
        selected: this.selectedExecutor,
        program_code: this.trs_program_code,
        formCreateProposal,
      };
  
      this.dialogRef = this.dialog.open(PengaturanDsdExecutorComponent, dialogConfig);
  
      this.dialogRef.afterClosed().subscribe(response => {
        
        console.log("kakakaka");
        console.log(response);
        var result = [];
        var result_id = [];
        if (typeof response !== "undefined") {
          response.forEach(function (item) {
            result_id.push(item.id);
            
            if (item.territory != "" && item.territory != "-"){
              result.push(item.territory.trim() + " - " + item.fullname);
            } else {
              if (item.district == "" || item.district == "-"){
                result.push(item.salespoint.trim() + " - " + item.fullname);
              } else {
                result.push(item.district.trim() + " - " + item.fullname);
              }
            }
          });
  
          result = result.sort();

          this.selectedExecutor = result_id.join("__");
          this.executor_selected_array = result;
  
          console.log(result);
        }
      });
    }
  }

  modalProduct() {
    if (this.selectedArea == ""){
      alert("Tunggu, data Area sedang di load");
    } else {
      const dialogConfig = new MatDialogConfig();
      const formCreateProposal = this.formCreateProposal.getRawValue();
  
      dialogConfig.maxWidth = "90vw";
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.panelClass = 'scrumboard-card-dialog';
      dialogConfig.data = {
        password: 'P@ssw0rd',
        IMPORT_FROM_METHOD: 'CREATE',
        area: this.selectedArea,
        selected: this.selectedProduct,
        formCreateProposal,
      };
  
      this.dialogRef = this.dialog.open(PengaturanDsdProductComponent, dialogConfig);
  
      this.dialogRef.afterClosed().subscribe(response => {
        var result = [];
        var result_id = [];
        if (typeof response !== "undefined") {
          response.forEach(function (item) {
            result_id.push(item.id);
            result.push(item.code + " (" + item.name + ")");
          });
  
          result = result.sort();

          this.selectedProduct = result_id.join("__");
          this.product_selected_array = result;
  
          console.log(result);
        }
      });
    }
  }

  parseArea(type) {
    // return type === 'division' ? 'zone' : type;
    switch (type) {
      case 'division':
        return 'zone';
      case 'teritory':
      case 'territory':
        return 'territory';
      default:
        return type;
    }
  }

  filteringGeotree(areaList) {
    return areaList;
  }

  initFilterArea() {
    this.areaFromLogin.map(item => {
      let level_desc = '';
      switch (item.type.trim()) {
        case 'area':
          level_desc = 'salespoint';
          this.formCreateProposal.get('area').setValue(item.id);
          this.formCreateProposal.get('area').disable();
          break
        case 'salespoint':
          level_desc = 'district';
          this.formCreateProposal.get('salespoint').setValue(item.id);
          this.formCreateProposal.get('salespoint').disable();
          break;
      }
      this.getAudienceArea(level_desc, item.id);
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'salespoint':
        item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
        this.retailerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          this.list[selection] = res;
        });

        this.formCreateProposal.get('salespoint').setValue('');
        break;

      default:
        break;
    }
  }

  createArea(): FormGroup {
    return this.formBuilder.group({
      area: [this.proposalData.area_id, Validators.required],
      salespoint: [""],
      list_area: this.formBuilder.array(this.listLevelArea),
      list_salespoint: this.formBuilder.array([]),
    })
  }

  addArea() {
    let wilayah = this.formCreateProposal.controls['areas'] as FormArray;
    wilayah.push(this.createArea());
    const index = wilayah.length > 0 ? (wilayah.length - 1) : 0
    this.initArea(index);
    this.generataList('salespoint', this.proposalData.area_id, index, 'render', '');
  }

  initArea(index) {
    let wilayah = this.formCreateProposal.controls['areas'] as FormArray;
    this.areaType.map(item => {
      switch (item.type.trim()) {
        case 'area':
          wilayah.at(index).get('area').disable();
          break;
        case 'salespoint':
          wilayah.at(index).get('salespoint').disable();
          break;
      }
    })
  }

  async generataList(selection, id, index, type, area_code) {

    area_code = area_code.trim();
    console.log("area_code");
    console.log(area_code);

    this.areaIdNonTargetAudience = id;
    let item: any;
    let response: any;
    let list: any;
    let wilayah = this.formCreateProposal.controls['areas'] as FormArray;
    
    switch (selection) {
      case 'salespoint':
        item = wilayah.at(index).get('list_area').value.length > 0 ? wilayah.at(index).get('list_area').value.filter(item => item.id === id)[0] : {};
      
        response = await this.notificationService.getListOtherChildren({ parent_id: id }).toPromise();
        list = wilayah.at(index).get(`list_${selection}`) as FormArray;

        //clear hasil sebelumnya
        while (list.length > 0) {
          list.removeAt(list.length - 1);
        }

        _.clone(response || []).map(item => {
          list.push(this.formBuilder.group({ ...item, name: item.name }));
        });
        if (list.length > 0){
          list.removeAt(0);
        }

        this.selectedArea = id;
        if (area_code == ''){
          const thisURL = this.router.url;
          area_code = thisURL.split('/').pop();
        }

        this.selectedArea_code = area_code;
        this.trs_program_code = this.selectedArea_code;

        if (type !== 'render') {
          /*
          this.selectedSalesPoint = "";
          this.selectedExecutor = [];
          this.selectedProduct = [];
          this.formCreateProposal.get('executor_selected').setValue("");
          this.formCreateProposal.get('product_selected').setValue("");
          */

          var str =  window.location.href;
          var lastIndex = str.lastIndexOf("/");
          var path = str.substring(0, lastIndex);
          var new_path = path + "/" + this.trs_program_code;
          
          this.dataService.showLoading(true);
          window.location.assign(new_path);
        
        }
        /*
        break;

      case 'district':
        this.selectedSalesPoint = id;
        this.selectedSalesPoint_code = area_code;

        if (type !== 'render') {
          this.selectedExecutor = [];
          this.formCreateProposal.get('executor_selected').setValue("");
        }

        this.trs_program_code = this.selectedArea_code+'_'+this.selectedSalesPoint_code;
        
        */




        //document.location.href = newUrl;

  

        break;
  

      default:
        break;
    }
  }

  clearFormArray = (index, selection) => {
    let wilayah = this.formCreateProposal.controls['areas'] as FormArray;
    let list = wilayah.at(index).get(selection) as FormArray;
    while (list.length > 0) {
      list.removeAt(list.length - 1);
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

  findDuplicate(array) {
    var object = {};
    var result = [];

    array.forEach(function (item) {
      if (!object[item])
        object[item] = 0;
      object[item] += 1;
    })

    for (var prop in object) {
      if (object[prop] >= 2) {
        result.push(prop);
      }
    }

    return result;
  }

}