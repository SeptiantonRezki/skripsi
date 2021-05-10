import { Component, OnInit } from '@angular/core';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { VirtualAccountCompanyService } from 'app/services/virtual-account/virtual-account-company.service';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-virtual-account-company-edit',
  templateUrl: './virtual-account-company-edit.component.html',
  styleUrls: ['./virtual-account-company-edit.component.scss']
})
export class VirtualAccountCompanyEditComponent implements OnInit {
  formCompany: FormGroup;
  listStatus: Array<any> = [{ name: 'Aktif', value: 'active' }, { name: 'Tidak Aktif', value: 'inactive' }];
  shortDetail: any;
  detailCompany: any;
  isDetail: Boolean;
  listBanks: any[] = [];
  listBankMap: any[] = [];

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private VirtualAccountCompanyService: VirtualAccountCompanyService,
    private activatedRoute: ActivatedRoute
  ) {
    this.shortDetail = this.dataService.getFromStorage('detail_virtual_account_company');
    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })
  }

  ngOnInit() {
    this.formCompany = this.formBuilder.group({
      name: ["", Validators.required],
      contact: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      flowingly_id: ["", Validators.required],
      status: ["", Validators.required],
      minimum_transaction: [0, Validators.required],
      service_cost: [0, Validators.required]
    });

    let regex = new RegExp(/[0-9]/g);
    this.formCompany.get('contact').valueChanges.subscribe(res => {
      if (res.match(regex)) {
        if (res.substring(0, 1) == '0') {
          let phone = res.substring(1);
          this.formCompany.get('contact').setValue(phone, { emitEvent: false });
        }
      }
    })

    this.getDetail();
    this.getBanks();
  }

  getDetail() {
    this.dataService.showLoading(true);
    this.VirtualAccountCompanyService.show({ company_id: this.shortDetail.id }).subscribe(res => {
      this.detailCompany = res;

      this.formCompany.setValue({
        name: res.code_bank,
        email: res.email,
        contact: res.contact ? (res.contact.split("+62")[1] ? res.contact.split("+62")[1] : res.contact) : '',
        flowingly_id: res.flowingly_id,
        status: res.status,
        minimum_transaction: res.minimum_transaction ? res.minimum_transaction : 0,
        service_cost: res.service_cost
      });
      if (this.isDetail) {
        this.formCompany.disable();
      }
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  getBanks() {
    this.VirtualAccountCompanyService.bankList({}).subscribe(res => {
      this.listBanks = res.data;
      this.listBanks.forEach(bank => {
        this.listBankMap[bank.code] = bank.name;
      });
    }, err=> {
      
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
    if (this.formCompany.valid) {
      this.dataService.showLoading(true);
      let body = {
        code_bank: this.formCompany.get('name').value,
        name: this.listBankMap[this.formCompany.get('name').value],
        contact: '+62' + this.formCompany.get('contact').value,
        email: this.formCompany.get('email').value,
        flowingly_id: this.formCompany.get('flowingly_id').value,
        status: this.formCompany.get('status').value,
        minimum_transaction: this.formCompany.get('minimum_transaction').value,
        service_cost: this.formCompany.get('service_cost').value,
      }

      this.VirtualAccountCompanyService.put(body, { company_id: this.detailCompany.id }).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Data berhasil disimpan!"
        })
        this.router.navigate(['virtual-account', 'companies']);
      }, err => {
        this.dataService.showLoading(false);
      })
    } else {
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      })
      commonFormValidator.validateAllFields(this.formCompany);
    }
  }

}
