import { registerDefaultFixtures } from '../../support';

describe('Amazon Lambda: Lambda functions test', () => {
  beforeEach(() => {
    registerDefaultFixtures();
    cy.route('/applications/lambdait/functions', 'fixture:lambda/functions/functions_list.json');
    cy.route('/applications/lambdait?expand=false', 'fixture:lambda/functions/expand.json');
    cy.route(
      '/functions?account=aws-cy-test&functionName=lambdait-java-integration-test&provider=aws&region=us-west-2',
      'fixture:lambda/functions/functions_list.json',
    );
    cy.route('/credentials?expand=true', 'fixture:lambda/functions/credentials_expand.json');
    cy.route('/networks/aws', 'fixture:lambda/functions/networks.json');
    cy.route('/subnets/aws', 'fixture:lambda/functions/subnets.json');
  });

  it('shows the Lambda funtions list and details', () => {
    cy.viewport(1536, 960);
    cy.visit('#/applications/lambdait/functions');

    //Get the first lambda function on the list
    cy.get('h6.clickable').first().click().should('exist');
    cy.get('#function-actions-dropdown').contains('Function Actions').should('exist');
    //Check the details
    cy.get('h4.collapsible-heading')
      .should(($h) => {
        expect($h).to.contain('Function Details');
      })
      .click();
    cy.get('.content-body').find('dt').contains('Last Modified').should('exist');
  });

  it('Create Lambda function', () => {
    cy.viewport(1536, 960);
    cy.visit('#/applications/lambdait/functions');
    cy.get('.application-actions')
      .find('button')
      .should(($b) => {
        expect($b).to.contain('Create Function');
      })
      .click();
    cy.get('h4.modal-title').contains('Create New Function').should('exist');
    //Fill Create Function modal
    cy.get('[name="functionName"]').type('cypress-funtion-test');
    cy.get('[name="s3bucket"]').type('s3-staging');
    cy.get('[name="s3key"]').type('dev/lambdatest/lambda-0.0.1-SNAPSHOT.jar');
    cy.get('[name="handler"]').type('io.WelcomeLambda::handleRequest');
    cy.get('[name="publish"]').check();
    cy.get('.TextInput[placeholder="Enter role ARN"]').type('arn:aws:iam::123456789012:role/SpinnakerAWSLambda');
    cy.get('button.btn.btn-block.btn-sm.add-new').each((item, index, list) => {
      item.click();
    });
    cy.get('tr.MapPair')
      .children('td')
      .find('input.form-control.input.input-sm')
      .each((item, index, list) => {
        cy.wrap(item).type('testing-' + index);
      });
    cy.get('input.TextInput[name="description"]').type('Cypress Testing');
    cy.get('input.TextInput[name="targetGroups"]').type('test-tg');
    cy.get('input.TextInput[name="deadLetterConfig.targetArn"]').type('arn:aws:lambda::123456789012:targetARN');
    cy.get('.modal-footer').first().contains('Cancel').click();
  });

  it('Edit Lambda funtion', () => {
    cy.viewport(1536, 960);
    cy.visit('#/applications/lambdait/functions');

    //Get the first lambda function on the list
    cy.get('h6.clickable').first().click().should('exist');
    cy.get('#function-actions-dropdown').contains('Function Actions').should('exist');
    //Check the details
    cy.get('h4.collapsible-heading')
      .should(($h) => {
        expect($h).to.contain('Function Details');
      })
      .click();
    cy.get('.content-body').find('dt').contains('Last Modified').should('exist');

    //Edit Lambda
    cy.get('#function-actions-dropdown').click();
    cy.get('[aria-labelledby="function-actions-dropdown"]').children().should('have.length', 2);
    cy.get('[aria-labelledby="function-actions-dropdown"]').contains('Edit').click();
    cy.get('h4.modal-title').contains('Edit').should('exist');
    cy.get('[name="s3bucket"]').type('s3-staging');
    cy.get('[name="s3key"]').type('dev/lambdatest/lambda-0.0.1-SNAPSHOT.jar');
    cy.get('[name="publish"]').check();
    cy.get('button.btn.btn-block.btn-sm.add-new').each((item, index, list) => {
      item.click();
    });
    cy.get('tr.MapPair')
      .children('td')
      .find('input.form-control.input.input-sm')
      .each((item, index, list) => {
        cy.wrap(item).type('testing-' + index);
      });
    cy.get('input.TextInput[name="description"]').type('Cypress Testing');
    cy.get('input.TextInput[name="targetGroups"]').type('test-tg');
    cy.get('input.TextInput[name="deadLetterConfig.targetArn"]').type('arn:aws:lambda::123456789012:targetARN');
    cy.get('.modal-footer').first().contains('Cancel').click();
  });

  it('shows the Lambda funtions list', () => {
    cy.viewport(1536, 960);
    cy.visit('#/applications/lambdait/functions');

    //Get the first lambda function on the list
    cy.get('h6.clickable').first().click().should('exist');
    cy.get('#function-actions-dropdown').contains('Function Actions').should('exist');
    //Check the details
    cy.get('h4.collapsible-heading')
      .should(($h) => {
        expect($h).to.contain('Function Details');
      })
      .click();
    cy.get('.content-body').find('dt').contains('Last Modified').should('exist');

    //Delete Lambda
    cy.get('#function-actions-dropdown').click();
    cy.get('[aria-labelledby="function-actions-dropdown"]').contains('Delete').click();
    cy.get('h4.modal-title').contains('Really delete').should('exist');
    cy.get('.modal-footer').first().contains('Cancel').click();
  });
});
