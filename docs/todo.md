# TODO — From Dumb Objects to a Self-Validating, Observable Domain

Work through each phase in order. Each phase builds on the previous one.
Do not skip ahead — the point is to feel the pain first, then fix it.

---

## Phase 1 — Get the project running

- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run dev` and confirm it executes without errors

---

## Phase 2 — Look at the plain, "dumb" object (orderOne)

> **Goal:** Start with the simplest possible representation of a domain concept — no validation, no types, just raw primitives.

Pick a concept from a restaurant domain: a **menu item**, an **order**, or a **table**.

- [ ] Define a plain object type using only `string`, `number`, and `boolean` fields
- [ ] Create two or three instances of it with hardcoded values
- [ ] Write a function that does something with those objects (e.g. calculates a total price, checks if a table is available)
- [ ] Run it and confirm it works

**Now break it on purpose:**

- [ ] Pass a negative price — does anything complain? No.
- [ ] Swap two `string` arguments in a function call (e.g. pass a name where an email is expected) — does anything complain? No.
- [ ] Write down which bugs slipped through silently

> These are called **silent bugs**. The program runs, but the data is wrong. This is the problem we will fix.

## Phase 2.b

- [ ] create a type for `Order`. It accepts only primitives
- [ ] it doesn't check for negative prices, or impossible values
- [ ] test it by passing a negative price, etc

---

## Phase 3 — Introduce a Branded Type

> **Goal:** Make the compiler reject invalid values at the point of use, not just at runtime.

Pick one field from Phase 2 that caused a silent bug (e.g. `price: number`).

- [ ] Declare a branded type for it:
  ```ts
  type Price = number & { readonly __brand: unique symbol }
  ```
- [ ] Update your object type to use `Price` instead of `number`
- [ ] Try assigning a raw `number` directly to a `Price` field — the compiler should now refuse
- [ ] Do the same for at least one `string` field (e.g. `Email`, `TableId`, `ItemName`)

**Check your understanding:**

- [ ] Can you explain in one sentence why `Price` and `number` are not the same type, even though `Price` is built from `number`?

---

## Phase 4 — Add a Smart Constructor

> **Goal:** Validate business rules at creation time so that an invalid value can never exist inside your domain.

For each branded type from Phase 3:

- [ ] Write a factory function that accepts a raw primitive and returns the branded type
- [ ] Inside that function, throw an error if the value breaks a business rule (e.g. price cannot be negative, email must contain `@`)
- [ ] Replace every direct object literal that sets those fields with a call to the factory function
- [ ] Try passing an invalid value to the factory — it should throw immediately, not silently continue

**Check your understanding:**

- [ ] Where is the only place a `Price` value is now created? Is that one place easy to audit and change?

---

## Phase 5 — Build a Value Object

> **Goal:** Group related branded types and behaviour into a single immutable unit.

Pick a concept that has more than one field and its own logic (e.g. `Money` = amount + currency, `OperatingHours` = open + close time).

- [ ] Define a type or interface that holds the related branded fields
- [ ] Write a factory function (not a class constructor) that validates and returns an instance
- [ ] Add a method or pure function that answers a domain question using only that object's data (e.g. `isOpen(hours, currentHour)`, `add(moneyA, moneyB)`)
- [ ] Make the object immutable: all fields should be `readonly`, and any "update" should return a new object instead of mutating the existing one

**Check your understanding:**

- [ ] If you need to change the open time of `OperatingHours`, do you mutate the object or create a new one? Why?

---

## Phase 6 — Build an Entity

> **Goal:** Model something that has a unique identity and whose state can change over time, while still enforcing its own rules.

Pick a concept that needs identity and lifecycle (e.g. `Order`, `Table`, `Customer`).

- [ ] Import `uuid` and generate a unique `id` for each instance at creation time
- [ ] Brand the id type (e.g. `type OrderId = string & { readonly __brand: unique symbol }`)
- [ ] Write a factory function that creates the entity with its initial state and a fresh `id`
- [ ] Add state-changing functions (e.g. `addItem`, `closeTable`, `cancelOrder`) that return a **new** entity with the updated state rather than mutating the original
- [ ] Enforce invariants inside those functions: throw if the requested change is not allowed (e.g. cannot add an item to a closed order)

**Check your understanding:**

- [ ] Two orders can have identical items and totals — are they the same order? How does your `OrderId` answer that?

---

## Phase 7 — Add the Observer Pattern

> **Goal:** Let other parts of the system react to changes in an entity without the entity needing to know who is listening.

Start with your Entity from Phase 6.

### 7a — Define an Observer

- [ ] Define what an observer looks like: it is anything that has a function which receives an event
  ```ts
  // hint: think of it as a callback signature
  type Observer<T> = (event: T) => void
  ```
- [ ] Define the events your entity can emit (e.g. `OrderPlaced`, `OrderCancelled`, `TableClosed`) — plain objects with a `type` field and a payload

### 7b — Add a subscriber list to the Entity

- [ ] Add an `observers` field to your entity — it is an array of observer functions
- [ ] Write a `subscribe` function that adds an observer to the list and returns the updated entity
- [ ] Write an `unsubscribe` function that removes a specific observer from the list and returns the updated entity

### 7c — Notify observers on state change

- [ ] In each state-changing function from Phase 6, after computing the new state, call every observer in the list and pass the relevant event
- [ ] Write a `notify` helper that iterates the observers list and calls each one — keep it separate and reusable

### 7d — Wire it up and test it manually

- [ ] In `index.ts`, create an entity
- [ ] Define two or three observer functions (e.g. one that logs to the console, one that would send an email, one that updates a UI label)
- [ ] Subscribe them to the entity
- [ ] Trigger a state change and confirm all observers are called
- [ ] Unsubscribe one observer and trigger another state change — confirm it is no longer called

**Check your understanding:**

- [ ] Does the entity know anything about the observers it notifies? If you added a new observer tomorrow, would you need to change the entity?

---

## Done?

If all phases are complete you have built a small domain model that:

- Rejects invalid values at the type level and at runtime
- Keeps business logic inside domain objects, not scattered in utility functions
- Tracks identity across state changes
- Broadcasts events to any number of listeners without coupling itself to them

That is Domain-Driven Design in practice.
