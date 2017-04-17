import { module } from 'angular';
import { scaleLinear, scaleLog } from 'd3-scale';
import { Line, line } from 'd3-shape';
import { get } from 'lodash';

import { IAvailabilityWindow } from './availability.read.service';

import './availability.less';

interface PopoverContent {
  datetime: string;
  incidents: string[];
  availability: number;
}

interface Dot {
  r: number;
  cx: string;
  cy: string;
  score: number;
  popoverContent: PopoverContent;
}

interface IAxisData {
  value: string;
  y: number;
}

export class AvailabilityTrendController implements ng.IComponentController {
  public availabilityWindow: IAvailabilityWindow;
  public height: number;
  public width: number;
  public trendLine: string;
  public dots: Dot[] = [];
  private axisData: IAxisData[];
  public popoverOpen: boolean[] = [];
  public popoverTemplate: string = require('./availability.trend.popover.html');

  private margin = 5;
  private popoverClose: ng.IPromise<void>[] = [];

  static get $inject() { return ['$timeout']; }

  constructor(private $timeout: ng.ITimeoutService) {}

  // Based on: https://en.wikipedia.org/wiki/High_availability#.22Nines.22
  private getNines(availability: number): number {
    return -Math.log10((100 - availability) / 100);
  }

  private getScore(availability: number): number {
    if (this.getNines(availability) >= this.availabilityWindow.target_nines * 0.95) { return 2; }
    return 4;
  }

  private generateDots(xScale: Function, yScale: Function): Dot[] {
    const dots: Dot[] = [];

    this.availabilityWindow.ts.is_outage.forEach((isOutage, index) => {
      if (isOutage) {
        const popoverContent: PopoverContent = {
          datetime: get(this.availabilityWindow, ['ts', 'datetime', index],  'Unknown'),
          availability: get(this.availabilityWindow, ['ts', 'availability', index], 0),
          incidents: get(this.availabilityWindow, ['ts', 'incs', index], <string[]>[])
        };

        dots.push({
          r: 3,
          cx: xScale(index),
          cy: yScale(this.availabilityWindow.ts.availability[index]),
          score: this.getScore(this.availabilityWindow.ts.availability[index]),
          popoverContent: popoverContent
        });
      }
    });

    return dots;
  }

  private updateData(): void {
    if (this.availabilityWindow && this.availabilityWindow.ts.availability && this.availabilityWindow.ts.availability.length) {
      // Set the min value to a large fraction of target nines
      const minValue = 99.8;

      // Create line function
      const xScale = scaleLinear().domain([0, this.availabilityWindow.ts.availability.length]).range([this.margin, this.width]);
      const yScale = scaleLog().domain([minValue, 100]).range([this.height - this.margin, this.margin]).clamp(true);
      const thisLine: Line<number> = line<number>()
                      .x((_, i) => xScale(i))
                      .y((d) => yScale(d));

      // Generate line
      this.trendLine = thisLine(this.availabilityWindow.ts.availability);

      // Generate the dots
      this.dots = this.generateDots(xScale, yScale);

      // Generate the right axis
      this.axisData = [
        {
          value: minValue.toFixed(3).substring(2),
          y: yScale(minValue) + this.margin
        },
        {
          value: yScale.invert(((this.height - this.margin) / 2) + this.margin).toFixed(3).substring(2),
          y: ((this.height - this.margin) / 2) + this.margin
        },
        {
          value: '100',
          y: yScale(100)
        }
      ];
    }
  }

  public $onInit(): void {
    this.updateData();
  }

  public $onChanges(): void {
    this.updateData();
  }

  public showPopover(index: number): void {
    this.popoverOpen[index] = true;
    this.popoverHovered(index);
  }

  public hidePopover(index: number, defer: boolean): void {
    if (defer) {
      this.popoverClose[index] = this.$timeout(
        () => {
          this.popoverOpen[index] = false;
        },
        500);
    } else {
      this.popoverOpen[index] = false;
    }
  }

  public popoverHovered(index: number): void {
    if (this.popoverClose[index]) {
      this.$timeout.cancel(this.popoverClose[index]);
      this.popoverClose[index] = null;
    }
  }
}

class AvailabilityTrendComponent implements ng.IComponentOptions {
  public bindings: any = {
    availabilityWindow: '<',
    height: '<',
    width: '<'
  };

  public controller: any = AvailabilityTrendController;
  public templateUrl: string = require('./availability.trend.html');
}

export const AVAILABILITY_TREND_COMPONENT = 'spinnaker.netflix.availability.trend.component';

module(AVAILABILITY_TREND_COMPONENT, [])
.component('availabilityTrend', new AvailabilityTrendComponent());
