describe('Module Navigation E2E Tests', () => {
  it('allows sequence traversal using next/prev buttons', () => {
    // Start at linear-regression
    cy.visit('/algorithms/linear-regression');
    cy.get('aside').should('be.visible');

    // Click Next Topic
    cy.get('a[href="/algorithms/logistic-regression"]').contains('Next Topic').click();

    // Verify we navigated to logistic regression
    cy.url().should('include', '/algorithms/logistic-regression');
    cy.get('h1').should('contain', 'Logistic Regression');

    // Click Previous Topic
    cy.get('a[href="/algorithms/linear-regression"]').contains('Previous Topic').click();

    // Verify we are back to linear-regression
    cy.url().should('include', '/algorithms/linear-regression');
  });

  it('navigates to related modules from the related topics section', () => {
    cy.visit('/algorithms/linear-regression');

    // Clicks fired mid-hydration can be swallowed by React; give the page a
    // beat to hydrate before interacting (matches active-learning.cy.ts).
    cy.wait(2000);

    // Click on a related module.
    cy.contains('h3', 'Related Topics')
      .should('exist')
      .parent()
      .find('a[href="/algorithms/logistic-regression"]')
      .should('be.visible')
      // The site header is sticky; Cypress's default scroll-to-top-of-viewport
      // behavior can land the target underneath it. Centering the target in
      // the viewport avoids that obstruction.
      .click({ scrollBehavior: 'center' });

    // Verify navigation
    cy.url().should('include', '/algorithms/logistic-regression');
    cy.get('h1').should('contain', 'Logistic Regression');
  });
});
