describe('Visualization Stress Testing', () => {
  it('handles rapid fit/reset cycling without crashing (Linear Regression)', () => {
    cy.visit('/algorithms/linear-regression');
    cy.get('svg[aria-label="Multivariable Linear Regression Fit"]').should('exist');
    
    // Rapidly click buttons
    for (let i = 0; i < 20; i++) {
      cy.get('body').then($body => {
        const runPauseBtn = $body.find('button[aria-label*="Fit"]');
        if (runPauseBtn.length) {
          cy.wrap(runPauseBtn.first()).click({force: true});
        }
      });
      if (i % 5 === 0) {
        cy.get('body').then($body => {
          const resetBtn = $body.find('button[aria-label*="Reset"]');
          if (resetBtn.length) {
            cy.wrap(resetBtn.first()).click({force: true});
          }
        });
      }
    }
    
    cy.contains('Visualization Error').should('not.exist');
    cy.get('svg').should('be.visible');
  });

  it('survives extreme viewport resizing while animating', () => {
    cy.visit('/algorithms/linear-regression');
    cy.get('body').then($body => {
      const runBtn = $body.find('button[aria-label*="Run"]');
      if (runBtn.length) {
        cy.wrap(runBtn.first()).click({force: true});
      }
    });
    
    // Rapidly resize viewport
    cy.viewport(320, 480);
    cy.wait(50);
    cy.viewport(1920, 1080);
    cy.wait(50);
    cy.viewport(768, 1024);
    cy.wait(50);
    
    cy.contains('Visualization Error').should('not.exist');
  });

  it('handles boundary and rapid slider scrubbing (Backpropagation)', () => {
    cy.visit('/algorithms/backpropagation');
    cy.get('svg').should('exist');

    // Find all range inputs and scrub them min to max rapidly
    cy.get('input[type="range"]').each(($slider) => {
      const min = Number($slider.attr('min') ?? 0);
      const max = Number($slider.attr('max') ?? 100);
      const mid = (min + max) / 2;

      cy.wrap($slider).invoke('val', min).trigger('input').trigger('change');
      cy.wrap($slider).invoke('val', max).trigger('input').trigger('change');
      cy.wrap($slider).invoke('val', mid).trigger('input').trigger('change');
      cy.wrap($slider).invoke('val', max * 2).trigger('input').trigger('change'); 
      cy.wrap($slider).invoke('val', min - 100).trigger('input').trigger('change'); 
    });

    cy.contains('Visualization Error').should('not.exist');
  });

  it('handles fast unmounting while visualization is running', () => {
    cy.visit('/algorithms/clustering');
    cy.get('svg').should('exist');
    
    cy.get('body').then($body => {
      const runBtn = $body.find('button[aria-label*="Run"]');
      if (runBtn.length > 0) {
         cy.wrap(runBtn.first()).click({force: true});
      }
    });
    
    // Quickly navigate to another module
    cy.visit('/algorithms/cnn');
    cy.get('svg').should('exist');
    cy.contains('Visualization Error').should('not.exist');
  });

  it('handles spamming select controls (Diffusion Models)', () => {
    cy.visit('/algorithms/diffusion-models');
    cy.get('svg').should('exist');

    cy.get('body').then($body => {
      // #lesson-module-select navigates between lessons — spamming it would
      // leave the page. Only exercise visualization-level selects.
      const selects = $body.find('select').not('#lesson-module-select');
      if (selects.length > 0) {
        cy.wrap(selects).each(($select) => {
          const options = $select.find('option');
          if (options.length > 1) {
            for(let i=0; i<options.length; i++) {
                cy.wrap($select).select(String(options.eq(i).val()), { force: true });
            }
          }
        });
      }
    });

    cy.contains('Visualization Error').should('not.exist');
  });
});
