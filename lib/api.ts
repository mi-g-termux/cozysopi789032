import { NextResponse } from "next/server";

/** Standard success envelope: { success: true, data }. */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/** Standard error envelope: { success: false, error, code }. */
export function fail(error: string, code: string, status = 400) {
  return NextResponse.json({ success: false, error, code }, { status });
}

export const Errors = {
  VALIDATION: (msg = "Please check the form and try again.") =>
    fail(msg, "VALIDATION", 400),
  UNAUTHENTICATED: () => fail("Please sign in to continue.", "UNAUTHENTICATED", 401),
  FORBIDDEN: () => fail("You do not have permission to do that.", "FORBIDDEN", 403),
  NOT_FOUND: (msg = "Not found.") => fail(msg, "NOT_FOUND", 404),
  CONFLICT: (msg: string) => fail(msg, "CONFLICT", 409),
  RATE_LIMIT: (msg = "Too many requests. Please slow down.") =>
    fail(msg, "RATE_LIMIT", 429),
  SERVER: () => fail("Something went wrong. Please try again.", "SERVER", 500)
};
