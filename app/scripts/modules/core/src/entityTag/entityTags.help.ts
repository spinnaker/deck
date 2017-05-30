import {module} from 'angular';
import {HELP_CONTENTS_REGISTRY, HelpContentsRegistry} from 'core/help/helpContents.registry';

const helpContents: any[] = [
  {
    key: 'entityTags.serverGroup.alert',
    contents: `<p>Alerts indicate an issue with a server group. When present, an alert icon
      <i class="notification fa fa-exclamation-triangle"></i> will be displayed in the clusters view next to the server group.</p>`
  },
  {
    key: 'entityTags.serverGroup.notice',
    contents: `<p>Notices provide additional context for a server group. When present, an info icon
      <i class="notification fa fa-flag"></i> will be displayed in the clusters view next to the server group.</p>`
  },
  {
    key: 'entityTags.loadBalancer.alert',
    contents: `<p>Alerts indicate an issue with a load balancer. When present, an alert icon
      <i class="notification fa fa-exclamation-triangle"></i> will be displayed in the load balancers view next to the server group.</p>`
  },
  {
    key: 'entityTags.loadBalancer.notice',
    contents: `<p>Notices provide additional context for a load balancer. When present, an info icon
      <i class="notification fa fa-flag"></i> will be displayed in the load balancers view next to the server group.</p>`
  },
  {
    key: 'entityTags.securityGroup.notice',
    contents: `<p>Notices provide additional context for a security group. When present, an info icon
      <i class="notification fa fa-flag"></i> will be displayed in the security groups view next to the security group.</p>`
  },
  {
    key: 'entityTags.securityGroup.alert',
    contents: `<p>Alerts indicate an issue with a security group. When present, an alert icon
      <i class="notification fa fa-exclamation-triangle"></i> will be displayed in the security groups view next to the security group.</p>`
  }
  ];

export const ENTITY_TAGS_HELP = 'spinnaker.core.entityTag.help';
module(ENTITY_TAGS_HELP, [HELP_CONTENTS_REGISTRY])
  .run((helpContentsRegistry: HelpContentsRegistry) => {
    helpContents.forEach((entry: any) => helpContentsRegistry.register(entry.key, entry.contents));
});
