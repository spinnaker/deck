import { HelpContentsRegistry } from 'core/help/helpContents.registry';

const helpContents: { [key: string]: string } = {
  'ecs.loadBalancer.targetGroup':
    '<p>A <em>target group</em> is attached to an application / network load balancer and is a target for load balancer traffic.</p>  <p> You need to create both the application load balancer and target groups prior to being able to use them in your pipeline.</p>',
  'ecs.serverGroup.clusterName':
    '<p>The name of the ECS cluster (group of underlying EC2 hosts) onto which your application will be deployed.</p><p>Note that suggestions here are dependent on the selected account and region combination.</p>',
  'ecs.stage.findImageByTags.labelOrSha':
    "<p>As of now, only Amazon's ECR is supported as a source docker repository.</p>",
  'ecs.serverGroup.stack':
    '<p>An environment variable available within your container, and on which you should base your application configuration at runtime.</p>  <p>Typical values for this parameter are <i>staging</i>, <i>prod</i>, etc.  Keep this parameter short!</p>',
  'ecs.serverGroup.detail':
    '<p>An environment variable available within your container, and on which you should base your application configuration at runtime.</p>  <p>Typical values for this parameter are <i>app</i>, <i>worker</i>, <i>migrator</i>, etc.  Keep this parameter short!</p>',
  'ecs.capacity.overwrite':
    "<p>Checking this box will have the previous server group's capacity overwrite the new <i>desired containers</i> parameter if a previous server group exists.</p>",
  'ecs.capacity.desired': '<p>The starting number of containers, before any autoscaling happens.</p>',
  'ecs.capacity.minimum':
    '<p>The minimum number of containers you can reach as a result of autoscaling.</p> <p>Typically, this represents the bare minimum you can afford to run without impacting your capacity to meet your SLA (Service Level Agreement) objectives</p>',
  'ecs.capacity.maximum': '<p>The maximal number of containers you can reach as a result of autoscaling.</p>',
  'ecs.capacity.reserved.computeUnits':
    '<p>The assured minimal amount of computing capacity your container will be able to use.  1024 units are equal to 1 AWS virtual CPU</p> <p>If other containers on your underlying host are not using their reserved compute capacity, this container will be able to use it.</p>',
  'ecs.capacity.reserved.memory':
    '<p>The maximal amount of memory that your container can use, in megabytes.  Exceeding this amount may result in termination of your container.</p><p>1024 mb = 1 gb</p>',
  'ecs.loadbalancing.targetPort': '<p>The port on which your application is listening for incoming traffic</p>',
  'ecs.iamrole':
    '<p>The IAM role that your container (task, in AWS wording) will inherit.  </p><p>Define a role only if your application needs to access AWS APIs</p>',
  'ecs.placementStrategy':
    '<p>The strategy the container scheduler will be using.  See <a href="http://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-placement-strategies.html" target="_blank">AWS documentation</a> for more details. </p><p>You should at least balance across availability zones</p><p>Custom placement strategies have not been implemented yet.</p>',
  'ecs.capacity.autoscalingPolicies':
    '<p>A predefined MetricAlarm and Autoscaling policy with an Action must exist.</p><p>There is a delay in MetricAlarm recognizing the Autoscaling policy.</p>',
};

Object.keys(helpContents).forEach(key => HelpContentsRegistry.register(key, helpContents[key]));
