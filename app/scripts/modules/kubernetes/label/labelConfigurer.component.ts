import {module} from 'angular';
import {KubernetesAnnotationConfigurerComponent} from '../annotation/annotationConfigurer.component'


export class KubernetesLabelConfigurerComponent extends KubernetesAnnotationConfigurerComponent {
  public templateUrl: string = require('./labelConfigurer.component.html')
}

export const KUBERNETES_LABEL_CONFIGURER = 'spinnaker.kubernetes.label.configurer.component';
module(KUBERNETES_LABEL_CONFIGURER, [])
  .component('kubernetesLabelConfigurer', new KubernetesLabelConfigurerComponent());
