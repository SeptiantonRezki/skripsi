import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { DataService } from "app/services/data.service";
import { DialogService } from "app/services/dialog.service";
import { LanguagesService } from "app/services/languages/languages.service";
import { TacticalRetailSalesService } from "app/services/tactical-retail-sales.service";
import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-trs-system-variable',
  templateUrl: './trs-system-variable.component.html',
  styleUrls: ['./trs-system-variable.component.scss']
})
export class TrsSystemVariableComponent implements OnInit {
  sysvariable: FormGroup;

  max_total_pack: Array<any>;
  max_pack_data: Array<any> = [];

  user1: Array<any>;
  filterUser1: FormControl = new FormControl();
  filteredUser1: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  userDb: Array<any>;
  filterUserDb: FormControl = new FormControl();
  filteredUserDb: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  filterDestroy = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private TRSService: TacticalRetailSalesService,
    private router: Router,
    private ls: LanguagesService
  ) { }

  ngOnInit() {
    this.TRSService.getSysVar().subscribe((res) => {
      this.max_pack_data = res[0];

      var d = new Date(this.max_pack_data['updated_at']);
      var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);

      this.max_pack_data['updated_date'] = datestring;
      this.createForm();
    });
  }

  createForm() {
    this.sysvariable = this.formBuilder.group({
      max_pack: ["", Validators.required]
    });
    this.sysvariable.get("max_pack").setValue(this.max_pack_data['value']);
  }

  submit() {
    if (!this.sysvariable.valid) {
      this.validateFormGroup(this.sysvariable);
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi data terlebih dahulu!",
      });
      return;
    }
    let body = {
      max_pack: this.sysvariable.get("max_pack").value
    };
    this.dataService.showLoading(true);
    this.TRSService.putSysVar(body).subscribe(
      (res) => {
        //this.router.navigate(["tactical-retail-sales", "trs-system-variable"]);
        this.dialogService.openSnackBar({ message: "Data berhasil diubah" });
        this.ngOnInit();
        this.dataService.showLoading(false);
      },
      (err) => {
        console.log(err);
        this.dataService.showLoading(false);
      }
    );
  }

  validateFormGroup(form: FormGroup) {
    Object.keys(form.controls).forEach((field) => {
      const control = form.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateFormGroup(control);
      }
    });
  }
}

