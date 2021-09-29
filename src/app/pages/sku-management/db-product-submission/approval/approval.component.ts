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
import { ProductSubmissionService } from "app/services/sku-management/product-submission.service";
import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "db-product-submission-approval",
  templateUrl: "./approval.component.html",
  styleUrls: ["./approval.component.scss"],
})
export class DbProductSubmissionApprovalComponent implements OnInit {
  approval: FormGroup;

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
    private submissionService: ProductSubmissionService,
    private router: Router
    private ls: LanguagesService
  ) {}

  ngOnInit() {
    this.createForm();
    this.getUsers();
    this.filterUser1.valueChanges
      .pipe(takeUntil(this.filterDestroy))
      .subscribe(() => {
        this.filteringUser1();
      });
    this.filterUserDb.valueChanges
      .pipe(takeUntil(this.filterDestroy))
      .subscribe(() => {
        this.filteringUserDb();
      });
  }

  createForm() {
    this.approval = this.formBuilder.group({
      user1: ["", Validators.required],
      userDb: ["", Validators.required],
    });
  }

  getUsers() {
    this.dataService.showLoading(true);
    this.submissionService.getUser().subscribe((res) => {
      this.dataService.showLoading(false);
      const listUser = res.data.map((item: any) => {
        if (item.approver_type === "approver-1")
          this.approval.get("user1").setValue(item.id);
        if (item.approver_type === "approver-produk-db")
          this.approval.get("userDb").setValue(item.id);
        return {
          ...item,
          name: item.fullname,
        };
      });
      this.user1 = listUser;
      this.filteredUser1.next(this.user1.slice());
      this.userDb = listUser;
      this.filteredUserDb.next(this.userDb.slice());
    });
  }

  filteringUser1() {
    const search = this.filterUser1.value;
    if (!this.user1) return;
    if (!search) {
      this.filteredUser1.next(this.user1.slice());
      return;
    }
    this.filteredUser1.next(
      this.user1.filter(
        (item) => item.name.toLowerCase().indexOf(search.toLowerCase()) >= 0
      )
    );
  }

  filteringUserDb() {
    const search = this.filterUserDb.value;
    if (!this.userDb) return;
    if (!search) {
      this.filteredUserDb.next(this.userDb.slice());
      return;
    }
    this.filteredUserDb.next(
      this.userDb.filter(
        (item) => item.name.toLowerCase().indexOf(search.toLowerCase()) >= 0
      )
    );
  }

  submit() {
    if (!this.approval.valid) {
      this.validateFormGroup(this.approval);
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi data terlebih dahulu!",
      });
      return;
    }
    let body = {
      approver_1_id: this.approval.controls["user1"].value,
      approver_produk_db_id: this.approval.controls["userDb"].value,
    };
    this.dataService.showLoading(true);
    this.submissionService.putUser(body).subscribe(
      (res) => {
        this.router.navigate(["sku-management", "db-product-submission"]);
        this.dialogService.openSnackBar({ message: "Data berhasil diubah" });
        this.dataService.showLoading(false);
      },
      (err) => {
        console.log(err);
        this.dataService.showLoading(false);
      }
    );
  }

  hasError(name) {
    return this.approval.get(name).invalid && this.approval.get(name).touched;
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
