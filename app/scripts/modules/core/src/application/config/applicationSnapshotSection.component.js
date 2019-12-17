'use strict';

import { module } from 'angular';

import { CONFIRMATION_MODAL_SERVICE } from 'core/confirmationModal/confirmationModal.service';
import { SnapshotWriter } from 'core/snapshot/SnapshotWriter';
import { CORE_SNAPSHOT_DIFF_VIEWSNAPSHOTDIFFBUTTON_COMPONENT } from 'core/snapshot/diff/viewSnapshotDiffButton.component';
import UIROUTER_ANGULARJS from '@uirouter/angularjs';

export const CORE_APPLICATION_CONFIG_APPLICATIONSNAPSHOTSECTION_COMPONENT =
  'spinnaker.core.application.config.serialize.component';
export const name = CORE_APPLICATION_CONFIG_APPLICATIONSNAPSHOTSECTION_COMPONENT; // for backwards compatibility
module(CORE_APPLICATION_CONFIG_APPLICATIONSNAPSHOTSECTION_COMPONENT, [
  UIROUTER_ANGULARJS,
  CONFIRMATION_MODAL_SERVICE,
  CORE_SNAPSHOT_DIFF_VIEWSNAPSHOTDIFFBUTTON_COMPONENT,
]).component('applicationSnapshotSection', {
  templateUrl: require('./applicationSnapshotSection.component.html'),
  bindings: {
    application: '=',
  },
  controller: [
    '$state',
    'confirmationModalService',
    function($state, confirmationModalService) {
      if (this.application.notFound || this.application.hasError) {
        return;
      }

      this.takeSnapshot = () => {
        const submitMethod = () => {
          return SnapshotWriter.takeSnapshot(this.application.attributes);
        };

        const taskMonitor = {
          application: this.application,
          title: 'Taking snapshot of ' + this.application.name,
          hasKatoTask: true,
        };

        confirmationModalService.confirm({
          header: 'Are you sure you want to take a snapshot of: ' + this.application.name + '?',
          buttonText: 'Take snapshot',
          provider: 'gce',
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };
    },
  ],
});
