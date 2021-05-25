import { Component, OnInit } from '@angular/core';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { VirtualAccountBinService } from 'app/services/virtual-account/virtual-account-bin.service';
import { VirtualAccountCompanyService } from 'app/services/virtual-account/virtual-account-company.service';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-virtual-account-bin-edit',
  templateUrl: './virtual-account-bin-edit.component.html',
  styleUrls: ['./virtual-account-bin-edit.component.scss']
})
export class VirtualAccountBinEditComponent implements OnInit {
  formBin: FormGroup;
  shortDetail: any;
  detailBin: any;
  isDetail: Boolean;
  // listCompany: Array<any> = [{ name: 'Bank Permata', id: '1' }];
  listCompany: Array<any> = [];
  listBank: Array<any>;
  listBankMap: any = {};

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private VirtualAccountBinService: VirtualAccountBinService,
    private VirtualAccountCompanyService: VirtualAccountCompanyService,
    private activatedRoute: ActivatedRoute
  ) {
    this.shortDetail = this.dataService.getFromStorage('detail_virtual_account_bin');
    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })
  }

  getBanks() {
    this.VirtualAccountCompanyService.bankList({}).subscribe(res => {
      this.listBank = res.data;
      this.listBank.forEach(bank => {
        this.listBankMap[bank.code] = bank.name;
      });
      console.log(res.data);
    }, err=> {

    })
  }

  getCompanies() {
    this.VirtualAccountBinService.list({}).subscribe(res => {
      this.listCompany = res.data.data
    }, err=> {

    })
  }
  
  ngOnInit() {
    this.formBin = this.formBuilder.group({
      company: ["", Validators.required],
      bin: ["", Validators.required]
    });

    this.getDetail();
    this.getCompanies();
    this.getBanks();
  }
    
  getDetail() {
    this.dataService.showLoading(true);
    this.VirtualAccountBinService.show({ bin_id: this.shortDetail.id }).subscribe(res => {
      this.detailBin = res;

      this.formBin.setValue({
        company: res.virtual_account_company_id,
        bin: res.bin
      });
      if (this.isDetail) {
        this.formBin.disable();
      }
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  submit() {
    if (this.formBin.valid) {
      this.dataService.showLoading(true);
      let body = {
        virtual_account_company_id: this.formBin.get('company').value,
        bin: this.formBin.get('bin').value
      }

      this.VirtualAccountBinService.put(body, { bin_id: this.detailBin.id }).subscribe(res => {
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
      commonFormValidator.validateAllFields(this.formBin);
    }
  }

}
