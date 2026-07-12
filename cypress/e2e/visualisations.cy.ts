const routes = [
  "/visualisations/gradient-descent",
  "/visualisations/attention",
  "/visualisations/kernel-trick",
  "/visualisations/overfitting",
  "/visualisations/k-means",
  "/visualisations/token-sampling",
];

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
];

describe("visualisation workspace", () => {
  for (const viewport of viewports) {
    for (const route of routes) {
      it(`${route} fits ${viewport.width}x${viewport.height}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit(route);
        cy.get('[data-testid="visualisation-workspace"]').should("be.visible");
        cy.get('[data-testid="visualisation-workspace"] [role="img"], [data-testid="visualisation-workspace"] [role="group"]')
          .first()
          .should("be.visible");
        cy.contains("button", "Next").should("be.visible");

        cy.document().then((document) => {
          expect(document.documentElement.scrollHeight).to.be.at.most(viewport.height);
          expect(document.body.scrollHeight).to.be.at.most(viewport.height);
        });
      });
    }
  }

  it("lists every visualisation on the library index", () => {
    cy.viewport(1280, 720);
    cy.visit("/visualisations");
    cy.get('a[href^="/visualisations/"]').should("have.length", routes.length);
    cy.contains(`${routes.length} visualisations`).should("be.visible");
  });

  it("keeps step controls operable and keyboard focusable", () => {
    cy.viewport(1280, 720);
    cy.visit("/visualisations/kernel-trick");
    cy.contains("button", "Next").should("not.be.disabled").focus().should("have.focus").click();
    cy.contains("Step 2 of 4").should("be.visible");
    cy.get('button[aria-label="Reset visualisation"]').focus().should("have.focus").click();
    cy.contains("Step 1 of 4").should("be.visible");
  });
});
