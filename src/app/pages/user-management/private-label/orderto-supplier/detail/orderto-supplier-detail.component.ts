import { Component, HostListener } from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";

// import { OrdersService } from "../../../services/orders.service";
// import { ProductService } from "../../../services/product.service";
import { DialogService } from "app/services/dialog.service";
import { FormGroup, FormBuilder, FormArray, Validators } from "@angular/forms";
import { FuseSplashScreenService } from "@fuse/services/splash-screen.service";
import * as html2canvas from "html2canvas";
import * as moment from "moment";
import { QzTrayService } from "app/services/qz-tray.service";
import { RupiahFormaterWithoutRpPipe } from "@fuse/pipes/rupiah-formater";
import { GeneratePO } from "app/classes/generate-po";
import { DataService } from "app/services/data.service";
import { Emitter } from "app/helper/emitter.helper";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { OrdertoSupplierService } from "app/services/user-management/private-label/orderto-supplier.service";


@Component({
  selector: 'app-orderto-supplier-detail',
  templateUrl: './orderto-supplier-detail.component.html',
  styleUrls: ['./orderto-supplier-detail.component.scss']
})
export class OrdertoSupplierDetailComponent {
  orderId: any;
  body: any;
  detailOrder: any;
  loadingIndicator = true;
  onLoad: Boolean;

  generatePO: GeneratePO = new GeneratePO();

  productsForm: FormGroup;
  orderStatuses: any[] = [];
  statusLogs: Array<any>[] = [];
  statusForm: FormGroup;
  selectedTab: any = 0;
  editable: Boolean;
  edited: Boolean;

  navigationSubscription;
  imageConverted: any;

  onEdit: boolean = false;
  dialogRef: any;
  // listLevel: any[] = [];
  isAnyUpdate: any;
  keyUp = new Subject<number>();
  allProductLevels: any[] = [];
  stateUpdated: Boolean;
  productsNota: any[] = [];
  total: any;


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
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private fuseSplashScreen: FuseSplashScreenService,
    private qzTrayService: QzTrayService,
    private convertRp: RupiahFormaterWithoutRpPipe,
    private dataService: DataService,
    private emitter: Emitter,
    private dialog: MatDialog,
    private ordertoSupplierService: OrdertoSupplierService,
    // private productService: ProductService,
    // private ordersService: OrdersService,
  ) {

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.onPriceChange(data);
      });

    this.edited = false;
    this.activatedRoute.url.subscribe(params => {
      console.log('params', params)
      this.orderId = params[2].path;
    });
    // this.listLevel = this.activatedRoute.snapshot.data["listLevel"].data

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (
        e instanceof NavigationEnd &&
        e.url === `/orders/pesanan-product-src/detail/${this.orderId}`
      ) {
        // this.ngOnInit();
      }
    });

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
    // this.allProductLevels = [];
    this.ordertoSupplierService.showListPesanan({ orderId: this.orderId }).subscribe(
      async res => {
      if (res.status == "success") {
        // setTimeout(() => {
        res = res.data;
        this.detailOrder = res;
        console.log('detail order', this.detailOrder);
        let products = this.detailOrder && this.detailOrder.order_products ? [...this.detailOrder.order_products].filter(obj => obj.amount > 0) : [];
        this.productsNota = products;
        this.total = 0;
        
        this.editable = false;

        this.loadingIndicator = false;
        this.onLoad = false;
        if (res.available_status)
          this.orderStatuses = Object.entries(res.available_status).map(
            ([value, name]) => ({ value, name })
          );
        else this.orderStatuses = [];
        this.statusLogs = res.order_status_logs;
        this.statusForm = this.formBuilder.group({
          newStatus: ""
        });

        this.productsForm = this.formBuilder.group({
          listProducts: this.formBuilder.array([])
        });

        let listProducts = this.productsForm.get("listProducts") as FormArray;
        while (listProducts.length > 0) {
          listProducts.removeAt(listProducts.length - 1);
        }

        this.isAnyUpdate = res && res.order_products ? res.order_products.findIndex(product => product.price_update_status) : -1;

        // let tierPrice = this.detailOrder.tier;
        console.log('allproductlevels get detail', this.allProductLevels);
        res.order_products.map((item: any, idx: number) => {
          this.total = parseInt(this.total) + parseInt(item.total_price);
          listProducts.push(
            this.formBuilder.group({
              id: item.id,
              name: item.name,
              image_url: item.image_url,
              brand: item.brand_name,
              category: item.category_name,
              packaging: item.packaging,
              price: item.price,
              amount: [
                item.amount,
                [Validators.min(0), Validators.max(item.amount)]
              ],
              editable: false,
              edited: false,
              price_update_status: item.total_price // item.price_update_status
            })
          );
        });
        this.productsForm.controls['listProducts'].valueChanges.debounceTime(500).subscribe(res => {
          this.edited = true;
        });
      }
      }, err => {
        console.log('err', err);
        this.loadingIndicator = false;
        // this.onLoad = false;
        // this.dialogService.openSnackBar({ message: err.error.message });
      }
    )
  }

  updateQty(index): void {
    let product = this.productsForm.get("listProducts") as FormArray;
    product.controls[index].get("editable").setValue(true);
    this.onEdit = !this.onEdit;
    // console.log('onUpdateQty', product, this.allProductLevels);
  }

  showRedBG(status) {
    switch (status) {
      case 'pesanan-baru':
        return true;
      case 'konfirmasi-perubahan':
        return true
      default:
        return false;
    }
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

    let tierPrice = this.detailOrder.tier;
    let tierPriceFound = this.detailOrder.products[index] ? this.detailOrder.products[index].levels.find(lvl => lvl.business_level_id === tierPrice) : null;

    if (tierPriceFound["price_discount"] > 0 && tierPriceFound && (product.controls[index].get("price").value < tierPriceFound["price_discount"])) {
      return this.dialogService.openSnackBar({
        message: "Harga Product Tidak Boleh Melebihi Harga Diskon Rp " + tierPriceFound["price_discount"]
      });
    }

    if (product.controls[index].get('amount').touched || product.controls[index].get('price').touched) {
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
        products: this.productsForm.get("listProducts").value.map((item, index) => {
          console.log('item', item.levels);
          let tierPrice = this.detailOrder.tier;
          return {
            product_id: item.id,
            amount: item.amount,
            price: item.price,
            levels: Array.isArray(this.allProductLevels[index]) ? this.allProductLevels[index].map(level => ({
              level_id: level.business_level_id,
              packaging: level.packaging,
              packaging_amount: level.packaging_amount,
              price: level.price,
              price_discount: level.price_discount,
              price_discount_expires_at: level.price_discount_expires_at,
            })) : [{
              level_id: this.allProductLevels[index].business_level_id,
              packaging: this.allProductLevels[index].packaging,
              packaging_amount: this.allProductLevels[index].packaging_amount,
              price: this.allProductLevels[index].price,
              price_discount: this.allProductLevels[index].price_discount,
              price_discount_expires_at: this.allProductLevels[index].price_discount_expires_a
            }],
            category_id: this.detailOrder.products[index].category_id
          };
        })
      };
      // console.log('body', body);
      // return;
      // this.ordersService
      //   .putAdjustment(body, { order_id: this.orderId })
      //   .subscribe(
      //     res => {
      //       this.loadingIndicator = false;
      //       this.dialogService.openSnackBar({
      //         message: "Data berhasil disimpan"
      //       });

      //       this.getDetailOrder();
      //       this.selectedTab = 1;
      //       this.editable = false;
      //       this.onEdit = false;
      //       this.stateUpdated = false;
      //     },
      //     err => {
      //       this.loadingIndicator = false;
      //       // this.dialogService.openSnackBar({ message: err.error.message })
      //     }
      //   );
    } else {
      this.dialogService.openSnackBar({
        message:
          "Harap periksa kembali data yang Anda masukan, jumlah barang tidak boleh melebihi jumlah sebelumnya dan tidak boleh kurang dari 0"
      });
    }
  }

  updateStatus() {
    let data = {
      titleDialog: "Konfirmasi Perubahan Status Pesanan",
      captionDialog: "Apakah anda yakin untuk melakukan perubahan status pesanan ini menjadi 'Pesanan "+ this.statusForm.get("newStatus").value + "'?",
      confirmCallback: this._updateStatus.bind(this),
      buttonText: ["Ya, Lanjutkan", "Tidak"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  _updateStatus(): void {
    let body: Object = {
      status: this.statusForm.get("newStatus").value
    };
    this.loadingIndicator = true;
    this.dataService.showLoading(true);
    this.ordertoSupplierService.putStatusPesanan(body, { orderId: this.orderId }).subscribe(
        res => {
          this.loadingIndicator = false;
          this.dataService.showLoading(false);
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

  cancelUpdateStats() {
    this.selectedTab = 1;
    this.dialogService.brodcastCloseConfirmation();
  }

  confirmUpdateStats() {
    // this.loadingIndicator = true;
    // this.dataService.showLoading(true);
    // this.ordersService.putStatus(this.body, { order_id: this.orderId }).subscribe(
    //   res => {
    //     this.loadingIndicator = false;
    //     this.dataService.showLoading(false);
    //     this.dialogService.brodcastCloseConfirmation();
    //     this.dialogService.openSnackBar({ message: "Status Berhasil Diubah" });

    //     this.ngOnInit();
    //     this.selectedTab = 0;
    //   },
    //   err => {
    //     this.loadingIndicator = false;
    //     this.dataService.showLoading(false);
    //     // this.dialogService.openSnackBar({ message: err.error.message })
    //   }
    // );
  }

  onPriceChange(data) {
    console.log('index idx', data.i);
    let tierPrice = this.detailOrder.tier;
    let tierPriceFound = this.detailOrder.products[data.i] ? this.detailOrder.products[data.i].levels.findIndex(lvl => lvl.business_level_id === tierPrice) : -1;
    let listProducts = this.productsForm.get("listProducts") as FormArray;
    let levels = listProducts.at(data.i).get('levels').value;

    if (levels.business_level_id) levels.price = listProducts.at(data.i).get('price').value;
    else levels[tierPriceFound].price = listProducts.at(data.i).get('price').value;

    // if (levels.business_level_id) levels.price = listProducts.at(data.i).get('price').value;
    // else levels[0].price = listProducts.at(data.i).get('price').value;
  }

  updatePrice(idx) {
    // let listProducts = this.productsForm.get("listProducts") as FormArray;
    // this.dataService.showLoading(true);
    // let fd = new FormData();
    // fd.append('order_id', this.detailOrder.id);
    // fd.append('order_product_id', listProducts.at(idx).get('id').value)
    // this.ordersService.updatePrice(fd).subscribe(res => {
    //   // console.log('res', res);
    //   this.dataService.showLoading(false);
    //   this.dialogService.openSnackBar({ message: 'Harga Product berhasil diperbarui!' });
    //   console.log('[ON UPDATE]', this.productsForm.get("listProducts").value);
    //   this.getDetailOrder();
    // }, err => {
    //   console.log('err', err);
    //   this.dataService.showLoading(false);
    //   this.dialogService.openSnackBar({ message: 'Harga Product gagal diperbarui!' });
    // })
  }

  updateAllPrice() {
    // this.dataService.showLoading(true);
    // let fd = new FormData();
    // fd.append('order_id', this.detailOrder.id);
    // this.ordersService.updatePrice(fd).subscribe(res => {
    //   // console.log('res', res);
    //   this.dataService.showLoading(false);
    //   this.dialogService.openSnackBar({ message: 'Semua Harga Product berhasil diperbarui!' });
    //   this.getDetailOrder();
    // }, err => {
    //   console.log('err', err);
    //   this.dataService.showLoading(false);
    //   this.dialogService.openSnackBar({ message: 'Semua Harga Product gagal diperbarui!' });
    // })
  }

  showTier(index, event) {
    // let listProducts = this.productsForm.get("listProducts") as FormArray;
    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.disableClose = true;
    // dialogConfig.autoFocus = true;
    // dialogConfig.panelClass = 'scrumboard-card-dialog';
    // // console.log('this.asdsadas', this.detailOrder);
    // dialogConfig.data = { tiers: this.listLevel, levels: this.detailOrder.products[index].levels && !this.detailOrder.products[index].levels.business_level_id ? this.detailOrder.products[index].levels : [this.detailOrder.products[index].levels] };

    // this.dialogRef = this.dialog.open(TierPriceDialogComponent, dialogConfig);
    // this.dialogRef.afterClosed().subscribe(response => {
    //   if (response) {
    //     console.log('response', response.levels);
    //     let tierPrice = this.detailOrder.tier;
    //     let tierPriceFound = this.detailOrder.products[index] ? this.detailOrder.products[index].levels.findIndex(lvl => lvl.business_level_id === tierPrice) : -1;
    //     listProducts.at(index).get('levels').setValue(response.levels);
    //     if (tierPriceFound > -1) listProducts.at(index).get('price').setValue(response.levels[tierPriceFound].price);

    //     this.allProductLevels[index] = response.levels;
    //     if (response.stateUpdated === true) {
    //       this.stateUpdated = true;
    //     }
    //     // this.dataService.showLoading(true);
    //   } else {
    //     console.log('its hitted close');
    //   }
    // });
  }

  async print() {
    let bodyHtml = {
      ...this.detailOrder,
      created_at: moment(this.detailOrder.created_at).format(
        "DD/MM/YYYY HH:mm"
      ),
      // total_discount: this.convertRp.transform(this.detailOrder.total_discount),
      // point_curs: this.convertRp.transform(this.detailOrder.point_curs),
      products: this.productsNota.map(obj => {
        return {
          ...obj,
          price_str: this.convertRp.transform(obj.price),
          total_price_str: this.convertRp.transform(obj.total_price),
          // subtotal_nota: this.convertRp.transform(obj.total_price),
          // discount_nota: this.convertRp.transform(obj.discount_nota)
        };
      }),
      total_str: this.convertRp.transform(this.total)
      // summary: 'TOTAL NILAI PO ' + this.total
      // this.detailOrder.summary.map(obj => {
      //   return {
      //     ...obj,
      //     title: obj.title.toUpperCase() === 'TOTAL NILAI PO' ? 'TOTAL PEMESANAN' : obj.title.toUpperCase(),
      //     value: this.checkOngkirWithProductExisting(obj)
      //   };
      // })
    };

    let popupWin;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(this.generatePO.html(bodyHtml));
    popupWin.document.close();
  }

  convertCanvasToImage(canvas) {
    let image = new Image();
    image.src = canvas.toDataURL("image/png");

    return image.src;
  }

  checkOngkirWithProductExisting(item) {
    if (item.title === 'Ongkos Pengiriman' || item.title === 'Total Pembayaran') {
      return this.productsNota.length === 0 ? 0 : item.value.split('Rp ')[1];
    } else {
      return item.value.split('Rp ')[1];
    }
  }
}