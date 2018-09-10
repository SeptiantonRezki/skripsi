import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { DialogService } from '../../../../services/dialog.service';
import { NewsService } from '../../../../services/newsfeed-management/news.service';
import { FormGroup, FormBuilder } from '../../../../../../node_modules/@angular/forms';
import { Router } from '../../../../../../node_modules/@angular/router';

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss']
})
export class NewsDetailComponent {
  detailNews: any;
  formBerita: FormGroup;

  statusNews: any[] = [{ name: 'Telah Diterbitkan', value: 'publish' }, { name: 'Belum Diterbitkan', value: 'unpublish' }]
  constructor(
    dataService: DataService,
    private router: Router,
    private dialogService: DialogService,
    private newsService: NewsService,
    private formBuilder: FormBuilder
  ) { 
    this.detailNews = dataService.getFromStorage('detail_news');
  }

  ngOnInit() {
    this.formBerita = this.formBuilder.group({
      status: [this.detailNews.status]
    })
  }

  submit() {
    let body = {
      _method: 'PUT',
      status: this.formBerita.get('status').value
    }

    this.newsService.put(body, {news_id: this.detailNews.id}).subscribe(
      res => {
        this.dialogService.openSnackBar({ message: 'Status berhasil diubah'})
        this.router.navigate(['newsfeed-management', 'news']);
        window.localStorage.removeItem('detail_news');
      },
      err => {
        console.log(err);
      }
    )
  }
}
