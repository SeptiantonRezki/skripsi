import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-b2-b-voucher-create',
  templateUrl: './b2-b-voucher-create.component.html',
  styleUrls: ['./b2-b-voucher-create.component.scss']
})
export class B2BVoucherCreateComponent implements OnInit {
  formDetilVoucher: FormGroup;
  minDateVoucher: any = new Date();
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.formDetilVoucher = this.formBuilder.group({
      name: ["", Validators.required],
      coin: [0, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      limit_only: [false],
      limit_by: [false],
      product: [""],
      category: [""]
    });
  }

}
