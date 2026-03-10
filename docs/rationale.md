# Rationale

The idea is that the app cannot accept "impossible" values based on business rules. We reinforce this by creating objects that are self-validating.

We have different levels of validation:

- **Smart constructors** enforce business rules at creation time, so invalid values never exist.
- **Validators** check business rules at runtime, so invalid values are detected.
- **Branded types** enforce business rules at runtime, so invalid values are detected.

Developers should implement and test them one by one to see the behavior of the app and avoid silent bugs.

## Objectives

- By the end of this exercise developers will understand the importance of Domain-Driven Design and strong typing in TypeScript.
- They will be able to write code that is free from primitive obsession and silent bugs.
- They will be able to write code that is free from silent bugs.
- They weill clearly see the difference between factory functions and constructors (OOP vs FP).
