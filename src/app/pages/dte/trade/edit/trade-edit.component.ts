import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DateAdapter } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { TradeProgramService } from 'app/services/dte/trade-program.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import * as moment from 'moment';

@Component({
  selector: 'app-trade-edit',
  templateUrl: './trade-edit.component.html',
  styleUrls: ['./trade-edit.component.scss']
})
export class TradeEditComponent {

  formTradeProgram: FormGroup;
  formTradeProgramError: any;
  detailFormTrade: any;

  minDate: Date;
  minExpireDate: Date;
  
  constructor(
    private router: Router,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private dataService: DataService,
    private tradeProgramService: TradeProgramService
  ) { 
    this.adapter.setLocale('id');
    
    this.formTradeProgramError = {
      name: {},
      start_date: {},
      end_date: {},
      budget: {},
      coin_expiry_date: {}
    }

    this.detailFormTrade = this.dataService.getFromStorage('detail_trade_program');
  }

  ngOnInit() {
    this.formTradeProgram = this.formBuilder.group({
      name: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      budget: ['', Validators.required],
      coin_expiry_date: ['', Validators.required]
    })

    this.formTradeProgram.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formTradeProgram, this.formTradeProgramError);
    })

    this.formTradeProgram.setValue({
      name: this.detailFormTrade.name,
      start_date: this.detailFormTrade.start_date,
      end_date: this.detailFormTrade.end_date,
      budget: this.detailFormTrade.budget,
      coin_expiry_date: this.detailFormTrade.coin_expiry_date
    })

    this.setMinEndDate('init');
    this.setMinExpireDate('init');
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

  submit(): void {
    if (this.formTradeProgram.valid) {
      let body = {
        _method: 'PUT',
        name: this.formTradeProgram.get('name').value,
        start_date: this.convertDate(this.formTradeProgram.get('start_date').value),
        end_date: this.convertDate(this.formTradeProgram.get('end_date').value),
        budget: this.formTradeProgram.get('budget').value,
        coin_expiry_date: this.convertDate(this.formTradeProgram.get('coin_expiry_date').value)
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
    } else {
      this.dialogService.openSnackBar({ message: 'Silakan lengkapi data terlebih dahulu!' });
    }
  }

  convertDate(param: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return "";
  }

}