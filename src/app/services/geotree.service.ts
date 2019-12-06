import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeotreeService {
  authAreas: any[] = [];
  diffLevelStarted: any;
  areas: any[] = [];

  constructor() { }

  getFilter2Geotree(areas) {
    this.authAreas = areas.slice();
    if (this.authAreas[0] && this.authAreas[0].length > 1) this.authAreas[0].splice(0, 1);
    if (this.authAreas[1] && this.authAreas[1].length > 1) this.authAreas[1].splice(0, 1);

    console.log('auth areasaskljdsa', this.authAreas);
    if (areas.length > 0 && this.authAreas[0].length > 1) this.diffLevelStarted = this.authAreas[0].find(area => this.authAreas[1].map(ar => ar.id).includes(area.id));
    else {
      this.diffLevelStarted = this.authAreas[0][0] ? this.authAreas[0][0] : null;

      this.areas = [this.diffLevelStarted];
    }
    console.log('the areas', this.authAreas, this.diffLevelStarted);
  }
}
