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
  selector: 'app-pengaturan-dsd',
  templateUrl: './pengaturan-dsd.component.html',
  styleUrls: ['./pengaturan-dsd.component.scss']
})
export class PengaturanDsdComponent implements OnInit {
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
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      geotagging: ['wajib', Validators.required],
      custCode1: ["", Validators.required],
      custName1: ["", Validators.required],
      custCode2: [""],
      custName2: [""],
      maxExecutor: [1, Validators.required],      
      flowingly: [""],
      
      executor: [""],
      kecamatan: [""],
      product: [""],

      //kanan
      executor_selected: ["", Validators.required],
      kecamatan_selected: ["", Validators.required],
      product_selected: ["", Validators.required],

      background: ["", Validators.required],
      objective: ["", Validators.required],

      area: [""],
      salespoint: [""],
    })

    // =========== GET AREA AWAL ===========
    this.dataService.showLoading(true);
    let areas = this.dataService.getDecryptedProfile()['area_id'];

    let request = {
      level: 4, // area
      area_id: areas
    };

    this.TRSService.getAreaByUser(request).subscribe(res => {
      this.listLevelArea = res.data;
      this.addArea();

      console.log("this.listLevelArea");
      console.log(this.listLevelArea);

      this.dataService.showLoading(false);
    }, err => {
      console.log('err occured', err);
      this.dataService.showLoading(false);
    })
    
    this.keyUpCust1.debounceTime(300)
      .flatMap(key => {
        return Observable.of(key).delay(300);
      })
      .subscribe(res => {
        this.setCustName(res, 'custName1');
      });

    this.keyUpCust2.debounceTime(300)
      .flatMap(key => {
        return Observable.of(key).delay(300);
      })
      .subscribe(res => {
        this.setCustName(res, 'custName2');
      });
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

  setMinDate(param?: any): void {
    this.formCreateProposal.get("endDate").setValue("");
    this.minMaxDateProposal = param;
    console.log("kaaaa");
    console.log(this.maxPeriodProposal);
    this.maxDateProposal = moment(param).add(parseInt(this.maxPeriodProposal), 'd');

    this.selectedExecutor = [];
    this.selectedKecamatan = [];
    this.formCreateProposal.get('executor_selected').setValue("");
    this.formCreateProposal.get('kecamatan_selected').setValue("");
  }

  dateChanged(): void {
    this.selectedExecutor = [];
    this.selectedKecamatan = [];
    this.formCreateProposal.get('executor_selected').setValue("");
    this.formCreateProposal.get('kecamatan_selected').setValue("");
  }
  
  setCustName(id, component_name): void {
    if (true) {
      if (id.length >= 10) {
        if (this.selectedSalesPoint == ""){
          alert("Pilih salespoint terlebih dahulu !");
        } else {
          let custCode1 = this.formCreateProposal.get('custCode1').value;
          let custCode2 = this.formCreateProposal.get('custCode2').value;
          if (custCode1.toUpperCase() == custCode2.toUpperCase()){
            alert('Customer tidak boleh sama');
          } else {
            id = id+"__"+this.selectedSalesPoint;
            this.dataService.showLoading(true);
            this.TRSService.getCustName(id.toUpperCase()).subscribe(res => {
              this.dataService.showLoading(false);
              if (res.status ==  'success'){
                this.formCreateProposal.get(component_name).setValue(res.data.name);
              } else {
                alert(res.message);
                this.formCreateProposal.get(component_name).setValue("");
              }
            }, err => {
              this.dataService.showLoading(false);
              console.log('err occured', err);
            })
          }
        }
      } else {
        this.formCreateProposal.get(component_name).setValue("");
      }
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
      area: [this.listLevelArea[0]["id"], Validators.required],
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
    this.generataList('salespoint', this.listLevelArea[0]["id"], index, 'render', this.listLevelArea[0]["code"]);
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

        if (type !== 'render') {
          wilayah.at(index).get('salespoint').setValue('');

          this.selectedSalesPoint = "";
          this.selectedExecutor = [];
          this.selectedProduct = [];
          this.formCreateProposal.get('executor_selected').setValue("");
          this.formCreateProposal.get('product_selected').setValue("");
        }

        this.selectedArea = id;
        this.selectedArea_code = area_code;

        /*
        break;

      case 'district':
        this.selectedSalesPoint = id;
        this.selectedSalesPoint_code = area_code;

        if (type !== 'render') {
          this.selectedExecutor = [];
          this.formCreateProposal.get('executor_selected').setValue("");
        }
        */

        //KHUSUS DSD
        this.trs_program_code = this.selectedArea_code;

        this.dataService.showLoading(true);
        this.TRSService.getProposalDetail(this.trs_program_code).subscribe(resProposal => {

          if (resProposal.status == 'empty'){
            alert("belum ada data tersimpan untuk area ini");
            this.dataService.showLoading(false);
            
          } else {
            this.proposalData = resProposal.data;
    
            this.formCreateProposal.patchValue({
              executor_selected: this.proposalData.textarea_executors,
              product_selected: this.proposalData.textarea_products,
            });
      
            this.selectedArea = this.proposalData.area_id;
      
            this.selectedExecutor = this.proposalData.selected_executors;
            this.selectedProduct = this.proposalData.selected_products;
        
            this.dataService.showLoading(false);
  
            let areas = this.dataService.getDecryptedProfile()['area_id'];
            let request = {
              level: 4, // area
              area_id: areas
            };
  
            this.TRSService.getAreaByUser(request).subscribe(res => {
              this.listLevelArea = res.data;
              this.addArea();
            }, err => {
              console.log('err occured', err);
              this.dataService.showLoading(false);
            });
          }

        }, err => {
          this.dataService.showLoading(false);
          console.log('err occured', err);
        })


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