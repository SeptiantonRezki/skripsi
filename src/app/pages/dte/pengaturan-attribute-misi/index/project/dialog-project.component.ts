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
import { LanguagesService } from "app/services/languages/languages.service";


@Component({
  selector: "app-dialog-project",
  templateUrl: "./dialog-project.component.html"
})
export class DialogProjectComponent implements OnInit {
  form: FormGroup;
  pagination: Page = new Page();
  offsetPagination: Number = null;
  data: any[];
  condition: boolean;
  loadingIndicator: Boolean;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogProjectComponent>,
    private dataService: DataService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    private ls: LanguagesService
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

    this.pengaturanAttributeMisiService.getProject(this.pagination).subscribe(
      res => {
        this.data = res.data.data;
      },
    );
  }

  submit(form) {
    console.log('ini data', this.data);
    this.condition = false;
    if ( this.data !== undefined) {
    this.data.forEach((each) => {
      if (each.name.toUpperCase() === form.value.name.toUpperCase()) {
        this.condition = true;
        this.dataService.showLoading(false);
      }
    });
    }
    if (this.condition === false) {
    this.dialogRef.close(`${form.value.name}`);
    this.pengaturanAttributeMisiService.createProjectMisi(form.value).subscribe(
      (res) => {
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22
        });
        this.router.navigate(["dte", "pengaturan-attribute-misi"]);
      },
      (err) => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
    }
  }
}
