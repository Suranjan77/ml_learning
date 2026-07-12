describe('Active Learning Features', () => {
  beforeEach(() => {
    // Visit a representative algorithm module page with full active learning features
    cy.visit('/algorithms/linear-regression');
  });

  it('renders Case Studies and Self-Check Quiz sections', () => {
    cy.contains('h3', 'Real-World Case Studies').should('exist');
    cy.contains('h2', 'Self-Check Quiz').should('exist');
  });

  it('handles quiz selection and reveals explanation', () => {
    // Wait for Next.js hydration
    cy.wait(2000);

    // The quiz is collapsed by default — open it first.
    cy.contains('button', 'Self-Check Quiz')
      .scrollIntoView()
      .click({ scrollBehavior: 'center' });

    // Find the first question card
    cy.contains('.font-mono', 'Q1').parents('.rounded-lg').as('question');
    
    // Explanation should not exist yet
    cy.get('@question').contains('.tracking-wider', 'Explanation').should('not.exist');
    
    // Click the first option
    cy.get('@question').find('button[role="radio"]').first().click({ force: true });
    
    // Explanation should now be revealed
    cy.get('@question').contains('.tracking-wider', 'Explanation').should('exist');
    
    // State indicators "Correct" or "Your pick" should show up
    cy.get('@question').invoke('text').should('match', /Correct|Your pick/);
    
    // Try again button should work
    cy.get('@question').contains('button', 'Try again').click({ force: true });
    cy.get('@question').contains('.tracking-wider', 'Explanation').should('not.exist');
  });
});
