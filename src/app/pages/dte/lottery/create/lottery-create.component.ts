import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-lottery-create',
  templateUrl: './lottery-create.component.html',
  styleUrls: ['./lottery-create.component.scss']
})
export class LotteryCreateComponent implements OnInit {
  selectedTab: number = 0;

  formSpin: FormGroup;
  onLoad: boolean;
  minDate = new Date();
  groupTradePrograms: any[] = [];


  constructor(
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.onLoad = true
  }

  ngOnInit() {
    this.formSpin = this.formBuilder.group({
      name: ["", Validators.required],
      group_trade_id: ["", Validators.required],
      start_date: [new Date()],
      end_date: [new Date()],
    })

    this.onLoad = false;
  }

}
