describe('Smoke Tests', () => {
  it('homepage loads successfully', () => {
    cy.visit('/');
    cy.get('h1').should('exist');
    // Page should contain at least some module cards/links
    cy.get('a[href*="/algorithms/"]').should('have.length.greaterThan', 0);
  });

  it('a foundation module page loads without errors', () => {
    // Visit the first algorithm — read the actual slug from the homepage link
    cy.visit('/');
    cy.get('a[href*="/algorithms/"]').first().click();
    // The page should have a heading with the module title
    cy.get('h1').should('exist').and('not.be.empty');
    // The page should not show a Next.js error overlay
    cy.get('#__next-build-error').should('not.exist');
  });

  it('a module page contains a visualization section', () => {
    cy.visit('/');
    cy.get('a[href*="/algorithms/"]').first().click();
    // There should be an SVG element (the visualization) or a visualization container
    cy.get('svg, [data-testid="visualization"]').should('exist');
  });

  it('playground page loads', () => {
    cy.visit('/playground');
    cy.get('h1, h2').should('exist');
  });

  it('labs page loads', () => {
    cy.visit('/labs');
    cy.get('h1, h2').should('exist');
  });

  it('404 page shows for invalid route', () => {
    cy.visit('/algorithms/this-does-not-exist', { failOnStatusCode: false });
    // Should show some kind of not-found message, not a blank page or crash
    cy.contains(/not found|404|doesn't exist/i).should('exist');
  });
});
