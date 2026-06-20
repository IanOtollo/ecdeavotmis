/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as bankAccounts from "../bankAccounts.js";
import type * as books from "../books.js";
import type * as capitationReceipts from "../capitationReceipts.js";
import type * as dashboard from "../dashboard.js";
import type * as emergencies from "../emergencies.js";
import type * as http from "../http.js";
import type * as infrastructure from "../infrastructure.js";
import type * as institutions from "../institutions.js";
import type * as learners from "../learners.js";
import type * as lib_auth from "../lib/auth.js";
import type * as seed from "../seed.js";
import type * as teachers from "../teachers.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  bankAccounts: typeof bankAccounts;
  books: typeof books;
  capitationReceipts: typeof capitationReceipts;
  dashboard: typeof dashboard;
  emergencies: typeof emergencies;
  http: typeof http;
  infrastructure: typeof infrastructure;
  institutions: typeof institutions;
  learners: typeof learners;
  "lib/auth": typeof lib_auth;
  seed: typeof seed;
  teachers: typeof teachers;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
