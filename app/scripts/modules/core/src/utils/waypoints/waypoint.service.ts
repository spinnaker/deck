import * as $ from 'jquery';
import { sortBy, throttle } from 'lodash';
import { IScope, module } from 'angular';
import { $timeout, $rootScope } from 'ngimport';

interface IViewPlacement {
  top: number;
  elem: string;
}

interface IWaypoint {
  lastWindow: IViewPlacement[];
  top: number;
  direction: string;
  offset?: number;
  container?: JQuery;
  scrollEnabled?: boolean;
}

export class WaypointService {
  private waypointRegistry: { [key: string]: IWaypoint; } = Object.create(null);

  public registerWaypointContainer(elementScope: IScope, element: JQuery, key: string, offset: number): void {
    this.waypointRegistry[key] = this.waypointRegistry[key] || Object.create(null);
    this.waypointRegistry[key].container = element;
    this.waypointRegistry[key].offset = offset;
    this.enableWaypointEvent(element, key);
    if (elementScope) {
      elementScope.$on('$destroy', () => {
        this.disableWaypointEvent(key);
      });
    }
  }

  private enableWaypointEvent(element: JQuery, key: string): void {
    const registryEntry = this.waypointRegistry[key];
    if (!registryEntry.scrollEnabled) {
      // because they do not affect rendering directly, we can debounce this pretty liberally
      // but delay in case the scroll triggers a render of other elements and the top changes
      element.bind('scroll.waypointEvents resize.waypointEvents', throttle(() => {
        $timeout(() => {
          const containerRect = element.get(0).getBoundingClientRect(),
                topThreshold = containerRect.top + registryEntry.offset,
                waypoints = element.find('[waypoint]'),
                lastTop = this.waypointRegistry[key].top,
                newTop = element.get(0).scrollTop,
                inView: IViewPlacement[] = [];
          waypoints.each((_index, waypoint) => {
            const waypointRect = waypoint.getBoundingClientRect();
            if (waypointRect.bottom >= topThreshold && waypointRect.top <= containerRect.bottom) {
                inView.push({ top: waypointRect.top, elem: waypoint.getAttribute('waypoint') });
            }
          });
          this.waypointRegistry[key] = {
            lastWindow: sortBy(inView, 'top'),
            top: newTop,
            direction: lastTop > newTop ? 'up' : 'down'
          };
          if (this.waypointRegistry[key].lastWindow.length) {
            $rootScope.$broadcast('waypoints-changed', this.waypointRegistry[key]);
          }
        });
      }, 200));
      registryEntry.scrollEnabled = true;
    }
  }

  public disableWaypointEvent(key: string): void {
    const registry = this.waypointRegistry[key];
    if (registry && registry.container) {
      registry.container.unbind('scroll.waypointEvents resize.waypointEvents');
      registry.scrollEnabled = false;
      registry.container = null;
    }
  }

  public restoreToWaypoint(key: string): void {
    $timeout(() => {
      const registry = this.waypointRegistry[key];
      if (!registry || !registry.container) {
        return;
      }

      const candidates = registry.lastWindow || [],
            container = registry.container,
            containerScrollTop = container.scrollTop();

      candidates.every((candidate) => {
        const elem = $('[waypoint="' + candidate.elem + '"]', container);
        if (elem.length) {
          container.scrollTop(containerScrollTop + elem.offset().top - candidate.top);
          container.trigger('scroll');
          return false;
        }
        return true;
      });
    }, 50);
  }
}

export const WAYPOINT_SERVICE = 'spinnaker.core.utils.waypoints.service';
module(WAYPOINT_SERVICE, [])
  .service('waypointService', WaypointService);
