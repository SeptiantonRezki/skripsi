import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DateAdapter } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { TradeProgramService } from 'app/services/dte/trade-program.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import * as moment from 'moment';
import { Observable } from 'rxjs';

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
  statusTP: any[] = [{ name: 'Terbitkan', value: 'publish' }, { name: 'Tidak Diterbitkan', value: 'unpublish' }]

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
    private activatedRoute: ActivatedRoute
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
      status: ['', Validators.required]
    })

    this.formTradeProgram.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formTradeProgram, this.formTradeProgramError);
    })

    this.formTradeProgram.setValue({
      name: this.detailFormTrade.name,
      start_date: this.detailFormTrade.start_date,
      end_date: this.detailFormTrade.end_date,
      budget: this.detailFormTrade.budget,
      coin_expiry_date: this.detailFormTrade.coin_expiry_date,
      status: this.detailFormTrade.status_publish
    })

    if (this.detailFormTrade.status === 'active') {
      this.formTradeProgram.disable();
    }

    this.formTradeProgram.controls['status'].enable();

    this.formTradeProgram.valueChanges.subscribe(res => {
      this.valueChange = true;
    })

    this.setMinEndDate('init');
    this.setMinExpireDate('init');

    if (this.isDetail) this.formTradeProgram.disable();
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
    if (this.files && this.files.size > 2000000) return this.dialogService.openSnackBar({ message: 'Ukuran gambar maksimal 2mb!' })

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
      if (this.files) fd.append('image', this.files);

      this.tradeProgramService.put(fd, { trade_program_id: this.detailFormTrade.id }).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: 'Data Berhasil Diubah' });
          this.router.navigate(['dte', 'trade-program']);
        },
        err => {
          console.log(err.error.message);
        }
      )
    } else {
      this.dialogService.openSnackBar({ message: 'Silakan lengkapi data terlebih dahulu!' });
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
        this.dialogService.openSnackBar({ message: 'Data Berhasil Diubah' });
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
