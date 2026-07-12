describe('Search E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    // The header renders a desktop and a mobile SearchBar; only one is
    // visible at any viewport, so always scope to the visible instance.
    cy.get('input[placeholder="Search modules..."]')
      .filter(':visible')
      .as('searchInput');
  });

  it('allows user to query and see suggestions in a dropdown', () => {
    cy.get('@searchInput').type('Linear Regression');

    // Wait for the dropdown to render the matching items
    cy.contains('Matching Modules').should('be.visible');
    cy.contains('Linear Regression').should('be.visible');
  });

  it('navigates to the corresponding module page when a suggestion is clicked', () => {
    cy.get('@searchInput').type('Logistic Regression');

    // Click on the result
    cy.contains('Matching Modules')
      .parent()
      .contains('Logistic Regression')
      .click();

    // Verify page routing
    cy.url().should('include', '/algorithms/logistic-regression');
    cy.get('h1').should('contain', 'Logistic Regression');
  });

  it('displays a friendly "no results" message for unmatched queries', () => {
    cy.get('@searchInput').type('nonexistentconcept123');

    // Dropdown should open and display no results message
    cy.contains(/No results found for.*nonexistentconcept123/i).should('be.visible');
  });

  it('clears query and closes dropdown when clear button is clicked', () => {
    cy.get('@searchInput').type('Linear Regression');
    cy.contains('Matching Modules').should('be.visible');

    // Click on the clear (X) button — only the active SearchBar renders one.
    cy.get('button[aria-label="Clear search"]').click();

    // Query should be empty and dropdown should be closed
    cy.get('@searchInput').should('have.value', '');
    cy.contains('Matching Modules').should('not.exist');
  });
});
