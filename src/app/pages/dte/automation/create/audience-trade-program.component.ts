import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { MatTabChangeEvent } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { AudienceTradeProgramService } from 'app/services/dte-automation/audience-trade-program.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-audience-trade-program',
  templateUrl: './audience-trade-program.component.html',
  styleUrls: ['./audience-trade-program.component.scss']
})
export class AudienceTradeProgramComponent implements OnInit {
  selectedTab: any;
  formAutomation: FormGroup;
  listAutomation: any[] = [
    { name: 'E-Order', value: 'e-order' },
    { name: 'Digital Coupon', value: 'coupon' },
    { name: 'Referral Code', value: 'referral_code' }
  ];

  filteredTradeProgram: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  tradePrograms: any[];
  public filterTradeProgram: FormControl = new FormControl();
  private _onDestroy = new Subject<void>();
  skus: FormArray;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private audienceTradeProgramService: AudienceTradeProgramService
  ) {
    // const selectedTab = dataService.getFromStorage("selected_tab");
    this.selectedTab = 0;
  }

  ngOnInit() {
    this.formAutomation = this.formBuilder.group({
      automation: ['e-order', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      coin_max: [0, Validators.required],
      coin_reward: [0, Validators.required],
      coupon_total: [0],
      trade_program_id: [""],
      title_challenge: ["", Validators.required],
      description_challenge: ["", Validators.required],
      button_text: ["", Validators.required],
      skus: this.formBuilder.array([this.createFormSku()])
    });

    this.audienceTradeProgramService.getTradePrograms().subscribe(res => {
      console.log('res list trade programs', res);
      this.tradePrograms = res.data.slice();
      this.filteredTradeProgram.next((res && res.data) ? res.data.slice() : []);
    });

    this.filterTradeProgram
      .valueChanges
      .pipe(
        takeUntil(this._onDestroy)
      )
      .subscribe(() => {
        this._filterTradeProgram();
      });
  }

  createFormSku() {
    return this.formBuilder.group({
      id: [""],
      name: [""]
    });
  }

  addSkuProduct() {
    this.skus = this.formAutomation.get("skus") as FormArray;
    this.skus.insert(0, this.createFormSku());
  }

  _filterTradeProgram() {
    if (!this.tradePrograms) {
      return;
    }
    // get the search keyword
    let search = this.filterTradeProgram.value;
    if (!search) {
      this.filteredTradeProgram.next(this.tradePrograms.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the trades
    this.filteredTradeProgram.next(
      this.tradePrograms.filter(trade => trade.name.toLowerCase().indexOf(search) > -1)
    );
  }

  setSelectedTab(tabChangeEvent: MatTabChangeEvent) {
    window.localStorage.removeItem("page");
    window.localStorage.removeItem("sort");
    window.localStorage.removeItem("sort_type");

    this.selectedTab = tabChangeEvent.index;
    this.dataService.setToStorage("selected_tab", this.selectedTab);
  }

}
