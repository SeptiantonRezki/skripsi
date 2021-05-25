import { Component, OnInit } from '@angular/core';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { VirtualAccountTncService } from 'app/services/virtual-account/virtual-account-tnc.service';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HelpService } from 'app/services/content-management/help.service';
import { Config } from 'app/classes/config';

@Component({
  selector: 'app-virtual-account-tnc-edit',
  templateUrl: './virtual-account-tnc-edit.component.html',
  styleUrls: ['./virtual-account-tnc-edit.component.scss']
})
export class VirtualAccountTncEditComponent implements OnInit {
  formTnc: FormGroup;
  userGroup: any[] = [];
  public options: Object = Config.FROALA_CONFIG;
  // listStatus: Array<any> = [{ name: 'Aktif', value: 'active' }, { name: 'Tidak Aktif', value: 'inactive' }];
  shortDetail: any;
  detailTnc: any;
  isDetail: Boolean;

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private VirtualAccountTncService: VirtualAccountTncService,
    private activatedRoute: ActivatedRoute,
    private helpService: HelpService
  ) {
    this.shortDetail = this.dataService.getFromStorage('detail_virtual_account_tnc');
    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })
  }

  ngOnInit() {
    this.formTnc = this.formBuilder.group({
      title: ["", Validators.required],
      user_group: ["", Validators.required],
      body: ["", Validators.required],
    });

    // let regex = new RegExp(/[0-9]/g);
    // this.formTnc.get('contact').valueChanges.subscribe(res => {
    //   if (res.match(regex)) {
    //     if (res.substring(0, 1) == '0') {
    //       let phone = res.substring(1);
    //       this.formTnc.get('contact').setValue(phone, { emitEvent: false });
    //     }
    //   }
    // })

    this.getUserGroups();
    this.getDetail();

  }

  getUserGroups() {
    this.helpService.getListUser().subscribe(
      (res: any) => {
        console.log('getListUser', res);
        this.userGroup = res.data.map((item: any) => {
          return (
            { name: item, value: item }
          );
        });
      },
      err => {
        this.userGroup = [];
        console.error(err);
      }
    );
  }

  getDetail() {
    this.dataService.showLoading(true);
    this.VirtualAccountTncService.show({ tnc_id: this.shortDetail.id }).subscribe(res => {
      this.detailTnc = res;

      this.formTnc.setValue({
        title: res.title,
        user_group: res.user_group,
        body: this.detailTnc.body,
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
        title: this.formTnc.get('title').value,
        user_group: this.formTnc.get('user_group').value,
        body: this.formTnc.get("body").value,
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
