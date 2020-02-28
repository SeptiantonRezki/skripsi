import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupTradeProgramService } from 'app/services/dte/group-trade-program.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-group-trade-program-edit',
  templateUrl: './group-trade-program-edit.component.html',
  styleUrls: ['./group-trade-program-edit.component.scss']
})
export class GroupTradeProgramEditComponent implements OnInit {
  formGroupTradeProgram: FormGroup;
  formGroupTradeProgramError: any;
  isDetail: Boolean;
  detailGroupTradeProgram: any;
  listStatus: any[] = [{ name: 'Aktif', value: 'active' }, { name: 'Tidak Aktif', value: 'inactive' }]
  formStatus: FormControl = new FormControl('');

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private groupTradeProgramService: GroupTradeProgramService,
    private activatedRoute: ActivatedRoute
  ) {
    this.formGroupTradeProgramError = {
      name: {}
    };
    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    });

    this.detailGroupTradeProgram = this.dataService.getFromStorage("detail_group_trade_program");
  }

  ngOnInit() {
    this.formGroupTradeProgram = this.formBuilder.group({
      name: ["", Validators.required]
    });

    this.formGroupTradeProgram.get('name').setValue(this.detailGroupTradeProgram.name);
    this.formStatus.setValue(this.detailGroupTradeProgram.status);
    if (this.isDetail) {
      this.formGroupTradeProgram.disable();
      this.formStatus.disable();
    }
  }

  submit() {
    if (this.formGroupTradeProgram.valid) {
      this.dataService.showLoading(true);
      let body = {
        name: this.formGroupTradeProgram.get('name').value,
        status: this.formStatus.value
      }

      this.groupTradeProgramService.put(body, { group_id: this.detailGroupTradeProgram.id }).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Data berhasil disimpan!"
        });
        this.router.navigate(['dte', 'group-trade-program']);
      }, err => {
        console.log('err', err);
        this.dataService.showLoading(false);
      })
    } else {
      commonFormValidator.validateAllFields(this.formGroupTradeProgram);

      this.dialogService.openSnackBar({ message: "Silahkan lengkapi data terlebih dahulu!" });
    }
  }

}
