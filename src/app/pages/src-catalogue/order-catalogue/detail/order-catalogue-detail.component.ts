import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { RupiahFormaterWithoutRpPipe } from '@fuse/pipes/rupiah-formater';
import { DataService } from 'app/services/data.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ProductCatalogueService } from 'app/services/src-catalogue/product-catalogue.service';
import { OrderCatalogueService } from 'app/services/src-catalogue/order-catalogue.service';
import { EstShippingDialogComponent } from '../est-shipping-dialog/est-shipping-dialog';

@Component({
  selector: 'app-order-catalogue-detail',
  templateUrl: './order-catalogue-detail.component.html',
  styleUrls: ['./order-catalogue-detail.component.scss']
})
export class OrderCatalogueDetailComponent implements OnInit {
  orderId: any;
  body: any;
  detailOrder: any;
  loadingIndicator = true;
  onLoad: Boolean;
  vendor_id: any;

  // generateReceipt: GenerateReceipt = new GenerateReceipt();

  productsForm: FormGroup;
  orderStatuses: any[];
  statusLogs: Array<any>[];
  statusForm: FormGroup;
  selectedTab: any = 0;
  editable: Boolean;
  edited: Boolean;

  navigationSubscription;
  imageConverted: any;

  onEdit: boolean = false;
  dialogRef: any;
  listLevel: any[] = [];
  isAnyUpdate: any;
  keyUp = new Subject<number>();
  allProductLevels: any[] = [];
  stateUpdated: Boolean;
  productsNota: any[] = [];
  tierHasDisc: Boolean;
  shipping_cost: FormControl = new FormControl('');


  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.onEdit || this.stateUpdated) {
      return false;
    }

    return true;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ordersService: OrderCatalogueService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private fuseSplashScreen: FuseSplashScreenService,
    private convertRp: RupiahFormaterWithoutRpPipe,
    private dataService: DataService,
    private dialog: MatDialog,
    private productService: ProductCatalogueService
  ) {

    // const observable = this.keyUp.debounceTime(1000)
    //   .distinctUntilChanged()
    //   .flatMap(search => {
    //     return Observable.of(search).delay(500);
    //   })
    //   .subscribe(data => {
    //     this.onPriceChange(data);
    //   });

    this.edited = false;
    this.activatedRoute.url.subscribe(params => {
      console.log('paramssss', params);
      this.orderId = params[2].path;
    });
    // this.listLevel = this.activatedRoute.snapshot.data["listLevel"].data

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (
        e instanceof NavigationEnd &&
        e.url === `/orders/detail/${this.orderId}`
      ) {
        // this.ngOnInit();
      }
    });

    let profile = this.dataService.getDecryptedProfile();
    if (profile) this.vendor_id = profile.vendor_company_id;

  }

  ngOnInit() {
    this.onLoad = true;
    this.getDetailOrder();
  }

  refreshLevel() {
    // this.productService.getListLevel().subscribe(res => {
    //   this.listLevel = res.data;
    // }, err => {
    //   console.log('err', err);
    // })
  }

  getDetailOrder(): void {
    this.loadingIndicator = true;
    this.allProductLevels = [];
    this.ordersService.show({ order_id: this.orderId }).subscribe(
      async res => {
        // setTimeout(() => {
        this.detailOrder = res.data;
        console.log('detail order', this.detailOrder);
        let products = this.detailOrder && this.detailOrder.order_products ? [...this.detailOrder.order_products].filter(obj => obj.qty > 0) : [];
        this.productsNota = products;
        console.log('products nota', this.productsNota);

        // if (res.data.type === "retailer") {
        this.editable =
          res.data.status === "baru" ||
            res.data.status === "diproses" ||
            res.data.status === "konfirmasi-perubahan"
            ? true
            : false;
        // } else {
        //   this.editable = false;
        // }


        this.loadingIndicator = false;
        this.onLoad = false;
        this.orderStatuses = res.data.available_status ? Object.entries(res.data.available_status).map(
          ([value, name]) => ({ value, name })
        ) : [];
        this.statusLogs = res.data.status_logs;

        this.statusForm = this.formBuilder.group({
          newStatus: ""
        });

        if (res && res.data) this.shipping_cost.setValue(Number(res.data.shipping_price));

        this.productsForm = this.formBuilder.group({
          listProducts: this.formBuilder.array([])
        });

        let listProducts = this.productsForm.get("listProducts") as FormArray;
        while (listProducts.length > 0) {
          listProducts.removeAt(listProducts.length - 1);
        }

        if (res && res.data && res.data.order_products) {
          res.data.order_products.map(item => {
            listProducts.push(this.formBuilder.group({
              id: item.id,
              name: item.name,
              image_url: item.images && item.images[0] ? item.images[0] : "",
              category: item.category_name,
              price: item.price,
              price_discount: item.price_discount,
              amount: [
                Number(item.qty),
                [Validators.min(0), Validators.max(item.amount)]
              ],
              editable: false,
              edited: false,
            }))
          })
        }
        this.productsForm.controls['listProducts'].valueChanges.debounceTime(500).subscribe(res => {
          this.edited = true;
        });
      },
      err => {
        this.loadingIndicator = false;
      }
    );
  }

  updateQty(index): void {
    let product = this.productsForm.get("listProducts") as FormArray;
    product.controls[index].get("editable").setValue(true);
    this.onEdit = !this.onEdit;
  }

  setQty(index): void {
    let product = this.productsForm.get("listProducts") as FormArray;
    if (!product.controls[index].get("amount").value) {
      product.controls[index].get("amount").setValue(0);
    }

    if (product.controls[index].get("amount").invalid) {
      return this.dialogService.openSnackBar({
        message:
          "Harap periksa kembali data yang Anda masukan, jumlah barang tidak boleh melebihi jumlah sebelumnya dan atau tidak boleh kurang dari 0"
      });
    }

    if (product.controls[index].get('amount').touched) {
      this.stateUpdated = true;
    }

    // this.onPriceChange(index);

    product.controls[index].get("editable").setValue(false);
    this.onEdit = !this.onEdit;
  }

  saveUpdateQty(): void {
    if (this.onEdit) {
      return this.dialogService.openSnackBar({
        message: "Terdapat Produk yang memiliki perubahan dan belum tersimpan!"
      });
    }
    if (this.productsForm.valid) {
      // console.log('asdkjasdjlzLkosijuhdb', this.productsForm.get("listProducts").value);
      this.loadingIndicator = true;
      let body: Object = {
        _method: "PUT",
        shipping_duration: this.detailOrder.shipping_duration,
        shipping_price: this.shipping_cost.value,

        order_products: this.productsForm.get("listProducts").value.map((item, index) => {
          return {
            id: item.id,
            name: this.detailOrder.order_products[index].name,
            image: this.detailOrder.order_products[index]['images'],
            description: this.detailOrder.order_products[index]['description'],
            total_price: this.detailOrder.order_products[index]['total_price'],
            have_community_price: this.detailOrder.order_products[index]['have_community_price'],
            community_min_qty: this.detailOrder.order_products[index]['community_min_qty'],
            community_price: this.detailOrder.order_products[index]['community_price'],
            use_community_price: this.detailOrder.order_products[index]['use_community_price'],
            vendor_company_id: this.vendor_id ? this.vendor_id : -99,
            sku_id: this.detailOrder.order_products[index].sku_id,
            qty: item.amount,
            price: item.price,
            vendor_product_category_id: this.detailOrder.order_products[index].vendor_product_category_id,
            category_name: item.category
          };
        })
      };
      this.ordersService
        .update({ order_id: this.orderId }, body)
        .subscribe(
          res => {
            this.loadingIndicator = false;
            this.dialogService.openSnackBar({
              message: "Data berhasil disimpan"
            });

            this.getDetailOrder();
            this.selectedTab = 1;
            this.editable = false;
            this.onEdit = false;
            this.stateUpdated = false;
          },
          err => {
            this.loadingIndicator = false;
            // this.dialogService.openSnackBar({ message: err.error.message })
          }
        );
    } else {
      this.dialogService.openSnackBar({
        message:
          "Harap periksa kembali data yang Anda masukan, jumlah barang tidak boleh melebihi jumlah sebelumnya dan tidak boleh kurang dari 0"
      });
    }
  }

  updateStatus(): void {
    console.log('selected stat', this.statusForm.get('newStatus').value);
    if ((this.detailOrder.status === 'baru' || this.detailOrder.status === 'diproses') && this.statusForm.get('newStatus').value !== 'dibatalkan') {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.panelClass = 'scrumboard-card-dialog';
      dialogConfig.data = { shipping_cost: this.shipping_cost.value, order_id: this.orderId, status: this.statusForm.get("newStatus").value, shipping_duration: this.detailOrder.shipping_duration || null };

      this.dialogRef = this.dialog.open(EstShippingDialogComponent, dialogConfig);
      this.dialogRef.afterClosed().subscribe(response => {
        if (response) {
          this.loadingIndicator = false;
          this.dataService.showLoading(false);
          this.dialogService.brodcastCloseConfirmation();
          this.dialogService.openSnackBar({ message: "Status Berhasil Diubah" });

          this.ngOnInit();
          this.selectedTab = 0;
        } else {
          this.dataService.showLoading(false);
        }
      });
    } else {
      let body: Object = {
        _method: "PUT",
        status: this.statusForm.get("newStatus").value,
        shipping_duration: this.detailOrder.shipping_duration,
        shipping_price: this.shipping_cost.value,


        order_products: this.productsForm.get("listProducts").value.map((item, index) => {
          return {
            id: item.id,
            name: this.detailOrder.order_products[index].name,
            image: this.detailOrder.order_products[index]['image'],
            description: this.detailOrder.order_products[index]['description'],
            total_price: this.detailOrder.order_products[index]['total_price'],
            have_community_price: this.detailOrder.order_products[index]['have_community_price'],
            community_min_qty: this.detailOrder.order_products[index]['community_min_qty'],
            community_price: this.detailOrder.order_products[index]['community_price'],
            use_community_price: this.detailOrder.order_products[index]['use_community_price'],
            vendor_company_id: this.vendor_id ? this.vendor_id : -99,
            sku_id: this.detailOrder.order_products[index].sku_id,
            qty: item.amount,
            price: item.price,
            vendor_product_category_id: this.detailOrder.order_products[index].vendor_product_category_id,
            category_name: item.category
          };
        })
      };
      this.body = body;
      this.confirmUpdateStats();
    }
  }

  confirmUpdateStats() {
    this.loadingIndicator = true;
    this.dataService.showLoading(true);
    this.ordersService.updateStatus({ order_id: this.orderId }, this.body).subscribe(
      res => {
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
        // this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Status Berhasil Diubah" });

        this.ngOnInit();
        this.selectedTab = 0;
      },
      err => {
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
        // this.dialogService.openSnackBar({ message: err.error.message })
      }
    );
  }

  checkOngkirWithProductExisting(item) {
    console.log('cek ongkir', item);
    if (item.title === 'Ongkos Pengiriman' || item.title === 'Total Pembayaran') {
      return this.productsNota.length === 0 ? 0 : item.value.split('Rp ')[1];
    } else {
      return item.value.split('Rp ')[1];
    }
  }

}
