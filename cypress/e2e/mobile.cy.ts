describe('Mobile Viewport', () => {
  beforeEach(() => {
    cy.viewport(360, 640);
  });

  const expectNoHorizontalOverflow = () => {
    cy.document().then((doc) => {
      expect(doc.documentElement.scrollWidth).to.be.lte(
        doc.documentElement.clientWidth + 1,
      );
    });
  };

  it('renders the homepage without horizontal overflow', () => {
    cy.visit('/');
    expectNoHorizontalOverflow();
  });

  it('renders a lesson without horizontal overflow', () => {
    cy.visit('/algorithms/linear-regression');
    cy.get('h1').should('exist');
    cy.get('[aria-label="Lesson navigation"]').scrollIntoView().should('be.visible');
    cy.get('a[href="#visualization"]').should('contain', 'Diagram');
    expectNoHorizontalOverflow();
  });

  it('uses an explicit mobile menu instead of a crowded navigation row', () => {
    cy.visit('/');
    cy.get('button[aria-label="Open navigation menu"]').click();
    cy.get('#mobile-primary-navigation').should('be.visible');
    cy.get('#mobile-primary-navigation').contains('Curriculum').click();
    cy.location('pathname').should('eq', '/tracks');
  });

  it('keeps visualization SVGs within the viewport', () => {
    cy.visit('/algorithms/linear-regression');
    cy.get('svg').each(($svg) => {
      expect($svg[0].getBoundingClientRect().width).to.be.lte(360);
    });
  });
});
