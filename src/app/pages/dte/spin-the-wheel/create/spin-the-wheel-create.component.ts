import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-spin-the-wheel-create',
  templateUrl: './spin-the-wheel-create.component.html',
  styleUrls: ['./spin-the-wheel-create.component.scss']
})
export class SpinTheWheelCreateComponent implements OnInit {
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
