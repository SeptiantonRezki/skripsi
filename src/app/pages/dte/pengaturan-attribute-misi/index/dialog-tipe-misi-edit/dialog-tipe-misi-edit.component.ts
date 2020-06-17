import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { FormGroup, FormBuilder } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { AudienceService } from "../../../../../services/dte/audience.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Router } from "@angular/router";
import { Subject, Observable, ReplaySubject } from "rxjs";
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';

@Component({
  selector: 'app-dialog-tipe-misi-edit',
  templateUrl: './dialog-tipe-misi-edit.component.html',
  styleUrls: ['./dialog-tipe-misi-edit.component.scss']
})
export class DialogTipeMisiEditComponent implements OnInit {
  form: FormGroup;
  loadingIndicator: Boolean;
  reorderable = true;
  saveData: Boolean;
  exportTemplate: Boolean;
  valueChange: Boolean;
  selected = [];
  name:string;
  id: number;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<DialogTipeMisiEditComponent>,
    private dataService: DataService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.name = data.name;
    this.id = data.id;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      // id: "",
      // name: ""
      name: this.name,
      id: this.id
    });
    this.form.patchValue({
      name: this.name,
      // status: this.status,
      // id: this.id
    });
    console.log(this.form.value);
  }

  submit(form) {
    this.dialogRef.close(`${form.value}`);
    // console.log(`${form.value.name}`);
    console.log(form.value);
    this.pengaturanAttributeMisiService.putTipeMisi(form.value, { tipe_misi_id: this.id }).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({
        message: "Data berhasil disimpan!"
      });
      this.router.navigate(['dte', 'pengaturan-attribute-misi']);
    }, err => {
      console.log('err', err);
      this.dataService.showLoading(false);
    })
  }

}
