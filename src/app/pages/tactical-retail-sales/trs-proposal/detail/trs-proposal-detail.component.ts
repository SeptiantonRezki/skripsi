import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { NewSignService } from 'app/services/settings/new-sign.service';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { GeotreeService } from 'app/services/geotree.service';
import { NotificationService } from 'app/services/notification.service';
import { RetailerService } from 'app/services/user-management/retailer.service';
import * as _ from "lodash";
import moment from 'moment';
import { Router } from '@angular/router';
import { TacticalRetailSalesService } from "app/services/tactical-retail-sales.service";
import { TrsProposalExecutorComponent } from "../component/trs-proposal-executor.component";
import { TrsProposalKecamatanComponent } from "../component/trs-proposal-kecamatan.component";
import { TrsProposalProductComponent } from "../component/trs-proposal-product.component";
import { TrsCancelReasonComponent } from "../component/trs-cancel-reason.component";
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { LanguagesService } from 'app/services/languages/languages.service';

import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";

@Component({
  selector: 'app-trs-proposal-detail',
  templateUrl: './trs-proposal-detail.component.html',
  styleUrls: ['./trs-proposal-detail.component.scss']
})
export class TrsProposalDetailComponent implements OnInit {
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

  minDateProposal: any = new Date();
  minMaxDateProposal: any = new Date();
  maxDateProposal: any = new Date();
  maxPeriodProposal: any = 60;

  selectedArea: any = [""];
  selectedSalesPoint: any = "";

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
    private TRSService: TacticalRetailSalesService,
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

    this.selected = [];

    this.list = {
      salespoint: [],
    }

    this.maxDateProposal.setDate(this.minDateProposal.getDate() + this.maxPeriodProposal);
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

      this.formCreateProposal.patchValue({
        startDate: this.proposalData.start_date,
        endDate: this.proposalData.end_date,
        geotagging: this.proposalData.geotag_flag,
        custCode1: this.proposalData.customer1_code,
        custName1: this.proposalData.customer1_name,
        custCode2: this.proposalData.customer2_code,
        custName2: this.proposalData.customer2_name,
        maxExecutor: this.proposalData.max_executor,
        flowingly: this.proposalData.flowingly,
        background: this.proposalData.background,
        objective: this.proposalData.objective,

        executor_selected: this.proposalData.textarea_executors,
        kecamatan_selected: this.proposalData.textarea_kecamatans,
        product_selected: this.proposalData.textarea_products,
        
        /*
        executor: [""],
        kecamatan: [""],
        product: [""],

        //kanan
        executor_selected: ["", Validators.required],
        kecamatan_selected: ["", Validators.required],
        product_selected: ["", Validators.required],
        */

      });

      this.selectedArea = this.proposalData.area_id;
      this.selectedSalesPoint = this.proposalData.salespoint_id;

      this.selectedExecutor = this.proposalData.selected_executors;
      this.selectedKecamatan = this.proposalData.selected_kecamatans;
      this.selectedProduct = this.proposalData.selected_products;

      console.log("this.proposalData.attachments");
      console.log(this.proposalData.attachments);

      // disable form
      if(this.proposalData.status !== 'draft') {
        //this.formDetailVoucher.disable();
        //this.disableForm = true;
      };
      



      this.dataService.showLoading(false);
      this.TRSService.getAreaByUser(request).subscribe(res => {
        this.listLevelArea = res.data;
        this.addArea();
      }, err => {
        console.log('err occured', err);
        this.dataService.showLoading(false);
      });

    }, err => {
      console.log('err occured', err);
    })

    // ============== SET END DATE ================
    this.TRSService.getSysVar().subscribe((res) => {
      res.data.forEach((item) => {
        if (item.param === 'max_period') {
          this.maxPeriodProposal = parseInt(item.value);
        }
      });
    }, err => {
      console.log('err occured', err);
      this.dataService.showLoading(false);
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

  setMinDate(param?: any): void {
    this.formCreateProposal.get("endDate").setValue("");
    this.minMaxDateProposal = param;
    console.log("kaaaa");
    console.log(this.maxPeriodProposal);
    this.maxDateProposal = moment(param).add(parseInt(this.maxPeriodProposal), 'd');
  }

  batal(){
    this.router.navigate(['/tactical-retail-sales', 'trs-proposal']);
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
    this.generataList('salespoint', this.proposalData.area_id, index, 'render');
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

  async generataList(selection, id, index, type) {
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
        }

        //editchan
        wilayah.at(index).get('salespoint').setValue(this.proposalData.salespoint_id);

        this.selectedArea = id;
        break;

      case 'district':
        this.selectedSalesPoint = id;
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
