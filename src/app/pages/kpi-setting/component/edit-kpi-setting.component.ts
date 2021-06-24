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

@Component({
  selector: 'app-edit-kpi-setting.component',
  templateUrl: './edit-kpi-setting.component.html'
})
export class EditKPISettingComponent implements OnInit {
  parameters: Array<string>;
  paramEdit: any = null;

  valueChange: Boolean;
  dialogRef: any;

  private subscription: Subscription;
  kpiSetting: KPISettingModel;

  loadingIndicator: Boolean;
  saveData: Boolean;

  @ViewChild("downloadLink") downloadLink: ElementRef;
  @ViewChild("singleSelect") singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();

  @HostListener("window:beforeunload")
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away

    if (this.valueChange && !this.saveData)
      return false;
    return true;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private idbService: IdbService,
    private route: ActivatedRoute,
  ) {
    this.kpiSetting = new KPISettingModel();
  }

  ngOnInit() {
    this.idbService.reset();

    this.subscription = this.route.params.subscribe((params) => {
      if (params['id']) {
        this.paramEdit = params['id'];
        this.kpiSetting =  this.dataService.getFromStorage('kpi_setting');
        console.log(this.kpiSetting);
      }
    });
  }
}
