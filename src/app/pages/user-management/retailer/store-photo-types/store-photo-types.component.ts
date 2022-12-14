import { Component, OnInit } from '@angular/core';
import { StorePhotoVerificationService } from 'app/services/store-photo-verification.service';
import { DndDropEvent, DropEffect } from 'ngx-drag-drop';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-store-photo-types',
  templateUrl: './store-photo-types.component.html',
  styleUrls: ['./store-photo-types.component.scss']
})
export class StorePhotoTypesComponent implements OnInit {
  storeTypes: Array<any> =
    [
      {
        id: 1,
        name: 'Tampak Depan',
        incoming: 1000,
        verified: 2000,
        count_audience: 3000,
        published: false
      },
      {
        id: 2,
        name: 'Tampak Dalam',
        incoming: 1000,
        verified: 2000,
        count_audience: 3000,
        published: false
      },
      {
        id: 3,
        name: 'Chiller',
        incoming: 1000,
        verified: 2000,
        count_audience: 3000,
        published: false
      },
    ];

  displayedColumns = ['name', 'incoming', 'verified', 'count_audience', 'published', 'action']
  constructor(
    private storePhotoVerificationService: StorePhotoVerificationService
  ) {
    // this._storeTypes.debounceTime(300).subscribe(val => {
    //   console.log({ val });
    // })
    
  }

  ngOnInit() {
  }
  onDrop(event: DndDropEvent, list?: Array<any>) {

    // let list = _list.getValue();
    if (list
      && (event.dropEffect === "copy"
        || event.dropEffect === "move")) {

      let index = event.index - 1;

      if (typeof index === "undefined") {

        index = list.length;
      }

      list.splice(index, 0, event.data);
      // _list.next(list);
    }
  }
  onDragged(item: any, list: Array<any>, effect: DropEffect) {
    // let list = _list.getValue();
    if (effect === "move") {
      const index = list.indexOf(item);
      list.splice(index, 1);
      // _list.next(list);
    }
  }
  getRowClass() {
    return { 'custom-row': true }
  }

}
