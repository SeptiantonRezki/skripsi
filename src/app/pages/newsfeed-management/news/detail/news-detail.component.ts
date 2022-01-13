import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { DialogService } from '../../../../services/dialog.service';
import { NewsService } from '../../../../services/newsfeed-management/news.service';
import { FormGroup, FormBuilder } from '../../../../../../node_modules/@angular/forms';
import { Router } from '../../../../../../node_modules/@angular/router';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss']
})
export class NewsDetailComponent {
  detailNews: any;
  formBerita: FormGroup;

  statusNews: any[] = [{ name: this.ls.locale.manajemen_newsfeed.daftar_berita.text4, value: 'publish' }, { name: this.ls.locale.manajemen_newsfeed.daftar_berita.text5, value: 'unpublish' }]
  constructor(
    dataService: DataService,
    private router: Router,
    private dialogService: DialogService,
    private newsService: NewsService,
    private formBuilder: FormBuilder,
    private ls: LanguagesService
  ) {
    this.detailNews = dataService.getFromStorage('detail_news');
  }

  ngOnInit() {
    this.formBerita = this.formBuilder.group({
      status: [this.detailNews.status],
      is_notif: [this.detailNews['is_notif'] === 1 ? true : false]
    })
  }

  submit() {
    let body = {
      _method: 'PUT',
      status: this.formBerita.get('status').value,
      is_notif: this.formBerita.get('is_notif').value === true ? 1 : 0,
    }

    this.newsService.put(body, { news_id: this.detailNews.id }).subscribe(
      res => {
        this.dialogService.openSnackBar({ message: 'Status berhasil diubah' })
        this.router.navigate(['newsfeed-management', 'news']);
        window.localStorage.removeItem('detail_news');
      },
      err => {
        console.log(err);
      }
    )
  }
}
