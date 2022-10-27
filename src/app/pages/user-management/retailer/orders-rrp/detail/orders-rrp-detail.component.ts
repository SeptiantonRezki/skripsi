import { Component, OnInit, HostListener } from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";

import { OrdersService } from "../../../../../services/user-management/retailer/orders.service";
// import { ProductService } from "../../../services/product.service";
import { DialogService } from "../../../../../services/dialog.service";
import { FormGroup, FormBuilder, FormArray, Validators } from "@angular/forms";
import { FuseSplashScreenService } from "@fuse/services/splash-screen.service";
// import html2canvas from "html2canvas";
import moment from 'moment';
import { QzTrayService } from "app/services/qz-tray.service";
import { RupiahFormaterWithoutRpPipe } from "@fuse/pipes/rupiah-formater";
import { GenerateReceipt } from "app/classes/generate-receipt";
import { DataService } from "app/services/data.service";
import { Emitter } from "app/helper/emitter.helper";
import { QiscusService } from "app/services/qiscus.service";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TierPriceDialogComponent } from "./tier-price-dialog/tier-price-dialog.component";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { CancelConfirmationDialogComponent } from "../detail/cancel-confirmation-dialog/cancel-confirmation-dialog.component";
import { GoogleTagManagerService } from "app/services/gtm.service";
import { isNgTemplate } from "@angular/compiler";
import { LanguagesService } from "app/services/languages/languages.service";
// import { CurrencyPipe } from '@angular/common';
import { RupiahFormaterPipe } from "@fuse/pipes/rupiah-formater";
import { PagesName } from 'app/classes/pages-name';
import { TranslateInterpolatePipe } from "@fuse/pipes/translateInterpolate.pipe";


@Component({
  selector: 'app-orders-rrp-detail',
  templateUrl: './orders-rrp-detail.component.html',
  styleUrls: ['./orders-rrp-detail.component.scss']
})
export class OrdersRrpDetailComponent implements OnInit {
  orderId: any;
  retailerId: any;
  orderRrp: any;
  blockOrder: any;
  body: any;
  bodyBlockOrder: any;
  permission: any;
  roles: PagesName = new PagesName();
  detailOrder: any;

  loadingIndicator = false;
  onLoad: Boolean;

  generateReceipt: GenerateReceipt = new GenerateReceipt(this.ls, this.translateInterpolatePipe, this.dataService);

  productsForm: FormGroup;
  orderStatuses: any[] = [];
  statusLogs: Array<any>[] = [];
  statusForm: FormGroup;
  selectedTab: any = 0;
  editable: Boolean;
  edited: Boolean;
  vaValidated: Boolean = true;

  navigationSubscription;
  imageConverted: any;
  imageUrl1: any = "https://assets.dev.src.id/2022/08/30/dniIDovkE9NKfq6EzfEqpQaPSJ7B2VLv2AFp49KA.jpeg";
  imageUrl2: any = "https://assets.dev.src.id/2022/08/30/dniIDovkE9NKfq6EzfEqpQaPSJ7B2VLv2AFp49KA.jpeg";
  imageUrl3: any = "https://assets.dev.src.id/2022/08/30/dniIDovkE9NKfq6EzfEqpQaPSJ7B2VLv2AFp49KA.jpeg";

  onEdit: boolean = false;
  dialogRef: any;
  listLevel: any[] = [];
  isAnyUpdate: any;
  keyUp = new Subject<number>();
  allProductLevels: any[] = [];
  stateUpdated: Boolean;
  productsNota: any[] = [];
  tierHasDisc: Boolean;
  updatingPrice: Boolean;
  productLoadingIndicator: Boolean;
  user_country: any;
  jsonLocale: any;

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
    private ordersService: OrdersService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private fuseSplashScreen: FuseSplashScreenService,
    private qzTrayService: QzTrayService,
    private convertRp: RupiahFormaterWithoutRpPipe,
    private dataService: DataService,
    private emitter: Emitter,
    private qs: QiscusService,
    private dialog: MatDialog,
    // private productService: ProductService,
    private gtmService: GoogleTagManagerService,
    private ls: LanguagesService,
    // private currencyPipe: CurrencyPipe,
    private translateInterpolatePipe: TranslateInterpolatePipe,
  ) {
    this.user_country = localStorage.getItem('user_country');
    this.permission = this.roles.getRoles('principal.retailer');
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
      this.orderId = params[2].path;
    });
    // this.listLevel = this.activatedRoute.snapshot.data["listLevel"].data

    this.activatedRoute.queryParams.subscribe(params => {
      if (params) {
        if (params['open'] == true) {
          this.emitter.emitChatAutoOpen(true); // for open chat
          this.emitter.emitChatIsExpand(true);
        }
      }
    });

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (
        e instanceof NavigationEnd &&
        e.url === `/user-management/rrp-retailer/detail/${this.orderId}`
      ) {
        // this.ngOnInit();
      }
    });

    this.dataService.currentJsonLocale.subscribe(res => {
      console.log("resss json", res);
      this.jsonLocale = res;
    })
  }

  ngOnInit() {
    this.onLoad = true;
    this.getDetailOrder();
  }

  ngOnDestroy() {
    this.emitter.emitChatIsOpen(false);
  }

  // refreshLevel() {
  //   this.productService.getListLevel().subscribe(res => {
  //     this.listLevel = res.data;
  //   }, err => {
  //     console.log('err', err);
  //   })
  // }

  async initDataQiscus(item: any) {
    try {
      if (item.status === 'pesanan-dibatalkan' || item.status === 'selesai') {
        // this.setState({ dataQiscus: null });
        this.emitter.emitChatIsOpen(true); // for open chat
        this.emitter.emitDataChat(item);
      } else if (
        item.qiscus_room_id !== null &&
        item.qiscus_room_id !== '' &&
        item.qiscus_room_id !== undefined
      ) {
        await this.qs.qiscus.getRoomById(item.qiscus_room_id)
          .then(async (getRoom: any) => {
            // console.log('DATAROOM', getRoom);
            // this.setState({ dataQiscus: { ...this.props.dataQiscus, ...getRoom } });
            this.emitter.emitChatIsOpen(true); // for open chat
            this.emitter.emitDataChat(item);
          }, (err: any) => {
            console.log('error_012', err);
            const payload = {
              retailer_id: item.retailer_id || "",
              invoice_number: item.invoice_number || "",
              order_id: item.id || ""
            };
            // console.log("PAYLOAD", payload);
            this.qs.qiscusCreateUpdateRoom(payload).subscribe(async (qRes: any) => {
              // console.log("RESP", qRes);
              if (qRes.status) {
                await this.qs.qiscus.getRoomById(qRes.data.room_id).then((getRoom: any) => {
                  this.emitter.emitChatIsOpen(true); // for open chat
                  this.emitter.emitDataChat(item);
                }, (err: any) => {
                  console.log('error_013a', err);
                }).catch((qiscusError: any) => {
                  console.log('error_013aa', qiscusError);
                });
              }
            });
          })
          .catch((qiscusError: any) => {
            console.log('q_error', qiscusError);
          });
      } else {
        const payload = {
          retailer_id: item.retailer_id || "",
          invoice_number: item.invoice_number || "",
          order_id: item.id || ""
        };
        // console.log("PAYLOAD", payload);
        this.qs.qiscusCreateUpdateRoom(payload).subscribe(async (qRes: any) => {
          // console.log("RESP", qRes);
          if (qRes.status) {
            await this.qs.qiscus.getRoomById(qRes.data.room_id).then((getRoom: any) => {
              this.emitter.emitChatIsOpen(true); // for open chat
              this.emitter.emitDataChat(item);
              return true;
            }, (err: any) => {
              console.log('q_error_013b', err);
            }).catch((qiscusError: any) => {
              console.log('q_error_013bb', qiscusError);
            });
          }
        });
      }
    } catch (x) {
      this.initLoginQiscus();
      setTimeout(() => {
        this.initDataQiscus(item);
      }, 1500);
    }
  }

  initLoginQiscus() {
    this.qs.qiscus.getNonce().then(async (gn: any) => {
      if (gn && gn.nonce) {
        return new Promise((resolve, reject) => {
          this.qs.createJWT({ nonce: gn.nonce }).subscribe((res: any) => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
        });
      }
    }).then((jwt: any) => {
      if (jwt && jwt.data) {
        return this.qs.qiscus.verifyIdentityToken(jwt.data);
      }
    }).then((userData: any) => {
      if (userData) {
        this.qs.qiscus.setUserWithIdentityToken(userData);
        return userData;
      }
    });
  }

  getDetailOrder(): void {
    this.loadingIndicator = true;
    this.allProductLevels = [];
    this.ordersService.getDetail(this.orderId).subscribe(
      async res => {
        // setTimeout(() => {
        if (Array.isArray(res.paylater_va) === false) {
          res.paylater_va = JSON.parse(res.paylater_va);
        }
        this.detailOrder = res;
        this.retailerId = this.detailOrder.retailer_id;
        this.orderRrp = (this.detailOrder.order_rrp !== null) ? this.detailOrder.order_rrp : 1;
        this.blockOrder = this.detailOrder.block_order ? this.detailOrder.block_order : 0;
        if (res.payment_type === 'virtual-account' && res.status === 'pesanan-diterima') {
          this.vaValidated = false;
        }
        console.log('detail Order....', this.detailOrder)
        let products = this.detailOrder && this.detailOrder.products ? [...this.detailOrder.products].filter(obj => obj.amount > 0) : [];
        this.productsNota = products;

        // let allTiers = [];
        // products.map(prd => {
        //   if (Array.isArray(prd.levels)) {
        //     allTiers = [
        //       ...allTiers,
        //       ...prd.levels
        //     ]
        //   } else {
        //     allTiers = [
        //       ...allTiers,
        //       ...[...prd.levels]
        //     ]
        //   }
        // });

        // this.tierHasDisc = allTiers.find(tier => tier.price_discount && tier.price_discount > 0) ? true : false;

        // console.log('alltiers', allTiers, this.tierHasDisc);

        // this.qs.getMessageTemplates({ user: 'wholesaler' }).subscribe((res_2: any) => {
        //   // this.emitter.emitDataChat({ templates: res_2.data });
        //   res.templates = res_2.data;
        //   // res.templates = [{title: 'apakah barang ready?'}, {title: 'apakah barang ready?'}, {title: 'apakah barang ready?'}, {title: 'apakah barang ready?'}, {title: 'apakah barang ready?'},{title: 'apakah barang ready?'}]
        //   if (res.status === "selesai" || res.status === "pesanan-dibatalkan") {
        //     const dayLimit = moment(new Date()).diff(moment(new Date(res.updated_at)), 'days'); // day limit is 30 days chat hidden or deleted
        //     if (dayLimit < 30) {
        //       // this.initDataQiscus(res);
        //       this.qiscusCheck(res); // check login qiscus
        //     } else {
        //       this.emitter.emitChatIsOpen(false); // for open chat
        //     }
        //   } else {
        //     // this.initDataQiscus(res);
        //     this.qiscusCheck(res); // check login qiscus
        //   }
        // })
        // this.emitter.emitChatIsOpen(true); // for open chat
        // this.emitter.emitDataChat(res);

        if (res.type === "retailer") {
          this.editable =
            // res.status === "pesanan-diterima" ||
            res.status === "pesanan-baru" ||
              res.status === "pesanan-dilihat" ||
              res.status === "diproses" ||
              res.status === "konfirmasi-perubahan"
              ? true
              : false;
        } else {
          this.editable = false;
        }
        this.onLoad = false;
        this.loadingIndicator = false;
        this.productLoadingIndicator = true;
        this.productsForm = this.formBuilder.group({
          listProducts: this.formBuilder.array([])
        });
        this.gtmUserTiming();

        let listProducts = this.productsForm.get("listProducts") as FormArray;
        while (listProducts.length > 0) {
          listProducts.removeAt(listProducts.length - 1);
        }
        this.statusLogs = res.status_logs;
        console.log(this.statusLogs)

        this.ordersService.getDetailProductList({ order_id: this.orderId }).subscribe(resProduct => {


          this.onLoad = false;
          this.orderStatuses = Object.entries(this.detailOrder.available_status).map(
            ([value, name]) => ({ value, name })
          );

          this.statusForm = this.formBuilder.group({
            newStatus: ""
          });
          this.detailOrder['products'] = resProduct;
          let products = resProduct ? [...resProduct].filter(obj => obj.amount > 0) : [];
          this.productsNota = products;
          // this.productsForm = this.formBuilder.group({
          //   listProducts: this.formBuilder.array([])
          // });

          // let listProducts = this.productsForm.get("listProducts") as FormArray;
          // while (listProducts.length > 0) {
          //   listProducts.removeAt(listProducts.length - 1);
          // }

          let withChildSummary = [];
          this.detailOrder.summary.map(sm => {
            withChildSummary.push({ ...sm });

            if (sm.child) {
              sm.child.map(chld => withChildSummary.push({ ...chld }));
            }
          });
          this.detailOrder.summary = withChildSummary;

          this.isAnyUpdate = resProduct ? resProduct.findIndex(product => product.price_update_status) : -1;

          let tierPrice = this.detailOrder.tier;
          // let tierPrice = 188;
          resProduct.map((item, idx) => {
            // console.log('item pulangkan saja aku pada ibumu', resProduct[idx].levels);
            this.allProductLevels.push(item.levels);
            let tierHasDisc = false;

            if (Array.isArray(item.levels)) {
              let levelFound = item.levels.find(lvl => lvl.business_level_id === tierPrice);
              if (levelFound) {
                tierHasDisc = levelFound.price_discount > 0 ? true : false;
              } else {
                levelFound = item.levels.find(lvl => lvl.business_level_id == -99);
                tierHasDisc = levelFound ? (levelFound.price_discount > 0 ? true : false) : false;
              }
            } else {
              tierHasDisc = item.levels ? (item.levels.price_discount > 0) : false;
            }
            let tierPriceFound = item.levels ? item.levels.find(lvl => lvl.business_level_id === tierPrice) : null;
            listProducts.push(
              this.formBuilder.group({
                id: item.id,
                name: item.name,
                other_name: item.other_name,
                image_url: item.image_url,
                brand: item.brand,
                category: item.category,
                packaging: item.packaging,
                price: item.price,
                price_currency: item.price_format_currency,
                price_discount: item.price_discount,
                // price: tierPriceFound ? tierPriceFound.price : (item.levels ? item.levels[0]['price'] : item.price),
                // price_discount: tierPriceFound ? tierPriceFound.price_discount : (item.levels ? item.levels[0]['price_discount'] : item.price_discount),
                amount: [
                  item.amount,
                  [Validators.min(0), Validators.max(item.amount)]
                ],
                levels: tierPriceFound ? tierPriceFound : resProduct[idx].levels,
                editable: false,
                edited: false,
                tierShowed: false,
                tierHasDisc: tierHasDisc,
                priceUpdated: false,
                price_update_status: item.price_update_status
              })
            );
          });
          this.productLoadingIndicator = false;
          // console.log('listProducts on Get Detail', listProducts.value);
          this.productsForm.controls['listProducts'].valueChanges.debounceTime(500).subscribe(res => {
            this.edited = true;
          });
        });

        // }, 2000);
      },
      err => {
        this.loadingIndicator = false;
        // this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  gtmUserTiming() {
    const startTime = this.dataService.getFromStorage('timeStartPesananDetail');
    if (startTime) {
      const endTime = moment(new Date());
      const totalPageLoadTime = moment.duration(endTime.diff(moment(startTime))).asSeconds();
      console.log('USER-TIMING timeStartPesananDetail FINISH', new Date());
      console.log('USER-TIMING timeStartPesananDetail totalPageLoadTime ', totalPageLoadTime);
      this.gtmService.userTiming({
        timingCategory: 'Page Load',
        timingVariable: 'Order id click to fully loaded order detail',
        timingLabel: location.href,
        timingValue: totalPageLoadTime
      });
      window.localStorage.removeItem('timeStartPesananDetail');
    }
  }

  blockNextOrder() {
    let bodyBlockOrder: Object = {
      _method: "PUT",
      // block_order: this.blockOrder
      retailer_id: this.detailOrder.retailer_id,
      business_id: this.detailOrder.wholesaler_id
    };
    this.ordersService.blockNextOrder(bodyBlockOrder, { retailer_id: this.detailOrder.retailer_id }).subscribe(res => {
      if (res.status) {
        this.blockOrder = 1;
      } else {
        this.dialogService.openSnackBar({ message: "Block Next Order Failed" })
      }
      },
      err => {
        this.dialogService.openSnackBar({ message: "Block Next Order Failed" })
        // console.log('block error');
      }
    );
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
      case 'diproses':
        return true;
      default:
        return false;
    }
  }

  async setQty(index) {
    let product = this.productsForm.get("listProducts") as FormArray;
    if (!product.controls[index].get("amount").value) {
      product.controls[index].get("amount").setValue(0);
    }

    if (product.controls[index].get("amount").invalid) {
      return this.dialogService.openSnackBar({
        message:
          this.ls.locale.lihat_pesanan.text7
      });
    }

    let tierPrice = this.detailOrder.tier;
    let tierPriceFound = this.detailOrder.products[index] ? this.detailOrder.products[index].levels.find(lvl => lvl.business_level_id === tierPrice) : null;
    if (tierPriceFound) {
      if (tierPriceFound["price_discount"] > 0 && tierPriceFound && (product.controls[index].get("price").value < tierPriceFound["price_discount"])) {
        return this.dialogService.openSnackBar({
          message: await this.ls.withParam('lihat_pesanan.text8', { price: tierPriceFound["price_discount"] })
        });
      }
    } else {
      tierPriceFound = this.detailOrder.products[index].levels.find(lvl => lvl.business_level_id == -99);
      if (tierPriceFound && tierPriceFound["price_discount"] > 0 && (product.controls[index].get("price").value < tierPriceFound["price_discount"])) {
        return this.dialogService.openSnackBar({
          message: await this.ls.withParam('lihat_pesanan.text8', { price: tierPriceFound["price_discount"] })
        });
      }
    }

    if (product.controls[index].get('amount').touched || product.controls[index].get('price').touched) {
      this.stateUpdated = true;
    }

    // EDIT PRICE
    let price = product.at(index).get("price").value;
    let rupiahFMT = new RupiahFormaterPipe(this.ls, this.dataService);

    product.at(index).get("price_currency").setValue(rupiahFMT.transform(price));

    // this.onPriceChange(index);

    product.controls[index].get("editable").setValue(false);
    this.onEdit = !this.onEdit;
  }

  saveUpdateQty(): void {
    if (this.onEdit) {
      return this.dialogService.openSnackBar({
        message: this.ls.locale.lihat_pesanan.text9
      });
    }
    if (this.productsForm.valid) {
      // console.log('asdkjasdjlzLkosijuhdb', this.productsForm.get("listProducts").value);
      this.loadingIndicator = true;
      let body: Object = {
        _method: "PUT",
        products: this.productsForm.get("listProducts").value.map((item, index) => {
          // console.log('item', item.levels);
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
              price_discount_expires_at: this.allProductLevels[index].price_discount_expires_at
            }],
            category_id: this.detailOrder.products[index].category_id
          };
        })
      };
      // console.log('body', body, this.allProductLevels);
      // return;
      const mode = this.dataService.getFromStorage('mode');
      this.ordersService
        .putAdjustment(body, { order_id: this.orderId })
        .subscribe(
          res => {
            if (mode === 'kasir') {
              this.gtmService.generalEvent('ModeKasir', 'LihatPesananUbah',
                { orderCode: this.detailOrder.invoice_number, orderId: this.orderId });
            } else {
              this.gtmService.generalEvent('ModeSistem', 'LihatPesananUbah',
                { orderCode: this.detailOrder.invoice_number, orderId: this.orderId });
            }
            this.loadingIndicator = false;
            this.dialogService.openSnackBar({
              message: this.ls.locale.global.messages.text6
            });
            this.updatingPrice = false;
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
          this.ls.locale.lihat_pesanan.text7
      });
    }
  }

  async updateStatus() {
    const mode = this.dataService.getFromStorage('mode');
    const body: Object = {
      status: this.statusForm.get("newStatus").value
    };
    let isHavePriceUpdate = this.detailOrder.products.find(prd => prd.price_update_status);
    if (isHavePriceUpdate && (this.detailOrder.status === 'pesanan-baru' || this.detailOrder.status === 'diproses')) {
      this.body = body;
      let desc = this.updatingPrice ? 'Disimpan' : 'Diubah';
      let bodyMsg = this.updatingPrice ? this.ls.locale.lihat_pesanan.text10 : this.ls.locale.lihat_pesanan.text11
      let data = {
        titleDialog: await this.ls.withParam('lihat_pesanan.text13', { action: desc }),
        captionDialog: bodyMsg,
        confirmCallback: this.confirmUpdateStats.bind(this),
        orderDetail: true,
        cancelCallback: this.cancelUpdateStats.bind(this),
        buttonText: [this.ls.locale.lihat_pesanan.text25, await this.ls.withParam('lihat_pesanan.text12', { action: (this.updatingPrice ? this.ls.locale.global.button.save : this.ls.locale.global.button.edit) })]
      };
      this.dialogService.openCustomConfirmationDialog(data);
    } else {
      if ((this.detailOrder.payment_type && this.detailOrder.payment_type === 'pay-later') && (body['status'] === 'pesanan-diterima' || body['status'] === 'pesanan-diambil')) {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.panelClass = 'jumlah-pembayaran-dialog';
        dialogConfig.data = {};

        this.dialogRef = this.dialog.open(CancelConfirmationDialogComponent, dialogConfig);
        this.dialogRef.afterClosed().subscribe(response => {
          if (response) {
            body['confirmation_code'] = response;
            this.loadingIndicator = true;
            this.dataService.showLoading(true);
            this.ordersService.putStatus(body, { order_id: this.orderId }).subscribe(
              res => {
                if (res.status) {
                  if (mode === 'kasir') {
                    this.gtmService.generalEvent('ModeKasir', 'LihatPesananPerbaruiStatus',
                      { orderCode: this.detailOrder.invoice_number, orderId: this.orderId, statusPemesanan: body['status'] });
                  } else {
                    this.gtmService.generalEvent('ModeSistem', 'LihatPesananPerbaruiStatus',
                      { orderCode: this.detailOrder.invoice_number, orderId: this.orderId, statusPemesanan: body['status'] });
                  }
                }
                this.loadingIndicator = false;
                this.dataService.showLoading(false);
                this.dialogService.openSnackBar({
                  message: !res.status ?
                    (res.message ? res.message : this.ls.locale.global.messages.failed_message)
                    : this.ls.locale.lihat_pesanan.text14
                });
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
        });
      }
      else if (
        (this.detailOrder.payment_type && this.detailOrder.payment_type === 'pay-later') && (this.detailOrder.status === 'pesanan-dilihat' && body['status'] === 'diproses') ||
        (this.detailOrder.payment_type && this.detailOrder.payment_type === 'pay-later') && (this.detailOrder.status === 'perubahan-disetujui' && body['status'] === 'diproses')
      ) {
        this.body = body;
        let data = {
          // titleDialog: "Perubahan Data pada Produk Dibeli Belum " + desc,
          captionDialog: this.ls.locale.lihat_pesanan.text15,
          confirmCallback: this.confirmUpdateStats.bind(this),
          orderDetail: true,
          cancelCallback: this.cancelUpdateStats.bind(this),
          buttonText: [this.ls.locale.lihat_pesanan.text16, this.ls.locale.lihat_pesanan.text17]
        };
        this.dialogService.openCustomConfirmationDialog(data);
      }
      else {
        this.loadingIndicator = true;
        this.dataService.showLoading(true);
        this.ordersService.putStatus(body, { order_id: this.orderId }).subscribe(
          res => {
            if (res.status) {
              if (mode === 'kasir') {
                this.gtmService.generalEvent('ModeKasir', 'LihatPesananPerbaruiStatus',
                  { orderCode: this.detailOrder.invoice_number, orderId: this.orderId, statusPemesanan: body['status'] });
              } else {
                this.gtmService.generalEvent('ModeSistem', 'LihatPesananPerbaruiStatus',
                  { orderCode: this.detailOrder.invoice_number, orderId: this.orderId, statusPemesanan: body['status'] });
              }
            }
            this.loadingIndicator = false;
            this.dataService.showLoading(false);
            this.dialogService.openSnackBar({
              message: !res.status ?
                (res.message ? res.message : this.ls.locale.global.messages.failed_message)
                : this.ls.locale.lihat_pesanan.text14
            });

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
    }
  }

  cancelUpdateStats() {
    this.selectedTab = 1;
    this.dialogService.brodcastCloseConfirmation();
  }

  confirmUpdateStats() {
    const mode = this.dataService.getFromStorage('mode');
    this.loadingIndicator = true;
    this.dataService.showLoading(true);
    this.ordersService.putStatus(this.body, { order_id: this.orderId }).subscribe(
      res => {
        if (res.status) {
          if (mode === 'kasir') {
            this.gtmService.generalEvent('ModeKasir', 'LihatPesananPerbaruiStatus',
              { orderCode: this.detailOrder.invoice_number, orderId: this.orderId, statusPemesanan: this.body['status'] });
          } else {
            this.gtmService.generalEvent('ModeSistem', 'LihatPesananPerbaruiStatus',
              { orderCode: this.detailOrder.invoice_number, orderId: this.orderId, statusPemesanan: this.body['status'] });
          }
        }
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({
          message: !res.status ?
            (res.message ? res.message : this.ls.locale.global.messages.failed_message)
            : this.ls.locale.lihat_pesanan.text14
        });

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

  onPriceChange(data) {
    // console.log('index idx', data.i);
    let tierPrice = this.detailOrder.tier;
    // let tierPrice = 188;
    let tierPriceFound = this.detailOrder.products[data.i] ? this.detailOrder.products[data.i].levels.findIndex(lvl => lvl.business_level_id === tierPrice) : -1;
    // console.log("pricefound!", tierPriceFound, this.detailOrder.products[data.i]);
    let listProducts = this.productsForm.get("listProducts") as FormArray;
    let levels = listProducts.at(data.i).get('levels').value;
    // console.log('levels on product list', levels);

    if (levels.business_level_id) levels.price = listProducts.at(data.i).get('price').value;
    else if (tierPriceFound > -1) levels[tierPriceFound].price = listProducts.at(data.i).get('price').value;

    // if (levels.business_level_id) levels.price = listProducts.at(data.i).get('price').value;
    // else levels[0].price = listProducts.at(data.i).get('price').value;
  }

  updatePrice(idx) {
    this.updatingPrice = true;
    let listProducts = this.productsForm.get("listProducts") as FormArray;
    this.dataService.showLoading(true);
    listProducts.at(idx).get("price").setValue(this.detailOrder.products[idx].price_update);
    listProducts.at(idx).get("price_update_status").setValue(false);
    setTimeout(() => {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({
        message: this.ls.locale.lihat_pesanan.text27
      });
    }, 1000);
  }

  updateAllPrice() {
    this.updatingPrice = true;
    this.dataService.showLoading(true);
    let listProducts = this.productsForm.get("listProducts") as FormArray;
    this.detailOrder.products.map((item, idx) => {
      if (item.price_update) {
        listProducts.at(idx).get("price").setValue(item.price_update);
        listProducts.at(idx).get("price_update_status").setValue(false);
      }
    });
    setTimeout(() => {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({
        message: this.ls.locale.lihat_pesanan.text18
      });
    }, 2000);
    // let fd = new FormData();
    // fd.append('order_id', this.detailOrder.id);
    // this.ordersService.updatePrice(fd).subscribe(res => {
    //   console.log('res', res);
    //   this.dataService.showLoading(false);
    //   this.dialogService.openSnackBar({ message: 'Semua Harga Product berhasil diperbarui!' });
    //   this.getDetailOrder();
    // }, err => {
    //   console.log('err', err);
    //   this.dataService.showLoading(false);
    //   this.dialogService.openSnackBar({ message: 'Semua Harga Product gagal diperbarui!' });
    // })
  }

  // showTier(index, event) {
  //   let listProducts = this.productsForm.get("listProducts") as FormArray;
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.disableClose = true;
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.panelClass = 'scrumboard-card-dialog';
  //   // console.log('this.asdsadas', this.detailOrder);
  //   dialogConfig.data = { tiers: this.listLevel, levels: this.detailOrder.products[index].levels && !this.detailOrder.products[index].levels.business_level_id ? this.detailOrder.products[index].levels : [this.detailOrder.products[index].levels] };

  //   this.dialogRef = this.dialog.open(TierPriceDialogComponent, dialogConfig);
  //   this.dialogRef.afterClosed().subscribe(response => {
  //     if (response) {
  //       // console.log('response', response.levels);
  //       let tierPrice = this.detailOrder.tier;
  //       let tierPriceFound = this.detailOrder.products[index] ? this.detailOrder.products[index].levels.findIndex(lvl => lvl.business_level_id === tierPrice) : -1;
  //       listProducts.at(index).get('levels').setValue(response.levels);
  //       if (tierPriceFound > -1) listProducts.at(index).get('price').setValue(response.levels[tierPriceFound].price);

  //       this.allProductLevels[index] = response.levels;
  //       if (response.stateUpdated === true) {
  //         this.stateUpdated = true;
  //       }
  //       // this.dataService.showLoading(true);
  //     } else {
  //       console.log('its hitted close');
  //     }
  //   });

  // }

  async print() {
    const mode = this.dataService.getFromStorage('mode');

    if (mode === 'kasir') {
      this.gtmService.generalEvent('ModeKasir', 'LihatPesananCetak',
        { orderCode: this.detailOrder.invoice_number, orderId: this.orderId });
    } else {
      this.gtmService.generalEvent('ModeSistem', 'LihatPesananCetak',
        { orderCode: this.detailOrder.invoice_number, orderId: this.orderId });
    }

    let bodyCurrency = {
      total_discount: this.convertRp.transform(this.detailOrder.total_discount),
      point_curs: this.convertRp.transform(this.detailOrder.point_curs),
      products: this.productsNota.map(obj => {
        return {
          ...obj,
          price_nota: this.convertRp.transform(obj.price + obj.price_discount),
          subtotal_nota: this.convertRp.transform((obj.price + obj.price_discount) * obj.amount),
          discount_nota: this.convertRp.transform(obj.price_discount * obj.amount)
        };
      })
    };

    const bodyHtml = {
      ...this.detailOrder,
      created_at: moment(this.detailOrder.created_at).format(
        "DD/MM/YYYY HH:mm"
      ),
      ...bodyCurrency,
      summary: this.detailOrder.summary.map(obj => {
        return {
          ...obj,
          title: obj.title.toUpperCase() === this.ls.locale.global.label.total_payment ? this.ls.locale.global.label.total_order : obj.title.toUpperCase(),
          value: this.checkOngkirWithProductExisting(obj)
        };
      })
    };

    let popupWin;
    let receipt = await this.generateReceipt.html(bodyHtml);
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(receipt);
    popupWin.document.close();
    // window.print();
  }

  convertCanvasToImage(canvas) {
    let image = new Image();
    image.src = canvas.toDataURL("image/png");

    return image.src;
  }

  checkOngkirWithProductExisting(item) {
    let symbol = this.jsonLocale.currencies.symbol;
    const _value = String(item.value).toLowerCase();
    const _symbol = String(symbol).toLowerCase();
    const splited = _value.split(`${_symbol}`);
    let value = (splited[1]) ? splited[1] : _value.split(`${_symbol} `)[1];

    if (item.title === 'Ongkos Pengiriman' || item.title === this.ls.locale.pesan_produk.text69) {
      return this.productsNota.length === 0 ? 0 : value;
    } else {
      return value;
    }
  }

  qiscusCheck(res: any) {
    if (this.qs.qiscus.isLogin) {
      this.initDataQiscus(res);
    } else {
      // setTimeout(() => {
      //   this.qiscusCheck(res);
      // }, 1500);
      this.initLoginQiscus();
      this.emitter.emitChatIsOpen(true);
    }
  }
}
