import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../../services/data.service";
import { AudienceService } from "../../../../../services/dte/audience.service";
import { DialogService } from "../../../../../services/dialog.service";
import { Router } from "@angular/router";
import { Subject, Observable, ReplaySubject } from "rxjs";
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';
import { Page } from 'app/classes/laravel-pagination';


@Component({
  selector: "app-dialog-kesulitan-misi",
  templateUrl: "./dialog-kesulitan-misi.component.html",
  styleUrls: ["./dialog-kesulitan-misi.component.scss"],
})
export class DialogKesulitanMisiComponent implements OnInit {
  form: FormGroup;
  pagination: Page = new Page();
  offsetPagination: Number = null;
  data: any[];
  condition: boolean;
  loadingIndicator: Boolean;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogKesulitanMisiComponent>,
    private dataService: DataService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
  ) {
    this.condition = false;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: "",
    });
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.pengaturanAttributeMisiService.getKesulitanMisi(this.pagination).subscribe(
      res => {
        this.data = res.data.data;
        console.log('ini data', this.data);
    }
  );
}

  submit(form) {
    this.dataService.showLoading(true);
    this.loadingIndicator = true;
    this.condition = false;
    this.data.forEach((each) => {
      if (each.name.toUpperCase() === form.value.name.toUpperCase()) {
        this.condition = true;
        this.dataService.showLoading(false);
        this.loadingIndicator = false;
      }
    });
    if (this.condition === false) {
    this.dialogRef.close(`${form.value.name}`);
    this.pengaturanAttributeMisiService.createKesulitanMisi(form.value).subscribe(
      (res) => {
        this.dialogService.openSnackBar({
          message: "Data Berhasil Disimpan",
        });
        this.dataService.showLoading(false);
        this.loadingIndicator = false;
        this.router.navigate(["dte", "pengaturan-attribute-misi"]);
      },
      (err) => {
        this.dialogService.openSnackBar({ message: err.error.message })
        console.log(err.error.message);
        this.dataService.showLoading(false);
        this.loadingIndicator = false;
      }
    );
      }
  }
}
