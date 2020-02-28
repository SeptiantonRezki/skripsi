import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { Router } from '@angular/router';
import { GroupTradeProgramService } from 'app/services/dte/group-trade-program.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-group-trade-program-create',
  templateUrl: './group-trade-program-create.component.html',
  styleUrls: ['./group-trade-program-create.component.scss']
})
export class GroupTradeProgramCreateComponent implements OnInit {
  formGroupTradeProgram: FormGroup;
  formGroupTradeProgramError: any;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private groupTradeProgramService: GroupTradeProgramService
  ) {
    this.formGroupTradeProgramError = {
      name: {}
    };
  }

  ngOnInit() {
    this.formGroupTradeProgram = this.formBuilder.group({
      name: ["", Validators.required]
    });
  }

  submit() {
    if (this.formGroupTradeProgram.valid) {
      this.dataService.showLoading(true);
      let body = {
        name: this.formGroupTradeProgram.get('name').value,
        status: 'active'
      }

      this.groupTradeProgramService.create(body).subscribe(res => {
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
