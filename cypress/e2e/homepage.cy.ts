describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the main header and description', () => {
    cy.get('h1').should('contain', 'Understand AI, Visually');
    cy.get('p').should('contain', 'structured curriculum');
  });

  it('shows the labs strip with every registered lab', () => {
    cy.get('#labs').within(() => {
      cy.contains('Learn by poking at it.').should('be.visible');
      cy.get('a[href="/playground"]').should('exist');
      cy.get('a[href="/labs/sampling"]').should('exist');
      cy.get('a[href="/labs/gradient-descent"]').should('exist');
      cy.get('a[href="/labs/overfitting"]').should('exist');
      cy.get('a[href="/labs/attention"]').should('exist');
      cy.get('a[href="/labs/tokenizer"]').should('exist');
    });
  });

  it('embeds the concept map as the curriculum section', () => {
    cy.get('#curriculum').within(() => {
      cy.contains('The curriculum is a map, not a list.').should('be.visible');
      cy.contains('a', 'Open the Full Map').should(
        'have.attr',
        'href',
        '/map',
      );
      cy.contains('a', 'Browse as a List').should(
        'have.attr',
        'href',
        '/tracks',
      );
      // Stage bands render with module nodes linking into lessons.
      cy.contains('Foundations').should('exist');
      cy.get('a[href^="/algorithms/"]').should('have.length.greaterThan', 30);
    });
  });

  it('navigates to a lesson from the embedded map', () => {
    cy.get('#curriculum a[href="/algorithms/linear-regression"]')
      .scrollIntoView()
      .click({ scrollBehavior: 'center' });
    cy.url().should('include', '/algorithms/linear-regression');
    cy.get('h1').should('exist');
    cy.contains('Intuition').should('exist');
  });
});
