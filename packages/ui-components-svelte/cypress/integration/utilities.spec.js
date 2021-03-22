/// <reference types="Cypress" />

import mount from "../support/mount";
import { TextInput } from "../../dist/index.min.js";

describe("Preprocessor plugin", () => {
  it("does not break when you navigate to the app", () => {
    cy.visit("/");
  });
});

describe("Mount helper function", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("mounts a TextInput", () => {
    mount(TextInput, {
      label: "Test the mount function",
      textInputType: "textarea"
    });
    cy.contains("Test the mount function");
  });

  it("Stores the component for future setting", () => {
    mount(TextInput, {
      label: "Test the mount function"
    });
    assert.notEqual(Cypress.component, undefined);
  });
});
