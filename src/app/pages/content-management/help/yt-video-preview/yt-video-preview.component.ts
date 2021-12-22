import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'yt-video-preview',
  templateUrl: './yt-video-preview.component.html',
  styleUrls: ['./yt-video-preview.component.scss']
})
export class YtVideoPreviewComponent implements OnInit, OnChanges {
  @Input('src') videoSource: string;
  videoId: string;

  constructor(
    private ls: LanguagesService
  ) {

  }

  ngOnInit() {
    // https://i.ytimg.com/vi_webp/tgbNymZ7vqY/hqdefault.webp
    console.log('SRC', this.videoSource);

    this.parseId();

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log({ changes });
    // const videoSource = changes.videoSource;
    this.videoSource = changes.videoSource.currentValue;
    this.parseId();
  }

  parseId() {

    if (!this.videoSource) { console.warn('videoSource is null'); return false; }

    var url = this.videoSource;
    var regex = /[?&]([^=#]+)=([^&#]*)/g, params = { v: null }, match;

    while (match = regex.exec(url)) {
      params[match[1]] = match[2];
    }
    this.videoId = params.v;

  }

}
