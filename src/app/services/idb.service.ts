import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { DataService } from "app/services/data.service";

class DexieInstance {
  db: any;
  constructor(dbName) {
    if (this.db) {
      return this.db;
    }
    this.db = new Dexie(dbName);
    this.db.version(1).stores({
      audiences: '++id'
    });
  }
}

export interface IQuery {
  page: number;
  per_page: number;
  search: string
}

@Injectable({
  providedIn: 'root'
})
export class IdbService {
  table: Dexie.Table<any, Number>;

  constructor(
    private dataService: DataService
  ) {
    let profile = this.dataService.getDecryptedProfile();
    let dbName = "AyoSrcHmsOfflineDB-" + (profile ? profile['id'] : 'NoProfileFound')
    let dbInstance = new DexieInstance(dbName);
    this.table = dbInstance.db.table('audiences');
  }

  // Product function
  getAll(filterFunc?: Function) {
    if (filterFunc) {
      return this.table.filter(dt => filterFunc(dt)).toArray();
    } else {
      return this.table.toArray();
    }
  }

  async paginate(query?: IQuery, filterFunc?: Function) {
    let skip = ((query.page ? query.page : 1) - 1) * (query.per_page ? query.per_page : 15);
    if (filterFunc) {
      return Promise.all([
        await this.table.filter(dt => filterFunc(dt)).offset(skip).limit(query.per_page ? query.per_page : 15).toArray(),
        await this.table.filter(dt => filterFunc(dt)).count()
      ]);
    } else {
      return Promise.all([
        this.table.offset(skip).limit(query.per_page ? query.per_page : 15).toArray(),
        this.table.count()
      ])
    }
  }

  getAnyOf(data) {
    return this.table.where('id').anyOf(data).toArray();
  }

  find(id) {
    return this.table.where('id').equals(id).first();
  }

  add(data) {
    return this.table.add(data);
  }

  bulkAdd(data) {
    return this.table.bulkAdd(data);
  }

  update(id, data) {
    return this.table.update(id, data);
  }

  bulkUpdate(data) {
    return this.table.bulkPut(data);
  }

  remove(id) {
    return this.table.delete(id);
  }

  reset() {
    return this.table.clear();
  }

  count() {
    return this.table.count();
  }
}
