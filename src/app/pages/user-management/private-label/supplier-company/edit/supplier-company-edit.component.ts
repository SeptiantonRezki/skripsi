import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged, switchMap, finalize, tap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { DialogService } from "../../../../../services/dialog.service";
import { commonFormValidator } from "../../../../../classes/commonFormValidator";
import { SupplierCompanyService } from "app/services/user-management/private-label/supplier-company.service";
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-supplier-company-edit',
  templateUrl: './supplier-company-edit.component.html',
  styleUrls: ['./supplier-company-edit.component.scss']
})
export class SupplierCompanyEditComponent implements OnInit {
  onLoad: boolean;
  createForm: FormGroup;
  createFormError: any;
  @ViewChild('chipList') chipList: MatChipList;
  @ViewChild('namasupplier') namasupplier: ElementRef;
  @ViewChild('alamat') alamat: ElementRef;
  @ViewChild('telepon') telepon: ElementRef;
  @ViewChild('ponsel') ponsel: ElementRef;
  productControl= new FormControl();
  catatanControl = new FormControl();

  supplierStatusList: any[] = [
    { name: 'Aktif', status: 'active' },
    { name: 'Non-Aktif', status: 'inactive' }
  ];

  supplierStatusSelected: any;
  products: any[];
  productVisible: boolean = true;
  productSelectable: boolean = true;
  productRemovable: boolean = true;
  productAddOnBlur: boolean = true;
  readonly productSeparatorKeysCodes: number[] = [COMMA];
  // keywords: string[] = [];
  productOptions: Observable<any[]>;
  isLoadingProduct: boolean;
  isProductFound: boolean;
  isLoadingSave: boolean;
  isDetail: boolean;
  supplierId: any;
  detailSupplier: any;

  constructor(
    private formBuilder: FormBuilder,
    private supplierCompanyService: SupplierCompanyService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    this.isLoadingProduct = false;
    this.isProductFound = false;
    this.products = [];
    this.isLoadingSave = false;
    this.productRemovable = true;

    this.activatedRoute.url.subscribe(param => {
      this.isDetail = param[1].path === 'detail' ? true : false;
      this.supplierId = param[2].path;
      if (this.isDetail) this.productRemovable = false
    });
  }

  async ngOnInit() {
    this.createForm = this.formBuilder.group({
      namasupplier: ["", Validators.required],
      alamat: ["", Validators.required],
      telepon: ["", [Validators.required, Validators.minLength(6)]],
      ponsel: ["", [Validators.required, Validators.minLength(6)]],
      // catatan: "",
    })
    this.catatanControl.setValue('');

    this.createForm.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.createForm, this.createFormError);
    })

    try {
      const response = await this.supplierCompanyService.detail({ supplierId: this.supplierId }).toPromise();
      if (response && response.status == 'success' && response.data) {
        console.log('response', response);
        this.detailSupplier = response.data;
        this.createForm.get('namasupplier').setValue(this.detailSupplier.name);
        if(this.router.url.indexOf('/user-management/private-label') > -1){
          
        this.products = this.detailSupplier.products;
        }
        this.createForm.get('alamat').setValue(this.detailSupplier.address);
        this.createForm.get('telepon').setValue(this.detailSupplier.telephone);
        this.createForm.get('ponsel').setValue(this.detailSupplier.cellphone);
        this.catatanControl.setValue(this.detailSupplier.note);
        this.supplierStatusSelected = this.detailSupplier.status;
      }
    } catch (error) {
      if (error.status === 404) {
        this.dialogService.openSnackBar({ message: "Data tidak ditemukan" });
        this.router.navigate(["user-management", "supplier-company"]);
      }
      throw error;
    }

    this.productOptions = this.productControl.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      tap(() => this.isLoadingProduct = true),
      distinctUntilChanged(),
      switchMap(value => this._filter(value)
      )
    )
  }

  // private _filter(value: string) {
  //   // console.log('value', value);
  //   // if (value) {
  //   return this.supplierCompanyService.search({ param: value, isAll: true }).pipe(
  //     map((option: any) => {
  //       console.log('option', option);
  //       if (option.data.length > 0) {
  //         this.isProductFound = true;
  //         return option.data;
  //       } else {
  //         this.isProductFound = false;
  //         return [{
  //           id: null,
  //           title: "",
  //           text: "HASIL PENCARIAN untuk \"" + value + "\" tidak ditemukan. Mohon hubungi tim Digital Care untuk pertanyaan ini.",
  //           value: value,
  //           disabled: true
  //         }];
  //       }
  //     })
  //   );
  //   // } else { this.productValue = ''; return []; }
  // }

  private _filter(value: string) {
    // console.log('value', value);
    // if (value) {
    return this.supplierCompanyService.search({ param: value, isAll: true }).pipe(
      map((option: any) => {
        // console.log('option', option);
        if (option.data.length > 0) {
          this.isProductFound = true;
          return option.data;
        } else {
          this.isProductFound = false;
          return [{
            id: null,
            title: "",
            text: "HASIL PENCARIAN untuk \"" + value + "\" tidak ditemukan. Mohon hubungi tim Digital Care untuk pertanyaan ini.",
            value: value,
            disabled: true
          }];
        }
      })
    );
    // } else { this.productValue = ''; return []; }
  }

  addChip(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add keyword
    if ((value || '').trim()) {
      // this.products.push(value.trim());
    }
    // Reset the input value
    if (input) {
      input.value = '';
      if (this.products.length > 0) {
        // this.formHelp.get('otherkeyword').setValue(value);
        this.chipList.errorState = false;
      } else {
        this.chipList.errorState = true;
      }
    }
  }

  addProductChip(item: any): void {
    // Add keyword
    if (item.name) {
      item.name = item.name.trim();
      this.products.push(item);
    }
  }

  removeChip(keyword: string): void {
    const index = this.products.indexOf(keyword);
    //remove keyword
    if (index >= 0) {
      this.products.splice(index, 1);
    }
  }

  checkError() {
    if (this.createForm.controls['namasupplier'].hasError('required')) {
      this.createForm.get('namasupplier').markAsTouched({ onlySelf: true });
      this.namasupplier.nativeElement.focus();
      console.log('#001');
    // } else if (this.products.length == 0) {
    //   this.chipList.errorState = true;
    //   this.chipList.focus();
    //   console.log('#002');
    } else if (this.createForm.controls['alamat'].hasError('required')) {
      this.createForm.get('alamat').markAsTouched({ onlySelf: true });
      this.alamat.nativeElement.focus();
      console.log('#003');
    } else if (this.createForm.controls['telepon'].hasError('required') || this.createForm.get("telepon").errors) {
      this.createForm.get('telepon').markAsTouched({ onlySelf: true });
      this.telepon.nativeElement.focus();
      console.log('#004');
    } else if (this.createForm.controls['ponsel'].hasError('required') || this.createForm.get("ponsel").errors) {
      this.createForm.get('ponsel').markAsTouched({ onlySelf: true });
      this.ponsel.nativeElement.focus();
      console.log('#005');
    }
  }

  onSave() {
    this.isLoadingSave = true;
    // if (this.createForm.valid && this.products.length > 0) {
    if (this.createForm.valid) {
      const products = this.products.map((item) => item.id);
      var body = {};
      if(this.router.url.indexOf('/user-management/private-label') > -1){
         body = {
          name: this.createForm.get("namasupplier").value,
          address: this.createForm.get("alamat").value,
          telephone: this.createForm.get("telepon").value,
          cellphone: this.createForm.get("ponsel").value,
          // note: this.createForm.get("catatan").value,
          note: this.catatanControl.value,
          products: products,
          status: this.supplierStatusSelected
        };
      }else{
        body = {
          name: this.createForm.get("namasupplier").value,
          address: this.createForm.get("alamat").value,
          telephone: this.createForm.get("telepon").value,
          cellphone: this.createForm.get("ponsel").value,
          // note: this.createForm.get("catatan").value,
          note: this.catatanControl.value,
          // products: products
          status: this.supplierStatusSelected
        };
      }
      this.supplierCompanyService.update(body, { supplierId: this.detailSupplier.id }).subscribe(res => {
        this.dialogService.openSnackBar({
          message: "Berhasil Mengubah Data"
        });
        if(this.router.url.indexOf('/user-management/private-label') > -1){
          this.products = [];
          this.router.navigate(["user-management", "private-label"]);
        }else{
          this.router.navigate(["user-management", "supplier-company"]);
        }
        }, err => {
          console.log('err', err);
          this.isLoadingSave = false;
          this.dialogService.openSnackBar({
            message: err.error.message
          });
        }
      );
    } else {
      console.log('failed to Save - Data Belum Lengkap', this.createForm.errors);
      this.isLoadingSave = false;
      this.dialogService.openSnackBar({
        message: "Data Belum Lengkap"
      });
      commonFormValidator.validateAllFields(this.createForm);
      this.checkError();
    }
  }

  isFromPrivateLabel(){
    if(this.router.url.indexOf('/user-management/private-label') > -1){
      return true;
    }else{
      return false;
    }
  }
}

