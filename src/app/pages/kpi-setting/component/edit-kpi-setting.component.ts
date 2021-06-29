import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  OnChanges,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from '../../../services/data.service';
import { Subject, Observable, ReplaySubject, Subscription } from "rxjs";
import { MatSelect, MatDialogConfig, MatDialog } from "@angular/material";
import * as _ from "underscore";
import { environment } from "environments/environment";
import { IdbService } from "app/services/idb.service";
import {KPISettingModel} from 'app/pages/kpi-setting/kpi-setting.model';
import { commonFormValidator } from "app/classes/commonFormValidator";
import * as moment from 'moment';
import { DialogService } from "app/services/dialog.service";
import { MasterKPIService } from '../../../services/kpi-setting/master-kpi.service';

@Component({
  selector: 'app-edit-kpi-setting.component',
  templateUrl: './edit-kpi-setting.component.html',
  styleUrls: ['./edit-kpi-setting.component.scss']
})
export class EditKPISettingComponent implements OnInit {
  formKPI: FormGroup;
  formdataErrors: any;
  paramEdit: any = null;

  indexDelete: any;

  private subscription: Subscription;
  kpiSetting: KPISettingModel;

  loadingIndicator: Boolean;
  saveData: Boolean;

  categories = [
    'visit', 'brand', 'trade program', 'ecosystem'
  ];

  brands: Array<any>;
  brand_parameters: Array<any>;
  trade_program_objectives: Array<any>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private masterKPIService: MasterKPIService,
    private route: ActivatedRoute,
  ) {
    this.kpiSetting = new KPISettingModel();

    this.formdataErrors = {
      category: {}
    };
  }

  ngOnInit() {

    this.subscription = this.route.params.subscribe((params) => {
      if (params['id']) {
        this.paramEdit = params['id'];
      }
    });

    this.kpiSetting =  this.dataService.getFromStorage('kpi_setting');
    console.log(this.kpiSetting);

    this.masterKPIService.getBrands().subscribe((res) => {
      this.brands = res
      console.log(res)
    })

    this.masterKPIService.getBrandParameters().subscribe((res) => {
      this.brand_parameters = res
      console.log(res)
    })
    this.masterKPIService.getTradeProgramObjectives().subscribe((res) =>{
      this.trade_program_objectives = res
      console.log(res)
    })
    
    
    let startDate = moment(this.kpiSetting.start_date).format('DD-MMM-YYYY');
    let endDate = moment(this.kpiSetting.end_date).format('DD-MMM-YYYY');
    let dateStr = `${startDate} - ${endDate}`;

    this.formKPI = this.formBuilder.group({
      year: [this.kpiSetting.year],
      kps_number: [this.kpiSetting.kps_number],
      date: [dateStr],
      kpis: this.formBuilder.array([], Validators.required)
    });

    this.formKPI.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formKPI, this.formdataErrors);
    })

    this.formKPI.get('year').disable();
    this.formKPI.get('kps_number').disable();
    this.formKPI.get('date').disable();

    this.setDetail();
  }

  setDetail() {
  }

  addKPI() {
    let kpis = this.formKPI.controls['kpis'] as FormArray;
    kpis.push(this.createKPI());
  }

  createKPI(): FormGroup {
    return this.formBuilder.group({
      category: ['', Validators.required],
      brand: [''],
      parameter: ['']
    })
  }

  deleteKPI(pos) {
    let dialogData = {
      titleDialog: 'Hapus KPI',
      captionDialog: `Apa Anda yakin menghapus KPI ${pos+1}?`,
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ['Hapus', 'Batal']
    }
    this.dialogService.openCustomConfirmationDialog(dialogData);
  }

  confirmDelete() {
    let kpis = this.formKPI.controls.kpis as FormArray;
    kpis.removeAt(this.indexDelete);
    this.dialogService.brodcastCloseConfirmation();
  }

  submit() {
    console.log(this.formKPI.get('kpis'))
    if(this.formKPI.valid) {
      let kpis = this.formKPI.controls.kpis as FormArray;

      console.log(kpis);
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formKPI);
    }
  }
}
