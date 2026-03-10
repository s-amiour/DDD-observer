# Strong Typing & Domain-Driven Design in TypeScript — Exercise Overview

## What this exercise is about

This exercise teaches you how to stop relying on raw primitives (`string`, `number`, `boolean`) to represent domain concepts, and instead build self-validating objects that make invalid states impossible to represent.

The domain is a **restaurant** — orders, tables, menu items, prices, operating hours. It is intentionally familiar so you can focus on the patterns, not on understanding the business.

By the end you will have built a small model that:

- Refuses invalid data at the type level (compile time) and at runtime
- Keeps business rules inside domain objects, not scattered across utility functions
- Tracks the identity of things that change over time
- Notifies other parts of the system when something happens, without being coupled to them

---

## The five concepts, in the order you will learn them

### 1. Branded Types

A branded type wraps a primitive (`number`, `string`) in a unique tag so the compiler treats it as a distinct type. A `Price` and a plain `number` are no longer interchangeable, even though a `Price` is still a number under the hood.

**Problem it solves:** you can no longer accidentally pass a discount amount where a price is expected, or an email string where a table ID is expected. The compiler catches the swap before the code ever runs.

---

### 2. Smart Constructors

A smart constructor is a factory function that is the **only** way to create a branded type. It validates the raw input against a business rule before returning the value.

**Problem it solves:** invalid values (negative prices, malformed emails, quantities of zero) are rejected at the moment of creation. They never enter the domain. If a value exists, it is already valid — you never need to check again.

---

### 3. Value Objects

A value object groups several related branded types together and adds behaviour that belongs to that concept. It is always immutable: "changing" a value object means creating a new one.

**Problem it solves:** logic that belongs to a concept (e.g. "am I open right now?", "what is the total of these two money amounts?") lives inside that concept, not in a utility file somewhere. Two value objects with the same fields are considered equal.

---

### 4. Entities

An entity is like a value object but with a **unique identity** that persists across state changes. Two orders with identical items are still two different orders. Identity is generated once at creation (using `uuid`) and never changes.

**Problem it solves:** you can track, compare, and update real-world things (orders, tables, customers) without losing track of which one is which. State changes are still validated — the entity enforces its own invariants.

---

### 5. Observer Pattern

The observer pattern lets an entity broadcast events to a list of subscribers without knowing anything about who they are or what they do. Observers can be added (`subscribe`) or removed (`unsubscribe`) at any time.

**Problem it solves:** when an order is placed, the entity does not need to know whether to send an email, update a screen, write to a log, or all three. It just fires an event. Each subscriber decides what to do with it independently. Adding a new reaction never requires touching the entity.

---

## The core philosophy

> **Make illegal states unrepresentable.**

If a value should never be negative, the type should reject negatives.
If two fields should never be swapped, give them different types.
If a state transition is forbidden, the code should throw before it happens.

Push all of this validation to the **boundary** — the moment raw data enters your system. Once inside, trust the types. Do not re-validate the same thing in ten different places.
