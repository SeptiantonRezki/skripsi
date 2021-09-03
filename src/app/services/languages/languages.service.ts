import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../classes/config';
import { Observable } from 'rxjs';
import id from '../../../assets/languages/id.json';

@Injectable()
export class LanguagesService {

  public locale: any;

  constructor() {
    this.start();
  }

  start() {
    this.locale = id;
    console.log('locale', id);
  }

}
