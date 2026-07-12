describe('Learning Tracks', () => {
  it('keeps all tracks and rich module previews on the tracks page', () => {
    cy.visit('/tracks');

    cy.contains('ML Practitioner').should('be.visible');
    cy.contains('Deep Learning').should('be.visible');
    cy.contains('Computer Vision').should('be.visible');

    // ML Practitioner is open by default, so its module buttons already render.
    // NOTE: always scope track-toggle queries to the section — a bare
    // cy.contains('button', 'Deep Learning') matches the "Synthesis: Deep
    // Learning Architecture Choice" module card in the open practitioner
    // section first.
    cy.get('#track-practitioner button')
      .first()
      .should('have.attr', 'aria-expanded', 'true');
    cy.get('#track-practitioner').within(() => {
      // More than just the track's own toggle button means module cards rendered.
      cy.get('button').should('have.length.greaterThan', 1);
    });

    // Deep Learning starts collapsed - expand it before its module buttons render.
    cy.get('#track-modern-ai button')
      .first()
      .should('contain', 'Deep Learning')
      .click();
    cy.get('#track-modern-ai').within(() => {
      cy.contains('button', 'Neural Networks').click();
      cy.contains('Preview').should('be.visible');
      cy.contains('Key Equation').should('be.visible');
      cy.contains('Open Full Study').should('be.visible');
    });
  });

  it('redirects legacy track URLs to the matching tracks-page section', () => {
    cy.visit('/tracks/modern-ai');
    cy.location('pathname').should('eq', '/tracks');
    cy.location('hash').should('eq', '#track-modern-ai');
    cy.get('#track-modern-ai button')
      .first()
      .should('contain', 'Deep Learning')
      .and('have.attr', 'aria-expanded', 'true');
  });
});
