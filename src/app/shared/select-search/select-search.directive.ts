import { Directive, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatSelect } from "@angular/material/select";

@Directive({
  selector: "[selectSearch]",
})
export class SelectSearchDirective implements OnInit {
  @Input() isScrolledBottom: boolean;
  @Output() onScrolledBottom: EventEmitter<Boolean> = new EventEmitter();

  constructor(private select: MatSelect) {}

  ngOnInit() {
    this.select.openedChange.subscribe((isOpen: boolean) => {
      if (!isOpen) return;
      this.select.panel.nativeElement.onscroll = (event: any) => {
        const target = event.currentTarget;
        if (
          target.scrollTop >= target.scrollHeight - target.offsetHeight &&
          !this.isScrolledBottom
        ) {
          this.onScrolledBottom.emit(true);
        }
      };
    });
  }
}
