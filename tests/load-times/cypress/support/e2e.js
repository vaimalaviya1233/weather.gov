// Ignore uncaught script errors. We can't control what happens with external
// scripts, so...
Cypress.on("uncaught:exception", () => false);