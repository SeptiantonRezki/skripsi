import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DateAdapter } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { TradeProgramService } from 'app/services/dte/trade-program.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import moment from 'moment';
import { Observable, Subject, ReplaySubject } from 'rxjs';
import { GroupTradeProgramService } from 'app/services/dte/group-trade-program.service';
import { takeUntil } from 'rxjs/operators';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-trade-edit',
  templateUrl: './trade-edit.component.html',
  styleUrls: ['./trade-edit.component.scss']
})
export class TradeEditComponent {

  formTradeProgram: FormGroup;
  formTradeProgramError: any;
  detailFormTrade: any;

  minDateFrom: any;
  minDate: any;
  minExpireDate: any;

  files: File;
  validComboDrag: boolean;
  valueChange: Boolean;
  saveData: Boolean;

  isDetail: Boolean;
  statusTP: any[] = [{ name: this.translate.instant('dte.trade_program.text6'), value: 'publish' }, { name: this.translate.instant('dte.trade_program.text7'), value: 'unpublish' }]
  listGroupTradeProgram: any[] = [];
  private _onDestroy = new Subject<void>();
  filteredGTpOptions: Observable<string[]>;
  public filterGTP: FormControl = new FormControl();
  public filteredGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  listSubGroupTradeProgram: any[] = [];
  public filterSGTP: FormControl = new FormControl();
  public filteredSGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.isDetail) return true;

    if (this.valueChange && !this.saveData) {
      return false;
    }

    if (this.files && !this.saveData) {
      return false;
    }

    return true;
  }

  constructor(
    private router: Router,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private dataService: DataService,
    private tradeProgramService: TradeProgramService,
    private activatedRoute: ActivatedRoute,
    private groupTradeProgramService: GroupTradeProgramService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.adapter.setLocale('id');
    this.minDateFrom = moment();
    this.minDate = moment();
    this.minExpireDate = moment();
    this.saveData = false;

    this.formTradeProgramError = {
      name: {},
      start_date: {},
      end_date: {},
      budget: {},
      coin_expiry_date: {}
    }

    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    this.detailFormTrade = this.dataService.getFromStorage('detail_trade_program');
  }

  ngOnInit() {
    this.formTradeProgram = this.formBuilder.group({
      name: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      budget: ['', [Validators.required, Validators.min(0)]],
      coin_expiry_date: ['', Validators.required],
      status: ['', Validators.required],
      group_trade_program_id: [""],
      sub_group_trade_program_id: [""],
    })

    this.formTradeProgram.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formTradeProgram, this.formTradeProgramError);
    })

    this.formTradeProgram.setValue({
      name: this.detailFormTrade.name,
      start_date: this.detailFormTrade.start_date,
      end_date: this.detailFormTrade.end_date,
      budget: Number(this.detailFormTrade.budget),
      coin_expiry_date: this.detailFormTrade.coin_expiry_date,
      status: this.detailFormTrade.status_publish,
      group_trade_program_id: this.detailFormTrade.trade_creator_group_id ? this.detailFormTrade.trade_creator_group_id : '',
      sub_group_trade_program_id: this.detailFormTrade.trade_creator_sub_group_id ? this.detailFormTrade.trade_creator_sub_group_id : '',
    })

    if (this.detailFormTrade.status === 'active') {
      this.formTradeProgram.disable();
    }

    this.formTradeProgram.controls['status'].enable();

    this.formTradeProgram.valueChanges.subscribe(res => {
      this.valueChange = true;
    })

    this.filterGTP.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringGTP();
      });

    this.filterSGTP.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringSGTP();
      });

    this.getGroupTradeProgram();
    this.getSubGroupTradeProgram();

    this.setMinEndDate('init');
    this.setMinExpireDate('init');

    if (this.isDetail) this.formTradeProgram.disable();
  }


  filteringGTP() {
    if (!this.listGroupTradeProgram) {
      return;
    }
    // get the search keyword
    let search = this.filterGTP.value;
    if (!search) {
      this.filteredGTP.next(this.listGroupTradeProgram.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredGTP.next(
      this.listGroupTradeProgram.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }
  getGroupTradeProgram() {
    this.groupTradeProgramService.get({ page: 'all' }).subscribe(res => {
      this.listGroupTradeProgram = res.data ? res.data.data : [];
      this.filteredGTP.next(this.listGroupTradeProgram.slice());
    })
  }

  getSubGroupTradeProgram() {
    this.groupTradeProgramService.getSubGroupTrade({ page: 'all' }).subscribe(res => {
      this.listSubGroupTradeProgram = res.data ? res.data.data : [];
      this.filteredSGTP.next(this.listSubGroupTradeProgram.slice());
    })
  }

  filteringSGTP() {
    if (!this.listSubGroupTradeProgram) {
      return;
    }
    // get the search keyword
    let search = this.filterSGTP.value;
    if (!search) {
      this.filteredSGTP.next(this.listSubGroupTradeProgram.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredSGTP.next(
      this.listSubGroupTradeProgram.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  setMinEndDate(init?) {
    if (!init) {
      this.formTradeProgram.get("end_date").setValue("");
    }

    this.minDate = this.formTradeProgram.get("start_date").value;
  }

  setMinExpireDate(init?) {
    if (!init) {
      this.formTradeProgram.get("coin_expiry_date").setValue("");
    }

    this.minExpireDate = this.formTradeProgram.get("end_date").value;
  }

  removeImage(): void {
    this.files = undefined;
  }

  submit(): void {
    if (this.files && this.files.size > 2000000) return this.dialogService.openSnackBar({ message: this.translate.instant('dte.group_trade_program.text13') })

    if (this.formTradeProgram.valid) {
      this.saveData = !this.saveData;
      let fd = new FormData();

      let body = {
        _method: 'PUT',
        name: this.formTradeProgram.get('name').value,
        start_date: this.convertDate(this.formTradeProgram.get('start_date').value),
        end_date: this.convertDate(this.formTradeProgram.get('end_date').value),
        budget: this.formTradeProgram.get('budget').value,
        coin_expiry_date: this.convertDate(this.formTradeProgram.get('coin_expiry_date').value),
        status: this.formTradeProgram.get('status').value,
      }

      fd.append('_method', body._method);
      fd.append('name', body.name);
      fd.append('start_date', body.start_date);
      fd.append('end_date', body.end_date);
      fd.append('budget', body.budget);
      fd.append('coin_expiry_date', body.coin_expiry_date);
      fd.append('status', body.status);
      fd.append('trade_creator_group_id', this.formTradeProgram.get('group_trade_program_id').value);
      fd.append('trade_creator_sub_group_id', this.formTradeProgram.get('sub_group_trade_program_id').value);
      if (this.files) fd.append('image', this.files);

      this.tradeProgramService.put(fd, { trade_program_id: this.detailFormTrade.id }).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: this.translate.instant('global.message.text2') });
          this.router.navigate(['dte', 'trade-program']);
        },
        err => {
          console.log(err.error.message);
        }
      )
    } else {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });
      commonFormValidator.validateAllFields(this.formTradeProgram);
    }
  }

  updateStatus() {
    this.saveData = !this.saveData;
    let formTradeProgram = this.formTradeProgram.getRawValue();

    let body = {
      _method: 'PUT',
      name: formTradeProgram.name,
      start_date: this.convertDate(formTradeProgram.start_date),
      end_date: this.convertDate(formTradeProgram.end_date),
      budget: formTradeProgram.budget,
      coin_expiry_date: this.convertDate(formTradeProgram.coin_expiry_date),
      status: formTradeProgram.status
    }

    this.tradeProgramService.put(body, { trade_program_id: this.detailFormTrade.id }).subscribe(
      res => {
        this.dialogService.openSnackBar({ message: this.translate.instant('global.message.text2') });
        this.router.navigate(['dte', 'trade-program']);
      },
      err => {
        console.log(err.error.message);
      }
    )
  }

  convertDate(param: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return "";
  }

}
