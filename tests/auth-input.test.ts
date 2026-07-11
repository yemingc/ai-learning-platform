import assert from "node:assert/strict";
import test from "node:test";
import {
  registrationInputSchema,
  signInInputSchema,
} from "../src/features/application/auth-input.ts";

test("registration accepts an omitted or blank optional name", () => {
  assert.deepEqual(
    registrationInputSchema.parse({
      email: "  LEARNER@EXAMPLE.COM ",
      name: "   ",
      password: "Password123!",
    }),
    {
      email: "learner@example.com",
      name: undefined,
      password: "Password123!",
    },
  );
  assert.equal(
    registrationInputSchema.safeParse({
      email: "learner@example.com",
      password: "Password123!",
    }).success,
    true,
  );
});

test("authentication normalizes email but preserves the password exactly", () => {
  assert.deepEqual(
    signInInputSchema.parse({
      callbackUrl: "/learn",
      email: " Learner@Example.COM ",
      password: "Password With Spaces!",
    }),
    {
      callbackUrl: "/learn",
      email: "learner@example.com",
      password: "Password With Spaces!",
    },
  );
});

test("authentication rejects malformed emails and out-of-range passwords", () => {
  assert.equal(
    registrationInputSchema.safeParse({
      email: "not-an-email",
      password: "Password123!",
    }).success,
    false,
  );
  assert.equal(
    signInInputSchema.safeParse({
      email: "learner@example.com",
      password: "short",
    }).success,
    false,
  );
});
