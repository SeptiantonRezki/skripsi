import { Component, OnInit } from '@angular/core';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { VirtualAccountTncService } from 'app/services/virtual-account/virtual-account-tnc.service';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-virtual-account-tnc-edit',
  templateUrl: './virtual-account-tnc-edit.component.html',
  styleUrls: ['./virtual-account-tnc-edit.component.scss']
})
export class VirtualAccountTncEditComponent implements OnInit {
  formTnc: FormGroup;
  listStatus: Array<any> = [{ name: 'Aktif', value: 'active' }, { name: 'Tidak Aktif', value: 'inactive' }];
  shortDetail: any;
  detailTnc: any;
  isDetail: Boolean;

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private VirtualAccountTncService: VirtualAccountTncService,
    private activatedRoute: ActivatedRoute
  ) {
    this.shortDetail = this.dataService.getFromStorage('detail_virtual_account_tnc');
    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })
  }

  ngOnInit() {
    this.formTnc = this.formBuilder.group({
      name: ["", Validators.required],
      contact: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      flowingly_id: ["", Validators.required],
      status: ["", Validators.required],
      minimum_transaction: [0, Validators.required],
      service_cost: [0, Validators.required]
    });

    let regex = new RegExp(/[0-9]/g);
    this.formTnc.get('contact').valueChanges.subscribe(res => {
      if (res.match(regex)) {
        if (res.substring(0, 1) == '0') {
          let phone = res.substring(1);
          this.formTnc.get('contact').setValue(phone, { emitEvent: false });
        }
      }
    })

    this.getDetail();

  }

  getDetail() {
    this.dataService.showLoading(true);
    this.VirtualAccountTncService.show({ tnc_id: this.shortDetail.id }).subscribe(res => {
      this.detailTnc = res;

      this.formTnc.setValue({
        name: res.name,
        email: res.email,
        contact: res.contact ? (res.contact.split("+62")[1] ? res.contact.split("+62")[1] : res.contact) : '',
        flowingly_id: res.flowingly_id,
        status: res.status,
        minimum_transaction: res.minimum_transaction ? res.minimum_transaction : 0,
        service_cost: res.service_cost
      });
      if (this.isDetail) {
        this.formTnc.disable();
      }
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  numbersOnlyValidation(event) {
    const inp = String.fromCharCode(event.keyCode);
    /*Allow only numbers*/
    if (!/^\d+$/.test(inp)) {
      event.preventDefault()
    }
  }

  submit() {
    if (this.formTnc.valid) {
      this.dataService.showLoading(true);
      let body = {
        name: this.formTnc.get('name').value,
        contact: '+62' + this.formTnc.get('contact').value,
        email: this.formTnc.get('email').value,
        flowingly_id: this.formTnc.get('flowingly_id').value,
        status: this.formTnc.get('status').value,
        minimum_transaction: this.formTnc.get('minimum_transaction').value,
        service_cost: this.formTnc.get('service_cost').value,
      }

      this.VirtualAccountTncService.put(body, { tnc_id: this.detailTnc.id }).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Data berhasil disimpan!"
        })
        this.router.navigate(['virtual-account', 'terms-and-condition']);
      }, err => {
        this.dataService.showLoading(false);
      })
    } else {
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      })
      commonFormValidator.validateAllFields(this.formTnc);
    }
  }

}
