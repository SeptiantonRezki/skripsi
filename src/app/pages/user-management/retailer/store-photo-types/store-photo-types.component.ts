import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { StorePhotoVerificationService } from 'app/services/store-photo-verification.service';
import { DndDropEvent, DropEffect } from 'ngx-drag-drop';
import * as _ from 'underscore';

export interface StorePhotoTypeDetail {
  id: number;
  type: string;
  status: any;
  jenis_foto: string;
  jumlah_foto_masuk: number;
  jumlah_foto_diverifikasi: number;
  jumlah_audience: number;
  is_publish: boolean;
}
@Component({
  selector: 'app-store-photo-types',
  templateUrl: './store-photo-types.component.html',
  styleUrls: ['./store-photo-types.component.scss']
})
export class StorePhotoTypesComponent implements OnInit {
  storeTypes: Array<StorePhotoTypeDetail> = [];

  constructor(
    private storePhotoVerificationService: StorePhotoVerificationService,
    private dialogService: DialogService,
    private dataService: DataService,
  ) {
  }

  ngOnInit() {
    this.fetchRows();
  }
  fetchRows() {
    this.storePhotoVerificationService.getListDetailPhotoType().subscribe(res => {

      if (res.data && res.data.length) {
        this.storeTypes = res.data || [];
      }
    }, err => {

    })
  }
  saveOrder(list) {
    const payload = { id: _.pluck(list, 'id') }

    this.storePhotoVerificationService.updateSortListPhotoType(payload).subscribe(res => {

      this.dialogService.openSnackBar({ message: 'Berhasil mengubah urutan' });

    }, err => {

    });
  }
  onChangePublish(event, item, confirmed = false) {
    console.log({ event, item });
    const statusTxt = (!event.value) ? 'Unpublish' : 'Publish';
    if(!confirmed) {
      const data = {
        titleDialog: `${statusTxt} Jenis Foto`,
        captionDialog: `Apakah anda yakin melakukan ${statusTxt} jenis foto?`,
        confirmCallback: () => { this.onChangePublish(event, item, true) },
        buttonText: ['Ya, Lanjutkan', 'Batal']
      };
  
      this.dialogService.openCustomConfirmationDialog(data);
      event.source.value = !event.value
      item.is_publish = !event.value
      event.value = !event.value
      return;
    }
    event.source.value = !event.value;
    item.is_publish = !event.value;
    event.value = !event.value;
    console.log({newEvent: event, item, confirmed});
    this.dataService.showLoading(true)
    const body = { id: item.id, publish: event.value ? 1 : 0 }

    this.storePhotoVerificationService.updatePhotoTypePublishStatus(body).subscribe(res => {
      this.dialogService.brodcastCloseConfirmation();
      this.dataService.showLoading(false)
      this.fetchRows();
    }, err => {
      this.dataService.showLoading(false)
    });
  }
  onDrop(event: DndDropEvent, list?: Array<StorePhotoTypeDetail>) {

    // let list = _list.getValue();
    if (list
      && (event.dropEffect === "copy"
        || event.dropEffect === "move")) {

      let index = event.index - 1;

      if (typeof index === "undefined") {

        index = list.length;
      }

      list.splice(index, 0, event.data);
      setTimeout(() => { this.saveOrder(list) }, 250); // TODO: set debounce
      // _list.next(list);
    }
  }
  onDragged(item: StorePhotoTypeDetail, list: Array<StorePhotoTypeDetail>, effect: DropEffect) {
    // let list = _list.getValue();
    if (effect === "move") {
      const index = list.indexOf(item);
      list.splice(index, 1);
    }
  }
  getRowClass() {
    return { 'custom-row': true }
  }
  onClickDelete(item: StorePhotoTypeDetail, confirmed=false) {

    if(!confirmed) {

      this.dialogService.openCustomConfirmationDialog({
        titleDialog: 'Hapus Jenis Foto',
        captionDialog: 'Apakah anda yakin?',
        confirmCallback: () => { this.onClickDelete(item, true) },
        buttonText: ['Ya, Lanjutkan', 'Batal']
      });
      return;
    }

    this.dataService.showLoading(true);
    this.storePhotoVerificationService.deleteStorePhotoType({id: item.id}).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogService.brodcastCloseConfirmation();
      this.dialogService.openSnackBar({message: `Berhasil menghapus jenis foto`});
      this.fetchRows();

    }, err => {
      this.dataService.showLoading(false);
    });

  }

}
