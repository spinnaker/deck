'use strict';

import * as DOMPurify from 'dompurify';

const angular = require('angular');

import { AUTO_SCROLL_DIRECTIVE } from 'core/presentation/autoScroll/autoScroll.directive';
import { ANY_FIELD_FILTER } from './anyFieldFilter/anyField.filter';
import { PAGE_NAVIGATOR_COMPONENT } from './navigation/pageNavigator.component';
import { PAGE_SECTION_COMPONENT } from './navigation/pageSection.component';
import { REPLACE_FILTER } from './replace.filter';
import { ROBOT_TO_HUMAN_FILTER } from './robotToHumanFilter/robotToHuman.filter';

import './flex-layout.less';
import './details.less';
import './main.less';
import './navPopover.less';

module.exports = angular
  .module('spinnaker.core.presentation', [
    ANY_FIELD_FILTER,
    AUTO_SCROLL_DIRECTIVE,
    PAGE_NAVIGATOR_COMPONENT,
    PAGE_SECTION_COMPONENT,
    require('./collapsibleSection/collapsibleSection.directive').name,
    require('./isVisible/isVisible.directive').name,
    ROBOT_TO_HUMAN_FILTER,
    require('./sortToggle/sorttoggle.directive').name,
    require('./percent.filter').name,
    REPLACE_FILTER,
  ])
  .run(() => {
    // Add a hook to make all DOMPurify'd links open a new window
    // See: https://github.com/cure53/DOMPurify/tree/master/demos#hook-to-open-all-links-in-a-new-window-link
    DOMPurify.addHook('afterSanitizeAttributes', function(node) {
      // set all elements owning target to target=_blank
      if ('target' in node) {
        node.setAttribute('target', '_blank');
        // prevent https://www.owasp.org/index.php/Reverse_Tabnabbing
        node.setAttribute('rel', 'noopener noreferrer');
      }
      // set non-HTML/MathML links to xlink:show=new
      if (!node.hasAttribute('target') && (node.hasAttribute('xlink:href') || node.hasAttribute('href'))) {
        node.setAttribute('xlink:show', 'new');
      }
      return node;
    });
  });
