import { registerDefaultFixtures } from '../../support';

describe('amazon ecs: ECSApp Server Group', () => {
  beforeEach(() => {
    registerDefaultFixtures();
    cy.route('/applications/ecsapp/pipelines?**', 'fixture:ecs/pipelines/pipelines.json');
    cy.route('/images/find?*', 'fixture:ecs/shared/images.json');
    cy.route('/applications/ecsapp/pipelineConfigs', 'fixture:ecs/pipelines/pipelineConfigs.json');
    cy.route('/pipelineConfigs/**', 'fixture:ecs/pipelines/pipelineConfigs.json');
    cy.route('/networks/aws', 'fixture:ecs/default/networks.aws-ecs.json');
    cy.route('/applications/ecsapp/serverGroups', 'fixture:ecs/clusters/serverGroups.json');
    cy.route('/ecs/serviceDiscoveryRegistries', 'fixture:ecs/shared/serviceDiscoveryRegistries.json');
    cy.route('/ecs/ecsClusters', 'fixture:ecs/shared/ecsClusters.json');
    cy.route('/ecs/secrets', []);
    cy.route('/ecs/cloudMetrics/alarms', []);
    cy.route('/artifacts/credentials', 'fixture:ecs/shared/artifacts.json');
    cy.route('/roles/ecs', 'fixture:ecs/shared/roles.json');
    cy.route('/subnets/ecs', 'fixture:ecs/shared/subnets.json');
    cy.route('/loadBalancers?provider=ecs', 'fixture:ecs/shared/lb.json');
    cy.route('/applications/ecsapp/clusters', 'fixture:ecs/clusters/clusters.json');
    cy.route('/applications/ecsapp/loadBalancers', 'fixture:ecs/clusters/loadbalancers.json');
    cy.route(
      '/applications/ecsapp/serverGroups/**/aws-prod-ecsdemo-v000?includeDetails=false',
      'fixture:ecs/clusters/serverGroup.ecsdemo-v000.json',
    );
  });

  it('configure a new server group with artifacts', () => {
    cy.visit('#/applications/ecsapp/executions');

    cy.get('a:contains("Configure")').click({ force: true });

    cy.get('a:contains("Deploy")').click({ force: true });

    cy.get('.btn:contains("Add server group")').click();

    cy.get('span:contains("Continue")').click();

    cy.get('div[ng-model="command.ecsClusterName"]').type('spinnaker-deployment-cluster');

    cy.get('span:contains("spinnaker-deployment-cluster")').click();

    cy.get('input[ng-model="command.stack"]').type('functional');

    cy.get('input[ng-model="command.freeFormDetails"]').type('testing');

    cy.get('div[ng-model="$ctrl.command.networkMode"]').type('awsvpc');

    cy.get('span:contains("awsvpc")').click();

    cy.get('div[ng-model="$ctrl.command.subnetType"]').type('public');

    cy.get('span:contains("public-subnet")').click();

    cy.get('input[ng-model="$ctrl.command.associatePublicIpAddress"]')
      .eq(1)
      .click();

    cy.get('input[ng-model="command.useTaskDefinitionArtifact"]')
      .eq(1)
      .click();

    cy.get('task-definition-react .Select-placeholder:contains("Select an artifact")').type(' ');

    cy.get('task-definition-react .Select-option:contains("Define")').click();

    cy.get('task-definition-react input')
      .eq(3)
      .type('new-ecs-artifact');
    cy.get('task-definition-react input')
      .eq(4)
      .type('0.0.1');
    cy.get('task-definition-react input')
      .eq(5)
      .type('someLocation');
    cy.get('task-definition-react input')
      .eq(6)
      .type('someReference');

    cy.get('task-definition-react button:contains("Add New Container Mapping")').click({ force: true });

    cy.get('task-definition-react input[placeholder="enter container name..."]').type('v001-container');

    cy.get('task-definition-react .Select-placeholder:contains("Select an image")').type('TRIGGER');

    cy.get('.Select-option:contains("TRIGGER")').click();

    cy.get('task-definition-react button:contains("Add New Target Group Mapping")').click({ force: true });

    cy.get('task-definition-react input[placeholder="Enter a container name ..."]').type('v001-container');

    cy.get('task-definition-react .Select-placeholder:contains("Select a target group")').type('demo');

    cy.get('.Select-option:contains("demo")').click();

    cy.get('div[ng-model="$ctrl.command.launchType"]').type('FARGATE');

    cy.get('.ui-select-highlight:contains("FARGATE")').click();

    cy.get('submit-button[label="command.viewState.submitButtonLabel"]').click();

    cy.get('.account-tag').should('have.length', 2);

    cy.get('td:contains("ecsapp-prod-ecsdemo")').should('have.length', 1);
    cy.get('td:contains("ecsapp-functional-testing")').should('have.length', 1);

    cy.get('td:contains("us-west-2")').should('have.length', 2);

    cy.get('button[ng-click="pipelineConfigurerCtrl.revertPipelineChanges()"]').click();
  });

  it('configure a new server group with container inputs', () => {
    cy.visit('#/applications/ecsapp/executions');

    cy.get('a:contains("Configure")').click({ force: true });

    cy.get('a:contains("Deploy")').click({ force: true });

    cy.get('.btn:contains("Add server group")').click();

    cy.get('span:contains("Continue")').click();

    cy.get('div[ng-model="command.ecsClusterName"]').type('spinnaker-deployment-cluster');

    cy.get('span:contains("spinnaker-deployment-cluster")').click();

    cy.get('input[ng-model="command.stack"]').type('functional');

    cy.get('input[ng-model="command.freeFormDetails"]').type('testing');

    cy.get('div[ng-model="$ctrl.command.networkMode"]').type('awsvpc');

    cy.get('span:contains("awsvpc")').click();

    cy.get('div[ng-model="$ctrl.command.subnetType"]').type('public');

    cy.get('span:contains("public-subnet")').click();

    cy.get('input[ng-model="$ctrl.command.associatePublicIpAddress"]')
      .eq(1)
      .click();

    cy.get('.Select-placeholder:contains("Select an image")').type('TRIGGER');

    cy.get('.Select-option:contains("TRIGGER")').click();

    cy.get('container-react input[type=number]')
      .eq(0)
      .type(1024);

    cy.get('container-react input[type=number]')
      .eq(1)
      .type(1024);

    cy.get('div[ng-model="$ctrl.command.launchType"]').type('FARGATE');

    cy.get('.ui-select-highlight:contains("FARGATE")').click();

    cy.get('div[ng-model="$ctrl.command.logDriver"]').type('awslogs');

    cy.get('span:contains("awslogs")').click();

    cy.get('submit-button[label="command.viewState.submitButtonLabel"]').click();

    cy.get('.account-tag').should('have.length', 2);

    cy.get('td:contains("ecsapp-prod-ecsdemo")').should('have.length', 1);
    cy.get('td:contains("ecsapp-functional-testing")').should('have.length', 1);

    cy.get('td:contains("us-west-2")').should('have.length', 2);

    cy.get('button[ng-click="pipelineConfigurerCtrl.revertPipelineChanges()"]').click();
  });

  it('edit an existing server group with artifact', () => {
    cy.visit('#/applications/ecsapp/executions');

    cy.get('a:contains("Configure")').click({ force: true });

    cy.get('a:contains("Deploy")').click({ force: true });

    cy.get('.glyphicon-edit').click({ force: true });

    cy.get('input[ng-model="command.stack"]')
      .clear()
      .type('functional');

    cy.get('input[ng-model="command.freeFormDetails"]')
      .clear()
      .type('testing');

    cy.get('submit-button[label="command.viewState.submitButtonLabel"]').click();

    cy.get('.account-tag').should('have.length', 1);

    cy.get('td:contains("ecsapp-functional-testing")').should('have.length', 1);

    cy.get('td:contains("us-west-2")').should('have.length', 1);

    cy.get('button[ng-click="pipelineConfigurerCtrl.revertPipelineChanges()"]').click();
  });

  it('edit an existing server group with container inputs', () => {
    cy.visit('#/applications/ecsapp/executions');

    cy.get('a:contains("Configure")').click({ force: true });

    cy.get('a:contains("Deploy")').click({ force: true });

    cy.get('.glyphicon-edit').click({ force: true });

    cy.get('input[ng-model="command.stack"]')
      .clear()
      .type('functional');

    cy.get('input[ng-model="command.freeFormDetails"]')
      .clear()
      .type('testing');

    cy.get('input[ng-model="command.useTaskDefinitionArtifact"]')
      .eq(0)
      .click();

    cy.get('container-react input[type=number]')
      .eq(0)
      .clear()
      .type(1024);

    cy.get('container-react input[type=number]')
      .eq(1)
      .clear()
      .type(1024);

    cy.get('submit-button[label="command.viewState.submitButtonLabel"]').click();

    cy.get('.account-tag').should('have.length', 1);

    cy.get('td:contains("ecsapp-functional-testing")').should('have.length', 1);

    cy.get('td:contains("us-west-2")').should('have.length', 1);

    cy.get('.glyphicon-edit').click({ force: true });

    cy.get('container-react input[type=number]')
      .eq(0)
      .should('have.value', '1024');

    cy.get('container-react input[type=number]')
      .eq(1)
      .should('have.value', '1024');

    cy.get('submit-button[label="command.viewState.submitButtonLabel"]').click();

    cy.get('button[ng-click="pipelineConfigurerCtrl.revertPipelineChanges()"]').click();
  });
});
