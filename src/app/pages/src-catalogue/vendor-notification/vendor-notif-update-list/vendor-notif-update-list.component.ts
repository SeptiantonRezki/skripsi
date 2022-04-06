import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MatDialog } from '@angular/material';
import { Page } from 'app/classes/laravel-pagination';
import { Emitter } from 'app/helper/emitter.helper';
import { DataService } from 'app/services/data.service';
import { NotificationService } from 'app/services/notification.service';
import { QiscusService } from 'app/services/qiscus.service';
import { SupportService } from 'app/services/settings/support.service';
import { Observable, Subject } from 'rxjs';
import moment from 'moment';
import { OrderCatalogueService } from 'app/services/src-catalogue/order-catalogue.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-vendor-notif-update-list',
  templateUrl: './vendor-notif-update-list.component.html',
  styleUrls: ['./vendor-notif-update-list.component.scss']
})
export class VendorNotifUpdateListComponent implements OnInit, OnDestroy {
  onLoad: boolean;
  loadingIndicator: boolean;

  formFilter: FormGroup;
  pagination: Page = new Page();
  offsetPagination: any;
  reorderable = true;

  allRowsSelected: boolean;
  selected: any[];
  totalData: number;

  minDate: any;

  keyUp = new Subject<string>();

  rows: any[] = [];
  _data: any = null;
  dataOrder: any;

  @Input()
  set data(data: any) {
    if (data !== null && data.result.data !== null) {
      if (data.result.data.length > 0) {
        Page.renderPagination(this.pagination, data.result);
        this.rows = data.result.data;
        this._data = data;
        this.totalData = data.result.total;
      } else {
        this.rows = [];
      }
    } else {
      this.rows = [];
    }
  }
  get data(): any { return this._data; }

  @Output()
  onRowsSelected = new EventEmitter<any>();
  constructor(
    private supportService: SupportService,
    public dialog: MatDialog,
    private emitter: Emitter,
    private qs: QiscusService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private adapter: DateAdapter<any>,
    private ordersService: OrderCatalogueService,
    private ls: LanguagesService,
  ) {
    this.onLoad = true;
    this.allRowsSelected = false;
    this.selected = [];
    this.totalData = 0;
    this.loadingIndicator = false;
    this.adapter.setLocale('id');
    this.rows = [];

    const sort_type = this.dataService.getFromStorage('sort_type');
    const sort = this.dataService.getFromStorage('sort');

    this.pagination.page = 1;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;
    this.pagination.per_page = 20;
    this.offsetPagination = 0;

    this.keyUp.debounceTime(500)
      .flatMap(search => {
        return Observable.of(search).delay(500);
      }).subscribe(res => {
        this.updateFilter(res);
      });
  }

  ngOnInit() {
    this.formFilter = this.formBuilder.group({
      from: '',
      to: ''
    });
    // this.getAndCreateRoomById(this._data['result']);
  }

  ngOnDestroy() {
    console.log('destroying')
    this.emitter.emitChatIsOpen(false);
  }

  selectFn(allRowsSelected: boolean) {
    this.allRowsSelected = allRowsSelected;
    if (!allRowsSelected) {
      this.selected = [];
    } else { this.selected.length = this.totalData; }
    this.onRowsSelected.emit({ allRowsSelected: allRowsSelected });
  }

  updateFilter(string?: string) {
    this.loadingIndicator = true;
    if (string) {
      this.pagination.search = string;
    } else {
      delete this.pagination.search;
      this.pagination.start_date = this.convertDate(this.formFilter.get('from').value);
      this.pagination.end_date = this.convertDate(this.formFilter.get('to').value);
    }

    this.pagination.page = 1;
    this.offsetPagination = 0;

    this.notificationService.getListNotif(this.pagination).subscribe((response) => {
      this.data = response;
      this.onLoad = false;
      this.loadingIndicator = false;
    }, (err) => {
      console.log('err', err);
    });
  }

  setMinDate(param?: any): void {
    this.formFilter.get('to').setValue('');
    this.minDate = param;
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }
    return '';
  }

  setPage(pageInfo: any) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.notificationService.getListNotif(this.pagination).subscribe(async (response) => {
      this.data = response;
      this.onLoad = false;
      this.loadingIndicator = false;
    }, (err) => {
      console.log('err', err);
    });
  }

  onSort(event: any) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.notificationService.getListNotif(this.pagination).subscribe(async (response) => {
      this.data = response;
      this.onLoad = false;
      this.loadingIndicator = false;
    }, (err) => {
      console.log('err', err);
    });
  }

  onSelect({ selected }) {
    // this.selected.splice(0, this.selected.length);
    // this.selected.push(...selected);
    this.selected = selected;
    this.onRowsSelected.emit({ isSelected: true, data: selected });
  }

  getId(row) {
    return row.id;
  }

  onCheckboxTrueChangeFn(event: any) {
  }

  async directDetail(data: any, index: number) {
    this.emitter.emitChatIsOpen(false);
    if (data && data.data) {
      const dataNotif = data;
      if (typeof data.data !== 'object') data.data = JSON.parse(data.data);
      if (dataNotif.notif_type === 'vendor' && dataNotif['data']['vendor_company_id']) {
        this.ordersService.show({ order_id: dataNotif['data']['id'] }).subscribe(
          async res => {
            await this.qs.getMessageTemplates({ user: 'vendor' }).subscribe((res_2: any) => {
              res['data'].templates = res_2.data;
              if (res.status === "selesai" || res.status === "pesanan-dibatalkan") {
                const dayLimit = moment(new Date()).diff(moment(new Date(res.updated_at)), 'days'); // day limit is 30 days chat hidden or deleted
                if (dayLimit < 30) {
                  this.qiscusCheck(res.data); // check login qiscus
                } else {
                  this.emitter.emitChatIsOpen(false); // for open chat
                }
              } else {
                this.qiscusCheck(res.data); // check login qiscus
              }
            })
          })
      }
      // this.onRowsSelected.emit({ isDirectDetail: true, data: dataNotif, index: index });
    } else {
      // const dataNotif = data;
      // this.onRowsSelected.emit({ isDirectDetail: true, data: dataNotif, index: index });
    }
  }

  isJSONStringify(data: any) {
    try {
      JSON.parse(data);
    } catch (ex) {
      console.warn('ex', ex);
      return false;
    }
    return true;
  }

  qiscusCheck(res: any) {
    if (this.qs.qiscus.isLogin) {
      this.initDataQiscus(res);
    } else {
      setTimeout(() => {
        this.initDataQiscus(res);
      }, 500);
    }
  }

  async initDataQiscus(item: any) {
    console.log('kena kah ?', item);
    if (item === 'pesanan-dibatalkan' || item === 'selesai') {
      // this.setState({ dataQiscus: null });
      this.emitter.emitChatIsOpen(true); // for open chat
      this.emitter.emitChatAutoOpen(true);
      this.emitter.emitDataChat(item);
      return false;
    } else if (
      item.qiscus_room_id !== null &&
      item.qiscus_room_id !== '' &&
      item.qiscus_room_id !== undefined
    ) {
      console.log('kena elsif')
      await this.qs.qiscus.getRoomById(item.qiscus_room_id)
        .then(async (getRoom: any) => {
          // this.setState({ dataQiscus: { ...this.props.dataQiscus, ...getRoom } });
          this.emitter.emitChatIsOpen(true); // for open chat
          this.emitter.emitChatAutoOpen(true);
          this.emitter.emitDataChat(item);
          return true;
        }, (err: any) => {
          console.log('error_012', err);
          const payload = {
            retailer_id: item.retailer_id || "",
            invoice_number: item.invoice_number || "",
            order_id: item.id || ""
          };
          // console.log("PAYLOAD", payload);
          this.qs.qiscusCreateUpdateRoomId({ order_id: item.id }).subscribe(async (qRes: any) => {
            // console.log("RESP", qRes);
            if (qRes.status) {
              await this.qs.qiscus.getRoomById(qRes.data.room_id).then((getRoom: any) => {
                this.emitter.emitChatIsOpen(true); // for open chat
                this.emitter.emitChatAutoOpen(true);
                this.emitter.emitDataChat(item);
                return true;
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
      this.qs.qiscusCreateUpdateRoomId({ order_id: item.id }).subscribe(async (qRes: any) => {
        // console.log("RESP", qRes);
        if (qRes.status) {
          await this.qs.qiscus.getRoomById(qRes.data.room_id).then((getRoom: any) => {
            this.emitter.emitChatIsOpen(true); // for open chat
            this.emitter.emitChatAutoOpen(true);
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
    return false;
  }

  async getAndCreateRoomById(items: any) {
    console.log('items', items);
    if (items.data && this.qs.qiscus.isLogin) {
      const dataTransaksi = [];
      this.loadingIndicator = true;
      this.qs.qiscus.loadRoomList({ page: 1, limit: 50, showParticipants: true, showEmpty: false })
        .then(async (rooms: any) => {
          // On success
          console.log('ROOM', rooms, items.data);
          const mappingRoom = await items.data.map(async (item: any) => {
            item['statusOpened'] = false;
            // item['orderStatuses'] = Object.entries(item.available_status).map(
            //   ([value, name]) => ({ value, name })
            // );
            rooms.map((room: any) => {
              if (typeof (item['data']) !== 'object') item['data'] = JSON.parse(item['data']);
              if (room.id == item['data'].qiscus_room_id) {
                item.dataQiscus = room;
                return;
              }
            });
            dataTransaksi.push(item);
            console.log('dataTransaksi', dataTransaksi);
            return;
            // if (item.status === 'pesanan-dibatalkan' || item.status === 'selesai') {
            //   item.dataQiscus = null;
            //   dataTransaksi.push(item);
            //   return;
            // } else {

            // }
          });
          Promise.all(mappingRoom).then(() => {
            // console.log("ROWS", dataTransaksi)
            this.rows = dataTransaksi;
            this.loadingIndicator = false;
          });
        })
        .catch(async (error: any) => {
          // On error
          console.log('3rror', error);
          const mappingRoom = await items.data.map(async (item: any) => {
            item['statusOpened'] = false;
            // item['orderStatuses'] = Object.entries(item.available_status).map(([value, name]) => ({ value, name }));
            return item;
          });
          console.log('mappingRoom', mappingRoom);
          this.rows = mappingRoom;
          this.loadingIndicator = false;
        })
    } else {
      setTimeout(() => {
        this.getAndCreateRoomById(items);
      }, 500);
    }
  }
}
