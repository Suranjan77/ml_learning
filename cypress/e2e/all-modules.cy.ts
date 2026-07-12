describe('All Modules Walkthrough', () => {
  it('visits all algorithm pages to verify they render without crashes', () => {
    cy.visit('/');

    // The homepage's embedded concept map lists every module exactly once —
    // gather all lesson URLs from it.
    const urls = new Set<string>();
    cy.get('#curriculum a[href^="/algorithms/"]')
      .each(($el) => {
        const href = $el.attr('href');
        if (href) urls.add(href);
      })
      .then(() => {
        const list = [...urls];
        expect(list.length).to.be.greaterThan(40);
        cy.log(`Crawling ${list.length} modules...`);

        // Visit each URL and perform lightweight sanity checks
        list.forEach((url) => {
          cy.visit(url);

          // Page should render a title
          cy.get('h1').should('exist').and('not.be.empty');

          // Ensure no build error or routing crash
          cy.get('#__next-build-error').should('not.exist');

          // Visualization checks apply only to modules that ship a diagram
          // (synthesis reviews and the workflow module legitimately have none).
          cy.get('body').then(($body) => {
            if ($body.text().includes('Interactive Diagram')) {
              cy.get('svg, [data-testid="visualization"]').should('exist');
              cy.get('[role="img"][aria-label]').should('exist');
              cy.get('[data-testid="visualization-error"]').should('not.exist');
              cy.get('[data-testid="visualization"]')
                .invoke('text')
                .should('not.match', /\b(?:NaN|Infinity)\b/);
            }
          });
        });
      });
  });
});
