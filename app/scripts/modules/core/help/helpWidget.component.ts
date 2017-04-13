import * as moment from 'moment';
import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';

interface IHelpFieldContents {
  content: string;
  placement: string;
}

@Component({
  selector: 'deck-help-widget',
  template: `
    <ng-template #popoverContent>
      <div [innerHTML]="contents.content" (mouseenter)="popoverHovered()" (mouseleave)="hidePopover(false)"></div>
    </ng-template>
    <div style="display: inline-block;">
      <div *ngIf="expand && contents.content"
           class="help-contents small"
           [popover]="popoverContent"></div>
      <a href class="help-field" *ngIf="!expand && contents.content"
         [popover]="popoverContent"
         (mouseenter)="showPopover()"
         (mouseleave)="hidePopover(true)"
         [placement]="contents.placement"
         [isOpen]="displayPopover"
         triggers="none"
         container="body">
        <span class="small glyphicon glyphicon-question-sign"></span>
      </a>
    </div>
  `
})
export class HelpWidgetComponent implements OnInit, OnChanges, OnDestroy {

  private popoverClose: number;
  private popoverShownStart: number;

  @Input()
  public content: string;

  @Input()
  public placement: string;

  public contents: IHelpFieldContents;
  public expand = false;
  public displayPopover = false;

  private popoverHovered(): void {
    if (this.popoverClose) {
      clearTimeout(this.popoverClose);
      this.popoverClose = null;
    }
  }

  public ngOnInit(): void {
    this.contents = {
      content: this.content,
      placement: this.placement || 'top'
    };
  }

  public ngOnChanges(_changes: SimpleChanges): void {
    this.ngOnInit();
  }

  public ngOnDestroy(): void {
    if (this.popoverClose) {
      clearTimeout(this.popoverClose);
    }
  }

  public showPopover(): void {
    this.displayPopover = true;
    this.popoverShownStart = moment.now();
    this.popoverHovered();
  }

  public hidePopover(defer = false): void {
    if (defer) {
      this.popoverClose = window.setTimeout(() => { this.displayPopover = false; }, 300);
    } else {
      this.displayPopover = false;
    }

    if (moment.now() - this.popoverShownStart > 500) {
      // TODO: wire in analytics
      // this.$analytics.eventTrack('Help contents viewed', {category: 'Help', label: this.key || this.content});
    }
    this.popoverShownStart = null;
  }
}
