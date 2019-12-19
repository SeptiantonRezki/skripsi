import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { d } from '@angular/core/src/render3';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeotreeService extends BaseService {
  authAreas: any[] = [];
  diffLevelStarted: any;
  areas: any[] = [];
  mutableAreas: any;

  constructor(http: HttpClient) {
    super(http);
  }

  getChildFilterArea(body?): Observable<any> {
    const url = this.getUrl("area", "child_filter");
    return this.postApi(url, body);
  }

  getFilter2Geotree(areas) {
    this.authAreas = areas.slice();
    // if (this.authAreas[0] && this.authAreas[0].length > 1) this.authAreas[0].splice(0, 1);
    // if (this.authAreas[1] && this.authAreas[1].length > 1) this.authAreas[1].splice(0, 1);

    console.log('auth areasaskljdsa', this.authAreas);
    if (areas.length > 0 && this.authAreas.length > 1) {
      let sameLevelArea = this.authAreas[0].filter(area => (this.authAreas[1] ? this.authAreas[1] : []).map(ar => ar.id).includes(area.id));
      console.log('sameLevelArea', sameLevelArea);
      this.diffLevelStarted = sameLevelArea.length > 0 ? sameLevelArea[sameLevelArea.length - 1] : null;
    }
    else {
      this.diffLevelStarted = this.authAreas[0] && this.authAreas[0][0] ? this.authAreas[0][0] : null;
      console.log('this', this.diffLevelStarted, this.authAreas);
      this.areas = [this.diffLevelStarted];
    }
    console.log('the areas', this.authAreas, this.diffLevelStarted);
  }

  disableArea(sameLevelArea) {
    console.log('sameArea', sameLevelArea);
    if (!sameLevelArea) return [];

    let area_levels = ["national", "division", "region", "area", "salespoint", "district", "territory"];
    switch (sameLevelArea.type) {
      case "territory":
        area_levels = ["division", "region", "area", "salespoint", "district"];
        return area_levels;
      case "district":
        area_levels = ["division", "region", "area", "salespoint"];
        return area_levels;
      case "salespoint":
        area_levels = ["division", "region", "area"];
        return area_levels;
      case "area":
        area_levels = ["division", "region"];
        return area_levels;
      case "region":
        area_levels = ["division"];
        return area_levels;
      default:
        return [];
    }
  }

  listMutableArea(last_level) {
    this.mutableAreas = { first: '', areas: [] };
    switch (last_level) {
      case 'national':
        this.mutableAreas = { first: "division", areas: ["region", "area", "salespoint", "district", "territory"] };
        return this.mutableAreas;
      case 'division':
        this.mutableAreas = { first: 'region', areas: ["area", "salespoint", "district", "territory"] };
        return this.mutableAreas;
      case 'region':
        this.mutableAreas = { first: 'area', areas: ["salespoint", "district", "territory"] };
        return this.mutableAreas;
      case 'area':
        this.mutableAreas = { first: 'salespoint', areas: ["district", "territory"] };
        return this.mutableAreas;
      case 'salespoint':
        this.mutableAreas = { first: 'district', areas: ["territory"] };
        return this.mutableAreas;
      default:
        return this.mutableAreas;
    }
  }

  getNextLevel(level) {
    switch (level) {
      case 'national':
        return "division";
      case 'division':
        return "region";
      case 'zone':
        return "region";
      case 'region':
        return "area";
      case 'area':
        return "salespoint"
      case 'salespoint':
        return "district";
      default:
        return "territory";
    }
  }

  getBeforeLevel(level) {
    switch (level) {
      // case 'national:':
      //   return "territory";
      case 'division':
        return "national";
      case 'zone':
        return 'national';
      case 'region':
        return "division";
      case 'area':
        return "region"
      case 'salespoint':
        return "area";
      case 'district':
        return 'salespoint';
      case 'territory':
      case 'teritory':
        return 'district';
    }
  }
}
