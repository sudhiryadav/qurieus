
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Account
 * 
 */
export type Account = $Result.DefaultSelection<Prisma.$AccountPayload>
/**
 * Model Session
 * 
 */
export type Session = $Result.DefaultSelection<Prisma.$SessionPayload>
/**
 * Model Users
 * 
 */
export type Users = $Result.DefaultSelection<Prisma.$UsersPayload>
/**
 * Model VerificationToken
 * 
 */
export type VerificationToken = $Result.DefaultSelection<Prisma.$VerificationTokenPayload>
/**
 * Model SubscriptionPlan
 * 
 */
export type SubscriptionPlan = $Result.DefaultSelection<Prisma.$SubscriptionPlanPayload>
/**
 * Model Subscription
 * 
 */
export type Subscription = $Result.DefaultSelection<Prisma.$SubscriptionPayload>
/**
 * Model Message
 * 
 */
export type Message = $Result.DefaultSelection<Prisma.$MessagePayload>
/**
 * Model ContactMessage
 * 
 */
export type ContactMessage = $Result.DefaultSelection<Prisma.$ContactMessagePayload>
/**
 * Model ChatConversation
 * 
 */
export type ChatConversation = $Result.DefaultSelection<Prisma.$ChatConversationPayload>
/**
 * Model ChatMessage
 * 
 */
export type ChatMessage = $Result.DefaultSelection<Prisma.$ChatMessagePayload>
/**
 * Model Document
 * 
 */
export type Document = $Result.DefaultSelection<Prisma.$DocumentPayload>
/**
 * Model DocumentChunk
 * 
 */
export type DocumentChunk = $Result.DefaultSelection<Prisma.$DocumentChunkPayload>
/**
 * Model Embedding
 * 
 */
export type Embedding = $Result.DefaultSelection<Prisma.$EmbeddingPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const SubscriptionType: {
  monthly: 'monthly',
  quarterly: 'quarterly',
  yearly: 'yearly'
};

export type SubscriptionType = (typeof SubscriptionType)[keyof typeof SubscriptionType]


export const PlanType: {
  basic: 'basic',
  pro: 'pro',
  enterprise: 'enterprise'
};

export type PlanType = (typeof PlanType)[keyof typeof PlanType]

}

export type SubscriptionType = $Enums.SubscriptionType

export const SubscriptionType: typeof $Enums.SubscriptionType

export type PlanType = $Enums.PlanType

export const PlanType: typeof $Enums.PlanType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Accounts
 * const accounts = await prisma.account.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Accounts
   * const accounts = await prisma.account.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.account`: Exposes CRUD operations for the **Account** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Accounts
    * const accounts = await prisma.account.findMany()
    * ```
    */
  get account(): Prisma.AccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.session`: Exposes CRUD operations for the **Session** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.session.findMany()
    * ```
    */
  get session(): Prisma.SessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.users`: Exposes CRUD operations for the **Users** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.users.findMany()
    * ```
    */
  get users(): Prisma.UsersDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.verificationToken`: Exposes CRUD operations for the **VerificationToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VerificationTokens
    * const verificationTokens = await prisma.verificationToken.findMany()
    * ```
    */
  get verificationToken(): Prisma.VerificationTokenDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.subscriptionPlan`: Exposes CRUD operations for the **SubscriptionPlan** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SubscriptionPlans
    * const subscriptionPlans = await prisma.subscriptionPlan.findMany()
    * ```
    */
  get subscriptionPlan(): Prisma.SubscriptionPlanDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.subscription`: Exposes CRUD operations for the **Subscription** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Subscriptions
    * const subscriptions = await prisma.subscription.findMany()
    * ```
    */
  get subscription(): Prisma.SubscriptionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.message`: Exposes CRUD operations for the **Message** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Messages
    * const messages = await prisma.message.findMany()
    * ```
    */
  get message(): Prisma.MessageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.contactMessage`: Exposes CRUD operations for the **ContactMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ContactMessages
    * const contactMessages = await prisma.contactMessage.findMany()
    * ```
    */
  get contactMessage(): Prisma.ContactMessageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.chatConversation`: Exposes CRUD operations for the **ChatConversation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ChatConversations
    * const chatConversations = await prisma.chatConversation.findMany()
    * ```
    */
  get chatConversation(): Prisma.ChatConversationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.chatMessage`: Exposes CRUD operations for the **ChatMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ChatMessages
    * const chatMessages = await prisma.chatMessage.findMany()
    * ```
    */
  get chatMessage(): Prisma.ChatMessageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.document`: Exposes CRUD operations for the **Document** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Documents
    * const documents = await prisma.document.findMany()
    * ```
    */
  get document(): Prisma.DocumentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.documentChunk`: Exposes CRUD operations for the **DocumentChunk** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DocumentChunks
    * const documentChunks = await prisma.documentChunk.findMany()
    * ```
    */
  get documentChunk(): Prisma.DocumentChunkDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.embedding`: Exposes CRUD operations for the **Embedding** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Embeddings
    * const embeddings = await prisma.embedding.findMany()
    * ```
    */
  get embedding(): Prisma.EmbeddingDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Account: 'Account',
    Session: 'Session',
    Users: 'Users',
    VerificationToken: 'VerificationToken',
    SubscriptionPlan: 'SubscriptionPlan',
    Subscription: 'Subscription',
    Message: 'Message',
    ContactMessage: 'ContactMessage',
    ChatConversation: 'ChatConversation',
    ChatMessage: 'ChatMessage',
    Document: 'Document',
    DocumentChunk: 'DocumentChunk',
    Embedding: 'Embedding'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "account" | "session" | "users" | "verificationToken" | "subscriptionPlan" | "subscription" | "message" | "contactMessage" | "chatConversation" | "chatMessage" | "document" | "documentChunk" | "embedding"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Account: {
        payload: Prisma.$AccountPayload<ExtArgs>
        fields: Prisma.AccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findFirst: {
            args: Prisma.AccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findMany: {
            args: Prisma.AccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          create: {
            args: Prisma.AccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          createMany: {
            args: Prisma.AccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          delete: {
            args: Prisma.AccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          update: {
            args: Prisma.AccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          deleteMany: {
            args: Prisma.AccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          upsert: {
            args: Prisma.AccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          aggregate: {
            args: Prisma.AccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccount>
          }
          groupBy: {
            args: Prisma.AccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccountCountArgs<ExtArgs>
            result: $Utils.Optional<AccountCountAggregateOutputType> | number
          }
        }
      }
      Session: {
        payload: Prisma.$SessionPayload<ExtArgs>
        fields: Prisma.SessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findFirst: {
            args: Prisma.SessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findMany: {
            args: Prisma.SessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          create: {
            args: Prisma.SessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          createMany: {
            args: Prisma.SessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          delete: {
            args: Prisma.SessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          update: {
            args: Prisma.SessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          deleteMany: {
            args: Prisma.SessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          upsert: {
            args: Prisma.SessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          aggregate: {
            args: Prisma.SessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSession>
          }
          groupBy: {
            args: Prisma.SessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionCountArgs<ExtArgs>
            result: $Utils.Optional<SessionCountAggregateOutputType> | number
          }
        }
      }
      Users: {
        payload: Prisma.$UsersPayload<ExtArgs>
        fields: Prisma.UsersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UsersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UsersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>
          }
          findFirst: {
            args: Prisma.UsersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UsersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>
          }
          findMany: {
            args: Prisma.UsersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>[]
          }
          create: {
            args: Prisma.UsersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>
          }
          createMany: {
            args: Prisma.UsersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UsersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>[]
          }
          delete: {
            args: Prisma.UsersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>
          }
          update: {
            args: Prisma.UsersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>
          }
          deleteMany: {
            args: Prisma.UsersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UsersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UsersUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>[]
          }
          upsert: {
            args: Prisma.UsersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsersPayload>
          }
          aggregate: {
            args: Prisma.UsersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsers>
          }
          groupBy: {
            args: Prisma.UsersGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsersGroupByOutputType>[]
          }
          count: {
            args: Prisma.UsersCountArgs<ExtArgs>
            result: $Utils.Optional<UsersCountAggregateOutputType> | number
          }
        }
      }
      VerificationToken: {
        payload: Prisma.$VerificationTokenPayload<ExtArgs>
        fields: Prisma.VerificationTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VerificationTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VerificationTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          findFirst: {
            args: Prisma.VerificationTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VerificationTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          findMany: {
            args: Prisma.VerificationTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>[]
          }
          create: {
            args: Prisma.VerificationTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          createMany: {
            args: Prisma.VerificationTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VerificationTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>[]
          }
          delete: {
            args: Prisma.VerificationTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          update: {
            args: Prisma.VerificationTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          deleteMany: {
            args: Prisma.VerificationTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VerificationTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VerificationTokenUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>[]
          }
          upsert: {
            args: Prisma.VerificationTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          aggregate: {
            args: Prisma.VerificationTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVerificationToken>
          }
          groupBy: {
            args: Prisma.VerificationTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<VerificationTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.VerificationTokenCountArgs<ExtArgs>
            result: $Utils.Optional<VerificationTokenCountAggregateOutputType> | number
          }
        }
      }
      SubscriptionPlan: {
        payload: Prisma.$SubscriptionPlanPayload<ExtArgs>
        fields: Prisma.SubscriptionPlanFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SubscriptionPlanFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SubscriptionPlanFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>
          }
          findFirst: {
            args: Prisma.SubscriptionPlanFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SubscriptionPlanFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>
          }
          findMany: {
            args: Prisma.SubscriptionPlanFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>[]
          }
          create: {
            args: Prisma.SubscriptionPlanCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>
          }
          createMany: {
            args: Prisma.SubscriptionPlanCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SubscriptionPlanCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>[]
          }
          delete: {
            args: Prisma.SubscriptionPlanDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>
          }
          update: {
            args: Prisma.SubscriptionPlanUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>
          }
          deleteMany: {
            args: Prisma.SubscriptionPlanDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SubscriptionPlanUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SubscriptionPlanUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>[]
          }
          upsert: {
            args: Prisma.SubscriptionPlanUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>
          }
          aggregate: {
            args: Prisma.SubscriptionPlanAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSubscriptionPlan>
          }
          groupBy: {
            args: Prisma.SubscriptionPlanGroupByArgs<ExtArgs>
            result: $Utils.Optional<SubscriptionPlanGroupByOutputType>[]
          }
          count: {
            args: Prisma.SubscriptionPlanCountArgs<ExtArgs>
            result: $Utils.Optional<SubscriptionPlanCountAggregateOutputType> | number
          }
        }
      }
      Subscription: {
        payload: Prisma.$SubscriptionPayload<ExtArgs>
        fields: Prisma.SubscriptionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SubscriptionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SubscriptionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          findFirst: {
            args: Prisma.SubscriptionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SubscriptionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          findMany: {
            args: Prisma.SubscriptionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>[]
          }
          create: {
            args: Prisma.SubscriptionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          createMany: {
            args: Prisma.SubscriptionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SubscriptionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>[]
          }
          delete: {
            args: Prisma.SubscriptionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          update: {
            args: Prisma.SubscriptionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          deleteMany: {
            args: Prisma.SubscriptionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SubscriptionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SubscriptionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>[]
          }
          upsert: {
            args: Prisma.SubscriptionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          aggregate: {
            args: Prisma.SubscriptionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSubscription>
          }
          groupBy: {
            args: Prisma.SubscriptionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SubscriptionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SubscriptionCountArgs<ExtArgs>
            result: $Utils.Optional<SubscriptionCountAggregateOutputType> | number
          }
        }
      }
      Message: {
        payload: Prisma.$MessagePayload<ExtArgs>
        fields: Prisma.MessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          findFirst: {
            args: Prisma.MessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          findMany: {
            args: Prisma.MessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>[]
          }
          create: {
            args: Prisma.MessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          createMany: {
            args: Prisma.MessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>[]
          }
          delete: {
            args: Prisma.MessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          update: {
            args: Prisma.MessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          deleteMany: {
            args: Prisma.MessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>[]
          }
          upsert: {
            args: Prisma.MessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          aggregate: {
            args: Prisma.MessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMessage>
          }
          groupBy: {
            args: Prisma.MessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<MessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.MessageCountArgs<ExtArgs>
            result: $Utils.Optional<MessageCountAggregateOutputType> | number
          }
        }
      }
      ContactMessage: {
        payload: Prisma.$ContactMessagePayload<ExtArgs>
        fields: Prisma.ContactMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ContactMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ContactMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>
          }
          findFirst: {
            args: Prisma.ContactMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ContactMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>
          }
          findMany: {
            args: Prisma.ContactMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>[]
          }
          create: {
            args: Prisma.ContactMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>
          }
          createMany: {
            args: Prisma.ContactMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ContactMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>[]
          }
          delete: {
            args: Prisma.ContactMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>
          }
          update: {
            args: Prisma.ContactMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>
          }
          deleteMany: {
            args: Prisma.ContactMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ContactMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ContactMessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>[]
          }
          upsert: {
            args: Prisma.ContactMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactMessagePayload>
          }
          aggregate: {
            args: Prisma.ContactMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateContactMessage>
          }
          groupBy: {
            args: Prisma.ContactMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<ContactMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.ContactMessageCountArgs<ExtArgs>
            result: $Utils.Optional<ContactMessageCountAggregateOutputType> | number
          }
        }
      }
      ChatConversation: {
        payload: Prisma.$ChatConversationPayload<ExtArgs>
        fields: Prisma.ChatConversationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChatConversationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChatConversationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>
          }
          findFirst: {
            args: Prisma.ChatConversationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChatConversationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>
          }
          findMany: {
            args: Prisma.ChatConversationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>[]
          }
          create: {
            args: Prisma.ChatConversationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>
          }
          createMany: {
            args: Prisma.ChatConversationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ChatConversationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>[]
          }
          delete: {
            args: Prisma.ChatConversationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>
          }
          update: {
            args: Prisma.ChatConversationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>
          }
          deleteMany: {
            args: Prisma.ChatConversationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChatConversationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ChatConversationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>[]
          }
          upsert: {
            args: Prisma.ChatConversationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatConversationPayload>
          }
          aggregate: {
            args: Prisma.ChatConversationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChatConversation>
          }
          groupBy: {
            args: Prisma.ChatConversationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChatConversationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChatConversationCountArgs<ExtArgs>
            result: $Utils.Optional<ChatConversationCountAggregateOutputType> | number
          }
        }
      }
      ChatMessage: {
        payload: Prisma.$ChatMessagePayload<ExtArgs>
        fields: Prisma.ChatMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChatMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChatMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>
          }
          findFirst: {
            args: Prisma.ChatMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChatMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>
          }
          findMany: {
            args: Prisma.ChatMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>[]
          }
          create: {
            args: Prisma.ChatMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>
          }
          createMany: {
            args: Prisma.ChatMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ChatMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>[]
          }
          delete: {
            args: Prisma.ChatMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>
          }
          update: {
            args: Prisma.ChatMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>
          }
          deleteMany: {
            args: Prisma.ChatMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChatMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ChatMessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>[]
          }
          upsert: {
            args: Prisma.ChatMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>
          }
          aggregate: {
            args: Prisma.ChatMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChatMessage>
          }
          groupBy: {
            args: Prisma.ChatMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChatMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChatMessageCountArgs<ExtArgs>
            result: $Utils.Optional<ChatMessageCountAggregateOutputType> | number
          }
        }
      }
      Document: {
        payload: Prisma.$DocumentPayload<ExtArgs>
        fields: Prisma.DocumentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DocumentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DocumentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>
          }
          findFirst: {
            args: Prisma.DocumentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DocumentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>
          }
          findMany: {
            args: Prisma.DocumentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>[]
          }
          create: {
            args: Prisma.DocumentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>
          }
          createMany: {
            args: Prisma.DocumentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DocumentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>[]
          }
          delete: {
            args: Prisma.DocumentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>
          }
          update: {
            args: Prisma.DocumentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>
          }
          deleteMany: {
            args: Prisma.DocumentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DocumentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DocumentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>[]
          }
          upsert: {
            args: Prisma.DocumentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>
          }
          aggregate: {
            args: Prisma.DocumentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDocument>
          }
          groupBy: {
            args: Prisma.DocumentGroupByArgs<ExtArgs>
            result: $Utils.Optional<DocumentGroupByOutputType>[]
          }
          count: {
            args: Prisma.DocumentCountArgs<ExtArgs>
            result: $Utils.Optional<DocumentCountAggregateOutputType> | number
          }
        }
      }
      DocumentChunk: {
        payload: Prisma.$DocumentChunkPayload<ExtArgs>
        fields: Prisma.DocumentChunkFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DocumentChunkFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentChunkPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DocumentChunkFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentChunkPayload>
          }
          findFirst: {
            args: Prisma.DocumentChunkFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentChunkPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DocumentChunkFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentChunkPayload>
          }
          findMany: {
            args: Prisma.DocumentChunkFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentChunkPayload>[]
          }
          create: {
            args: Prisma.DocumentChunkCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentChunkPayload>
          }
          createMany: {
            args: Prisma.DocumentChunkCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DocumentChunkCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentChunkPayload>[]
          }
          delete: {
            args: Prisma.DocumentChunkDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentChunkPayload>
          }
          update: {
            args: Prisma.DocumentChunkUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentChunkPayload>
          }
          deleteMany: {
            args: Prisma.DocumentChunkDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DocumentChunkUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DocumentChunkUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentChunkPayload>[]
          }
          upsert: {
            args: Prisma.DocumentChunkUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentChunkPayload>
          }
          aggregate: {
            args: Prisma.DocumentChunkAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDocumentChunk>
          }
          groupBy: {
            args: Prisma.DocumentChunkGroupByArgs<ExtArgs>
            result: $Utils.Optional<DocumentChunkGroupByOutputType>[]
          }
          count: {
            args: Prisma.DocumentChunkCountArgs<ExtArgs>
            result: $Utils.Optional<DocumentChunkCountAggregateOutputType> | number
          }
        }
      }
      Embedding: {
        payload: Prisma.$EmbeddingPayload<ExtArgs>
        fields: Prisma.EmbeddingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmbeddingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmbeddingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>
          }
          findFirst: {
            args: Prisma.EmbeddingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmbeddingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>
          }
          findMany: {
            args: Prisma.EmbeddingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>[]
          }
          create: {
            args: Prisma.EmbeddingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>
          }
          createMany: {
            args: Prisma.EmbeddingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmbeddingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>[]
          }
          delete: {
            args: Prisma.EmbeddingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>
          }
          update: {
            args: Prisma.EmbeddingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>
          }
          deleteMany: {
            args: Prisma.EmbeddingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmbeddingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EmbeddingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>[]
          }
          upsert: {
            args: Prisma.EmbeddingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmbeddingPayload>
          }
          aggregate: {
            args: Prisma.EmbeddingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmbedding>
          }
          groupBy: {
            args: Prisma.EmbeddingGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmbeddingGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmbeddingCountArgs<ExtArgs>
            result: $Utils.Optional<EmbeddingCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    account?: AccountOmit
    session?: SessionOmit
    users?: UsersOmit
    verificationToken?: VerificationTokenOmit
    subscriptionPlan?: SubscriptionPlanOmit
    subscription?: SubscriptionOmit
    message?: MessageOmit
    contactMessage?: ContactMessageOmit
    chatConversation?: ChatConversationOmit
    chatMessage?: ChatMessageOmit
    document?: DocumentOmit
    documentChunk?: DocumentChunkOmit
    embedding?: EmbeddingOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UsersCountOutputType
   */

  export type UsersCountOutputType = {
    accounts: number
    sessions: number
    messages: number
    documents: number
    embeddings: number
    chatConversations: number
  }

  export type UsersCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    accounts?: boolean | UsersCountOutputTypeCountAccountsArgs
    sessions?: boolean | UsersCountOutputTypeCountSessionsArgs
    messages?: boolean | UsersCountOutputTypeCountMessagesArgs
    documents?: boolean | UsersCountOutputTypeCountDocumentsArgs
    embeddings?: boolean | UsersCountOutputTypeCountEmbeddingsArgs
    chatConversations?: boolean | UsersCountOutputTypeCountChatConversationsArgs
  }

  // Custom InputTypes
  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsersCountOutputType
     */
    select?: UsersCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MessageWhereInput
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountDocumentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentWhereInput
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountEmbeddingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmbeddingWhereInput
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountChatConversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChatConversationWhereInput
  }


  /**
   * Count Type SubscriptionPlanCountOutputType
   */

  export type SubscriptionPlanCountOutputType = {
    subscriptions: number
  }

  export type SubscriptionPlanCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subscriptions?: boolean | SubscriptionPlanCountOutputTypeCountSubscriptionsArgs
  }

  // Custom InputTypes
  /**
   * SubscriptionPlanCountOutputType without action
   */
  export type SubscriptionPlanCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlanCountOutputType
     */
    select?: SubscriptionPlanCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SubscriptionPlanCountOutputType without action
   */
  export type SubscriptionPlanCountOutputTypeCountSubscriptionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubscriptionWhereInput
  }


  /**
   * Count Type ChatConversationCountOutputType
   */

  export type ChatConversationCountOutputType = {
    messages: number
  }

  export type ChatConversationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | ChatConversationCountOutputTypeCountMessagesArgs
  }

  // Custom InputTypes
  /**
   * ChatConversationCountOutputType without action
   */
  export type ChatConversationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversationCountOutputType
     */
    select?: ChatConversationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ChatConversationCountOutputType without action
   */
  export type ChatConversationCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChatMessageWhereInput
  }


  /**
   * Count Type DocumentCountOutputType
   */

  export type DocumentCountOutputType = {
    chunks: number
  }

  export type DocumentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    chunks?: boolean | DocumentCountOutputTypeCountChunksArgs
  }

  // Custom InputTypes
  /**
   * DocumentCountOutputType without action
   */
  export type DocumentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentCountOutputType
     */
    select?: DocumentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DocumentCountOutputType without action
   */
  export type DocumentCountOutputTypeCountChunksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentChunkWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Account
   */

  export type AggregateAccount = {
    _count: AccountCountAggregateOutputType | null
    _avg: AccountAvgAggregateOutputType | null
    _sum: AccountSumAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  export type AccountAvgAggregateOutputType = {
    expires_at: number | null
  }

  export type AccountSumAggregateOutputType = {
    expires_at: number | null
  }

  export type AccountMinAggregateOutputType = {
    id: string | null
    userId: string | null
    type: string | null
    provider: string | null
    providerAccountId: string | null
    refresh_token: string | null
    access_token: string | null
    expires_at: number | null
    token_type: string | null
    scope: string | null
    id_token: string | null
    session_state: string | null
  }

  export type AccountMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    type: string | null
    provider: string | null
    providerAccountId: string | null
    refresh_token: string | null
    access_token: string | null
    expires_at: number | null
    token_type: string | null
    scope: string | null
    id_token: string | null
    session_state: string | null
  }

  export type AccountCountAggregateOutputType = {
    id: number
    userId: number
    type: number
    provider: number
    providerAccountId: number
    refresh_token: number
    access_token: number
    expires_at: number
    token_type: number
    scope: number
    id_token: number
    session_state: number
    _all: number
  }


  export type AccountAvgAggregateInputType = {
    expires_at?: true
  }

  export type AccountSumAggregateInputType = {
    expires_at?: true
  }

  export type AccountMinAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    provider?: true
    providerAccountId?: true
    refresh_token?: true
    access_token?: true
    expires_at?: true
    token_type?: true
    scope?: true
    id_token?: true
    session_state?: true
  }

  export type AccountMaxAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    provider?: true
    providerAccountId?: true
    refresh_token?: true
    access_token?: true
    expires_at?: true
    token_type?: true
    scope?: true
    id_token?: true
    session_state?: true
  }

  export type AccountCountAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    provider?: true
    providerAccountId?: true
    refresh_token?: true
    access_token?: true
    expires_at?: true
    token_type?: true
    scope?: true
    id_token?: true
    session_state?: true
    _all?: true
  }

  export type AccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Account to aggregate.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Accounts
    **/
    _count?: true | AccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AccountAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AccountSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountMaxAggregateInputType
  }

  export type GetAccountAggregateType<T extends AccountAggregateArgs> = {
        [P in keyof T & keyof AggregateAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccount[P]>
      : GetScalarType<T[P], AggregateAccount[P]>
  }




  export type AccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithAggregationInput | AccountOrderByWithAggregationInput[]
    by: AccountScalarFieldEnum[] | AccountScalarFieldEnum
    having?: AccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountCountAggregateInputType | true
    _avg?: AccountAvgAggregateInputType
    _sum?: AccountSumAggregateInputType
    _min?: AccountMinAggregateInputType
    _max?: AccountMaxAggregateInputType
  }

  export type AccountGroupByOutputType = {
    id: string
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token: string | null
    access_token: string | null
    expires_at: number | null
    token_type: string | null
    scope: string | null
    id_token: string | null
    session_state: string | null
    _count: AccountCountAggregateOutputType | null
    _avg: AccountAvgAggregateOutputType | null
    _sum: AccountSumAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  type GetAccountGroupByPayload<T extends AccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountGroupByOutputType[P]>
            : GetScalarType<T[P], AccountGroupByOutputType[P]>
        }
      >
    >


  export type AccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectScalar = {
    id?: boolean
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
  }

  export type AccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "type" | "provider" | "providerAccountId" | "refresh_token" | "access_token" | "expires_at" | "token_type" | "scope" | "id_token" | "session_state", ExtArgs["result"]["account"]>
  export type AccountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }
  export type AccountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }
  export type AccountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }

  export type $AccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Account"
    objects: {
      user: Prisma.$UsersPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      type: string
      provider: string
      providerAccountId: string
      refresh_token: string | null
      access_token: string | null
      expires_at: number | null
      token_type: string | null
      scope: string | null
      id_token: string | null
      session_state: string | null
    }, ExtArgs["result"]["account"]>
    composites: {}
  }

  type AccountGetPayload<S extends boolean | null | undefined | AccountDefaultArgs> = $Result.GetResult<Prisma.$AccountPayload, S>

  type AccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AccountCountAggregateInputType | true
    }

  export interface AccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Account'], meta: { name: 'Account' } }
    /**
     * Find zero or one Account that matches the filter.
     * @param {AccountFindUniqueArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountFindUniqueArgs>(args: SelectSubset<T, AccountFindUniqueArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Account that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccountFindUniqueOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountFindFirstArgs>(args?: SelectSubset<T, AccountFindFirstArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Accounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Accounts
     * const accounts = await prisma.account.findMany()
     * 
     * // Get first 10 Accounts
     * const accounts = await prisma.account.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const accountWithIdOnly = await prisma.account.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AccountFindManyArgs>(args?: SelectSubset<T, AccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Account.
     * @param {AccountCreateArgs} args - Arguments to create a Account.
     * @example
     * // Create one Account
     * const Account = await prisma.account.create({
     *   data: {
     *     // ... data to create a Account
     *   }
     * })
     * 
     */
    create<T extends AccountCreateArgs>(args: SelectSubset<T, AccountCreateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Accounts.
     * @param {AccountCreateManyArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccountCreateManyArgs>(args?: SelectSubset<T, AccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Accounts and returns the data saved in the database.
     * @param {AccountCreateManyAndReturnArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Account.
     * @param {AccountDeleteArgs} args - Arguments to delete one Account.
     * @example
     * // Delete one Account
     * const Account = await prisma.account.delete({
     *   where: {
     *     // ... filter to delete one Account
     *   }
     * })
     * 
     */
    delete<T extends AccountDeleteArgs>(args: SelectSubset<T, AccountDeleteArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Account.
     * @param {AccountUpdateArgs} args - Arguments to update one Account.
     * @example
     * // Update one Account
     * const account = await prisma.account.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccountUpdateArgs>(args: SelectSubset<T, AccountUpdateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Accounts.
     * @param {AccountDeleteManyArgs} args - Arguments to filter Accounts to delete.
     * @example
     * // Delete a few Accounts
     * const { count } = await prisma.account.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccountDeleteManyArgs>(args?: SelectSubset<T, AccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccountUpdateManyArgs>(args: SelectSubset<T, AccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts and returns the data updated in the database.
     * @param {AccountUpdateManyAndReturnArgs} args - Arguments to update many Accounts.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AccountUpdateManyAndReturnArgs>(args: SelectSubset<T, AccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Account.
     * @param {AccountUpsertArgs} args - Arguments to update or create a Account.
     * @example
     * // Update or create a Account
     * const account = await prisma.account.upsert({
     *   create: {
     *     // ... data to create a Account
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Account we want to update
     *   }
     * })
     */
    upsert<T extends AccountUpsertArgs>(args: SelectSubset<T, AccountUpsertArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountCountArgs} args - Arguments to filter Accounts to count.
     * @example
     * // Count the number of Accounts
     * const count = await prisma.account.count({
     *   where: {
     *     // ... the filter for the Accounts we want to count
     *   }
     * })
    **/
    count<T extends AccountCountArgs>(
      args?: Subset<T, AccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccountAggregateArgs>(args: Subset<T, AccountAggregateArgs>): Prisma.PrismaPromise<GetAccountAggregateType<T>>

    /**
     * Group by Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountGroupByArgs['orderBy'] }
        : { orderBy?: AccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Account model
   */
  readonly fields: AccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Account.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UsersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsersDefaultArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Account model
   */
  interface AccountFieldRefs {
    readonly id: FieldRef<"Account", 'String'>
    readonly userId: FieldRef<"Account", 'String'>
    readonly type: FieldRef<"Account", 'String'>
    readonly provider: FieldRef<"Account", 'String'>
    readonly providerAccountId: FieldRef<"Account", 'String'>
    readonly refresh_token: FieldRef<"Account", 'String'>
    readonly access_token: FieldRef<"Account", 'String'>
    readonly expires_at: FieldRef<"Account", 'Int'>
    readonly token_type: FieldRef<"Account", 'String'>
    readonly scope: FieldRef<"Account", 'String'>
    readonly id_token: FieldRef<"Account", 'String'>
    readonly session_state: FieldRef<"Account", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Account findUnique
   */
  export type AccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findUniqueOrThrow
   */
  export type AccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findFirst
   */
  export type AccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findFirstOrThrow
   */
  export type AccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findMany
   */
  export type AccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Accounts to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account create
   */
  export type AccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to create a Account.
     */
    data: XOR<AccountCreateInput, AccountUncheckedCreateInput>
  }

  /**
   * Account createMany
   */
  export type AccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Account createManyAndReturn
   */
  export type AccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account update
   */
  export type AccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to update a Account.
     */
    data: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
    /**
     * Choose, which Account to update.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account updateMany
   */
  export type AccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
  }

  /**
   * Account updateManyAndReturn
   */
  export type AccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account upsert
   */
  export type AccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The filter to search for the Account to update in case it exists.
     */
    where: AccountWhereUniqueInput
    /**
     * In case the Account found by the `where` argument doesn't exist, create a new Account with this data.
     */
    create: XOR<AccountCreateInput, AccountUncheckedCreateInput>
    /**
     * In case the Account was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
  }

  /**
   * Account delete
   */
  export type AccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter which Account to delete.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account deleteMany
   */
  export type AccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Accounts to delete
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to delete.
     */
    limit?: number
  }

  /**
   * Account without action
   */
  export type AccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
  }


  /**
   * Model Session
   */

  export type AggregateSession = {
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  export type SessionMinAggregateOutputType = {
    id: string | null
    sessionToken: string | null
    userId: string | null
    expires: Date | null
  }

  export type SessionMaxAggregateOutputType = {
    id: string | null
    sessionToken: string | null
    userId: string | null
    expires: Date | null
  }

  export type SessionCountAggregateOutputType = {
    id: number
    sessionToken: number
    userId: number
    expires: number
    _all: number
  }


  export type SessionMinAggregateInputType = {
    id?: true
    sessionToken?: true
    userId?: true
    expires?: true
  }

  export type SessionMaxAggregateInputType = {
    id?: true
    sessionToken?: true
    userId?: true
    expires?: true
  }

  export type SessionCountAggregateInputType = {
    id?: true
    sessionToken?: true
    userId?: true
    expires?: true
    _all?: true
  }

  export type SessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Session to aggregate.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sessions
    **/
    _count?: true | SessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionMaxAggregateInputType
  }

  export type GetSessionAggregateType<T extends SessionAggregateArgs> = {
        [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSession[P]>
      : GetScalarType<T[P], AggregateSession[P]>
  }




  export type SessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithAggregationInput | SessionOrderByWithAggregationInput[]
    by: SessionScalarFieldEnum[] | SessionScalarFieldEnum
    having?: SessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionCountAggregateInputType | true
    _min?: SessionMinAggregateInputType
    _max?: SessionMaxAggregateInputType
  }

  export type SessionGroupByOutputType = {
    id: string
    sessionToken: string
    userId: string
    expires: Date
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  type GetSessionGroupByPayload<T extends SessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionGroupByOutputType[P]>
            : GetScalarType<T[P], SessionGroupByOutputType[P]>
        }
      >
    >


  export type SessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectScalar = {
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
  }

  export type SessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionToken" | "userId" | "expires", ExtArgs["result"]["session"]>
  export type SessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }
  export type SessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }
  export type SessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }

  export type $SessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Session"
    objects: {
      user: Prisma.$UsersPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionToken: string
      userId: string
      expires: Date
    }, ExtArgs["result"]["session"]>
    composites: {}
  }

  type SessionGetPayload<S extends boolean | null | undefined | SessionDefaultArgs> = $Result.GetResult<Prisma.$SessionPayload, S>

  type SessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SessionCountAggregateInputType | true
    }

  export interface SessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Session'], meta: { name: 'Session' } }
    /**
     * Find zero or one Session that matches the filter.
     * @param {SessionFindUniqueArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SessionFindUniqueArgs>(args: SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Session that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SessionFindUniqueOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SessionFindFirstArgs>(args?: SelectSubset<T, SessionFindFirstArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SessionFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sessions
     * const sessions = await prisma.session.findMany()
     * 
     * // Get first 10 Sessions
     * const sessions = await prisma.session.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sessionWithIdOnly = await prisma.session.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SessionFindManyArgs>(args?: SelectSubset<T, SessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Session.
     * @param {SessionCreateArgs} args - Arguments to create a Session.
     * @example
     * // Create one Session
     * const Session = await prisma.session.create({
     *   data: {
     *     // ... data to create a Session
     *   }
     * })
     * 
     */
    create<T extends SessionCreateArgs>(args: SelectSubset<T, SessionCreateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sessions.
     * @param {SessionCreateManyArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SessionCreateManyArgs>(args?: SelectSubset<T, SessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sessions and returns the data saved in the database.
     * @param {SessionCreateManyAndReturnArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SessionCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Session.
     * @param {SessionDeleteArgs} args - Arguments to delete one Session.
     * @example
     * // Delete one Session
     * const Session = await prisma.session.delete({
     *   where: {
     *     // ... filter to delete one Session
     *   }
     * })
     * 
     */
    delete<T extends SessionDeleteArgs>(args: SelectSubset<T, SessionDeleteArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Session.
     * @param {SessionUpdateArgs} args - Arguments to update one Session.
     * @example
     * // Update one Session
     * const session = await prisma.session.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SessionUpdateArgs>(args: SelectSubset<T, SessionUpdateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sessions.
     * @param {SessionDeleteManyArgs} args - Arguments to filter Sessions to delete.
     * @example
     * // Delete a few Sessions
     * const { count } = await prisma.session.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SessionDeleteManyArgs>(args?: SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SessionUpdateManyArgs>(args: SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions and returns the data updated in the database.
     * @param {SessionUpdateManyAndReturnArgs} args - Arguments to update many Sessions.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SessionUpdateManyAndReturnArgs>(args: SelectSubset<T, SessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Session.
     * @param {SessionUpsertArgs} args - Arguments to update or create a Session.
     * @example
     * // Update or create a Session
     * const session = await prisma.session.upsert({
     *   create: {
     *     // ... data to create a Session
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Session we want to update
     *   }
     * })
     */
    upsert<T extends SessionUpsertArgs>(args: SelectSubset<T, SessionUpsertArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCountArgs} args - Arguments to filter Sessions to count.
     * @example
     * // Count the number of Sessions
     * const count = await prisma.session.count({
     *   where: {
     *     // ... the filter for the Sessions we want to count
     *   }
     * })
    **/
    count<T extends SessionCountArgs>(
      args?: Subset<T, SessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionAggregateArgs>(args: Subset<T, SessionAggregateArgs>): Prisma.PrismaPromise<GetSessionAggregateType<T>>

    /**
     * Group by Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionGroupByArgs['orderBy'] }
        : { orderBy?: SessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Session model
   */
  readonly fields: SessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Session.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UsersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsersDefaultArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Session model
   */
  interface SessionFieldRefs {
    readonly id: FieldRef<"Session", 'String'>
    readonly sessionToken: FieldRef<"Session", 'String'>
    readonly userId: FieldRef<"Session", 'String'>
    readonly expires: FieldRef<"Session", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Session findUnique
   */
  export type SessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findUniqueOrThrow
   */
  export type SessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findFirst
   */
  export type SessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findFirstOrThrow
   */
  export type SessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findMany
   */
  export type SessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session create
   */
  export type SessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to create a Session.
     */
    data: XOR<SessionCreateInput, SessionUncheckedCreateInput>
  }

  /**
   * Session createMany
   */
  export type SessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Session createManyAndReturn
   */
  export type SessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session update
   */
  export type SessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to update a Session.
     */
    data: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
    /**
     * Choose, which Session to update.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session updateMany
   */
  export type SessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
  }

  /**
   * Session updateManyAndReturn
   */
  export type SessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session upsert
   */
  export type SessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The filter to search for the Session to update in case it exists.
     */
    where: SessionWhereUniqueInput
    /**
     * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
     */
    create: XOR<SessionCreateInput, SessionUncheckedCreateInput>
    /**
     * In case the Session was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
  }

  /**
   * Session delete
   */
  export type SessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter which Session to delete.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session deleteMany
   */
  export type SessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to delete.
     */
    limit?: number
  }

  /**
   * Session without action
   */
  export type SessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
  }


  /**
   * Model Users
   */

  export type AggregateUsers = {
    _count: UsersCountAggregateOutputType | null
    _avg: UsersAvgAggregateOutputType | null
    _sum: UsersSumAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  export type UsersAvgAggregateOutputType = {
    login_attempts: number | null
  }

  export type UsersSumAggregateOutputType = {
    login_attempts: number | null
  }

  export type UsersMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    emailVerified: Date | null
    image: string | null
    password: string | null
    passwordResetToken: string | null
    passwordResetTokenExp: Date | null
    company: string | null
    plan: $Enums.PlanType | null
    subscription_type: $Enums.SubscriptionType | null
    subscription_start_date: Date | null
    subscription_end_date: Date | null
    is_active: boolean | null
    is_verified: boolean | null
    login_attempts: number | null
    locked_until: Date | null
    created_at: Date | null
    updated_at: Date | null
    jobTitle: string | null
    bio: string | null
    phone: string | null
  }

  export type UsersMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    emailVerified: Date | null
    image: string | null
    password: string | null
    passwordResetToken: string | null
    passwordResetTokenExp: Date | null
    company: string | null
    plan: $Enums.PlanType | null
    subscription_type: $Enums.SubscriptionType | null
    subscription_start_date: Date | null
    subscription_end_date: Date | null
    is_active: boolean | null
    is_verified: boolean | null
    login_attempts: number | null
    locked_until: Date | null
    created_at: Date | null
    updated_at: Date | null
    jobTitle: string | null
    bio: string | null
    phone: string | null
  }

  export type UsersCountAggregateOutputType = {
    id: number
    name: number
    email: number
    emailVerified: number
    image: number
    password: number
    passwordResetToken: number
    passwordResetTokenExp: number
    company: number
    plan: number
    subscription_type: number
    subscription_start_date: number
    subscription_end_date: number
    is_active: number
    is_verified: number
    login_attempts: number
    locked_until: number
    created_at: number
    updated_at: number
    jobTitle: number
    bio: number
    phone: number
    _all: number
  }


  export type UsersAvgAggregateInputType = {
    login_attempts?: true
  }

  export type UsersSumAggregateInputType = {
    login_attempts?: true
  }

  export type UsersMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    password?: true
    passwordResetToken?: true
    passwordResetTokenExp?: true
    company?: true
    plan?: true
    subscription_type?: true
    subscription_start_date?: true
    subscription_end_date?: true
    is_active?: true
    is_verified?: true
    login_attempts?: true
    locked_until?: true
    created_at?: true
    updated_at?: true
    jobTitle?: true
    bio?: true
    phone?: true
  }

  export type UsersMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    password?: true
    passwordResetToken?: true
    passwordResetTokenExp?: true
    company?: true
    plan?: true
    subscription_type?: true
    subscription_start_date?: true
    subscription_end_date?: true
    is_active?: true
    is_verified?: true
    login_attempts?: true
    locked_until?: true
    created_at?: true
    updated_at?: true
    jobTitle?: true
    bio?: true
    phone?: true
  }

  export type UsersCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    password?: true
    passwordResetToken?: true
    passwordResetTokenExp?: true
    company?: true
    plan?: true
    subscription_type?: true
    subscription_start_date?: true
    subscription_end_date?: true
    is_active?: true
    is_verified?: true
    login_attempts?: true
    locked_until?: true
    created_at?: true
    updated_at?: true
    jobTitle?: true
    bio?: true
    phone?: true
    _all?: true
  }

  export type UsersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to aggregate.
     */
    where?: UsersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UsersOrderByWithRelationInput | UsersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UsersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UsersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UsersAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UsersSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsersMaxAggregateInputType
  }

  export type GetUsersAggregateType<T extends UsersAggregateArgs> = {
        [P in keyof T & keyof AggregateUsers]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsers[P]>
      : GetScalarType<T[P], AggregateUsers[P]>
  }




  export type UsersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsersWhereInput
    orderBy?: UsersOrderByWithAggregationInput | UsersOrderByWithAggregationInput[]
    by: UsersScalarFieldEnum[] | UsersScalarFieldEnum
    having?: UsersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsersCountAggregateInputType | true
    _avg?: UsersAvgAggregateInputType
    _sum?: UsersSumAggregateInputType
    _min?: UsersMinAggregateInputType
    _max?: UsersMaxAggregateInputType
  }

  export type UsersGroupByOutputType = {
    id: string
    name: string
    email: string
    emailVerified: Date | null
    image: string | null
    password: string
    passwordResetToken: string | null
    passwordResetTokenExp: Date | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date: Date
    subscription_end_date: Date
    is_active: boolean
    is_verified: boolean
    login_attempts: number
    locked_until: Date | null
    created_at: Date
    updated_at: Date
    jobTitle: string | null
    bio: string | null
    phone: string | null
    _count: UsersCountAggregateOutputType | null
    _avg: UsersAvgAggregateOutputType | null
    _sum: UsersSumAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  type GetUsersGroupByPayload<T extends UsersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsersGroupByOutputType[P]>
            : GetScalarType<T[P], UsersGroupByOutputType[P]>
        }
      >
    >


  export type UsersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    password?: boolean
    passwordResetToken?: boolean
    passwordResetTokenExp?: boolean
    company?: boolean
    plan?: boolean
    subscription_type?: boolean
    subscription_start_date?: boolean
    subscription_end_date?: boolean
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: boolean
    locked_until?: boolean
    created_at?: boolean
    updated_at?: boolean
    jobTitle?: boolean
    bio?: boolean
    phone?: boolean
    accounts?: boolean | Users$accountsArgs<ExtArgs>
    sessions?: boolean | Users$sessionsArgs<ExtArgs>
    subscription?: boolean | Users$subscriptionArgs<ExtArgs>
    messages?: boolean | Users$messagesArgs<ExtArgs>
    documents?: boolean | Users$documentsArgs<ExtArgs>
    embeddings?: boolean | Users$embeddingsArgs<ExtArgs>
    chatConversations?: boolean | Users$chatConversationsArgs<ExtArgs>
    _count?: boolean | UsersCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["users"]>

  export type UsersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    password?: boolean
    passwordResetToken?: boolean
    passwordResetTokenExp?: boolean
    company?: boolean
    plan?: boolean
    subscription_type?: boolean
    subscription_start_date?: boolean
    subscription_end_date?: boolean
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: boolean
    locked_until?: boolean
    created_at?: boolean
    updated_at?: boolean
    jobTitle?: boolean
    bio?: boolean
    phone?: boolean
  }, ExtArgs["result"]["users"]>

  export type UsersSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    password?: boolean
    passwordResetToken?: boolean
    passwordResetTokenExp?: boolean
    company?: boolean
    plan?: boolean
    subscription_type?: boolean
    subscription_start_date?: boolean
    subscription_end_date?: boolean
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: boolean
    locked_until?: boolean
    created_at?: boolean
    updated_at?: boolean
    jobTitle?: boolean
    bio?: boolean
    phone?: boolean
  }, ExtArgs["result"]["users"]>

  export type UsersSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    password?: boolean
    passwordResetToken?: boolean
    passwordResetTokenExp?: boolean
    company?: boolean
    plan?: boolean
    subscription_type?: boolean
    subscription_start_date?: boolean
    subscription_end_date?: boolean
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: boolean
    locked_until?: boolean
    created_at?: boolean
    updated_at?: boolean
    jobTitle?: boolean
    bio?: boolean
    phone?: boolean
  }

  export type UsersOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "emailVerified" | "image" | "password" | "passwordResetToken" | "passwordResetTokenExp" | "company" | "plan" | "subscription_type" | "subscription_start_date" | "subscription_end_date" | "is_active" | "is_verified" | "login_attempts" | "locked_until" | "created_at" | "updated_at" | "jobTitle" | "bio" | "phone", ExtArgs["result"]["users"]>
  export type UsersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    accounts?: boolean | Users$accountsArgs<ExtArgs>
    sessions?: boolean | Users$sessionsArgs<ExtArgs>
    subscription?: boolean | Users$subscriptionArgs<ExtArgs>
    messages?: boolean | Users$messagesArgs<ExtArgs>
    documents?: boolean | Users$documentsArgs<ExtArgs>
    embeddings?: boolean | Users$embeddingsArgs<ExtArgs>
    chatConversations?: boolean | Users$chatConversationsArgs<ExtArgs>
    _count?: boolean | UsersCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UsersIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UsersIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UsersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Users"
    objects: {
      accounts: Prisma.$AccountPayload<ExtArgs>[]
      sessions: Prisma.$SessionPayload<ExtArgs>[]
      subscription: Prisma.$SubscriptionPayload<ExtArgs> | null
      messages: Prisma.$MessagePayload<ExtArgs>[]
      documents: Prisma.$DocumentPayload<ExtArgs>[]
      embeddings: Prisma.$EmbeddingPayload<ExtArgs>[]
      chatConversations: Prisma.$ChatConversationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      emailVerified: Date | null
      image: string | null
      password: string
      passwordResetToken: string | null
      passwordResetTokenExp: Date | null
      company: string
      plan: $Enums.PlanType
      subscription_type: $Enums.SubscriptionType
      subscription_start_date: Date
      subscription_end_date: Date
      is_active: boolean
      is_verified: boolean
      login_attempts: number
      locked_until: Date | null
      created_at: Date
      updated_at: Date
      jobTitle: string | null
      bio: string | null
      phone: string | null
    }, ExtArgs["result"]["users"]>
    composites: {}
  }

  type UsersGetPayload<S extends boolean | null | undefined | UsersDefaultArgs> = $Result.GetResult<Prisma.$UsersPayload, S>

  type UsersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UsersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsersCountAggregateInputType | true
    }

  export interface UsersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Users'], meta: { name: 'Users' } }
    /**
     * Find zero or one Users that matches the filter.
     * @param {UsersFindUniqueArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UsersFindUniqueArgs>(args: SelectSubset<T, UsersFindUniqueArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Users that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UsersFindUniqueOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UsersFindUniqueOrThrowArgs>(args: SelectSubset<T, UsersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersFindFirstArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UsersFindFirstArgs>(args?: SelectSubset<T, UsersFindFirstArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Users that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersFindFirstOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UsersFindFirstOrThrowArgs>(args?: SelectSubset<T, UsersFindFirstOrThrowArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.users.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.users.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const usersWithIdOnly = await prisma.users.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UsersFindManyArgs>(args?: SelectSubset<T, UsersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Users.
     * @param {UsersCreateArgs} args - Arguments to create a Users.
     * @example
     * // Create one Users
     * const Users = await prisma.users.create({
     *   data: {
     *     // ... data to create a Users
     *   }
     * })
     * 
     */
    create<T extends UsersCreateArgs>(args: SelectSubset<T, UsersCreateArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UsersCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const users = await prisma.users.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UsersCreateManyArgs>(args?: SelectSubset<T, UsersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UsersCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const users = await prisma.users.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const usersWithIdOnly = await prisma.users.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UsersCreateManyAndReturnArgs>(args?: SelectSubset<T, UsersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Users.
     * @param {UsersDeleteArgs} args - Arguments to delete one Users.
     * @example
     * // Delete one Users
     * const Users = await prisma.users.delete({
     *   where: {
     *     // ... filter to delete one Users
     *   }
     * })
     * 
     */
    delete<T extends UsersDeleteArgs>(args: SelectSubset<T, UsersDeleteArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Users.
     * @param {UsersUpdateArgs} args - Arguments to update one Users.
     * @example
     * // Update one Users
     * const users = await prisma.users.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UsersUpdateArgs>(args: SelectSubset<T, UsersUpdateArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UsersDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.users.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UsersDeleteManyArgs>(args?: SelectSubset<T, UsersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const users = await prisma.users.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UsersUpdateManyArgs>(args: SelectSubset<T, UsersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UsersUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const users = await prisma.users.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const usersWithIdOnly = await prisma.users.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UsersUpdateManyAndReturnArgs>(args: SelectSubset<T, UsersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Users.
     * @param {UsersUpsertArgs} args - Arguments to update or create a Users.
     * @example
     * // Update or create a Users
     * const users = await prisma.users.upsert({
     *   create: {
     *     // ... data to create a Users
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Users we want to update
     *   }
     * })
     */
    upsert<T extends UsersUpsertArgs>(args: SelectSubset<T, UsersUpsertArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.users.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UsersCountArgs>(
      args?: Subset<T, UsersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsersAggregateArgs>(args: Subset<T, UsersAggregateArgs>): Prisma.PrismaPromise<GetUsersAggregateType<T>>

    /**
     * Group by Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UsersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UsersGroupByArgs['orderBy'] }
        : { orderBy?: UsersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UsersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Users model
   */
  readonly fields: UsersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Users.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UsersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    accounts<T extends Users$accountsArgs<ExtArgs> = {}>(args?: Subset<T, Users$accountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    sessions<T extends Users$sessionsArgs<ExtArgs> = {}>(args?: Subset<T, Users$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    subscription<T extends Users$subscriptionArgs<ExtArgs> = {}>(args?: Subset<T, Users$subscriptionArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    messages<T extends Users$messagesArgs<ExtArgs> = {}>(args?: Subset<T, Users$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    documents<T extends Users$documentsArgs<ExtArgs> = {}>(args?: Subset<T, Users$documentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    embeddings<T extends Users$embeddingsArgs<ExtArgs> = {}>(args?: Subset<T, Users$embeddingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    chatConversations<T extends Users$chatConversationsArgs<ExtArgs> = {}>(args?: Subset<T, Users$chatConversationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Users model
   */
  interface UsersFieldRefs {
    readonly id: FieldRef<"Users", 'String'>
    readonly name: FieldRef<"Users", 'String'>
    readonly email: FieldRef<"Users", 'String'>
    readonly emailVerified: FieldRef<"Users", 'DateTime'>
    readonly image: FieldRef<"Users", 'String'>
    readonly password: FieldRef<"Users", 'String'>
    readonly passwordResetToken: FieldRef<"Users", 'String'>
    readonly passwordResetTokenExp: FieldRef<"Users", 'DateTime'>
    readonly company: FieldRef<"Users", 'String'>
    readonly plan: FieldRef<"Users", 'PlanType'>
    readonly subscription_type: FieldRef<"Users", 'SubscriptionType'>
    readonly subscription_start_date: FieldRef<"Users", 'DateTime'>
    readonly subscription_end_date: FieldRef<"Users", 'DateTime'>
    readonly is_active: FieldRef<"Users", 'Boolean'>
    readonly is_verified: FieldRef<"Users", 'Boolean'>
    readonly login_attempts: FieldRef<"Users", 'Int'>
    readonly locked_until: FieldRef<"Users", 'DateTime'>
    readonly created_at: FieldRef<"Users", 'DateTime'>
    readonly updated_at: FieldRef<"Users", 'DateTime'>
    readonly jobTitle: FieldRef<"Users", 'String'>
    readonly bio: FieldRef<"Users", 'String'>
    readonly phone: FieldRef<"Users", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Users findUnique
   */
  export type UsersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where: UsersWhereUniqueInput
  }

  /**
   * Users findUniqueOrThrow
   */
  export type UsersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where: UsersWhereUniqueInput
  }

  /**
   * Users findFirst
   */
  export type UsersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UsersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UsersOrderByWithRelationInput | UsersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UsersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * Users findFirstOrThrow
   */
  export type UsersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UsersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UsersOrderByWithRelationInput | UsersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UsersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * Users findMany
   */
  export type UsersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UsersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UsersOrderByWithRelationInput | UsersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UsersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * Users create
   */
  export type UsersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * The data needed to create a Users.
     */
    data: XOR<UsersCreateInput, UsersUncheckedCreateInput>
  }

  /**
   * Users createMany
   */
  export type UsersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UsersCreateManyInput | UsersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Users createManyAndReturn
   */
  export type UsersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UsersCreateManyInput | UsersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Users update
   */
  export type UsersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * The data needed to update a Users.
     */
    data: XOR<UsersUpdateInput, UsersUncheckedUpdateInput>
    /**
     * Choose, which Users to update.
     */
    where: UsersWhereUniqueInput
  }

  /**
   * Users updateMany
   */
  export type UsersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UsersUpdateManyMutationInput, UsersUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UsersWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * Users updateManyAndReturn
   */
  export type UsersUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UsersUpdateManyMutationInput, UsersUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UsersWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * Users upsert
   */
  export type UsersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * The filter to search for the Users to update in case it exists.
     */
    where: UsersWhereUniqueInput
    /**
     * In case the Users found by the `where` argument doesn't exist, create a new Users with this data.
     */
    create: XOR<UsersCreateInput, UsersUncheckedCreateInput>
    /**
     * In case the Users was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UsersUpdateInput, UsersUncheckedUpdateInput>
  }

  /**
   * Users delete
   */
  export type UsersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
    /**
     * Filter which Users to delete.
     */
    where: UsersWhereUniqueInput
  }

  /**
   * Users deleteMany
   */
  export type UsersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UsersWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * Users.accounts
   */
  export type Users$accountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    cursor?: AccountWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Users.sessions
   */
  export type Users$sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    cursor?: SessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Users.subscription
   */
  export type Users$subscriptionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    where?: SubscriptionWhereInput
  }

  /**
   * Users.messages
   */
  export type Users$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    where?: MessageWhereInput
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    cursor?: MessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Users.documents
   */
  export type Users$documentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    where?: DocumentWhereInput
    orderBy?: DocumentOrderByWithRelationInput | DocumentOrderByWithRelationInput[]
    cursor?: DocumentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DocumentScalarFieldEnum | DocumentScalarFieldEnum[]
  }

  /**
   * Users.embeddings
   */
  export type Users$embeddingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingInclude<ExtArgs> | null
    where?: EmbeddingWhereInput
    orderBy?: EmbeddingOrderByWithRelationInput | EmbeddingOrderByWithRelationInput[]
    cursor?: EmbeddingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmbeddingScalarFieldEnum | EmbeddingScalarFieldEnum[]
  }

  /**
   * Users.chatConversations
   */
  export type Users$chatConversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatConversation
     */
    omit?: ChatConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatConversationInclude<ExtArgs> | null
    where?: ChatConversationWhereInput
    orderBy?: ChatConversationOrderByWithRelationInput | ChatConversationOrderByWithRelationInput[]
    cursor?: ChatConversationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ChatConversationScalarFieldEnum | ChatConversationScalarFieldEnum[]
  }

  /**
   * Users without action
   */
  export type UsersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Users
     */
    select?: UsersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Users
     */
    omit?: UsersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsersInclude<ExtArgs> | null
  }


  /**
   * Model VerificationToken
   */

  export type AggregateVerificationToken = {
    _count: VerificationTokenCountAggregateOutputType | null
    _min: VerificationTokenMinAggregateOutputType | null
    _max: VerificationTokenMaxAggregateOutputType | null
  }

  export type VerificationTokenMinAggregateOutputType = {
    identifier: string | null
    token: string | null
    expires: Date | null
  }

  export type VerificationTokenMaxAggregateOutputType = {
    identifier: string | null
    token: string | null
    expires: Date | null
  }

  export type VerificationTokenCountAggregateOutputType = {
    identifier: number
    token: number
    expires: number
    _all: number
  }


  export type VerificationTokenMinAggregateInputType = {
    identifier?: true
    token?: true
    expires?: true
  }

  export type VerificationTokenMaxAggregateInputType = {
    identifier?: true
    token?: true
    expires?: true
  }

  export type VerificationTokenCountAggregateInputType = {
    identifier?: true
    token?: true
    expires?: true
    _all?: true
  }

  export type VerificationTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationToken to aggregate.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VerificationTokens
    **/
    _count?: true | VerificationTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VerificationTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VerificationTokenMaxAggregateInputType
  }

  export type GetVerificationTokenAggregateType<T extends VerificationTokenAggregateArgs> = {
        [P in keyof T & keyof AggregateVerificationToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVerificationToken[P]>
      : GetScalarType<T[P], AggregateVerificationToken[P]>
  }




  export type VerificationTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VerificationTokenWhereInput
    orderBy?: VerificationTokenOrderByWithAggregationInput | VerificationTokenOrderByWithAggregationInput[]
    by: VerificationTokenScalarFieldEnum[] | VerificationTokenScalarFieldEnum
    having?: VerificationTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VerificationTokenCountAggregateInputType | true
    _min?: VerificationTokenMinAggregateInputType
    _max?: VerificationTokenMaxAggregateInputType
  }

  export type VerificationTokenGroupByOutputType = {
    identifier: string
    token: string
    expires: Date
    _count: VerificationTokenCountAggregateOutputType | null
    _min: VerificationTokenMinAggregateOutputType | null
    _max: VerificationTokenMaxAggregateOutputType | null
  }

  type GetVerificationTokenGroupByPayload<T extends VerificationTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VerificationTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VerificationTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VerificationTokenGroupByOutputType[P]>
            : GetScalarType<T[P], VerificationTokenGroupByOutputType[P]>
        }
      >
    >


  export type VerificationTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }, ExtArgs["result"]["verificationToken"]>

  export type VerificationTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }, ExtArgs["result"]["verificationToken"]>

  export type VerificationTokenSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }, ExtArgs["result"]["verificationToken"]>

  export type VerificationTokenSelectScalar = {
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }

  export type VerificationTokenOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"identifier" | "token" | "expires", ExtArgs["result"]["verificationToken"]>

  export type $VerificationTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VerificationToken"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      identifier: string
      token: string
      expires: Date
    }, ExtArgs["result"]["verificationToken"]>
    composites: {}
  }

  type VerificationTokenGetPayload<S extends boolean | null | undefined | VerificationTokenDefaultArgs> = $Result.GetResult<Prisma.$VerificationTokenPayload, S>

  type VerificationTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VerificationTokenFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VerificationTokenCountAggregateInputType | true
    }

  export interface VerificationTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VerificationToken'], meta: { name: 'VerificationToken' } }
    /**
     * Find zero or one VerificationToken that matches the filter.
     * @param {VerificationTokenFindUniqueArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VerificationTokenFindUniqueArgs>(args: SelectSubset<T, VerificationTokenFindUniqueArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VerificationToken that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VerificationTokenFindUniqueOrThrowArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VerificationTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, VerificationTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VerificationToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenFindFirstArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VerificationTokenFindFirstArgs>(args?: SelectSubset<T, VerificationTokenFindFirstArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VerificationToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenFindFirstOrThrowArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VerificationTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, VerificationTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VerificationTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VerificationTokens
     * const verificationTokens = await prisma.verificationToken.findMany()
     * 
     * // Get first 10 VerificationTokens
     * const verificationTokens = await prisma.verificationToken.findMany({ take: 10 })
     * 
     * // Only select the `identifier`
     * const verificationTokenWithIdentifierOnly = await prisma.verificationToken.findMany({ select: { identifier: true } })
     * 
     */
    findMany<T extends VerificationTokenFindManyArgs>(args?: SelectSubset<T, VerificationTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VerificationToken.
     * @param {VerificationTokenCreateArgs} args - Arguments to create a VerificationToken.
     * @example
     * // Create one VerificationToken
     * const VerificationToken = await prisma.verificationToken.create({
     *   data: {
     *     // ... data to create a VerificationToken
     *   }
     * })
     * 
     */
    create<T extends VerificationTokenCreateArgs>(args: SelectSubset<T, VerificationTokenCreateArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VerificationTokens.
     * @param {VerificationTokenCreateManyArgs} args - Arguments to create many VerificationTokens.
     * @example
     * // Create many VerificationTokens
     * const verificationToken = await prisma.verificationToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VerificationTokenCreateManyArgs>(args?: SelectSubset<T, VerificationTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VerificationTokens and returns the data saved in the database.
     * @param {VerificationTokenCreateManyAndReturnArgs} args - Arguments to create many VerificationTokens.
     * @example
     * // Create many VerificationTokens
     * const verificationToken = await prisma.verificationToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VerificationTokens and only return the `identifier`
     * const verificationTokenWithIdentifierOnly = await prisma.verificationToken.createManyAndReturn({
     *   select: { identifier: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VerificationTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, VerificationTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VerificationToken.
     * @param {VerificationTokenDeleteArgs} args - Arguments to delete one VerificationToken.
     * @example
     * // Delete one VerificationToken
     * const VerificationToken = await prisma.verificationToken.delete({
     *   where: {
     *     // ... filter to delete one VerificationToken
     *   }
     * })
     * 
     */
    delete<T extends VerificationTokenDeleteArgs>(args: SelectSubset<T, VerificationTokenDeleteArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VerificationToken.
     * @param {VerificationTokenUpdateArgs} args - Arguments to update one VerificationToken.
     * @example
     * // Update one VerificationToken
     * const verificationToken = await prisma.verificationToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VerificationTokenUpdateArgs>(args: SelectSubset<T, VerificationTokenUpdateArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VerificationTokens.
     * @param {VerificationTokenDeleteManyArgs} args - Arguments to filter VerificationTokens to delete.
     * @example
     * // Delete a few VerificationTokens
     * const { count } = await prisma.verificationToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VerificationTokenDeleteManyArgs>(args?: SelectSubset<T, VerificationTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VerificationTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VerificationTokens
     * const verificationToken = await prisma.verificationToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VerificationTokenUpdateManyArgs>(args: SelectSubset<T, VerificationTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VerificationTokens and returns the data updated in the database.
     * @param {VerificationTokenUpdateManyAndReturnArgs} args - Arguments to update many VerificationTokens.
     * @example
     * // Update many VerificationTokens
     * const verificationToken = await prisma.verificationToken.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VerificationTokens and only return the `identifier`
     * const verificationTokenWithIdentifierOnly = await prisma.verificationToken.updateManyAndReturn({
     *   select: { identifier: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VerificationTokenUpdateManyAndReturnArgs>(args: SelectSubset<T, VerificationTokenUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VerificationToken.
     * @param {VerificationTokenUpsertArgs} args - Arguments to update or create a VerificationToken.
     * @example
     * // Update or create a VerificationToken
     * const verificationToken = await prisma.verificationToken.upsert({
     *   create: {
     *     // ... data to create a VerificationToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VerificationToken we want to update
     *   }
     * })
     */
    upsert<T extends VerificationTokenUpsertArgs>(args: SelectSubset<T, VerificationTokenUpsertArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VerificationTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenCountArgs} args - Arguments to filter VerificationTokens to count.
     * @example
     * // Count the number of VerificationTokens
     * const count = await prisma.verificationToken.count({
     *   where: {
     *     // ... the filter for the VerificationTokens we want to count
     *   }
     * })
    **/
    count<T extends VerificationTokenCountArgs>(
      args?: Subset<T, VerificationTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VerificationTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VerificationToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VerificationTokenAggregateArgs>(args: Subset<T, VerificationTokenAggregateArgs>): Prisma.PrismaPromise<GetVerificationTokenAggregateType<T>>

    /**
     * Group by VerificationToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VerificationTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VerificationTokenGroupByArgs['orderBy'] }
        : { orderBy?: VerificationTokenGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VerificationTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VerificationToken model
   */
  readonly fields: VerificationTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VerificationToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VerificationTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VerificationToken model
   */
  interface VerificationTokenFieldRefs {
    readonly identifier: FieldRef<"VerificationToken", 'String'>
    readonly token: FieldRef<"VerificationToken", 'String'>
    readonly expires: FieldRef<"VerificationToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * VerificationToken findUnique
   */
  export type VerificationTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken findUniqueOrThrow
   */
  export type VerificationTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken findFirst
   */
  export type VerificationTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VerificationTokens.
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VerificationTokens.
     */
    distinct?: VerificationTokenScalarFieldEnum | VerificationTokenScalarFieldEnum[]
  }

  /**
   * VerificationToken findFirstOrThrow
   */
  export type VerificationTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VerificationTokens.
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VerificationTokens.
     */
    distinct?: VerificationTokenScalarFieldEnum | VerificationTokenScalarFieldEnum[]
  }

  /**
   * VerificationToken findMany
   */
  export type VerificationTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationTokens to fetch.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VerificationTokens.
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    distinct?: VerificationTokenScalarFieldEnum | VerificationTokenScalarFieldEnum[]
  }

  /**
   * VerificationToken create
   */
  export type VerificationTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data needed to create a VerificationToken.
     */
    data: XOR<VerificationTokenCreateInput, VerificationTokenUncheckedCreateInput>
  }

  /**
   * VerificationToken createMany
   */
  export type VerificationTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VerificationTokens.
     */
    data: VerificationTokenCreateManyInput | VerificationTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VerificationToken createManyAndReturn
   */
  export type VerificationTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data used to create many VerificationTokens.
     */
    data: VerificationTokenCreateManyInput | VerificationTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VerificationToken update
   */
  export type VerificationTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data needed to update a VerificationToken.
     */
    data: XOR<VerificationTokenUpdateInput, VerificationTokenUncheckedUpdateInput>
    /**
     * Choose, which VerificationToken to update.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken updateMany
   */
  export type VerificationTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VerificationTokens.
     */
    data: XOR<VerificationTokenUpdateManyMutationInput, VerificationTokenUncheckedUpdateManyInput>
    /**
     * Filter which VerificationTokens to update
     */
    where?: VerificationTokenWhereInput
    /**
     * Limit how many VerificationTokens to update.
     */
    limit?: number
  }

  /**
   * VerificationToken updateManyAndReturn
   */
  export type VerificationTokenUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data used to update VerificationTokens.
     */
    data: XOR<VerificationTokenUpdateManyMutationInput, VerificationTokenUncheckedUpdateManyInput>
    /**
     * Filter which VerificationTokens to update
     */
    where?: VerificationTokenWhereInput
    /**
     * Limit how many VerificationTokens to update.
     */
    limit?: number
  }

  /**
   * VerificationToken upsert
   */
  export type VerificationTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The filter to search for the VerificationToken to update in case it exists.
     */
    where: VerificationTokenWhereUniqueInput
    /**
     * In case the VerificationToken found by the `where` argument doesn't exist, create a new VerificationToken with this data.
     */
    create: XOR<VerificationTokenCreateInput, VerificationTokenUncheckedCreateInput>
    /**
     * In case the VerificationToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VerificationTokenUpdateInput, VerificationTokenUncheckedUpdateInput>
  }

  /**
   * VerificationToken delete
   */
  export type VerificationTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter which VerificationToken to delete.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken deleteMany
   */
  export type VerificationTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationTokens to delete
     */
    where?: VerificationTokenWhereInput
    /**
     * Limit how many VerificationTokens to delete.
     */
    limit?: number
  }

  /**
   * VerificationToken without action
   */
  export type VerificationTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
  }


  /**
   * Model SubscriptionPlan
   */

  export type AggregateSubscriptionPlan = {
    _count: SubscriptionPlanCountAggregateOutputType | null
    _avg: SubscriptionPlanAvgAggregateOutputType | null
    _sum: SubscriptionPlanSumAggregateOutputType | null
    _min: SubscriptionPlanMinAggregateOutputType | null
    _max: SubscriptionPlanMaxAggregateOutputType | null
  }

  export type SubscriptionPlanAvgAggregateOutputType = {
    price: number | null
  }

  export type SubscriptionPlanSumAggregateOutputType = {
    price: number | null
  }

  export type SubscriptionPlanMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    price: number | null
    currency: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SubscriptionPlanMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    price: number | null
    currency: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SubscriptionPlanCountAggregateOutputType = {
    id: number
    name: number
    description: number
    price: number
    currency: number
    features: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SubscriptionPlanAvgAggregateInputType = {
    price?: true
  }

  export type SubscriptionPlanSumAggregateInputType = {
    price?: true
  }

  export type SubscriptionPlanMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    price?: true
    currency?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SubscriptionPlanMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    price?: true
    currency?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SubscriptionPlanCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    price?: true
    currency?: true
    features?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SubscriptionPlanAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SubscriptionPlan to aggregate.
     */
    where?: SubscriptionPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SubscriptionPlans to fetch.
     */
    orderBy?: SubscriptionPlanOrderByWithRelationInput | SubscriptionPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SubscriptionPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SubscriptionPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SubscriptionPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SubscriptionPlans
    **/
    _count?: true | SubscriptionPlanCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SubscriptionPlanAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SubscriptionPlanSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SubscriptionPlanMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SubscriptionPlanMaxAggregateInputType
  }

  export type GetSubscriptionPlanAggregateType<T extends SubscriptionPlanAggregateArgs> = {
        [P in keyof T & keyof AggregateSubscriptionPlan]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSubscriptionPlan[P]>
      : GetScalarType<T[P], AggregateSubscriptionPlan[P]>
  }




  export type SubscriptionPlanGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubscriptionPlanWhereInput
    orderBy?: SubscriptionPlanOrderByWithAggregationInput | SubscriptionPlanOrderByWithAggregationInput[]
    by: SubscriptionPlanScalarFieldEnum[] | SubscriptionPlanScalarFieldEnum
    having?: SubscriptionPlanScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SubscriptionPlanCountAggregateInputType | true
    _avg?: SubscriptionPlanAvgAggregateInputType
    _sum?: SubscriptionPlanSumAggregateInputType
    _min?: SubscriptionPlanMinAggregateInputType
    _max?: SubscriptionPlanMaxAggregateInputType
  }

  export type SubscriptionPlanGroupByOutputType = {
    id: string
    name: string
    description: string
    price: number
    currency: string
    features: string[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: SubscriptionPlanCountAggregateOutputType | null
    _avg: SubscriptionPlanAvgAggregateOutputType | null
    _sum: SubscriptionPlanSumAggregateOutputType | null
    _min: SubscriptionPlanMinAggregateOutputType | null
    _max: SubscriptionPlanMaxAggregateOutputType | null
  }

  type GetSubscriptionPlanGroupByPayload<T extends SubscriptionPlanGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SubscriptionPlanGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SubscriptionPlanGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SubscriptionPlanGroupByOutputType[P]>
            : GetScalarType<T[P], SubscriptionPlanGroupByOutputType[P]>
        }
      >
    >


  export type SubscriptionPlanSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    currency?: boolean
    features?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    subscriptions?: boolean | SubscriptionPlan$subscriptionsArgs<ExtArgs>
    _count?: boolean | SubscriptionPlanCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subscriptionPlan"]>

  export type SubscriptionPlanSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    currency?: boolean
    features?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["subscriptionPlan"]>

  export type SubscriptionPlanSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    currency?: boolean
    features?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["subscriptionPlan"]>

  export type SubscriptionPlanSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    currency?: boolean
    features?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SubscriptionPlanOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "price" | "currency" | "features" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["subscriptionPlan"]>
  export type SubscriptionPlanInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subscriptions?: boolean | SubscriptionPlan$subscriptionsArgs<ExtArgs>
    _count?: boolean | SubscriptionPlanCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SubscriptionPlanIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SubscriptionPlanIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SubscriptionPlanPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SubscriptionPlan"
    objects: {
      subscriptions: Prisma.$SubscriptionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string
      price: number
      currency: string
      features: string[]
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["subscriptionPlan"]>
    composites: {}
  }

  type SubscriptionPlanGetPayload<S extends boolean | null | undefined | SubscriptionPlanDefaultArgs> = $Result.GetResult<Prisma.$SubscriptionPlanPayload, S>

  type SubscriptionPlanCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SubscriptionPlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SubscriptionPlanCountAggregateInputType | true
    }

  export interface SubscriptionPlanDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SubscriptionPlan'], meta: { name: 'SubscriptionPlan' } }
    /**
     * Find zero or one SubscriptionPlan that matches the filter.
     * @param {SubscriptionPlanFindUniqueArgs} args - Arguments to find a SubscriptionPlan
     * @example
     * // Get one SubscriptionPlan
     * const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SubscriptionPlanFindUniqueArgs>(args: SelectSubset<T, SubscriptionPlanFindUniqueArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SubscriptionPlan that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SubscriptionPlanFindUniqueOrThrowArgs} args - Arguments to find a SubscriptionPlan
     * @example
     * // Get one SubscriptionPlan
     * const subscriptionPlan = await prisma.subscriptionPlan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SubscriptionPlanFindUniqueOrThrowArgs>(args: SelectSubset<T, SubscriptionPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SubscriptionPlan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanFindFirstArgs} args - Arguments to find a SubscriptionPlan
     * @example
     * // Get one SubscriptionPlan
     * const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SubscriptionPlanFindFirstArgs>(args?: SelectSubset<T, SubscriptionPlanFindFirstArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SubscriptionPlan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanFindFirstOrThrowArgs} args - Arguments to find a SubscriptionPlan
     * @example
     * // Get one SubscriptionPlan
     * const subscriptionPlan = await prisma.subscriptionPlan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SubscriptionPlanFindFirstOrThrowArgs>(args?: SelectSubset<T, SubscriptionPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SubscriptionPlans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SubscriptionPlans
     * const subscriptionPlans = await prisma.subscriptionPlan.findMany()
     * 
     * // Get first 10 SubscriptionPlans
     * const subscriptionPlans = await prisma.subscriptionPlan.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const subscriptionPlanWithIdOnly = await prisma.subscriptionPlan.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SubscriptionPlanFindManyArgs>(args?: SelectSubset<T, SubscriptionPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SubscriptionPlan.
     * @param {SubscriptionPlanCreateArgs} args - Arguments to create a SubscriptionPlan.
     * @example
     * // Create one SubscriptionPlan
     * const SubscriptionPlan = await prisma.subscriptionPlan.create({
     *   data: {
     *     // ... data to create a SubscriptionPlan
     *   }
     * })
     * 
     */
    create<T extends SubscriptionPlanCreateArgs>(args: SelectSubset<T, SubscriptionPlanCreateArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SubscriptionPlans.
     * @param {SubscriptionPlanCreateManyArgs} args - Arguments to create many SubscriptionPlans.
     * @example
     * // Create many SubscriptionPlans
     * const subscriptionPlan = await prisma.subscriptionPlan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SubscriptionPlanCreateManyArgs>(args?: SelectSubset<T, SubscriptionPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SubscriptionPlans and returns the data saved in the database.
     * @param {SubscriptionPlanCreateManyAndReturnArgs} args - Arguments to create many SubscriptionPlans.
     * @example
     * // Create many SubscriptionPlans
     * const subscriptionPlan = await prisma.subscriptionPlan.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SubscriptionPlans and only return the `id`
     * const subscriptionPlanWithIdOnly = await prisma.subscriptionPlan.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SubscriptionPlanCreateManyAndReturnArgs>(args?: SelectSubset<T, SubscriptionPlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SubscriptionPlan.
     * @param {SubscriptionPlanDeleteArgs} args - Arguments to delete one SubscriptionPlan.
     * @example
     * // Delete one SubscriptionPlan
     * const SubscriptionPlan = await prisma.subscriptionPlan.delete({
     *   where: {
     *     // ... filter to delete one SubscriptionPlan
     *   }
     * })
     * 
     */
    delete<T extends SubscriptionPlanDeleteArgs>(args: SelectSubset<T, SubscriptionPlanDeleteArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SubscriptionPlan.
     * @param {SubscriptionPlanUpdateArgs} args - Arguments to update one SubscriptionPlan.
     * @example
     * // Update one SubscriptionPlan
     * const subscriptionPlan = await prisma.subscriptionPlan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SubscriptionPlanUpdateArgs>(args: SelectSubset<T, SubscriptionPlanUpdateArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SubscriptionPlans.
     * @param {SubscriptionPlanDeleteManyArgs} args - Arguments to filter SubscriptionPlans to delete.
     * @example
     * // Delete a few SubscriptionPlans
     * const { count } = await prisma.subscriptionPlan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SubscriptionPlanDeleteManyArgs>(args?: SelectSubset<T, SubscriptionPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SubscriptionPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SubscriptionPlans
     * const subscriptionPlan = await prisma.subscriptionPlan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SubscriptionPlanUpdateManyArgs>(args: SelectSubset<T, SubscriptionPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SubscriptionPlans and returns the data updated in the database.
     * @param {SubscriptionPlanUpdateManyAndReturnArgs} args - Arguments to update many SubscriptionPlans.
     * @example
     * // Update many SubscriptionPlans
     * const subscriptionPlan = await prisma.subscriptionPlan.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SubscriptionPlans and only return the `id`
     * const subscriptionPlanWithIdOnly = await prisma.subscriptionPlan.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SubscriptionPlanUpdateManyAndReturnArgs>(args: SelectSubset<T, SubscriptionPlanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SubscriptionPlan.
     * @param {SubscriptionPlanUpsertArgs} args - Arguments to update or create a SubscriptionPlan.
     * @example
     * // Update or create a SubscriptionPlan
     * const subscriptionPlan = await prisma.subscriptionPlan.upsert({
     *   create: {
     *     // ... data to create a SubscriptionPlan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SubscriptionPlan we want to update
     *   }
     * })
     */
    upsert<T extends SubscriptionPlanUpsertArgs>(args: SelectSubset<T, SubscriptionPlanUpsertArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SubscriptionPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanCountArgs} args - Arguments to filter SubscriptionPlans to count.
     * @example
     * // Count the number of SubscriptionPlans
     * const count = await prisma.subscriptionPlan.count({
     *   where: {
     *     // ... the filter for the SubscriptionPlans we want to count
     *   }
     * })
    **/
    count<T extends SubscriptionPlanCountArgs>(
      args?: Subset<T, SubscriptionPlanCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SubscriptionPlanCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SubscriptionPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SubscriptionPlanAggregateArgs>(args: Subset<T, SubscriptionPlanAggregateArgs>): Prisma.PrismaPromise<GetSubscriptionPlanAggregateType<T>>

    /**
     * Group by SubscriptionPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SubscriptionPlanGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SubscriptionPlanGroupByArgs['orderBy'] }
        : { orderBy?: SubscriptionPlanGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SubscriptionPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSubscriptionPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SubscriptionPlan model
   */
  readonly fields: SubscriptionPlanFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SubscriptionPlan.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SubscriptionPlanClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    subscriptions<T extends SubscriptionPlan$subscriptionsArgs<ExtArgs> = {}>(args?: Subset<T, SubscriptionPlan$subscriptionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SubscriptionPlan model
   */
  interface SubscriptionPlanFieldRefs {
    readonly id: FieldRef<"SubscriptionPlan", 'String'>
    readonly name: FieldRef<"SubscriptionPlan", 'String'>
    readonly description: FieldRef<"SubscriptionPlan", 'String'>
    readonly price: FieldRef<"SubscriptionPlan", 'Float'>
    readonly currency: FieldRef<"SubscriptionPlan", 'String'>
    readonly features: FieldRef<"SubscriptionPlan", 'String[]'>
    readonly isActive: FieldRef<"SubscriptionPlan", 'Boolean'>
    readonly createdAt: FieldRef<"SubscriptionPlan", 'DateTime'>
    readonly updatedAt: FieldRef<"SubscriptionPlan", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SubscriptionPlan findUnique
   */
  export type SubscriptionPlanFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionPlanInclude<ExtArgs> | null
    /**
     * Filter, which SubscriptionPlan to fetch.
     */
    where: SubscriptionPlanWhereUniqueInput
  }

  /**
   * SubscriptionPlan findUniqueOrThrow
   */
  export type SubscriptionPlanFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionPlanInclude<ExtArgs> | null
    /**
     * Filter, which SubscriptionPlan to fetch.
     */
    where: SubscriptionPlanWhereUniqueInput
  }

  /**
   * SubscriptionPlan findFirst
   */
  export type SubscriptionPlanFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionPlanInclude<ExtArgs> | null
    /**
     * Filter, which SubscriptionPlan to fetch.
     */
    where?: SubscriptionPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SubscriptionPlans to fetch.
     */
    orderBy?: SubscriptionPlanOrderByWithRelationInput | SubscriptionPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SubscriptionPlans.
     */
    cursor?: SubscriptionPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SubscriptionPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SubscriptionPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SubscriptionPlans.
     */
    distinct?: SubscriptionPlanScalarFieldEnum | SubscriptionPlanScalarFieldEnum[]
  }

  /**
   * SubscriptionPlan findFirstOrThrow
   */
  export type SubscriptionPlanFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionPlanInclude<ExtArgs> | null
    /**
     * Filter, which SubscriptionPlan to fetch.
     */
    where?: SubscriptionPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SubscriptionPlans to fetch.
     */
    orderBy?: SubscriptionPlanOrderByWithRelationInput | SubscriptionPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SubscriptionPlans.
     */
    cursor?: SubscriptionPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SubscriptionPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SubscriptionPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SubscriptionPlans.
     */
    distinct?: SubscriptionPlanScalarFieldEnum | SubscriptionPlanScalarFieldEnum[]
  }

  /**
   * SubscriptionPlan findMany
   */
  export type SubscriptionPlanFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionPlanInclude<ExtArgs> | null
    /**
     * Filter, which SubscriptionPlans to fetch.
     */
    where?: SubscriptionPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SubscriptionPlans to fetch.
     */
    orderBy?: SubscriptionPlanOrderByWithRelationInput | SubscriptionPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SubscriptionPlans.
     */
    cursor?: SubscriptionPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SubscriptionPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SubscriptionPlans.
     */
    skip?: number
    distinct?: SubscriptionPlanScalarFieldEnum | SubscriptionPlanScalarFieldEnum[]
  }

  /**
   * SubscriptionPlan create
   */
  export type SubscriptionPlanCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionPlanInclude<ExtArgs> | null
    /**
     * The data needed to create a SubscriptionPlan.
     */
    data: XOR<SubscriptionPlanCreateInput, SubscriptionPlanUncheckedCreateInput>
  }

  /**
   * SubscriptionPlan createMany
   */
  export type SubscriptionPlanCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SubscriptionPlans.
     */
    data: SubscriptionPlanCreateManyInput | SubscriptionPlanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SubscriptionPlan createManyAndReturn
   */
  export type SubscriptionPlanCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * The data used to create many SubscriptionPlans.
     */
    data: SubscriptionPlanCreateManyInput | SubscriptionPlanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SubscriptionPlan update
   */
  export type SubscriptionPlanUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionPlanInclude<ExtArgs> | null
    /**
     * The data needed to update a SubscriptionPlan.
     */
    data: XOR<SubscriptionPlanUpdateInput, SubscriptionPlanUncheckedUpdateInput>
    /**
     * Choose, which SubscriptionPlan to update.
     */
    where: SubscriptionPlanWhereUniqueInput
  }

  /**
   * SubscriptionPlan updateMany
   */
  export type SubscriptionPlanUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SubscriptionPlans.
     */
    data: XOR<SubscriptionPlanUpdateManyMutationInput, SubscriptionPlanUncheckedUpdateManyInput>
    /**
     * Filter which SubscriptionPlans to update
     */
    where?: SubscriptionPlanWhereInput
    /**
     * Limit how many SubscriptionPlans to update.
     */
    limit?: number
  }

  /**
   * SubscriptionPlan updateManyAndReturn
   */
  export type SubscriptionPlanUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * The data used to update SubscriptionPlans.
     */
    data: XOR<SubscriptionPlanUpdateManyMutationInput, SubscriptionPlanUncheckedUpdateManyInput>
    /**
     * Filter which SubscriptionPlans to update
     */
    where?: SubscriptionPlanWhereInput
    /**
     * Limit how many SubscriptionPlans to update.
     */
    limit?: number
  }

  /**
   * SubscriptionPlan upsert
   */
  export type SubscriptionPlanUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionPlanInclude<ExtArgs> | null
    /**
     * The filter to search for the SubscriptionPlan to update in case it exists.
     */
    where: SubscriptionPlanWhereUniqueInput
    /**
     * In case the SubscriptionPlan found by the `where` argument doesn't exist, create a new SubscriptionPlan with this data.
     */
    create: XOR<SubscriptionPlanCreateInput, SubscriptionPlanUncheckedCreateInput>
    /**
     * In case the SubscriptionPlan was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SubscriptionPlanUpdateInput, SubscriptionPlanUncheckedUpdateInput>
  }

  /**
   * SubscriptionPlan delete
   */
  export type SubscriptionPlanDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionPlanInclude<ExtArgs> | null
    /**
     * Filter which SubscriptionPlan to delete.
     */
    where: SubscriptionPlanWhereUniqueInput
  }

  /**
   * SubscriptionPlan deleteMany
   */
  export type SubscriptionPlanDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SubscriptionPlans to delete
     */
    where?: SubscriptionPlanWhereInput
    /**
     * Limit how many SubscriptionPlans to delete.
     */
    limit?: number
  }

  /**
   * SubscriptionPlan.subscriptions
   */
  export type SubscriptionPlan$subscriptionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    where?: SubscriptionWhereInput
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    cursor?: SubscriptionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SubscriptionScalarFieldEnum | SubscriptionScalarFieldEnum[]
  }

  /**
   * SubscriptionPlan without action
   */
  export type SubscriptionPlanDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionPlanInclude<ExtArgs> | null
  }


  /**
   * Model Subscription
   */

  export type AggregateSubscription = {
    _count: SubscriptionCountAggregateOutputType | null
    _avg: SubscriptionAvgAggregateOutputType | null
    _sum: SubscriptionSumAggregateOutputType | null
    _min: SubscriptionMinAggregateOutputType | null
    _max: SubscriptionMaxAggregateOutputType | null
  }

  export type SubscriptionAvgAggregateOutputType = {
    lastPaymentAmount: number | null
  }

  export type SubscriptionSumAggregateOutputType = {
    lastPaymentAmount: number | null
  }

  export type SubscriptionMinAggregateOutputType = {
    id: string | null
    userId: string | null
    planId: string | null
    razorpaySubscriptionId: string | null
    razorpayCustomerId: string | null
    status: string | null
    currentPeriodStart: Date | null
    currentPeriodEnd: Date | null
    cancelledAt: Date | null
    lastPaymentId: string | null
    lastPaymentAmount: number | null
    lastPaymentDate: Date | null
    lastPaymentError: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SubscriptionMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    planId: string | null
    razorpaySubscriptionId: string | null
    razorpayCustomerId: string | null
    status: string | null
    currentPeriodStart: Date | null
    currentPeriodEnd: Date | null
    cancelledAt: Date | null
    lastPaymentId: string | null
    lastPaymentAmount: number | null
    lastPaymentDate: Date | null
    lastPaymentError: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SubscriptionCountAggregateOutputType = {
    id: number
    userId: number
    planId: number
    razorpaySubscriptionId: number
    razorpayCustomerId: number
    status: number
    currentPeriodStart: number
    currentPeriodEnd: number
    cancelledAt: number
    lastPaymentId: number
    lastPaymentAmount: number
    lastPaymentDate: number
    lastPaymentError: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SubscriptionAvgAggregateInputType = {
    lastPaymentAmount?: true
  }

  export type SubscriptionSumAggregateInputType = {
    lastPaymentAmount?: true
  }

  export type SubscriptionMinAggregateInputType = {
    id?: true
    userId?: true
    planId?: true
    razorpaySubscriptionId?: true
    razorpayCustomerId?: true
    status?: true
    currentPeriodStart?: true
    currentPeriodEnd?: true
    cancelledAt?: true
    lastPaymentId?: true
    lastPaymentAmount?: true
    lastPaymentDate?: true
    lastPaymentError?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SubscriptionMaxAggregateInputType = {
    id?: true
    userId?: true
    planId?: true
    razorpaySubscriptionId?: true
    razorpayCustomerId?: true
    status?: true
    currentPeriodStart?: true
    currentPeriodEnd?: true
    cancelledAt?: true
    lastPaymentId?: true
    lastPaymentAmount?: true
    lastPaymentDate?: true
    lastPaymentError?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SubscriptionCountAggregateInputType = {
    id?: true
    userId?: true
    planId?: true
    razorpaySubscriptionId?: true
    razorpayCustomerId?: true
    status?: true
    currentPeriodStart?: true
    currentPeriodEnd?: true
    cancelledAt?: true
    lastPaymentId?: true
    lastPaymentAmount?: true
    lastPaymentDate?: true
    lastPaymentError?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SubscriptionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Subscription to aggregate.
     */
    where?: SubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subscriptions to fetch.
     */
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Subscriptions
    **/
    _count?: true | SubscriptionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SubscriptionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SubscriptionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SubscriptionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SubscriptionMaxAggregateInputType
  }

  export type GetSubscriptionAggregateType<T extends SubscriptionAggregateArgs> = {
        [P in keyof T & keyof AggregateSubscription]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSubscription[P]>
      : GetScalarType<T[P], AggregateSubscription[P]>
  }




  export type SubscriptionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubscriptionWhereInput
    orderBy?: SubscriptionOrderByWithAggregationInput | SubscriptionOrderByWithAggregationInput[]
    by: SubscriptionScalarFieldEnum[] | SubscriptionScalarFieldEnum
    having?: SubscriptionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SubscriptionCountAggregateInputType | true
    _avg?: SubscriptionAvgAggregateInputType
    _sum?: SubscriptionSumAggregateInputType
    _min?: SubscriptionMinAggregateInputType
    _max?: SubscriptionMaxAggregateInputType
  }

  export type SubscriptionGroupByOutputType = {
    id: string
    userId: string
    planId: string
    razorpaySubscriptionId: string
    razorpayCustomerId: string
    status: string
    currentPeriodStart: Date
    currentPeriodEnd: Date
    cancelledAt: Date | null
    lastPaymentId: string | null
    lastPaymentAmount: number | null
    lastPaymentDate: Date | null
    lastPaymentError: string | null
    createdAt: Date
    updatedAt: Date
    _count: SubscriptionCountAggregateOutputType | null
    _avg: SubscriptionAvgAggregateOutputType | null
    _sum: SubscriptionSumAggregateOutputType | null
    _min: SubscriptionMinAggregateOutputType | null
    _max: SubscriptionMaxAggregateOutputType | null
  }

  type GetSubscriptionGroupByPayload<T extends SubscriptionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SubscriptionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SubscriptionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SubscriptionGroupByOutputType[P]>
            : GetScalarType<T[P], SubscriptionGroupByOutputType[P]>
        }
      >
    >


  export type SubscriptionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    planId?: boolean
    razorpaySubscriptionId?: boolean
    razorpayCustomerId?: boolean
    status?: boolean
    currentPeriodStart?: boolean
    currentPeriodEnd?: boolean
    cancelledAt?: boolean
    lastPaymentId?: boolean
    lastPaymentAmount?: boolean
    lastPaymentDate?: boolean
    lastPaymentError?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
    plan?: boolean | SubscriptionPlanDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subscription"]>

  export type SubscriptionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    planId?: boolean
    razorpaySubscriptionId?: boolean
    razorpayCustomerId?: boolean
    status?: boolean
    currentPeriodStart?: boolean
    currentPeriodEnd?: boolean
    cancelledAt?: boolean
    lastPaymentId?: boolean
    lastPaymentAmount?: boolean
    lastPaymentDate?: boolean
    lastPaymentError?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
    plan?: boolean | SubscriptionPlanDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subscription"]>

  export type SubscriptionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    planId?: boolean
    razorpaySubscriptionId?: boolean
    razorpayCustomerId?: boolean
    status?: boolean
    currentPeriodStart?: boolean
    currentPeriodEnd?: boolean
    cancelledAt?: boolean
    lastPaymentId?: boolean
    lastPaymentAmount?: boolean
    lastPaymentDate?: boolean
    lastPaymentError?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
    plan?: boolean | SubscriptionPlanDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subscription"]>

  export type SubscriptionSelectScalar = {
    id?: boolean
    userId?: boolean
    planId?: boolean
    razorpaySubscriptionId?: boolean
    razorpayCustomerId?: boolean
    status?: boolean
    currentPeriodStart?: boolean
    currentPeriodEnd?: boolean
    cancelledAt?: boolean
    lastPaymentId?: boolean
    lastPaymentAmount?: boolean
    lastPaymentDate?: boolean
    lastPaymentError?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SubscriptionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "planId" | "razorpaySubscriptionId" | "razorpayCustomerId" | "status" | "currentPeriodStart" | "currentPeriodEnd" | "cancelledAt" | "lastPaymentId" | "lastPaymentAmount" | "lastPaymentDate" | "lastPaymentError" | "createdAt" | "updatedAt", ExtArgs["result"]["subscription"]>
  export type SubscriptionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
    plan?: boolean | SubscriptionPlanDefaultArgs<ExtArgs>
  }
  export type SubscriptionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
    plan?: boolean | SubscriptionPlanDefaultArgs<ExtArgs>
  }
  export type SubscriptionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
    plan?: boolean | SubscriptionPlanDefaultArgs<ExtArgs>
  }

  export type $SubscriptionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Subscription"
    objects: {
      user: Prisma.$UsersPayload<ExtArgs>
      plan: Prisma.$SubscriptionPlanPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      planId: string
      razorpaySubscriptionId: string
      razorpayCustomerId: string
      status: string
      currentPeriodStart: Date
      currentPeriodEnd: Date
      cancelledAt: Date | null
      lastPaymentId: string | null
      lastPaymentAmount: number | null
      lastPaymentDate: Date | null
      lastPaymentError: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["subscription"]>
    composites: {}
  }

  type SubscriptionGetPayload<S extends boolean | null | undefined | SubscriptionDefaultArgs> = $Result.GetResult<Prisma.$SubscriptionPayload, S>

  type SubscriptionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SubscriptionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SubscriptionCountAggregateInputType | true
    }

  export interface SubscriptionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Subscription'], meta: { name: 'Subscription' } }
    /**
     * Find zero or one Subscription that matches the filter.
     * @param {SubscriptionFindUniqueArgs} args - Arguments to find a Subscription
     * @example
     * // Get one Subscription
     * const subscription = await prisma.subscription.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SubscriptionFindUniqueArgs>(args: SelectSubset<T, SubscriptionFindUniqueArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Subscription that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SubscriptionFindUniqueOrThrowArgs} args - Arguments to find a Subscription
     * @example
     * // Get one Subscription
     * const subscription = await prisma.subscription.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SubscriptionFindUniqueOrThrowArgs>(args: SelectSubset<T, SubscriptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Subscription that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionFindFirstArgs} args - Arguments to find a Subscription
     * @example
     * // Get one Subscription
     * const subscription = await prisma.subscription.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SubscriptionFindFirstArgs>(args?: SelectSubset<T, SubscriptionFindFirstArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Subscription that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionFindFirstOrThrowArgs} args - Arguments to find a Subscription
     * @example
     * // Get one Subscription
     * const subscription = await prisma.subscription.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SubscriptionFindFirstOrThrowArgs>(args?: SelectSubset<T, SubscriptionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Subscriptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Subscriptions
     * const subscriptions = await prisma.subscription.findMany()
     * 
     * // Get first 10 Subscriptions
     * const subscriptions = await prisma.subscription.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const subscriptionWithIdOnly = await prisma.subscription.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SubscriptionFindManyArgs>(args?: SelectSubset<T, SubscriptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Subscription.
     * @param {SubscriptionCreateArgs} args - Arguments to create a Subscription.
     * @example
     * // Create one Subscription
     * const Subscription = await prisma.subscription.create({
     *   data: {
     *     // ... data to create a Subscription
     *   }
     * })
     * 
     */
    create<T extends SubscriptionCreateArgs>(args: SelectSubset<T, SubscriptionCreateArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Subscriptions.
     * @param {SubscriptionCreateManyArgs} args - Arguments to create many Subscriptions.
     * @example
     * // Create many Subscriptions
     * const subscription = await prisma.subscription.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SubscriptionCreateManyArgs>(args?: SelectSubset<T, SubscriptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Subscriptions and returns the data saved in the database.
     * @param {SubscriptionCreateManyAndReturnArgs} args - Arguments to create many Subscriptions.
     * @example
     * // Create many Subscriptions
     * const subscription = await prisma.subscription.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Subscriptions and only return the `id`
     * const subscriptionWithIdOnly = await prisma.subscription.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SubscriptionCreateManyAndReturnArgs>(args?: SelectSubset<T, SubscriptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Subscription.
     * @param {SubscriptionDeleteArgs} args - Arguments to delete one Subscription.
     * @example
     * // Delete one Subscription
     * const Subscription = await prisma.subscription.delete({
     *   where: {
     *     // ... filter to delete one Subscription
     *   }
     * })
     * 
     */
    delete<T extends SubscriptionDeleteArgs>(args: SelectSubset<T, SubscriptionDeleteArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Subscription.
     * @param {SubscriptionUpdateArgs} args - Arguments to update one Subscription.
     * @example
     * // Update one Subscription
     * const subscription = await prisma.subscription.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SubscriptionUpdateArgs>(args: SelectSubset<T, SubscriptionUpdateArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Subscriptions.
     * @param {SubscriptionDeleteManyArgs} args - Arguments to filter Subscriptions to delete.
     * @example
     * // Delete a few Subscriptions
     * const { count } = await prisma.subscription.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SubscriptionDeleteManyArgs>(args?: SelectSubset<T, SubscriptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Subscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Subscriptions
     * const subscription = await prisma.subscription.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SubscriptionUpdateManyArgs>(args: SelectSubset<T, SubscriptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Subscriptions and returns the data updated in the database.
     * @param {SubscriptionUpdateManyAndReturnArgs} args - Arguments to update many Subscriptions.
     * @example
     * // Update many Subscriptions
     * const subscription = await prisma.subscription.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Subscriptions and only return the `id`
     * const subscriptionWithIdOnly = await prisma.subscription.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SubscriptionUpdateManyAndReturnArgs>(args: SelectSubset<T, SubscriptionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Subscription.
     * @param {SubscriptionUpsertArgs} args - Arguments to update or create a Subscription.
     * @example
     * // Update or create a Subscription
     * const subscription = await prisma.subscription.upsert({
     *   create: {
     *     // ... data to create a Subscription
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Subscription we want to update
     *   }
     * })
     */
    upsert<T extends SubscriptionUpsertArgs>(args: SelectSubset<T, SubscriptionUpsertArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Subscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionCountArgs} args - Arguments to filter Subscriptions to count.
     * @example
     * // Count the number of Subscriptions
     * const count = await prisma.subscription.count({
     *   where: {
     *     // ... the filter for the Subscriptions we want to count
     *   }
     * })
    **/
    count<T extends SubscriptionCountArgs>(
      args?: Subset<T, SubscriptionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SubscriptionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Subscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SubscriptionAggregateArgs>(args: Subset<T, SubscriptionAggregateArgs>): Prisma.PrismaPromise<GetSubscriptionAggregateType<T>>

    /**
     * Group by Subscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SubscriptionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SubscriptionGroupByArgs['orderBy'] }
        : { orderBy?: SubscriptionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SubscriptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSubscriptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Subscription model
   */
  readonly fields: SubscriptionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Subscription.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SubscriptionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UsersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsersDefaultArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    plan<T extends SubscriptionPlanDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SubscriptionPlanDefaultArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Subscription model
   */
  interface SubscriptionFieldRefs {
    readonly id: FieldRef<"Subscription", 'String'>
    readonly userId: FieldRef<"Subscription", 'String'>
    readonly planId: FieldRef<"Subscription", 'String'>
    readonly razorpaySubscriptionId: FieldRef<"Subscription", 'String'>
    readonly razorpayCustomerId: FieldRef<"Subscription", 'String'>
    readonly status: FieldRef<"Subscription", 'String'>
    readonly currentPeriodStart: FieldRef<"Subscription", 'DateTime'>
    readonly currentPeriodEnd: FieldRef<"Subscription", 'DateTime'>
    readonly cancelledAt: FieldRef<"Subscription", 'DateTime'>
    readonly lastPaymentId: FieldRef<"Subscription", 'String'>
    readonly lastPaymentAmount: FieldRef<"Subscription", 'Float'>
    readonly lastPaymentDate: FieldRef<"Subscription", 'DateTime'>
    readonly lastPaymentError: FieldRef<"Subscription", 'String'>
    readonly createdAt: FieldRef<"Subscription", 'DateTime'>
    readonly updatedAt: FieldRef<"Subscription", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Subscription findUnique
   */
  export type SubscriptionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscription to fetch.
     */
    where: SubscriptionWhereUniqueInput
  }

  /**
   * Subscription findUniqueOrThrow
   */
  export type SubscriptionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscription to fetch.
     */
    where: SubscriptionWhereUniqueInput
  }

  /**
   * Subscription findFirst
   */
  export type SubscriptionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscription to fetch.
     */
    where?: SubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subscriptions to fetch.
     */
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Subscriptions.
     */
    cursor?: SubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Subscriptions.
     */
    distinct?: SubscriptionScalarFieldEnum | SubscriptionScalarFieldEnum[]
  }

  /**
   * Subscription findFirstOrThrow
   */
  export type SubscriptionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscription to fetch.
     */
    where?: SubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subscriptions to fetch.
     */
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Subscriptions.
     */
    cursor?: SubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Subscriptions.
     */
    distinct?: SubscriptionScalarFieldEnum | SubscriptionScalarFieldEnum[]
  }

  /**
   * Subscription findMany
   */
  export type SubscriptionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscriptions to fetch.
     */
    where?: SubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subscriptions to fetch.
     */
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Subscriptions.
     */
    cursor?: SubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subscriptions.
     */
    skip?: number
    distinct?: SubscriptionScalarFieldEnum | SubscriptionScalarFieldEnum[]
  }

  /**
   * Subscription create
   */
  export type SubscriptionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * The data needed to create a Subscription.
     */
    data: XOR<SubscriptionCreateInput, SubscriptionUncheckedCreateInput>
  }

  /**
   * Subscription createMany
   */
  export type SubscriptionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Subscriptions.
     */
    data: SubscriptionCreateManyInput | SubscriptionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Subscription createManyAndReturn
   */
  export type SubscriptionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * The data used to create many Subscriptions.
     */
    data: SubscriptionCreateManyInput | SubscriptionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Subscription update
   */
  export type SubscriptionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * The data needed to update a Subscription.
     */
    data: XOR<SubscriptionUpdateInput, SubscriptionUncheckedUpdateInput>
    /**
     * Choose, which Subscription to update.
     */
    where: SubscriptionWhereUniqueInput
  }

  /**
   * Subscription updateMany
   */
  export type SubscriptionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Subscriptions.
     */
    data: XOR<SubscriptionUpdateManyMutationInput, SubscriptionUncheckedUpdateManyInput>
    /**
     * Filter which Subscriptions to update
     */
    where?: SubscriptionWhereInput
    /**
     * Limit how many Subscriptions to update.
     */
    limit?: number
  }

  /**
   * Subscription updateManyAndReturn
   */
  export type SubscriptionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * The data used to update Subscriptions.
     */
    data: XOR<SubscriptionUpdateManyMutationInput, SubscriptionUncheckedUpdateManyInput>
    /**
     * Filter which Subscriptions to update
     */
    where?: SubscriptionWhereInput
    /**
     * Limit how many Subscriptions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Subscription upsert
   */
  export type SubscriptionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * The filter to search for the Subscription to update in case it exists.
     */
    where: SubscriptionWhereUniqueInput
    /**
     * In case the Subscription found by the `where` argument doesn't exist, create a new Subscription with this data.
     */
    create: XOR<SubscriptionCreateInput, SubscriptionUncheckedCreateInput>
    /**
     * In case the Subscription was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SubscriptionUpdateInput, SubscriptionUncheckedUpdateInput>
  }

  /**
   * Subscription delete
   */
  export type SubscriptionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter which Subscription to delete.
     */
    where: SubscriptionWhereUniqueInput
  }

  /**
   * Subscription deleteMany
   */
  export type SubscriptionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Subscriptions to delete
     */
    where?: SubscriptionWhereInput
    /**
     * Limit how many Subscriptions to delete.
     */
    limit?: number
  }

  /**
   * Subscription without action
   */
  export type SubscriptionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Subscription
     */
    omit?: SubscriptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
  }


  /**
   * Model Message
   */

  export type AggregateMessage = {
    _count: MessageCountAggregateOutputType | null
    _min: MessageMinAggregateOutputType | null
    _max: MessageMaxAggregateOutputType | null
  }

  export type MessageMinAggregateOutputType = {
    id: string | null
    content: string | null
    role: string | null
    createdAt: Date | null
    userId: string | null
  }

  export type MessageMaxAggregateOutputType = {
    id: string | null
    content: string | null
    role: string | null
    createdAt: Date | null
    userId: string | null
  }

  export type MessageCountAggregateOutputType = {
    id: number
    content: number
    role: number
    createdAt: number
    userId: number
    _all: number
  }


  export type MessageMinAggregateInputType = {
    id?: true
    content?: true
    role?: true
    createdAt?: true
    userId?: true
  }

  export type MessageMaxAggregateInputType = {
    id?: true
    content?: true
    role?: true
    createdAt?: true
    userId?: true
  }

  export type MessageCountAggregateInputType = {
    id?: true
    content?: true
    role?: true
    createdAt?: true
    userId?: true
    _all?: true
  }

  export type MessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Message to aggregate.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Messages
    **/
    _count?: true | MessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MessageMaxAggregateInputType
  }

  export type GetMessageAggregateType<T extends MessageAggregateArgs> = {
        [P in keyof T & keyof AggregateMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMessage[P]>
      : GetScalarType<T[P], AggregateMessage[P]>
  }




  export type MessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MessageWhereInput
    orderBy?: MessageOrderByWithAggregationInput | MessageOrderByWithAggregationInput[]
    by: MessageScalarFieldEnum[] | MessageScalarFieldEnum
    having?: MessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MessageCountAggregateInputType | true
    _min?: MessageMinAggregateInputType
    _max?: MessageMaxAggregateInputType
  }

  export type MessageGroupByOutputType = {
    id: string
    content: string
    role: string
    createdAt: Date
    userId: string
    _count: MessageCountAggregateOutputType | null
    _min: MessageMinAggregateOutputType | null
    _max: MessageMaxAggregateOutputType | null
  }

  type GetMessageGroupByPayload<T extends MessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MessageGroupByOutputType[P]>
            : GetScalarType<T[P], MessageGroupByOutputType[P]>
        }
      >
    >


  export type MessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    content?: boolean
    role?: boolean
    createdAt?: boolean
    userId?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["message"]>

  export type MessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    content?: boolean
    role?: boolean
    createdAt?: boolean
    userId?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["message"]>

  export type MessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    content?: boolean
    role?: boolean
    createdAt?: boolean
    userId?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["message"]>

  export type MessageSelectScalar = {
    id?: boolean
    content?: boolean
    role?: boolean
    createdAt?: boolean
    userId?: boolean
  }

  export type MessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "content" | "role" | "createdAt" | "userId", ExtArgs["result"]["message"]>
  export type MessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }
  export type MessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }
  export type MessageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }

  export type $MessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Message"
    objects: {
      user: Prisma.$UsersPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      content: string
      role: string
      createdAt: Date
      userId: string
    }, ExtArgs["result"]["message"]>
    composites: {}
  }

  type MessageGetPayload<S extends boolean | null | undefined | MessageDefaultArgs> = $Result.GetResult<Prisma.$MessagePayload, S>

  type MessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MessageCountAggregateInputType | true
    }

  export interface MessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Message'], meta: { name: 'Message' } }
    /**
     * Find zero or one Message that matches the filter.
     * @param {MessageFindUniqueArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MessageFindUniqueArgs>(args: SelectSubset<T, MessageFindUniqueArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Message that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MessageFindUniqueOrThrowArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MessageFindUniqueOrThrowArgs>(args: SelectSubset<T, MessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Message that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindFirstArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MessageFindFirstArgs>(args?: SelectSubset<T, MessageFindFirstArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Message that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindFirstOrThrowArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MessageFindFirstOrThrowArgs>(args?: SelectSubset<T, MessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Messages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Messages
     * const messages = await prisma.message.findMany()
     * 
     * // Get first 10 Messages
     * const messages = await prisma.message.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const messageWithIdOnly = await prisma.message.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MessageFindManyArgs>(args?: SelectSubset<T, MessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Message.
     * @param {MessageCreateArgs} args - Arguments to create a Message.
     * @example
     * // Create one Message
     * const Message = await prisma.message.create({
     *   data: {
     *     // ... data to create a Message
     *   }
     * })
     * 
     */
    create<T extends MessageCreateArgs>(args: SelectSubset<T, MessageCreateArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Messages.
     * @param {MessageCreateManyArgs} args - Arguments to create many Messages.
     * @example
     * // Create many Messages
     * const message = await prisma.message.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MessageCreateManyArgs>(args?: SelectSubset<T, MessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Messages and returns the data saved in the database.
     * @param {MessageCreateManyAndReturnArgs} args - Arguments to create many Messages.
     * @example
     * // Create many Messages
     * const message = await prisma.message.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Messages and only return the `id`
     * const messageWithIdOnly = await prisma.message.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MessageCreateManyAndReturnArgs>(args?: SelectSubset<T, MessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Message.
     * @param {MessageDeleteArgs} args - Arguments to delete one Message.
     * @example
     * // Delete one Message
     * const Message = await prisma.message.delete({
     *   where: {
     *     // ... filter to delete one Message
     *   }
     * })
     * 
     */
    delete<T extends MessageDeleteArgs>(args: SelectSubset<T, MessageDeleteArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Message.
     * @param {MessageUpdateArgs} args - Arguments to update one Message.
     * @example
     * // Update one Message
     * const message = await prisma.message.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MessageUpdateArgs>(args: SelectSubset<T, MessageUpdateArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Messages.
     * @param {MessageDeleteManyArgs} args - Arguments to filter Messages to delete.
     * @example
     * // Delete a few Messages
     * const { count } = await prisma.message.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MessageDeleteManyArgs>(args?: SelectSubset<T, MessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Messages
     * const message = await prisma.message.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MessageUpdateManyArgs>(args: SelectSubset<T, MessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Messages and returns the data updated in the database.
     * @param {MessageUpdateManyAndReturnArgs} args - Arguments to update many Messages.
     * @example
     * // Update many Messages
     * const message = await prisma.message.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Messages and only return the `id`
     * const messageWithIdOnly = await prisma.message.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MessageUpdateManyAndReturnArgs>(args: SelectSubset<T, MessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Message.
     * @param {MessageUpsertArgs} args - Arguments to update or create a Message.
     * @example
     * // Update or create a Message
     * const message = await prisma.message.upsert({
     *   create: {
     *     // ... data to create a Message
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Message we want to update
     *   }
     * })
     */
    upsert<T extends MessageUpsertArgs>(args: SelectSubset<T, MessageUpsertArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageCountArgs} args - Arguments to filter Messages to count.
     * @example
     * // Count the number of Messages
     * const count = await prisma.message.count({
     *   where: {
     *     // ... the filter for the Messages we want to count
     *   }
     * })
    **/
    count<T extends MessageCountArgs>(
      args?: Subset<T, MessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MessageAggregateArgs>(args: Subset<T, MessageAggregateArgs>): Prisma.PrismaPromise<GetMessageAggregateType<T>>

    /**
     * Group by Message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MessageGroupByArgs['orderBy'] }
        : { orderBy?: MessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Message model
   */
  readonly fields: MessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Message.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UsersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsersDefaultArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Message model
   */
  interface MessageFieldRefs {
    readonly id: FieldRef<"Message", 'String'>
    readonly content: FieldRef<"Message", 'String'>
    readonly role: FieldRef<"Message", 'String'>
    readonly createdAt: FieldRef<"Message", 'DateTime'>
    readonly userId: FieldRef<"Message", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Message findUnique
   */
  export type MessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message findUniqueOrThrow
   */
  export type MessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message findFirst
   */
  export type MessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Messages.
     */
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message findFirstOrThrow
   */
  export type MessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Messages.
     */
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message findMany
   */
  export type MessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Messages to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message create
   */
  export type MessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The data needed to create a Message.
     */
    data: XOR<MessageCreateInput, MessageUncheckedCreateInput>
  }

  /**
   * Message createMany
   */
  export type MessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Messages.
     */
    data: MessageCreateManyInput | MessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Message createManyAndReturn
   */
  export type MessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * The data used to create many Messages.
     */
    data: MessageCreateManyInput | MessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Message update
   */
  export type MessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The data needed to update a Message.
     */
    data: XOR<MessageUpdateInput, MessageUncheckedUpdateInput>
    /**
     * Choose, which Message to update.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message updateMany
   */
  export type MessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Messages.
     */
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyInput>
    /**
     * Filter which Messages to update
     */
    where?: MessageWhereInput
    /**
     * Limit how many Messages to update.
     */
    limit?: number
  }

  /**
   * Message updateManyAndReturn
   */
  export type MessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * The data used to update Messages.
     */
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyInput>
    /**
     * Filter which Messages to update
     */
    where?: MessageWhereInput
    /**
     * Limit how many Messages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Message upsert
   */
  export type MessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The filter to search for the Message to update in case it exists.
     */
    where: MessageWhereUniqueInput
    /**
     * In case the Message found by the `where` argument doesn't exist, create a new Message with this data.
     */
    create: XOR<MessageCreateInput, MessageUncheckedCreateInput>
    /**
     * In case the Message was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MessageUpdateInput, MessageUncheckedUpdateInput>
  }

  /**
   * Message delete
   */
  export type MessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter which Message to delete.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message deleteMany
   */
  export type MessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Messages to delete
     */
    where?: MessageWhereInput
    /**
     * Limit how many Messages to delete.
     */
    limit?: number
  }

  /**
   * Message without action
   */
  export type MessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
  }


  /**
   * Model ContactMessage
   */

  export type AggregateContactMessage = {
    _count: ContactMessageCountAggregateOutputType | null
    _min: ContactMessageMinAggregateOutputType | null
    _max: ContactMessageMaxAggregateOutputType | null
  }

  export type ContactMessageMinAggregateOutputType = {
    id: string | null
    fullName: string | null
    email: string | null
    phone: string | null
    message: string | null
    createdAt: Date | null
  }

  export type ContactMessageMaxAggregateOutputType = {
    id: string | null
    fullName: string | null
    email: string | null
    phone: string | null
    message: string | null
    createdAt: Date | null
  }

  export type ContactMessageCountAggregateOutputType = {
    id: number
    fullName: number
    email: number
    phone: number
    message: number
    createdAt: number
    _all: number
  }


  export type ContactMessageMinAggregateInputType = {
    id?: true
    fullName?: true
    email?: true
    phone?: true
    message?: true
    createdAt?: true
  }

  export type ContactMessageMaxAggregateInputType = {
    id?: true
    fullName?: true
    email?: true
    phone?: true
    message?: true
    createdAt?: true
  }

  export type ContactMessageCountAggregateInputType = {
    id?: true
    fullName?: true
    email?: true
    phone?: true
    message?: true
    createdAt?: true
    _all?: true
  }

  export type ContactMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContactMessage to aggregate.
     */
    where?: ContactMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactMessages to fetch.
     */
    orderBy?: ContactMessageOrderByWithRelationInput | ContactMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ContactMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ContactMessages
    **/
    _count?: true | ContactMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ContactMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ContactMessageMaxAggregateInputType
  }

  export type GetContactMessageAggregateType<T extends ContactMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateContactMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateContactMessage[P]>
      : GetScalarType<T[P], AggregateContactMessage[P]>
  }




  export type ContactMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContactMessageWhereInput
    orderBy?: ContactMessageOrderByWithAggregationInput | ContactMessageOrderByWithAggregationInput[]
    by: ContactMessageScalarFieldEnum[] | ContactMessageScalarFieldEnum
    having?: ContactMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ContactMessageCountAggregateInputType | true
    _min?: ContactMessageMinAggregateInputType
    _max?: ContactMessageMaxAggregateInputType
  }

  export type ContactMessageGroupByOutputType = {
    id: string
    fullName: string
    email: string
    phone: string
    message: string
    createdAt: Date
    _count: ContactMessageCountAggregateOutputType | null
    _min: ContactMessageMinAggregateOutputType | null
    _max: ContactMessageMaxAggregateOutputType | null
  }

  type GetContactMessageGroupByPayload<T extends ContactMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ContactMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ContactMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ContactMessageGroupByOutputType[P]>
            : GetScalarType<T[P], ContactMessageGroupByOutputType[P]>
        }
      >
    >


  export type ContactMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    email?: boolean
    phone?: boolean
    message?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["contactMessage"]>

  export type ContactMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    email?: boolean
    phone?: boolean
    message?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["contactMessage"]>

  export type ContactMessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    email?: boolean
    phone?: boolean
    message?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["contactMessage"]>

  export type ContactMessageSelectScalar = {
    id?: boolean
    fullName?: boolean
    email?: boolean
    phone?: boolean
    message?: boolean
    createdAt?: boolean
  }

  export type ContactMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "fullName" | "email" | "phone" | "message" | "createdAt", ExtArgs["result"]["contactMessage"]>

  export type $ContactMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ContactMessage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      fullName: string
      email: string
      phone: string
      message: string
      createdAt: Date
    }, ExtArgs["result"]["contactMessage"]>
    composites: {}
  }

  type ContactMessageGetPayload<S extends boolean | null | undefined | ContactMessageDefaultArgs> = $Result.GetResult<Prisma.$ContactMessagePayload, S>

  type ContactMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ContactMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ContactMessageCountAggregateInputType | true
    }

  export interface ContactMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ContactMessage'], meta: { name: 'ContactMessage' } }
    /**
     * Find zero or one ContactMessage that matches the filter.
     * @param {ContactMessageFindUniqueArgs} args - Arguments to find a ContactMessage
     * @example
     * // Get one ContactMessage
     * const contactMessage = await prisma.contactMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ContactMessageFindUniqueArgs>(args: SelectSubset<T, ContactMessageFindUniqueArgs<ExtArgs>>): Prisma__ContactMessageClient<$Result.GetResult<Prisma.$ContactMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ContactMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ContactMessageFindUniqueOrThrowArgs} args - Arguments to find a ContactMessage
     * @example
     * // Get one ContactMessage
     * const contactMessage = await prisma.contactMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ContactMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, ContactMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ContactMessageClient<$Result.GetResult<Prisma.$ContactMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ContactMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageFindFirstArgs} args - Arguments to find a ContactMessage
     * @example
     * // Get one ContactMessage
     * const contactMessage = await prisma.contactMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ContactMessageFindFirstArgs>(args?: SelectSubset<T, ContactMessageFindFirstArgs<ExtArgs>>): Prisma__ContactMessageClient<$Result.GetResult<Prisma.$ContactMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ContactMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageFindFirstOrThrowArgs} args - Arguments to find a ContactMessage
     * @example
     * // Get one ContactMessage
     * const contactMessage = await prisma.contactMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ContactMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, ContactMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ContactMessageClient<$Result.GetResult<Prisma.$ContactMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ContactMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ContactMessages
     * const contactMessages = await prisma.contactMessage.findMany()
     * 
     * // Get first 10 ContactMessages
     * const contactMessages = await prisma.contactMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const contactMessageWithIdOnly = await prisma.contactMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ContactMessageFindManyArgs>(args?: SelectSubset<T, ContactMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ContactMessage.
     * @param {ContactMessageCreateArgs} args - Arguments to create a ContactMessage.
     * @example
     * // Create one ContactMessage
     * const ContactMessage = await prisma.contactMessage.create({
     *   data: {
     *     // ... data to create a ContactMessage
     *   }
     * })
     * 
     */
    create<T extends ContactMessageCreateArgs>(args: SelectSubset<T, ContactMessageCreateArgs<ExtArgs>>): Prisma__ContactMessageClient<$Result.GetResult<Prisma.$ContactMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ContactMessages.
     * @param {ContactMessageCreateManyArgs} args - Arguments to create many ContactMessages.
     * @example
     * // Create many ContactMessages
     * const contactMessage = await prisma.contactMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ContactMessageCreateManyArgs>(args?: SelectSubset<T, ContactMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ContactMessages and returns the data saved in the database.
     * @param {ContactMessageCreateManyAndReturnArgs} args - Arguments to create many ContactMessages.
     * @example
     * // Create many ContactMessages
     * const contactMessage = await prisma.contactMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ContactMessages and only return the `id`
     * const contactMessageWithIdOnly = await prisma.contactMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ContactMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, ContactMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactMessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ContactMessage.
     * @param {ContactMessageDeleteArgs} args - Arguments to delete one ContactMessage.
     * @example
     * // Delete one ContactMessage
     * const ContactMessage = await prisma.contactMessage.delete({
     *   where: {
     *     // ... filter to delete one ContactMessage
     *   }
     * })
     * 
     */
    delete<T extends ContactMessageDeleteArgs>(args: SelectSubset<T, ContactMessageDeleteArgs<ExtArgs>>): Prisma__ContactMessageClient<$Result.GetResult<Prisma.$ContactMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ContactMessage.
     * @param {ContactMessageUpdateArgs} args - Arguments to update one ContactMessage.
     * @example
     * // Update one ContactMessage
     * const contactMessage = await prisma.contactMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ContactMessageUpdateArgs>(args: SelectSubset<T, ContactMessageUpdateArgs<ExtArgs>>): Prisma__ContactMessageClient<$Result.GetResult<Prisma.$ContactMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ContactMessages.
     * @param {ContactMessageDeleteManyArgs} args - Arguments to filter ContactMessages to delete.
     * @example
     * // Delete a few ContactMessages
     * const { count } = await prisma.contactMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ContactMessageDeleteManyArgs>(args?: SelectSubset<T, ContactMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ContactMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ContactMessages
     * const contactMessage = await prisma.contactMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ContactMessageUpdateManyArgs>(args: SelectSubset<T, ContactMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ContactMessages and returns the data updated in the database.
     * @param {ContactMessageUpdateManyAndReturnArgs} args - Arguments to update many ContactMessages.
     * @example
     * // Update many ContactMessages
     * const contactMessage = await prisma.contactMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ContactMessages and only return the `id`
     * const contactMessageWithIdOnly = await prisma.contactMessage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ContactMessageUpdateManyAndReturnArgs>(args: SelectSubset<T, ContactMessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactMessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ContactMessage.
     * @param {ContactMessageUpsertArgs} args - Arguments to update or create a ContactMessage.
     * @example
     * // Update or create a ContactMessage
     * const contactMessage = await prisma.contactMessage.upsert({
     *   create: {
     *     // ... data to create a ContactMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ContactMessage we want to update
     *   }
     * })
     */
    upsert<T extends ContactMessageUpsertArgs>(args: SelectSubset<T, ContactMessageUpsertArgs<ExtArgs>>): Prisma__ContactMessageClient<$Result.GetResult<Prisma.$ContactMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ContactMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageCountArgs} args - Arguments to filter ContactMessages to count.
     * @example
     * // Count the number of ContactMessages
     * const count = await prisma.contactMessage.count({
     *   where: {
     *     // ... the filter for the ContactMessages we want to count
     *   }
     * })
    **/
    count<T extends ContactMessageCountArgs>(
      args?: Subset<T, ContactMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ContactMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ContactMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ContactMessageAggregateArgs>(args: Subset<T, ContactMessageAggregateArgs>): Prisma.PrismaPromise<GetContactMessageAggregateType<T>>

    /**
     * Group by ContactMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ContactMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ContactMessageGroupByArgs['orderBy'] }
        : { orderBy?: ContactMessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ContactMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetContactMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ContactMessage model
   */
  readonly fields: ContactMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ContactMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ContactMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ContactMessage model
   */
  interface ContactMessageFieldRefs {
    readonly id: FieldRef<"ContactMessage", 'String'>
    readonly fullName: FieldRef<"ContactMessage", 'String'>
    readonly email: FieldRef<"ContactMessage", 'String'>
    readonly phone: FieldRef<"ContactMessage", 'String'>
    readonly message: FieldRef<"ContactMessage", 'String'>
    readonly createdAt: FieldRef<"ContactMessage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ContactMessage findUnique
   */
  export type ContactMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null
    /**
     * Filter, which ContactMessage to fetch.
     */
    where: ContactMessageWhereUniqueInput
  }

  /**
   * ContactMessage findUniqueOrThrow
   */
  export type ContactMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null
    /**
     * Filter, which ContactMessage to fetch.
     */
    where: ContactMessageWhereUniqueInput
  }

  /**
   * ContactMessage findFirst
   */
  export type ContactMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null
    /**
     * Filter, which ContactMessage to fetch.
     */
    where?: ContactMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactMessages to fetch.
     */
    orderBy?: ContactMessageOrderByWithRelationInput | ContactMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContactMessages.
     */
    cursor?: ContactMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContactMessages.
     */
    distinct?: ContactMessageScalarFieldEnum | ContactMessageScalarFieldEnum[]
  }

  /**
   * ContactMessage findFirstOrThrow
   */
  export type ContactMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null
    /**
     * Filter, which ContactMessage to fetch.
     */
    where?: ContactMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactMessages to fetch.
     */
    orderBy?: ContactMessageOrderByWithRelationInput | ContactMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContactMessages.
     */
    cursor?: ContactMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContactMessages.
     */
    distinct?: ContactMessageScalarFieldEnum | ContactMessageScalarFieldEnum[]
  }

  /**
   * ContactMessage findMany
   */
  export type ContactMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null
    /**
     * Filter, which ContactMessages to fetch.
     */
    where?: ContactMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactMessages to fetch.
     */
    orderBy?: ContactMessageOrderByWithRelationInput | ContactMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ContactMessages.
     */
    cursor?: ContactMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactMessages.
     */
    skip?: number
    distinct?: ContactMessageScalarFieldEnum | ContactMessageScalarFieldEnum[]
  }

  /**
   * ContactMessage create
   */
  export type ContactMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null
    /**
     * The data needed to create a ContactMessage.
     */
    data: XOR<ContactMessageCreateInput, ContactMessageUncheckedCreateInput>
  }

  /**
   * ContactMessage createMany
   */
  export type ContactMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ContactMessages.
     */
    data: ContactMessageCreateManyInput | ContactMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ContactMessage createManyAndReturn
   */
  export type ContactMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null
    /**
     * The data used to create many ContactMessages.
     */
    data: ContactMessageCreateManyInput | ContactMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ContactMessage update
   */
  export type ContactMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null
    /**
     * The data needed to update a ContactMessage.
     */
    data: XOR<ContactMessageUpdateInput, ContactMessageUncheckedUpdateInput>
    /**
     * Choose, which ContactMessage to update.
     */
    where: ContactMessageWhereUniqueInput
  }

  /**
   * ContactMessage updateMany
   */
  export type ContactMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ContactMessages.
     */
    data: XOR<ContactMessageUpdateManyMutationInput, ContactMessageUncheckedUpdateManyInput>
    /**
     * Filter which ContactMessages to update
     */
    where?: ContactMessageWhereInput
    /**
     * Limit how many ContactMessages to update.
     */
    limit?: number
  }

  /**
   * ContactMessage updateManyAndReturn
   */
  export type ContactMessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null
    /**
     * The data used to update ContactMessages.
     */
    data: XOR<ContactMessageUpdateManyMutationInput, ContactMessageUncheckedUpdateManyInput>
    /**
     * Filter which ContactMessages to update
     */
    where?: ContactMessageWhereInput
    /**
     * Limit how many ContactMessages to update.
     */
    limit?: number
  }

  /**
   * ContactMessage upsert
   */
  export type ContactMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null
    /**
     * The filter to search for the ContactMessage to update in case it exists.
     */
    where: ContactMessageWhereUniqueInput
    /**
     * In case the ContactMessage found by the `where` argument doesn't exist, create a new ContactMessage with this data.
     */
    create: XOR<ContactMessageCreateInput, ContactMessageUncheckedCreateInput>
    /**
     * In case the ContactMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ContactMessageUpdateInput, ContactMessageUncheckedUpdateInput>
  }

  /**
   * ContactMessage delete
   */
  export type ContactMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null
    /**
     * Filter which ContactMessage to delete.
     */
    where: ContactMessageWhereUniqueInput
  }

  /**
   * ContactMessage deleteMany
   */
  export type ContactMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContactMessages to delete
     */
    where?: ContactMessageWhereInput
    /**
     * Limit how many ContactMessages to delete.
     */
    limit?: number
  }

  /**
   * ContactMessage without action
   */
  export type ContactMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactMessage
     */
    select?: ContactMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactMessage
     */
    omit?: ContactMessageOmit<ExtArgs> | null
  }


  /**
   * Model ChatConversation
   */

  export type AggregateChatConversation = {
    _count: ChatConversationCountAggregateOutputType | null
    _avg: ChatConversationAvgAggregateOutputType | null
    _sum: ChatConversationSumAggregateOutputType | null
    _min: ChatConversationMinAggregateOutputType | null
    _max: ChatConversationMaxAggregateOutputType | null
  }

  export type ChatConversationAvgAggregateOutputType = {
    totalMessages: number | null
    avgResponseTime: number | null
  }

  export type ChatConversationSumAggregateOutputType = {
    totalMessages: number | null
    avgResponseTime: number | null
  }

  export type ChatConversationMinAggregateOutputType = {
    id: string | null
    visitorId: string | null
    userId: string | null
    userAgent: string | null
    deviceType: string | null
    browser: string | null
    os: string | null
    ipAddress: string | null
    referrer: string | null
    firstSeen: Date | null
    lastSeen: Date | null
    totalMessages: number | null
    avgResponseTime: number | null
  }

  export type ChatConversationMaxAggregateOutputType = {
    id: string | null
    visitorId: string | null
    userId: string | null
    userAgent: string | null
    deviceType: string | null
    browser: string | null
    os: string | null
    ipAddress: string | null
    referrer: string | null
    firstSeen: Date | null
    lastSeen: Date | null
    totalMessages: number | null
    avgResponseTime: number | null
  }

  export type ChatConversationCountAggregateOutputType = {
    id: number
    visitorId: number
    userId: number
    userAgent: number
    deviceType: number
    browser: number
    os: number
    ipAddress: number
    referrer: number
    firstSeen: number
    lastSeen: number
    totalMessages: number
    avgResponseTime: number
    _all: number
  }


  export type ChatConversationAvgAggregateInputType = {
    totalMessages?: true
    avgResponseTime?: true
  }

  export type ChatConversationSumAggregateInputType = {
    totalMessages?: true
    avgResponseTime?: true
  }

  export type ChatConversationMinAggregateInputType = {
    id?: true
    visitorId?: true
    userId?: true
    userAgent?: true
    deviceType?: true
    browser?: true
    os?: true
    ipAddress?: true
    referrer?: true
    firstSeen?: true
    lastSeen?: true
    totalMessages?: true
    avgResponseTime?: true
  }

  export type ChatConversationMaxAggregateInputType = {
    id?: true
    visitorId?: true
    userId?: true
    userAgent?: true
    deviceType?: true
    browser?: true
    os?: true
    ipAddress?: true
    referrer?: true
    firstSeen?: true
    lastSeen?: true
    totalMessages?: true
    avgResponseTime?: true
  }

  export type ChatConversationCountAggregateInputType = {
    id?: true
    visitorId?: true
    userId?: true
    userAgent?: true
    deviceType?: true
    browser?: true
    os?: true
    ipAddress?: true
    referrer?: true
    firstSeen?: true
    lastSeen?: true
    totalMessages?: true
    avgResponseTime?: true
    _all?: true
  }

  export type ChatConversationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChatConversation to aggregate.
     */
    where?: ChatConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatConversations to fetch.
     */
    orderBy?: ChatConversationOrderByWithRelationInput | ChatConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChatConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatConversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatConversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ChatConversations
    **/
    _count?: true | ChatConversationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ChatConversationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ChatConversationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChatConversationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChatConversationMaxAggregateInputType
  }

  export type GetChatConversationAggregateType<T extends ChatConversationAggregateArgs> = {
        [P in keyof T & keyof AggregateChatConversation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChatConversation[P]>
      : GetScalarType<T[P], AggregateChatConversation[P]>
  }




  export type ChatConversationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChatConversationWhereInput
    orderBy?: ChatConversationOrderByWithAggregationInput | ChatConversationOrderByWithAggregationInput[]
    by: ChatConversationScalarFieldEnum[] | ChatConversationScalarFieldEnum
    having?: ChatConversationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChatConversationCountAggregateInputType | true
    _avg?: ChatConversationAvgAggregateInputType
    _sum?: ChatConversationSumAggregateInputType
    _min?: ChatConversationMinAggregateInputType
    _max?: ChatConversationMaxAggregateInputType
  }

  export type ChatConversationGroupByOutputType = {
    id: string
    visitorId: string
    userId: string
    userAgent: string | null
    deviceType: string | null
    browser: string | null
    os: string | null
    ipAddress: string | null
    referrer: string | null
    firstSeen: Date
    lastSeen: Date
    totalMessages: number
    avgResponseTime: number | null
    _count: ChatConversationCountAggregateOutputType | null
    _avg: ChatConversationAvgAggregateOutputType | null
    _sum: ChatConversationSumAggregateOutputType | null
    _min: ChatConversationMinAggregateOutputType | null
    _max: ChatConversationMaxAggregateOutputType | null
  }

  type GetChatConversationGroupByPayload<T extends ChatConversationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChatConversationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChatConversationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChatConversationGroupByOutputType[P]>
            : GetScalarType<T[P], ChatConversationGroupByOutputType[P]>
        }
      >
    >


  export type ChatConversationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    visitorId?: boolean
    userId?: boolean
    userAgent?: boolean
    deviceType?: boolean
    browser?: boolean
    os?: boolean
    ipAddress?: boolean
    referrer?: boolean
    firstSeen?: boolean
    lastSeen?: boolean
    totalMessages?: boolean
    avgResponseTime?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
    messages?: boolean | ChatConversation$messagesArgs<ExtArgs>
    _count?: boolean | ChatConversationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["chatConversation"]>

  export type ChatConversationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    visitorId?: boolean
    userId?: boolean
    userAgent?: boolean
    deviceType?: boolean
    browser?: boolean
    os?: boolean
    ipAddress?: boolean
    referrer?: boolean
    firstSeen?: boolean
    lastSeen?: boolean
    totalMessages?: boolean
    avgResponseTime?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["chatConversation"]>

  export type ChatConversationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    visitorId?: boolean
    userId?: boolean
    userAgent?: boolean
    deviceType?: boolean
    browser?: boolean
    os?: boolean
    ipAddress?: boolean
    referrer?: boolean
    firstSeen?: boolean
    lastSeen?: boolean
    totalMessages?: boolean
    avgResponseTime?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["chatConversation"]>

  export type ChatConversationSelectScalar = {
    id?: boolean
    visitorId?: boolean
    userId?: boolean
    userAgent?: boolean
    deviceType?: boolean
    browser?: boolean
    os?: boolean
    ipAddress?: boolean
    referrer?: boolean
    firstSeen?: boolean
    lastSeen?: boolean
    totalMessages?: boolean
    avgResponseTime?: boolean
  }

  export type ChatConversationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "visitorId" | "userId" | "userAgent" | "deviceType" | "browser" | "os" | "ipAddress" | "referrer" | "firstSeen" | "lastSeen" | "totalMessages" | "avgResponseTime", ExtArgs["result"]["chatConversation"]>
  export type ChatConversationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
    messages?: boolean | ChatConversation$messagesArgs<ExtArgs>
    _count?: boolean | ChatConversationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ChatConversationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }
  export type ChatConversationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }

  export type $ChatConversationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ChatConversation"
    objects: {
      user: Prisma.$UsersPayload<ExtArgs>
      messages: Prisma.$ChatMessagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      visitorId: string
      userId: string
      userAgent: string | null
      deviceType: string | null
      browser: string | null
      os: string | null
      ipAddress: string | null
      referrer: string | null
      firstSeen: Date
      lastSeen: Date
      totalMessages: number
      avgResponseTime: number | null
    }, ExtArgs["result"]["chatConversation"]>
    composites: {}
  }

  type ChatConversationGetPayload<S extends boolean | null | undefined | ChatConversationDefaultArgs> = $Result.GetResult<Prisma.$ChatConversationPayload, S>

  type ChatConversationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ChatConversationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ChatConversationCountAggregateInputType | true
    }

  export interface ChatConversationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ChatConversation'], meta: { name: 'ChatConversation' } }
    /**
     * Find zero or one ChatConversation that matches the filter.
     * @param {ChatConversationFindUniqueArgs} args - Arguments to find a ChatConversation
     * @example
     * // Get one ChatConversation
     * const chatConversation = await prisma.chatConversation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChatConversationFindUniqueArgs>(args: SelectSubset<T, ChatConversationFindUniqueArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ChatConversation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ChatConversationFindUniqueOrThrowArgs} args - Arguments to find a ChatConversation
     * @example
     * // Get one ChatConversation
     * const chatConversation = await prisma.chatConversation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChatConversationFindUniqueOrThrowArgs>(args: SelectSubset<T, ChatConversationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChatConversation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationFindFirstArgs} args - Arguments to find a ChatConversation
     * @example
     * // Get one ChatConversation
     * const chatConversation = await prisma.chatConversation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChatConversationFindFirstArgs>(args?: SelectSubset<T, ChatConversationFindFirstArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChatConversation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationFindFirstOrThrowArgs} args - Arguments to find a ChatConversation
     * @example
     * // Get one ChatConversation
     * const chatConversation = await prisma.chatConversation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChatConversationFindFirstOrThrowArgs>(args?: SelectSubset<T, ChatConversationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ChatConversations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChatConversations
     * const chatConversations = await prisma.chatConversation.findMany()
     * 
     * // Get first 10 ChatConversations
     * const chatConversations = await prisma.chatConversation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const chatConversationWithIdOnly = await prisma.chatConversation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChatConversationFindManyArgs>(args?: SelectSubset<T, ChatConversationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ChatConversation.
     * @param {ChatConversationCreateArgs} args - Arguments to create a ChatConversation.
     * @example
     * // Create one ChatConversation
     * const ChatConversation = await prisma.chatConversation.create({
     *   data: {
     *     // ... data to create a ChatConversation
     *   }
     * })
     * 
     */
    create<T extends ChatConversationCreateArgs>(args: SelectSubset<T, ChatConversationCreateArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ChatConversations.
     * @param {ChatConversationCreateManyArgs} args - Arguments to create many ChatConversations.
     * @example
     * // Create many ChatConversations
     * const chatConversation = await prisma.chatConversation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChatConversationCreateManyArgs>(args?: SelectSubset<T, ChatConversationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ChatConversations and returns the data saved in the database.
     * @param {ChatConversationCreateManyAndReturnArgs} args - Arguments to create many ChatConversations.
     * @example
     * // Create many ChatConversations
     * const chatConversation = await prisma.chatConversation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ChatConversations and only return the `id`
     * const chatConversationWithIdOnly = await prisma.chatConversation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ChatConversationCreateManyAndReturnArgs>(args?: SelectSubset<T, ChatConversationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ChatConversation.
     * @param {ChatConversationDeleteArgs} args - Arguments to delete one ChatConversation.
     * @example
     * // Delete one ChatConversation
     * const ChatConversation = await prisma.chatConversation.delete({
     *   where: {
     *     // ... filter to delete one ChatConversation
     *   }
     * })
     * 
     */
    delete<T extends ChatConversationDeleteArgs>(args: SelectSubset<T, ChatConversationDeleteArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ChatConversation.
     * @param {ChatConversationUpdateArgs} args - Arguments to update one ChatConversation.
     * @example
     * // Update one ChatConversation
     * const chatConversation = await prisma.chatConversation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChatConversationUpdateArgs>(args: SelectSubset<T, ChatConversationUpdateArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ChatConversations.
     * @param {ChatConversationDeleteManyArgs} args - Arguments to filter ChatConversations to delete.
     * @example
     * // Delete a few ChatConversations
     * const { count } = await prisma.chatConversation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChatConversationDeleteManyArgs>(args?: SelectSubset<T, ChatConversationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChatConversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChatConversations
     * const chatConversation = await prisma.chatConversation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChatConversationUpdateManyArgs>(args: SelectSubset<T, ChatConversationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChatConversations and returns the data updated in the database.
     * @param {ChatConversationUpdateManyAndReturnArgs} args - Arguments to update many ChatConversations.
     * @example
     * // Update many ChatConversations
     * const chatConversation = await prisma.chatConversation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ChatConversations and only return the `id`
     * const chatConversationWithIdOnly = await prisma.chatConversation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ChatConversationUpdateManyAndReturnArgs>(args: SelectSubset<T, ChatConversationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ChatConversation.
     * @param {ChatConversationUpsertArgs} args - Arguments to update or create a ChatConversation.
     * @example
     * // Update or create a ChatConversation
     * const chatConversation = await prisma.chatConversation.upsert({
     *   create: {
     *     // ... data to create a ChatConversation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChatConversation we want to update
     *   }
     * })
     */
    upsert<T extends ChatConversationUpsertArgs>(args: SelectSubset<T, ChatConversationUpsertArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ChatConversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationCountArgs} args - Arguments to filter ChatConversations to count.
     * @example
     * // Count the number of ChatConversations
     * const count = await prisma.chatConversation.count({
     *   where: {
     *     // ... the filter for the ChatConversations we want to count
     *   }
     * })
    **/
    count<T extends ChatConversationCountArgs>(
      args?: Subset<T, ChatConversationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChatConversationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ChatConversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChatConversationAggregateArgs>(args: Subset<T, ChatConversationAggregateArgs>): Prisma.PrismaPromise<GetChatConversationAggregateType<T>>

    /**
     * Group by ChatConversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatConversationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChatConversationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChatConversationGroupByArgs['orderBy'] }
        : { orderBy?: ChatConversationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChatConversationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChatConversationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ChatConversation model
   */
  readonly fields: ChatConversationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ChatConversation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChatConversationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UsersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsersDefaultArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    messages<T extends ChatConversation$messagesArgs<ExtArgs> = {}>(args?: Subset<T, ChatConversation$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ChatConversation model
   */
  interface ChatConversationFieldRefs {
    readonly id: FieldRef<"ChatConversation", 'String'>
    readonly visitorId: FieldRef<"ChatConversation", 'String'>
    readonly userId: FieldRef<"ChatConversation", 'String'>
    readonly userAgent: FieldRef<"ChatConversation", 'String'>
    readonly deviceType: FieldRef<"ChatConversation", 'String'>
    readonly browser: FieldRef<"ChatConversation", 'String'>
    readonly os: FieldRef<"ChatConversation", 'String'>
    readonly ipAddress: FieldRef<"ChatConversation", 'String'>
    readonly referrer: FieldRef<"ChatConversation", 'String'>
    readonly firstSeen: FieldRef<"ChatConversation", 'DateTime'>
    readonly lastSeen: FieldRef<"ChatConversation", 'DateTime'>
    readonly totalMessages: FieldRef<"ChatConversation", 'Int'>
    readonly avgResponseTime: FieldRef<"ChatConversation", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * ChatConversation findUnique
   */
  export type ChatConversationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatConversation
     */
    omit?: ChatConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatConversationInclude<ExtArgs> | null
    /**
     * Filter, which ChatConversation to fetch.
     */
    where: ChatConversationWhereUniqueInput
  }

  /**
   * ChatConversation findUniqueOrThrow
   */
  export type ChatConversationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatConversation
     */
    omit?: ChatConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatConversationInclude<ExtArgs> | null
    /**
     * Filter, which ChatConversation to fetch.
     */
    where: ChatConversationWhereUniqueInput
  }

  /**
   * ChatConversation findFirst
   */
  export type ChatConversationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatConversation
     */
    omit?: ChatConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatConversationInclude<ExtArgs> | null
    /**
     * Filter, which ChatConversation to fetch.
     */
    where?: ChatConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatConversations to fetch.
     */
    orderBy?: ChatConversationOrderByWithRelationInput | ChatConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChatConversations.
     */
    cursor?: ChatConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatConversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatConversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChatConversations.
     */
    distinct?: ChatConversationScalarFieldEnum | ChatConversationScalarFieldEnum[]
  }

  /**
   * ChatConversation findFirstOrThrow
   */
  export type ChatConversationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatConversation
     */
    omit?: ChatConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatConversationInclude<ExtArgs> | null
    /**
     * Filter, which ChatConversation to fetch.
     */
    where?: ChatConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatConversations to fetch.
     */
    orderBy?: ChatConversationOrderByWithRelationInput | ChatConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChatConversations.
     */
    cursor?: ChatConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatConversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatConversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChatConversations.
     */
    distinct?: ChatConversationScalarFieldEnum | ChatConversationScalarFieldEnum[]
  }

  /**
   * ChatConversation findMany
   */
  export type ChatConversationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatConversation
     */
    omit?: ChatConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatConversationInclude<ExtArgs> | null
    /**
     * Filter, which ChatConversations to fetch.
     */
    where?: ChatConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatConversations to fetch.
     */
    orderBy?: ChatConversationOrderByWithRelationInput | ChatConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ChatConversations.
     */
    cursor?: ChatConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatConversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatConversations.
     */
    skip?: number
    distinct?: ChatConversationScalarFieldEnum | ChatConversationScalarFieldEnum[]
  }

  /**
   * ChatConversation create
   */
  export type ChatConversationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatConversation
     */
    omit?: ChatConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatConversationInclude<ExtArgs> | null
    /**
     * The data needed to create a ChatConversation.
     */
    data: XOR<ChatConversationCreateInput, ChatConversationUncheckedCreateInput>
  }

  /**
   * ChatConversation createMany
   */
  export type ChatConversationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChatConversations.
     */
    data: ChatConversationCreateManyInput | ChatConversationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChatConversation createManyAndReturn
   */
  export type ChatConversationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ChatConversation
     */
    omit?: ChatConversationOmit<ExtArgs> | null
    /**
     * The data used to create many ChatConversations.
     */
    data: ChatConversationCreateManyInput | ChatConversationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatConversationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ChatConversation update
   */
  export type ChatConversationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatConversation
     */
    omit?: ChatConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatConversationInclude<ExtArgs> | null
    /**
     * The data needed to update a ChatConversation.
     */
    data: XOR<ChatConversationUpdateInput, ChatConversationUncheckedUpdateInput>
    /**
     * Choose, which ChatConversation to update.
     */
    where: ChatConversationWhereUniqueInput
  }

  /**
   * ChatConversation updateMany
   */
  export type ChatConversationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ChatConversations.
     */
    data: XOR<ChatConversationUpdateManyMutationInput, ChatConversationUncheckedUpdateManyInput>
    /**
     * Filter which ChatConversations to update
     */
    where?: ChatConversationWhereInput
    /**
     * Limit how many ChatConversations to update.
     */
    limit?: number
  }

  /**
   * ChatConversation updateManyAndReturn
   */
  export type ChatConversationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ChatConversation
     */
    omit?: ChatConversationOmit<ExtArgs> | null
    /**
     * The data used to update ChatConversations.
     */
    data: XOR<ChatConversationUpdateManyMutationInput, ChatConversationUncheckedUpdateManyInput>
    /**
     * Filter which ChatConversations to update
     */
    where?: ChatConversationWhereInput
    /**
     * Limit how many ChatConversations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatConversationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ChatConversation upsert
   */
  export type ChatConversationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatConversation
     */
    omit?: ChatConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatConversationInclude<ExtArgs> | null
    /**
     * The filter to search for the ChatConversation to update in case it exists.
     */
    where: ChatConversationWhereUniqueInput
    /**
     * In case the ChatConversation found by the `where` argument doesn't exist, create a new ChatConversation with this data.
     */
    create: XOR<ChatConversationCreateInput, ChatConversationUncheckedCreateInput>
    /**
     * In case the ChatConversation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChatConversationUpdateInput, ChatConversationUncheckedUpdateInput>
  }

  /**
   * ChatConversation delete
   */
  export type ChatConversationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatConversation
     */
    omit?: ChatConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatConversationInclude<ExtArgs> | null
    /**
     * Filter which ChatConversation to delete.
     */
    where: ChatConversationWhereUniqueInput
  }

  /**
   * ChatConversation deleteMany
   */
  export type ChatConversationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChatConversations to delete
     */
    where?: ChatConversationWhereInput
    /**
     * Limit how many ChatConversations to delete.
     */
    limit?: number
  }

  /**
   * ChatConversation.messages
   */
  export type ChatConversation$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatMessageInclude<ExtArgs> | null
    where?: ChatMessageWhereInput
    orderBy?: ChatMessageOrderByWithRelationInput | ChatMessageOrderByWithRelationInput[]
    cursor?: ChatMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ChatMessageScalarFieldEnum | ChatMessageScalarFieldEnum[]
  }

  /**
   * ChatConversation without action
   */
  export type ChatConversationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatConversation
     */
    select?: ChatConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatConversation
     */
    omit?: ChatConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatConversationInclude<ExtArgs> | null
  }


  /**
   * Model ChatMessage
   */

  export type AggregateChatMessage = {
    _count: ChatMessageCountAggregateOutputType | null
    _min: ChatMessageMinAggregateOutputType | null
    _max: ChatMessageMaxAggregateOutputType | null
  }

  export type ChatMessageMinAggregateOutputType = {
    id: string | null
    conversationId: string | null
    content: string | null
    role: string | null
    createdAt: Date | null
  }

  export type ChatMessageMaxAggregateOutputType = {
    id: string | null
    conversationId: string | null
    content: string | null
    role: string | null
    createdAt: Date | null
  }

  export type ChatMessageCountAggregateOutputType = {
    id: number
    conversationId: number
    content: number
    role: number
    createdAt: number
    _all: number
  }


  export type ChatMessageMinAggregateInputType = {
    id?: true
    conversationId?: true
    content?: true
    role?: true
    createdAt?: true
  }

  export type ChatMessageMaxAggregateInputType = {
    id?: true
    conversationId?: true
    content?: true
    role?: true
    createdAt?: true
  }

  export type ChatMessageCountAggregateInputType = {
    id?: true
    conversationId?: true
    content?: true
    role?: true
    createdAt?: true
    _all?: true
  }

  export type ChatMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChatMessage to aggregate.
     */
    where?: ChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatMessages to fetch.
     */
    orderBy?: ChatMessageOrderByWithRelationInput | ChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ChatMessages
    **/
    _count?: true | ChatMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChatMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChatMessageMaxAggregateInputType
  }

  export type GetChatMessageAggregateType<T extends ChatMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateChatMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChatMessage[P]>
      : GetScalarType<T[P], AggregateChatMessage[P]>
  }




  export type ChatMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChatMessageWhereInput
    orderBy?: ChatMessageOrderByWithAggregationInput | ChatMessageOrderByWithAggregationInput[]
    by: ChatMessageScalarFieldEnum[] | ChatMessageScalarFieldEnum
    having?: ChatMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChatMessageCountAggregateInputType | true
    _min?: ChatMessageMinAggregateInputType
    _max?: ChatMessageMaxAggregateInputType
  }

  export type ChatMessageGroupByOutputType = {
    id: string
    conversationId: string
    content: string
    role: string
    createdAt: Date
    _count: ChatMessageCountAggregateOutputType | null
    _min: ChatMessageMinAggregateOutputType | null
    _max: ChatMessageMaxAggregateOutputType | null
  }

  type GetChatMessageGroupByPayload<T extends ChatMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChatMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChatMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChatMessageGroupByOutputType[P]>
            : GetScalarType<T[P], ChatMessageGroupByOutputType[P]>
        }
      >
    >


  export type ChatMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    conversationId?: boolean
    content?: boolean
    role?: boolean
    createdAt?: boolean
    conversation?: boolean | ChatConversationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["chatMessage"]>

  export type ChatMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    conversationId?: boolean
    content?: boolean
    role?: boolean
    createdAt?: boolean
    conversation?: boolean | ChatConversationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["chatMessage"]>

  export type ChatMessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    conversationId?: boolean
    content?: boolean
    role?: boolean
    createdAt?: boolean
    conversation?: boolean | ChatConversationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["chatMessage"]>

  export type ChatMessageSelectScalar = {
    id?: boolean
    conversationId?: boolean
    content?: boolean
    role?: boolean
    createdAt?: boolean
  }

  export type ChatMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "conversationId" | "content" | "role" | "createdAt", ExtArgs["result"]["chatMessage"]>
  export type ChatMessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversation?: boolean | ChatConversationDefaultArgs<ExtArgs>
  }
  export type ChatMessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversation?: boolean | ChatConversationDefaultArgs<ExtArgs>
  }
  export type ChatMessageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversation?: boolean | ChatConversationDefaultArgs<ExtArgs>
  }

  export type $ChatMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ChatMessage"
    objects: {
      conversation: Prisma.$ChatConversationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      conversationId: string
      content: string
      role: string
      createdAt: Date
    }, ExtArgs["result"]["chatMessage"]>
    composites: {}
  }

  type ChatMessageGetPayload<S extends boolean | null | undefined | ChatMessageDefaultArgs> = $Result.GetResult<Prisma.$ChatMessagePayload, S>

  type ChatMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ChatMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ChatMessageCountAggregateInputType | true
    }

  export interface ChatMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ChatMessage'], meta: { name: 'ChatMessage' } }
    /**
     * Find zero or one ChatMessage that matches the filter.
     * @param {ChatMessageFindUniqueArgs} args - Arguments to find a ChatMessage
     * @example
     * // Get one ChatMessage
     * const chatMessage = await prisma.chatMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChatMessageFindUniqueArgs>(args: SelectSubset<T, ChatMessageFindUniqueArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ChatMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ChatMessageFindUniqueOrThrowArgs} args - Arguments to find a ChatMessage
     * @example
     * // Get one ChatMessage
     * const chatMessage = await prisma.chatMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChatMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, ChatMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChatMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageFindFirstArgs} args - Arguments to find a ChatMessage
     * @example
     * // Get one ChatMessage
     * const chatMessage = await prisma.chatMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChatMessageFindFirstArgs>(args?: SelectSubset<T, ChatMessageFindFirstArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChatMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageFindFirstOrThrowArgs} args - Arguments to find a ChatMessage
     * @example
     * // Get one ChatMessage
     * const chatMessage = await prisma.chatMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChatMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, ChatMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ChatMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChatMessages
     * const chatMessages = await prisma.chatMessage.findMany()
     * 
     * // Get first 10 ChatMessages
     * const chatMessages = await prisma.chatMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const chatMessageWithIdOnly = await prisma.chatMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChatMessageFindManyArgs>(args?: SelectSubset<T, ChatMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ChatMessage.
     * @param {ChatMessageCreateArgs} args - Arguments to create a ChatMessage.
     * @example
     * // Create one ChatMessage
     * const ChatMessage = await prisma.chatMessage.create({
     *   data: {
     *     // ... data to create a ChatMessage
     *   }
     * })
     * 
     */
    create<T extends ChatMessageCreateArgs>(args: SelectSubset<T, ChatMessageCreateArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ChatMessages.
     * @param {ChatMessageCreateManyArgs} args - Arguments to create many ChatMessages.
     * @example
     * // Create many ChatMessages
     * const chatMessage = await prisma.chatMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChatMessageCreateManyArgs>(args?: SelectSubset<T, ChatMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ChatMessages and returns the data saved in the database.
     * @param {ChatMessageCreateManyAndReturnArgs} args - Arguments to create many ChatMessages.
     * @example
     * // Create many ChatMessages
     * const chatMessage = await prisma.chatMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ChatMessages and only return the `id`
     * const chatMessageWithIdOnly = await prisma.chatMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ChatMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, ChatMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ChatMessage.
     * @param {ChatMessageDeleteArgs} args - Arguments to delete one ChatMessage.
     * @example
     * // Delete one ChatMessage
     * const ChatMessage = await prisma.chatMessage.delete({
     *   where: {
     *     // ... filter to delete one ChatMessage
     *   }
     * })
     * 
     */
    delete<T extends ChatMessageDeleteArgs>(args: SelectSubset<T, ChatMessageDeleteArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ChatMessage.
     * @param {ChatMessageUpdateArgs} args - Arguments to update one ChatMessage.
     * @example
     * // Update one ChatMessage
     * const chatMessage = await prisma.chatMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChatMessageUpdateArgs>(args: SelectSubset<T, ChatMessageUpdateArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ChatMessages.
     * @param {ChatMessageDeleteManyArgs} args - Arguments to filter ChatMessages to delete.
     * @example
     * // Delete a few ChatMessages
     * const { count } = await prisma.chatMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChatMessageDeleteManyArgs>(args?: SelectSubset<T, ChatMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChatMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChatMessages
     * const chatMessage = await prisma.chatMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChatMessageUpdateManyArgs>(args: SelectSubset<T, ChatMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChatMessages and returns the data updated in the database.
     * @param {ChatMessageUpdateManyAndReturnArgs} args - Arguments to update many ChatMessages.
     * @example
     * // Update many ChatMessages
     * const chatMessage = await prisma.chatMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ChatMessages and only return the `id`
     * const chatMessageWithIdOnly = await prisma.chatMessage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ChatMessageUpdateManyAndReturnArgs>(args: SelectSubset<T, ChatMessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ChatMessage.
     * @param {ChatMessageUpsertArgs} args - Arguments to update or create a ChatMessage.
     * @example
     * // Update or create a ChatMessage
     * const chatMessage = await prisma.chatMessage.upsert({
     *   create: {
     *     // ... data to create a ChatMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChatMessage we want to update
     *   }
     * })
     */
    upsert<T extends ChatMessageUpsertArgs>(args: SelectSubset<T, ChatMessageUpsertArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ChatMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageCountArgs} args - Arguments to filter ChatMessages to count.
     * @example
     * // Count the number of ChatMessages
     * const count = await prisma.chatMessage.count({
     *   where: {
     *     // ... the filter for the ChatMessages we want to count
     *   }
     * })
    **/
    count<T extends ChatMessageCountArgs>(
      args?: Subset<T, ChatMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChatMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ChatMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChatMessageAggregateArgs>(args: Subset<T, ChatMessageAggregateArgs>): Prisma.PrismaPromise<GetChatMessageAggregateType<T>>

    /**
     * Group by ChatMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChatMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChatMessageGroupByArgs['orderBy'] }
        : { orderBy?: ChatMessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChatMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChatMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ChatMessage model
   */
  readonly fields: ChatMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ChatMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChatMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    conversation<T extends ChatConversationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ChatConversationDefaultArgs<ExtArgs>>): Prisma__ChatConversationClient<$Result.GetResult<Prisma.$ChatConversationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ChatMessage model
   */
  interface ChatMessageFieldRefs {
    readonly id: FieldRef<"ChatMessage", 'String'>
    readonly conversationId: FieldRef<"ChatMessage", 'String'>
    readonly content: FieldRef<"ChatMessage", 'String'>
    readonly role: FieldRef<"ChatMessage", 'String'>
    readonly createdAt: FieldRef<"ChatMessage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ChatMessage findUnique
   */
  export type ChatMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which ChatMessage to fetch.
     */
    where: ChatMessageWhereUniqueInput
  }

  /**
   * ChatMessage findUniqueOrThrow
   */
  export type ChatMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which ChatMessage to fetch.
     */
    where: ChatMessageWhereUniqueInput
  }

  /**
   * ChatMessage findFirst
   */
  export type ChatMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which ChatMessage to fetch.
     */
    where?: ChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatMessages to fetch.
     */
    orderBy?: ChatMessageOrderByWithRelationInput | ChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChatMessages.
     */
    cursor?: ChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChatMessages.
     */
    distinct?: ChatMessageScalarFieldEnum | ChatMessageScalarFieldEnum[]
  }

  /**
   * ChatMessage findFirstOrThrow
   */
  export type ChatMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which ChatMessage to fetch.
     */
    where?: ChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatMessages to fetch.
     */
    orderBy?: ChatMessageOrderByWithRelationInput | ChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChatMessages.
     */
    cursor?: ChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChatMessages.
     */
    distinct?: ChatMessageScalarFieldEnum | ChatMessageScalarFieldEnum[]
  }

  /**
   * ChatMessage findMany
   */
  export type ChatMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which ChatMessages to fetch.
     */
    where?: ChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatMessages to fetch.
     */
    orderBy?: ChatMessageOrderByWithRelationInput | ChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ChatMessages.
     */
    cursor?: ChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatMessages.
     */
    skip?: number
    distinct?: ChatMessageScalarFieldEnum | ChatMessageScalarFieldEnum[]
  }

  /**
   * ChatMessage create
   */
  export type ChatMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatMessageInclude<ExtArgs> | null
    /**
     * The data needed to create a ChatMessage.
     */
    data: XOR<ChatMessageCreateInput, ChatMessageUncheckedCreateInput>
  }

  /**
   * ChatMessage createMany
   */
  export type ChatMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChatMessages.
     */
    data: ChatMessageCreateManyInput | ChatMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChatMessage createManyAndReturn
   */
  export type ChatMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * The data used to create many ChatMessages.
     */
    data: ChatMessageCreateManyInput | ChatMessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatMessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ChatMessage update
   */
  export type ChatMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatMessageInclude<ExtArgs> | null
    /**
     * The data needed to update a ChatMessage.
     */
    data: XOR<ChatMessageUpdateInput, ChatMessageUncheckedUpdateInput>
    /**
     * Choose, which ChatMessage to update.
     */
    where: ChatMessageWhereUniqueInput
  }

  /**
   * ChatMessage updateMany
   */
  export type ChatMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ChatMessages.
     */
    data: XOR<ChatMessageUpdateManyMutationInput, ChatMessageUncheckedUpdateManyInput>
    /**
     * Filter which ChatMessages to update
     */
    where?: ChatMessageWhereInput
    /**
     * Limit how many ChatMessages to update.
     */
    limit?: number
  }

  /**
   * ChatMessage updateManyAndReturn
   */
  export type ChatMessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * The data used to update ChatMessages.
     */
    data: XOR<ChatMessageUpdateManyMutationInput, ChatMessageUncheckedUpdateManyInput>
    /**
     * Filter which ChatMessages to update
     */
    where?: ChatMessageWhereInput
    /**
     * Limit how many ChatMessages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatMessageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ChatMessage upsert
   */
  export type ChatMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatMessageInclude<ExtArgs> | null
    /**
     * The filter to search for the ChatMessage to update in case it exists.
     */
    where: ChatMessageWhereUniqueInput
    /**
     * In case the ChatMessage found by the `where` argument doesn't exist, create a new ChatMessage with this data.
     */
    create: XOR<ChatMessageCreateInput, ChatMessageUncheckedCreateInput>
    /**
     * In case the ChatMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChatMessageUpdateInput, ChatMessageUncheckedUpdateInput>
  }

  /**
   * ChatMessage delete
   */
  export type ChatMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatMessageInclude<ExtArgs> | null
    /**
     * Filter which ChatMessage to delete.
     */
    where: ChatMessageWhereUniqueInput
  }

  /**
   * ChatMessage deleteMany
   */
  export type ChatMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChatMessages to delete
     */
    where?: ChatMessageWhereInput
    /**
     * Limit how many ChatMessages to delete.
     */
    limit?: number
  }

  /**
   * ChatMessage without action
   */
  export type ChatMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChatMessageInclude<ExtArgs> | null
  }


  /**
   * Model Document
   */

  export type AggregateDocument = {
    _count: DocumentCountAggregateOutputType | null
    _avg: DocumentAvgAggregateOutputType | null
    _sum: DocumentSumAggregateOutputType | null
    _min: DocumentMinAggregateOutputType | null
    _max: DocumentMaxAggregateOutputType | null
  }

  export type DocumentAvgAggregateOutputType = {
    fileSize: number | null
  }

  export type DocumentSumAggregateOutputType = {
    fileSize: number | null
  }

  export type DocumentMinAggregateOutputType = {
    id: string | null
    fileName: string | null
    originalName: string | null
    fileType: string | null
    fileSize: number | null
    category: string | null
    description: string | null
    content: string | null
    keywords: string | null
    uploadedAt: Date | null
    userId: string | null
  }

  export type DocumentMaxAggregateOutputType = {
    id: string | null
    fileName: string | null
    originalName: string | null
    fileType: string | null
    fileSize: number | null
    category: string | null
    description: string | null
    content: string | null
    keywords: string | null
    uploadedAt: Date | null
    userId: string | null
  }

  export type DocumentCountAggregateOutputType = {
    id: number
    fileName: number
    originalName: number
    fileType: number
    fileSize: number
    category: number
    description: number
    content: number
    keywords: number
    uploadedAt: number
    userId: number
    _all: number
  }


  export type DocumentAvgAggregateInputType = {
    fileSize?: true
  }

  export type DocumentSumAggregateInputType = {
    fileSize?: true
  }

  export type DocumentMinAggregateInputType = {
    id?: true
    fileName?: true
    originalName?: true
    fileType?: true
    fileSize?: true
    category?: true
    description?: true
    content?: true
    keywords?: true
    uploadedAt?: true
    userId?: true
  }

  export type DocumentMaxAggregateInputType = {
    id?: true
    fileName?: true
    originalName?: true
    fileType?: true
    fileSize?: true
    category?: true
    description?: true
    content?: true
    keywords?: true
    uploadedAt?: true
    userId?: true
  }

  export type DocumentCountAggregateInputType = {
    id?: true
    fileName?: true
    originalName?: true
    fileType?: true
    fileSize?: true
    category?: true
    description?: true
    content?: true
    keywords?: true
    uploadedAt?: true
    userId?: true
    _all?: true
  }

  export type DocumentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Document to aggregate.
     */
    where?: DocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documents to fetch.
     */
    orderBy?: DocumentOrderByWithRelationInput | DocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Documents
    **/
    _count?: true | DocumentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DocumentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DocumentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DocumentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DocumentMaxAggregateInputType
  }

  export type GetDocumentAggregateType<T extends DocumentAggregateArgs> = {
        [P in keyof T & keyof AggregateDocument]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDocument[P]>
      : GetScalarType<T[P], AggregateDocument[P]>
  }




  export type DocumentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentWhereInput
    orderBy?: DocumentOrderByWithAggregationInput | DocumentOrderByWithAggregationInput[]
    by: DocumentScalarFieldEnum[] | DocumentScalarFieldEnum
    having?: DocumentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DocumentCountAggregateInputType | true
    _avg?: DocumentAvgAggregateInputType
    _sum?: DocumentSumAggregateInputType
    _min?: DocumentMinAggregateInputType
    _max?: DocumentMaxAggregateInputType
  }

  export type DocumentGroupByOutputType = {
    id: string
    fileName: string
    originalName: string
    fileType: string
    fileSize: number
    category: string | null
    description: string | null
    content: string
    keywords: string | null
    uploadedAt: Date
    userId: string
    _count: DocumentCountAggregateOutputType | null
    _avg: DocumentAvgAggregateOutputType | null
    _sum: DocumentSumAggregateOutputType | null
    _min: DocumentMinAggregateOutputType | null
    _max: DocumentMaxAggregateOutputType | null
  }

  type GetDocumentGroupByPayload<T extends DocumentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DocumentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DocumentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DocumentGroupByOutputType[P]>
            : GetScalarType<T[P], DocumentGroupByOutputType[P]>
        }
      >
    >


  export type DocumentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fileName?: boolean
    originalName?: boolean
    fileType?: boolean
    fileSize?: boolean
    category?: boolean
    description?: boolean
    content?: boolean
    keywords?: boolean
    uploadedAt?: boolean
    userId?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
    chunks?: boolean | Document$chunksArgs<ExtArgs>
    _count?: boolean | DocumentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["document"]>

  export type DocumentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fileName?: boolean
    originalName?: boolean
    fileType?: boolean
    fileSize?: boolean
    category?: boolean
    description?: boolean
    content?: boolean
    keywords?: boolean
    uploadedAt?: boolean
    userId?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["document"]>

  export type DocumentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fileName?: boolean
    originalName?: boolean
    fileType?: boolean
    fileSize?: boolean
    category?: boolean
    description?: boolean
    content?: boolean
    keywords?: boolean
    uploadedAt?: boolean
    userId?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["document"]>

  export type DocumentSelectScalar = {
    id?: boolean
    fileName?: boolean
    originalName?: boolean
    fileType?: boolean
    fileSize?: boolean
    category?: boolean
    description?: boolean
    content?: boolean
    keywords?: boolean
    uploadedAt?: boolean
    userId?: boolean
  }

  export type DocumentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "fileName" | "originalName" | "fileType" | "fileSize" | "category" | "description" | "content" | "keywords" | "uploadedAt" | "userId", ExtArgs["result"]["document"]>
  export type DocumentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
    chunks?: boolean | Document$chunksArgs<ExtArgs>
    _count?: boolean | DocumentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DocumentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }
  export type DocumentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
  }

  export type $DocumentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Document"
    objects: {
      user: Prisma.$UsersPayload<ExtArgs>
      chunks: Prisma.$DocumentChunkPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      fileName: string
      originalName: string
      fileType: string
      fileSize: number
      category: string | null
      description: string | null
      content: string
      keywords: string | null
      uploadedAt: Date
      userId: string
    }, ExtArgs["result"]["document"]>
    composites: {}
  }

  type DocumentGetPayload<S extends boolean | null | undefined | DocumentDefaultArgs> = $Result.GetResult<Prisma.$DocumentPayload, S>

  type DocumentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DocumentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DocumentCountAggregateInputType | true
    }

  export interface DocumentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Document'], meta: { name: 'Document' } }
    /**
     * Find zero or one Document that matches the filter.
     * @param {DocumentFindUniqueArgs} args - Arguments to find a Document
     * @example
     * // Get one Document
     * const document = await prisma.document.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DocumentFindUniqueArgs>(args: SelectSubset<T, DocumentFindUniqueArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Document that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DocumentFindUniqueOrThrowArgs} args - Arguments to find a Document
     * @example
     * // Get one Document
     * const document = await prisma.document.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DocumentFindUniqueOrThrowArgs>(args: SelectSubset<T, DocumentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Document that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentFindFirstArgs} args - Arguments to find a Document
     * @example
     * // Get one Document
     * const document = await prisma.document.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DocumentFindFirstArgs>(args?: SelectSubset<T, DocumentFindFirstArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Document that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentFindFirstOrThrowArgs} args - Arguments to find a Document
     * @example
     * // Get one Document
     * const document = await prisma.document.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DocumentFindFirstOrThrowArgs>(args?: SelectSubset<T, DocumentFindFirstOrThrowArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Documents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Documents
     * const documents = await prisma.document.findMany()
     * 
     * // Get first 10 Documents
     * const documents = await prisma.document.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const documentWithIdOnly = await prisma.document.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DocumentFindManyArgs>(args?: SelectSubset<T, DocumentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Document.
     * @param {DocumentCreateArgs} args - Arguments to create a Document.
     * @example
     * // Create one Document
     * const Document = await prisma.document.create({
     *   data: {
     *     // ... data to create a Document
     *   }
     * })
     * 
     */
    create<T extends DocumentCreateArgs>(args: SelectSubset<T, DocumentCreateArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Documents.
     * @param {DocumentCreateManyArgs} args - Arguments to create many Documents.
     * @example
     * // Create many Documents
     * const document = await prisma.document.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DocumentCreateManyArgs>(args?: SelectSubset<T, DocumentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Documents and returns the data saved in the database.
     * @param {DocumentCreateManyAndReturnArgs} args - Arguments to create many Documents.
     * @example
     * // Create many Documents
     * const document = await prisma.document.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Documents and only return the `id`
     * const documentWithIdOnly = await prisma.document.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DocumentCreateManyAndReturnArgs>(args?: SelectSubset<T, DocumentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Document.
     * @param {DocumentDeleteArgs} args - Arguments to delete one Document.
     * @example
     * // Delete one Document
     * const Document = await prisma.document.delete({
     *   where: {
     *     // ... filter to delete one Document
     *   }
     * })
     * 
     */
    delete<T extends DocumentDeleteArgs>(args: SelectSubset<T, DocumentDeleteArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Document.
     * @param {DocumentUpdateArgs} args - Arguments to update one Document.
     * @example
     * // Update one Document
     * const document = await prisma.document.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DocumentUpdateArgs>(args: SelectSubset<T, DocumentUpdateArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Documents.
     * @param {DocumentDeleteManyArgs} args - Arguments to filter Documents to delete.
     * @example
     * // Delete a few Documents
     * const { count } = await prisma.document.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DocumentDeleteManyArgs>(args?: SelectSubset<T, DocumentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Documents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Documents
     * const document = await prisma.document.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DocumentUpdateManyArgs>(args: SelectSubset<T, DocumentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Documents and returns the data updated in the database.
     * @param {DocumentUpdateManyAndReturnArgs} args - Arguments to update many Documents.
     * @example
     * // Update many Documents
     * const document = await prisma.document.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Documents and only return the `id`
     * const documentWithIdOnly = await prisma.document.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DocumentUpdateManyAndReturnArgs>(args: SelectSubset<T, DocumentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Document.
     * @param {DocumentUpsertArgs} args - Arguments to update or create a Document.
     * @example
     * // Update or create a Document
     * const document = await prisma.document.upsert({
     *   create: {
     *     // ... data to create a Document
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Document we want to update
     *   }
     * })
     */
    upsert<T extends DocumentUpsertArgs>(args: SelectSubset<T, DocumentUpsertArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Documents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentCountArgs} args - Arguments to filter Documents to count.
     * @example
     * // Count the number of Documents
     * const count = await prisma.document.count({
     *   where: {
     *     // ... the filter for the Documents we want to count
     *   }
     * })
    **/
    count<T extends DocumentCountArgs>(
      args?: Subset<T, DocumentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DocumentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Document.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DocumentAggregateArgs>(args: Subset<T, DocumentAggregateArgs>): Prisma.PrismaPromise<GetDocumentAggregateType<T>>

    /**
     * Group by Document.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DocumentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DocumentGroupByArgs['orderBy'] }
        : { orderBy?: DocumentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DocumentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDocumentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Document model
   */
  readonly fields: DocumentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Document.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DocumentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UsersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsersDefaultArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    chunks<T extends Document$chunksArgs<ExtArgs> = {}>(args?: Subset<T, Document$chunksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentChunkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Document model
   */
  interface DocumentFieldRefs {
    readonly id: FieldRef<"Document", 'String'>
    readonly fileName: FieldRef<"Document", 'String'>
    readonly originalName: FieldRef<"Document", 'String'>
    readonly fileType: FieldRef<"Document", 'String'>
    readonly fileSize: FieldRef<"Document", 'Int'>
    readonly category: FieldRef<"Document", 'String'>
    readonly description: FieldRef<"Document", 'String'>
    readonly content: FieldRef<"Document", 'String'>
    readonly keywords: FieldRef<"Document", 'String'>
    readonly uploadedAt: FieldRef<"Document", 'DateTime'>
    readonly userId: FieldRef<"Document", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Document findUnique
   */
  export type DocumentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * Filter, which Document to fetch.
     */
    where: DocumentWhereUniqueInput
  }

  /**
   * Document findUniqueOrThrow
   */
  export type DocumentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * Filter, which Document to fetch.
     */
    where: DocumentWhereUniqueInput
  }

  /**
   * Document findFirst
   */
  export type DocumentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * Filter, which Document to fetch.
     */
    where?: DocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documents to fetch.
     */
    orderBy?: DocumentOrderByWithRelationInput | DocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Documents.
     */
    cursor?: DocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Documents.
     */
    distinct?: DocumentScalarFieldEnum | DocumentScalarFieldEnum[]
  }

  /**
   * Document findFirstOrThrow
   */
  export type DocumentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * Filter, which Document to fetch.
     */
    where?: DocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documents to fetch.
     */
    orderBy?: DocumentOrderByWithRelationInput | DocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Documents.
     */
    cursor?: DocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Documents.
     */
    distinct?: DocumentScalarFieldEnum | DocumentScalarFieldEnum[]
  }

  /**
   * Document findMany
   */
  export type DocumentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * Filter, which Documents to fetch.
     */
    where?: DocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documents to fetch.
     */
    orderBy?: DocumentOrderByWithRelationInput | DocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Documents.
     */
    cursor?: DocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documents.
     */
    skip?: number
    distinct?: DocumentScalarFieldEnum | DocumentScalarFieldEnum[]
  }

  /**
   * Document create
   */
  export type DocumentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * The data needed to create a Document.
     */
    data: XOR<DocumentCreateInput, DocumentUncheckedCreateInput>
  }

  /**
   * Document createMany
   */
  export type DocumentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Documents.
     */
    data: DocumentCreateManyInput | DocumentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Document createManyAndReturn
   */
  export type DocumentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * The data used to create many Documents.
     */
    data: DocumentCreateManyInput | DocumentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Document update
   */
  export type DocumentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * The data needed to update a Document.
     */
    data: XOR<DocumentUpdateInput, DocumentUncheckedUpdateInput>
    /**
     * Choose, which Document to update.
     */
    where: DocumentWhereUniqueInput
  }

  /**
   * Document updateMany
   */
  export type DocumentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Documents.
     */
    data: XOR<DocumentUpdateManyMutationInput, DocumentUncheckedUpdateManyInput>
    /**
     * Filter which Documents to update
     */
    where?: DocumentWhereInput
    /**
     * Limit how many Documents to update.
     */
    limit?: number
  }

  /**
   * Document updateManyAndReturn
   */
  export type DocumentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * The data used to update Documents.
     */
    data: XOR<DocumentUpdateManyMutationInput, DocumentUncheckedUpdateManyInput>
    /**
     * Filter which Documents to update
     */
    where?: DocumentWhereInput
    /**
     * Limit how many Documents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Document upsert
   */
  export type DocumentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * The filter to search for the Document to update in case it exists.
     */
    where: DocumentWhereUniqueInput
    /**
     * In case the Document found by the `where` argument doesn't exist, create a new Document with this data.
     */
    create: XOR<DocumentCreateInput, DocumentUncheckedCreateInput>
    /**
     * In case the Document was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DocumentUpdateInput, DocumentUncheckedUpdateInput>
  }

  /**
   * Document delete
   */
  export type DocumentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * Filter which Document to delete.
     */
    where: DocumentWhereUniqueInput
  }

  /**
   * Document deleteMany
   */
  export type DocumentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Documents to delete
     */
    where?: DocumentWhereInput
    /**
     * Limit how many Documents to delete.
     */
    limit?: number
  }

  /**
   * Document.chunks
   */
  export type Document$chunksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentChunk
     */
    select?: DocumentChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentChunk
     */
    omit?: DocumentChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentChunkInclude<ExtArgs> | null
    where?: DocumentChunkWhereInput
    orderBy?: DocumentChunkOrderByWithRelationInput | DocumentChunkOrderByWithRelationInput[]
    cursor?: DocumentChunkWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DocumentChunkScalarFieldEnum | DocumentChunkScalarFieldEnum[]
  }

  /**
   * Document without action
   */
  export type DocumentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
  }


  /**
   * Model DocumentChunk
   */

  export type AggregateDocumentChunk = {
    _count: DocumentChunkCountAggregateOutputType | null
    _avg: DocumentChunkAvgAggregateOutputType | null
    _sum: DocumentChunkSumAggregateOutputType | null
    _min: DocumentChunkMinAggregateOutputType | null
    _max: DocumentChunkMaxAggregateOutputType | null
  }

  export type DocumentChunkAvgAggregateOutputType = {
    chunkIndex: number | null
  }

  export type DocumentChunkSumAggregateOutputType = {
    chunkIndex: number | null
  }

  export type DocumentChunkMinAggregateOutputType = {
    id: string | null
    documentId: string | null
    content: string | null
    chunkIndex: number | null
  }

  export type DocumentChunkMaxAggregateOutputType = {
    id: string | null
    documentId: string | null
    content: string | null
    chunkIndex: number | null
  }

  export type DocumentChunkCountAggregateOutputType = {
    id: number
    documentId: number
    content: number
    chunkIndex: number
    _all: number
  }


  export type DocumentChunkAvgAggregateInputType = {
    chunkIndex?: true
  }

  export type DocumentChunkSumAggregateInputType = {
    chunkIndex?: true
  }

  export type DocumentChunkMinAggregateInputType = {
    id?: true
    documentId?: true
    content?: true
    chunkIndex?: true
  }

  export type DocumentChunkMaxAggregateInputType = {
    id?: true
    documentId?: true
    content?: true
    chunkIndex?: true
  }

  export type DocumentChunkCountAggregateInputType = {
    id?: true
    documentId?: true
    content?: true
    chunkIndex?: true
    _all?: true
  }

  export type DocumentChunkAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DocumentChunk to aggregate.
     */
    where?: DocumentChunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentChunks to fetch.
     */
    orderBy?: DocumentChunkOrderByWithRelationInput | DocumentChunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DocumentChunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentChunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DocumentChunks
    **/
    _count?: true | DocumentChunkCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DocumentChunkAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DocumentChunkSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DocumentChunkMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DocumentChunkMaxAggregateInputType
  }

  export type GetDocumentChunkAggregateType<T extends DocumentChunkAggregateArgs> = {
        [P in keyof T & keyof AggregateDocumentChunk]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDocumentChunk[P]>
      : GetScalarType<T[P], AggregateDocumentChunk[P]>
  }




  export type DocumentChunkGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentChunkWhereInput
    orderBy?: DocumentChunkOrderByWithAggregationInput | DocumentChunkOrderByWithAggregationInput[]
    by: DocumentChunkScalarFieldEnum[] | DocumentChunkScalarFieldEnum
    having?: DocumentChunkScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DocumentChunkCountAggregateInputType | true
    _avg?: DocumentChunkAvgAggregateInputType
    _sum?: DocumentChunkSumAggregateInputType
    _min?: DocumentChunkMinAggregateInputType
    _max?: DocumentChunkMaxAggregateInputType
  }

  export type DocumentChunkGroupByOutputType = {
    id: string
    documentId: string
    content: string
    chunkIndex: number
    _count: DocumentChunkCountAggregateOutputType | null
    _avg: DocumentChunkAvgAggregateOutputType | null
    _sum: DocumentChunkSumAggregateOutputType | null
    _min: DocumentChunkMinAggregateOutputType | null
    _max: DocumentChunkMaxAggregateOutputType | null
  }

  type GetDocumentChunkGroupByPayload<T extends DocumentChunkGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DocumentChunkGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DocumentChunkGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DocumentChunkGroupByOutputType[P]>
            : GetScalarType<T[P], DocumentChunkGroupByOutputType[P]>
        }
      >
    >


  export type DocumentChunkSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    documentId?: boolean
    content?: boolean
    chunkIndex?: boolean
    document?: boolean | DocumentDefaultArgs<ExtArgs>
    embedding?: boolean | DocumentChunk$embeddingArgs<ExtArgs>
  }, ExtArgs["result"]["documentChunk"]>

  export type DocumentChunkSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    documentId?: boolean
    content?: boolean
    chunkIndex?: boolean
    document?: boolean | DocumentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["documentChunk"]>

  export type DocumentChunkSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    documentId?: boolean
    content?: boolean
    chunkIndex?: boolean
    document?: boolean | DocumentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["documentChunk"]>

  export type DocumentChunkSelectScalar = {
    id?: boolean
    documentId?: boolean
    content?: boolean
    chunkIndex?: boolean
  }

  export type DocumentChunkOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "documentId" | "content" | "chunkIndex", ExtArgs["result"]["documentChunk"]>
  export type DocumentChunkInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    document?: boolean | DocumentDefaultArgs<ExtArgs>
    embedding?: boolean | DocumentChunk$embeddingArgs<ExtArgs>
  }
  export type DocumentChunkIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    document?: boolean | DocumentDefaultArgs<ExtArgs>
  }
  export type DocumentChunkIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    document?: boolean | DocumentDefaultArgs<ExtArgs>
  }

  export type $DocumentChunkPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DocumentChunk"
    objects: {
      document: Prisma.$DocumentPayload<ExtArgs>
      embedding: Prisma.$EmbeddingPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      documentId: string
      content: string
      chunkIndex: number
    }, ExtArgs["result"]["documentChunk"]>
    composites: {}
  }

  type DocumentChunkGetPayload<S extends boolean | null | undefined | DocumentChunkDefaultArgs> = $Result.GetResult<Prisma.$DocumentChunkPayload, S>

  type DocumentChunkCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DocumentChunkFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DocumentChunkCountAggregateInputType | true
    }

  export interface DocumentChunkDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DocumentChunk'], meta: { name: 'DocumentChunk' } }
    /**
     * Find zero or one DocumentChunk that matches the filter.
     * @param {DocumentChunkFindUniqueArgs} args - Arguments to find a DocumentChunk
     * @example
     * // Get one DocumentChunk
     * const documentChunk = await prisma.documentChunk.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DocumentChunkFindUniqueArgs>(args: SelectSubset<T, DocumentChunkFindUniqueArgs<ExtArgs>>): Prisma__DocumentChunkClient<$Result.GetResult<Prisma.$DocumentChunkPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DocumentChunk that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DocumentChunkFindUniqueOrThrowArgs} args - Arguments to find a DocumentChunk
     * @example
     * // Get one DocumentChunk
     * const documentChunk = await prisma.documentChunk.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DocumentChunkFindUniqueOrThrowArgs>(args: SelectSubset<T, DocumentChunkFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DocumentChunkClient<$Result.GetResult<Prisma.$DocumentChunkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DocumentChunk that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentChunkFindFirstArgs} args - Arguments to find a DocumentChunk
     * @example
     * // Get one DocumentChunk
     * const documentChunk = await prisma.documentChunk.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DocumentChunkFindFirstArgs>(args?: SelectSubset<T, DocumentChunkFindFirstArgs<ExtArgs>>): Prisma__DocumentChunkClient<$Result.GetResult<Prisma.$DocumentChunkPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DocumentChunk that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentChunkFindFirstOrThrowArgs} args - Arguments to find a DocumentChunk
     * @example
     * // Get one DocumentChunk
     * const documentChunk = await prisma.documentChunk.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DocumentChunkFindFirstOrThrowArgs>(args?: SelectSubset<T, DocumentChunkFindFirstOrThrowArgs<ExtArgs>>): Prisma__DocumentChunkClient<$Result.GetResult<Prisma.$DocumentChunkPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DocumentChunks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentChunkFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DocumentChunks
     * const documentChunks = await prisma.documentChunk.findMany()
     * 
     * // Get first 10 DocumentChunks
     * const documentChunks = await prisma.documentChunk.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const documentChunkWithIdOnly = await prisma.documentChunk.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DocumentChunkFindManyArgs>(args?: SelectSubset<T, DocumentChunkFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentChunkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DocumentChunk.
     * @param {DocumentChunkCreateArgs} args - Arguments to create a DocumentChunk.
     * @example
     * // Create one DocumentChunk
     * const DocumentChunk = await prisma.documentChunk.create({
     *   data: {
     *     // ... data to create a DocumentChunk
     *   }
     * })
     * 
     */
    create<T extends DocumentChunkCreateArgs>(args: SelectSubset<T, DocumentChunkCreateArgs<ExtArgs>>): Prisma__DocumentChunkClient<$Result.GetResult<Prisma.$DocumentChunkPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DocumentChunks.
     * @param {DocumentChunkCreateManyArgs} args - Arguments to create many DocumentChunks.
     * @example
     * // Create many DocumentChunks
     * const documentChunk = await prisma.documentChunk.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DocumentChunkCreateManyArgs>(args?: SelectSubset<T, DocumentChunkCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DocumentChunks and returns the data saved in the database.
     * @param {DocumentChunkCreateManyAndReturnArgs} args - Arguments to create many DocumentChunks.
     * @example
     * // Create many DocumentChunks
     * const documentChunk = await prisma.documentChunk.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DocumentChunks and only return the `id`
     * const documentChunkWithIdOnly = await prisma.documentChunk.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DocumentChunkCreateManyAndReturnArgs>(args?: SelectSubset<T, DocumentChunkCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentChunkPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DocumentChunk.
     * @param {DocumentChunkDeleteArgs} args - Arguments to delete one DocumentChunk.
     * @example
     * // Delete one DocumentChunk
     * const DocumentChunk = await prisma.documentChunk.delete({
     *   where: {
     *     // ... filter to delete one DocumentChunk
     *   }
     * })
     * 
     */
    delete<T extends DocumentChunkDeleteArgs>(args: SelectSubset<T, DocumentChunkDeleteArgs<ExtArgs>>): Prisma__DocumentChunkClient<$Result.GetResult<Prisma.$DocumentChunkPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DocumentChunk.
     * @param {DocumentChunkUpdateArgs} args - Arguments to update one DocumentChunk.
     * @example
     * // Update one DocumentChunk
     * const documentChunk = await prisma.documentChunk.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DocumentChunkUpdateArgs>(args: SelectSubset<T, DocumentChunkUpdateArgs<ExtArgs>>): Prisma__DocumentChunkClient<$Result.GetResult<Prisma.$DocumentChunkPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DocumentChunks.
     * @param {DocumentChunkDeleteManyArgs} args - Arguments to filter DocumentChunks to delete.
     * @example
     * // Delete a few DocumentChunks
     * const { count } = await prisma.documentChunk.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DocumentChunkDeleteManyArgs>(args?: SelectSubset<T, DocumentChunkDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DocumentChunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentChunkUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DocumentChunks
     * const documentChunk = await prisma.documentChunk.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DocumentChunkUpdateManyArgs>(args: SelectSubset<T, DocumentChunkUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DocumentChunks and returns the data updated in the database.
     * @param {DocumentChunkUpdateManyAndReturnArgs} args - Arguments to update many DocumentChunks.
     * @example
     * // Update many DocumentChunks
     * const documentChunk = await prisma.documentChunk.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DocumentChunks and only return the `id`
     * const documentChunkWithIdOnly = await prisma.documentChunk.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DocumentChunkUpdateManyAndReturnArgs>(args: SelectSubset<T, DocumentChunkUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentChunkPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DocumentChunk.
     * @param {DocumentChunkUpsertArgs} args - Arguments to update or create a DocumentChunk.
     * @example
     * // Update or create a DocumentChunk
     * const documentChunk = await prisma.documentChunk.upsert({
     *   create: {
     *     // ... data to create a DocumentChunk
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DocumentChunk we want to update
     *   }
     * })
     */
    upsert<T extends DocumentChunkUpsertArgs>(args: SelectSubset<T, DocumentChunkUpsertArgs<ExtArgs>>): Prisma__DocumentChunkClient<$Result.GetResult<Prisma.$DocumentChunkPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DocumentChunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentChunkCountArgs} args - Arguments to filter DocumentChunks to count.
     * @example
     * // Count the number of DocumentChunks
     * const count = await prisma.documentChunk.count({
     *   where: {
     *     // ... the filter for the DocumentChunks we want to count
     *   }
     * })
    **/
    count<T extends DocumentChunkCountArgs>(
      args?: Subset<T, DocumentChunkCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DocumentChunkCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DocumentChunk.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentChunkAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DocumentChunkAggregateArgs>(args: Subset<T, DocumentChunkAggregateArgs>): Prisma.PrismaPromise<GetDocumentChunkAggregateType<T>>

    /**
     * Group by DocumentChunk.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentChunkGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DocumentChunkGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DocumentChunkGroupByArgs['orderBy'] }
        : { orderBy?: DocumentChunkGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DocumentChunkGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDocumentChunkGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DocumentChunk model
   */
  readonly fields: DocumentChunkFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DocumentChunk.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DocumentChunkClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    document<T extends DocumentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DocumentDefaultArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    embedding<T extends DocumentChunk$embeddingArgs<ExtArgs> = {}>(args?: Subset<T, DocumentChunk$embeddingArgs<ExtArgs>>): Prisma__EmbeddingClient<$Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DocumentChunk model
   */
  interface DocumentChunkFieldRefs {
    readonly id: FieldRef<"DocumentChunk", 'String'>
    readonly documentId: FieldRef<"DocumentChunk", 'String'>
    readonly content: FieldRef<"DocumentChunk", 'String'>
    readonly chunkIndex: FieldRef<"DocumentChunk", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * DocumentChunk findUnique
   */
  export type DocumentChunkFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentChunk
     */
    select?: DocumentChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentChunk
     */
    omit?: DocumentChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentChunkInclude<ExtArgs> | null
    /**
     * Filter, which DocumentChunk to fetch.
     */
    where: DocumentChunkWhereUniqueInput
  }

  /**
   * DocumentChunk findUniqueOrThrow
   */
  export type DocumentChunkFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentChunk
     */
    select?: DocumentChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentChunk
     */
    omit?: DocumentChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentChunkInclude<ExtArgs> | null
    /**
     * Filter, which DocumentChunk to fetch.
     */
    where: DocumentChunkWhereUniqueInput
  }

  /**
   * DocumentChunk findFirst
   */
  export type DocumentChunkFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentChunk
     */
    select?: DocumentChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentChunk
     */
    omit?: DocumentChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentChunkInclude<ExtArgs> | null
    /**
     * Filter, which DocumentChunk to fetch.
     */
    where?: DocumentChunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentChunks to fetch.
     */
    orderBy?: DocumentChunkOrderByWithRelationInput | DocumentChunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DocumentChunks.
     */
    cursor?: DocumentChunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentChunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DocumentChunks.
     */
    distinct?: DocumentChunkScalarFieldEnum | DocumentChunkScalarFieldEnum[]
  }

  /**
   * DocumentChunk findFirstOrThrow
   */
  export type DocumentChunkFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentChunk
     */
    select?: DocumentChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentChunk
     */
    omit?: DocumentChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentChunkInclude<ExtArgs> | null
    /**
     * Filter, which DocumentChunk to fetch.
     */
    where?: DocumentChunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentChunks to fetch.
     */
    orderBy?: DocumentChunkOrderByWithRelationInput | DocumentChunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DocumentChunks.
     */
    cursor?: DocumentChunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentChunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DocumentChunks.
     */
    distinct?: DocumentChunkScalarFieldEnum | DocumentChunkScalarFieldEnum[]
  }

  /**
   * DocumentChunk findMany
   */
  export type DocumentChunkFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentChunk
     */
    select?: DocumentChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentChunk
     */
    omit?: DocumentChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentChunkInclude<ExtArgs> | null
    /**
     * Filter, which DocumentChunks to fetch.
     */
    where?: DocumentChunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentChunks to fetch.
     */
    orderBy?: DocumentChunkOrderByWithRelationInput | DocumentChunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DocumentChunks.
     */
    cursor?: DocumentChunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentChunks.
     */
    skip?: number
    distinct?: DocumentChunkScalarFieldEnum | DocumentChunkScalarFieldEnum[]
  }

  /**
   * DocumentChunk create
   */
  export type DocumentChunkCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentChunk
     */
    select?: DocumentChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentChunk
     */
    omit?: DocumentChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentChunkInclude<ExtArgs> | null
    /**
     * The data needed to create a DocumentChunk.
     */
    data: XOR<DocumentChunkCreateInput, DocumentChunkUncheckedCreateInput>
  }

  /**
   * DocumentChunk createMany
   */
  export type DocumentChunkCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DocumentChunks.
     */
    data: DocumentChunkCreateManyInput | DocumentChunkCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DocumentChunk createManyAndReturn
   */
  export type DocumentChunkCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentChunk
     */
    select?: DocumentChunkSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentChunk
     */
    omit?: DocumentChunkOmit<ExtArgs> | null
    /**
     * The data used to create many DocumentChunks.
     */
    data: DocumentChunkCreateManyInput | DocumentChunkCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentChunkIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DocumentChunk update
   */
  export type DocumentChunkUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentChunk
     */
    select?: DocumentChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentChunk
     */
    omit?: DocumentChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentChunkInclude<ExtArgs> | null
    /**
     * The data needed to update a DocumentChunk.
     */
    data: XOR<DocumentChunkUpdateInput, DocumentChunkUncheckedUpdateInput>
    /**
     * Choose, which DocumentChunk to update.
     */
    where: DocumentChunkWhereUniqueInput
  }

  /**
   * DocumentChunk updateMany
   */
  export type DocumentChunkUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DocumentChunks.
     */
    data: XOR<DocumentChunkUpdateManyMutationInput, DocumentChunkUncheckedUpdateManyInput>
    /**
     * Filter which DocumentChunks to update
     */
    where?: DocumentChunkWhereInput
    /**
     * Limit how many DocumentChunks to update.
     */
    limit?: number
  }

  /**
   * DocumentChunk updateManyAndReturn
   */
  export type DocumentChunkUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentChunk
     */
    select?: DocumentChunkSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentChunk
     */
    omit?: DocumentChunkOmit<ExtArgs> | null
    /**
     * The data used to update DocumentChunks.
     */
    data: XOR<DocumentChunkUpdateManyMutationInput, DocumentChunkUncheckedUpdateManyInput>
    /**
     * Filter which DocumentChunks to update
     */
    where?: DocumentChunkWhereInput
    /**
     * Limit how many DocumentChunks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentChunkIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DocumentChunk upsert
   */
  export type DocumentChunkUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentChunk
     */
    select?: DocumentChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentChunk
     */
    omit?: DocumentChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentChunkInclude<ExtArgs> | null
    /**
     * The filter to search for the DocumentChunk to update in case it exists.
     */
    where: DocumentChunkWhereUniqueInput
    /**
     * In case the DocumentChunk found by the `where` argument doesn't exist, create a new DocumentChunk with this data.
     */
    create: XOR<DocumentChunkCreateInput, DocumentChunkUncheckedCreateInput>
    /**
     * In case the DocumentChunk was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DocumentChunkUpdateInput, DocumentChunkUncheckedUpdateInput>
  }

  /**
   * DocumentChunk delete
   */
  export type DocumentChunkDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentChunk
     */
    select?: DocumentChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentChunk
     */
    omit?: DocumentChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentChunkInclude<ExtArgs> | null
    /**
     * Filter which DocumentChunk to delete.
     */
    where: DocumentChunkWhereUniqueInput
  }

  /**
   * DocumentChunk deleteMany
   */
  export type DocumentChunkDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DocumentChunks to delete
     */
    where?: DocumentChunkWhereInput
    /**
     * Limit how many DocumentChunks to delete.
     */
    limit?: number
  }

  /**
   * DocumentChunk.embedding
   */
  export type DocumentChunk$embeddingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingInclude<ExtArgs> | null
    where?: EmbeddingWhereInput
  }

  /**
   * DocumentChunk without action
   */
  export type DocumentChunkDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentChunk
     */
    select?: DocumentChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentChunk
     */
    omit?: DocumentChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentChunkInclude<ExtArgs> | null
  }


  /**
   * Model Embedding
   */

  export type AggregateEmbedding = {
    _count: EmbeddingCountAggregateOutputType | null
    _avg: EmbeddingAvgAggregateOutputType | null
    _sum: EmbeddingSumAggregateOutputType | null
    _min: EmbeddingMinAggregateOutputType | null
    _max: EmbeddingMaxAggregateOutputType | null
  }

  export type EmbeddingAvgAggregateOutputType = {
    vector: number | null
  }

  export type EmbeddingSumAggregateOutputType = {
    vector: number[]
  }

  export type EmbeddingMinAggregateOutputType = {
    id: string | null
    userId: string | null
    chunkId: string | null
    createdAt: Date | null
  }

  export type EmbeddingMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    chunkId: string | null
    createdAt: Date | null
  }

  export type EmbeddingCountAggregateOutputType = {
    id: number
    userId: number
    chunkId: number
    vector: number
    createdAt: number
    _all: number
  }


  export type EmbeddingAvgAggregateInputType = {
    vector?: true
  }

  export type EmbeddingSumAggregateInputType = {
    vector?: true
  }

  export type EmbeddingMinAggregateInputType = {
    id?: true
    userId?: true
    chunkId?: true
    createdAt?: true
  }

  export type EmbeddingMaxAggregateInputType = {
    id?: true
    userId?: true
    chunkId?: true
    createdAt?: true
  }

  export type EmbeddingCountAggregateInputType = {
    id?: true
    userId?: true
    chunkId?: true
    vector?: true
    createdAt?: true
    _all?: true
  }

  export type EmbeddingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Embedding to aggregate.
     */
    where?: EmbeddingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Embeddings to fetch.
     */
    orderBy?: EmbeddingOrderByWithRelationInput | EmbeddingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmbeddingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Embeddings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Embeddings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Embeddings
    **/
    _count?: true | EmbeddingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EmbeddingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EmbeddingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmbeddingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmbeddingMaxAggregateInputType
  }

  export type GetEmbeddingAggregateType<T extends EmbeddingAggregateArgs> = {
        [P in keyof T & keyof AggregateEmbedding]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmbedding[P]>
      : GetScalarType<T[P], AggregateEmbedding[P]>
  }




  export type EmbeddingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmbeddingWhereInput
    orderBy?: EmbeddingOrderByWithAggregationInput | EmbeddingOrderByWithAggregationInput[]
    by: EmbeddingScalarFieldEnum[] | EmbeddingScalarFieldEnum
    having?: EmbeddingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmbeddingCountAggregateInputType | true
    _avg?: EmbeddingAvgAggregateInputType
    _sum?: EmbeddingSumAggregateInputType
    _min?: EmbeddingMinAggregateInputType
    _max?: EmbeddingMaxAggregateInputType
  }

  export type EmbeddingGroupByOutputType = {
    id: string
    userId: string
    chunkId: string
    vector: number[]
    createdAt: Date
    _count: EmbeddingCountAggregateOutputType | null
    _avg: EmbeddingAvgAggregateOutputType | null
    _sum: EmbeddingSumAggregateOutputType | null
    _min: EmbeddingMinAggregateOutputType | null
    _max: EmbeddingMaxAggregateOutputType | null
  }

  type GetEmbeddingGroupByPayload<T extends EmbeddingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmbeddingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmbeddingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmbeddingGroupByOutputType[P]>
            : GetScalarType<T[P], EmbeddingGroupByOutputType[P]>
        }
      >
    >


  export type EmbeddingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    chunkId?: boolean
    vector?: boolean
    createdAt?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
    chunk?: boolean | DocumentChunkDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["embedding"]>

  export type EmbeddingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    chunkId?: boolean
    vector?: boolean
    createdAt?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
    chunk?: boolean | DocumentChunkDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["embedding"]>

  export type EmbeddingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    chunkId?: boolean
    vector?: boolean
    createdAt?: boolean
    user?: boolean | UsersDefaultArgs<ExtArgs>
    chunk?: boolean | DocumentChunkDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["embedding"]>

  export type EmbeddingSelectScalar = {
    id?: boolean
    userId?: boolean
    chunkId?: boolean
    vector?: boolean
    createdAt?: boolean
  }

  export type EmbeddingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "chunkId" | "vector" | "createdAt", ExtArgs["result"]["embedding"]>
  export type EmbeddingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
    chunk?: boolean | DocumentChunkDefaultArgs<ExtArgs>
  }
  export type EmbeddingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
    chunk?: boolean | DocumentChunkDefaultArgs<ExtArgs>
  }
  export type EmbeddingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UsersDefaultArgs<ExtArgs>
    chunk?: boolean | DocumentChunkDefaultArgs<ExtArgs>
  }

  export type $EmbeddingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Embedding"
    objects: {
      user: Prisma.$UsersPayload<ExtArgs>
      chunk: Prisma.$DocumentChunkPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      chunkId: string
      vector: number[]
      createdAt: Date
    }, ExtArgs["result"]["embedding"]>
    composites: {}
  }

  type EmbeddingGetPayload<S extends boolean | null | undefined | EmbeddingDefaultArgs> = $Result.GetResult<Prisma.$EmbeddingPayload, S>

  type EmbeddingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EmbeddingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EmbeddingCountAggregateInputType | true
    }

  export interface EmbeddingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Embedding'], meta: { name: 'Embedding' } }
    /**
     * Find zero or one Embedding that matches the filter.
     * @param {EmbeddingFindUniqueArgs} args - Arguments to find a Embedding
     * @example
     * // Get one Embedding
     * const embedding = await prisma.embedding.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmbeddingFindUniqueArgs>(args: SelectSubset<T, EmbeddingFindUniqueArgs<ExtArgs>>): Prisma__EmbeddingClient<$Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Embedding that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EmbeddingFindUniqueOrThrowArgs} args - Arguments to find a Embedding
     * @example
     * // Get one Embedding
     * const embedding = await prisma.embedding.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmbeddingFindUniqueOrThrowArgs>(args: SelectSubset<T, EmbeddingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmbeddingClient<$Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Embedding that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbeddingFindFirstArgs} args - Arguments to find a Embedding
     * @example
     * // Get one Embedding
     * const embedding = await prisma.embedding.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmbeddingFindFirstArgs>(args?: SelectSubset<T, EmbeddingFindFirstArgs<ExtArgs>>): Prisma__EmbeddingClient<$Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Embedding that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbeddingFindFirstOrThrowArgs} args - Arguments to find a Embedding
     * @example
     * // Get one Embedding
     * const embedding = await prisma.embedding.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmbeddingFindFirstOrThrowArgs>(args?: SelectSubset<T, EmbeddingFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmbeddingClient<$Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Embeddings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbeddingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Embeddings
     * const embeddings = await prisma.embedding.findMany()
     * 
     * // Get first 10 Embeddings
     * const embeddings = await prisma.embedding.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const embeddingWithIdOnly = await prisma.embedding.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EmbeddingFindManyArgs>(args?: SelectSubset<T, EmbeddingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Embedding.
     * @param {EmbeddingCreateArgs} args - Arguments to create a Embedding.
     * @example
     * // Create one Embedding
     * const Embedding = await prisma.embedding.create({
     *   data: {
     *     // ... data to create a Embedding
     *   }
     * })
     * 
     */
    create<T extends EmbeddingCreateArgs>(args: SelectSubset<T, EmbeddingCreateArgs<ExtArgs>>): Prisma__EmbeddingClient<$Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Embeddings.
     * @param {EmbeddingCreateManyArgs} args - Arguments to create many Embeddings.
     * @example
     * // Create many Embeddings
     * const embedding = await prisma.embedding.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmbeddingCreateManyArgs>(args?: SelectSubset<T, EmbeddingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Embeddings and returns the data saved in the database.
     * @param {EmbeddingCreateManyAndReturnArgs} args - Arguments to create many Embeddings.
     * @example
     * // Create many Embeddings
     * const embedding = await prisma.embedding.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Embeddings and only return the `id`
     * const embeddingWithIdOnly = await prisma.embedding.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmbeddingCreateManyAndReturnArgs>(args?: SelectSubset<T, EmbeddingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Embedding.
     * @param {EmbeddingDeleteArgs} args - Arguments to delete one Embedding.
     * @example
     * // Delete one Embedding
     * const Embedding = await prisma.embedding.delete({
     *   where: {
     *     // ... filter to delete one Embedding
     *   }
     * })
     * 
     */
    delete<T extends EmbeddingDeleteArgs>(args: SelectSubset<T, EmbeddingDeleteArgs<ExtArgs>>): Prisma__EmbeddingClient<$Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Embedding.
     * @param {EmbeddingUpdateArgs} args - Arguments to update one Embedding.
     * @example
     * // Update one Embedding
     * const embedding = await prisma.embedding.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmbeddingUpdateArgs>(args: SelectSubset<T, EmbeddingUpdateArgs<ExtArgs>>): Prisma__EmbeddingClient<$Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Embeddings.
     * @param {EmbeddingDeleteManyArgs} args - Arguments to filter Embeddings to delete.
     * @example
     * // Delete a few Embeddings
     * const { count } = await prisma.embedding.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmbeddingDeleteManyArgs>(args?: SelectSubset<T, EmbeddingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Embeddings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbeddingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Embeddings
     * const embedding = await prisma.embedding.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmbeddingUpdateManyArgs>(args: SelectSubset<T, EmbeddingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Embeddings and returns the data updated in the database.
     * @param {EmbeddingUpdateManyAndReturnArgs} args - Arguments to update many Embeddings.
     * @example
     * // Update many Embeddings
     * const embedding = await prisma.embedding.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Embeddings and only return the `id`
     * const embeddingWithIdOnly = await prisma.embedding.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EmbeddingUpdateManyAndReturnArgs>(args: SelectSubset<T, EmbeddingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Embedding.
     * @param {EmbeddingUpsertArgs} args - Arguments to update or create a Embedding.
     * @example
     * // Update or create a Embedding
     * const embedding = await prisma.embedding.upsert({
     *   create: {
     *     // ... data to create a Embedding
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Embedding we want to update
     *   }
     * })
     */
    upsert<T extends EmbeddingUpsertArgs>(args: SelectSubset<T, EmbeddingUpsertArgs<ExtArgs>>): Prisma__EmbeddingClient<$Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Embeddings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbeddingCountArgs} args - Arguments to filter Embeddings to count.
     * @example
     * // Count the number of Embeddings
     * const count = await prisma.embedding.count({
     *   where: {
     *     // ... the filter for the Embeddings we want to count
     *   }
     * })
    **/
    count<T extends EmbeddingCountArgs>(
      args?: Subset<T, EmbeddingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmbeddingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Embedding.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbeddingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmbeddingAggregateArgs>(args: Subset<T, EmbeddingAggregateArgs>): Prisma.PrismaPromise<GetEmbeddingAggregateType<T>>

    /**
     * Group by Embedding.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmbeddingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmbeddingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmbeddingGroupByArgs['orderBy'] }
        : { orderBy?: EmbeddingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmbeddingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmbeddingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Embedding model
   */
  readonly fields: EmbeddingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Embedding.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmbeddingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UsersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsersDefaultArgs<ExtArgs>>): Prisma__UsersClient<$Result.GetResult<Prisma.$UsersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    chunk<T extends DocumentChunkDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DocumentChunkDefaultArgs<ExtArgs>>): Prisma__DocumentChunkClient<$Result.GetResult<Prisma.$DocumentChunkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Embedding model
   */
  interface EmbeddingFieldRefs {
    readonly id: FieldRef<"Embedding", 'String'>
    readonly userId: FieldRef<"Embedding", 'String'>
    readonly chunkId: FieldRef<"Embedding", 'String'>
    readonly vector: FieldRef<"Embedding", 'Float[]'>
    readonly createdAt: FieldRef<"Embedding", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Embedding findUnique
   */
  export type EmbeddingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingInclude<ExtArgs> | null
    /**
     * Filter, which Embedding to fetch.
     */
    where: EmbeddingWhereUniqueInput
  }

  /**
   * Embedding findUniqueOrThrow
   */
  export type EmbeddingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingInclude<ExtArgs> | null
    /**
     * Filter, which Embedding to fetch.
     */
    where: EmbeddingWhereUniqueInput
  }

  /**
   * Embedding findFirst
   */
  export type EmbeddingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingInclude<ExtArgs> | null
    /**
     * Filter, which Embedding to fetch.
     */
    where?: EmbeddingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Embeddings to fetch.
     */
    orderBy?: EmbeddingOrderByWithRelationInput | EmbeddingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Embeddings.
     */
    cursor?: EmbeddingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Embeddings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Embeddings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Embeddings.
     */
    distinct?: EmbeddingScalarFieldEnum | EmbeddingScalarFieldEnum[]
  }

  /**
   * Embedding findFirstOrThrow
   */
  export type EmbeddingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingInclude<ExtArgs> | null
    /**
     * Filter, which Embedding to fetch.
     */
    where?: EmbeddingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Embeddings to fetch.
     */
    orderBy?: EmbeddingOrderByWithRelationInput | EmbeddingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Embeddings.
     */
    cursor?: EmbeddingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Embeddings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Embeddings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Embeddings.
     */
    distinct?: EmbeddingScalarFieldEnum | EmbeddingScalarFieldEnum[]
  }

  /**
   * Embedding findMany
   */
  export type EmbeddingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingInclude<ExtArgs> | null
    /**
     * Filter, which Embeddings to fetch.
     */
    where?: EmbeddingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Embeddings to fetch.
     */
    orderBy?: EmbeddingOrderByWithRelationInput | EmbeddingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Embeddings.
     */
    cursor?: EmbeddingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Embeddings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Embeddings.
     */
    skip?: number
    distinct?: EmbeddingScalarFieldEnum | EmbeddingScalarFieldEnum[]
  }

  /**
   * Embedding create
   */
  export type EmbeddingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingInclude<ExtArgs> | null
    /**
     * The data needed to create a Embedding.
     */
    data: XOR<EmbeddingCreateInput, EmbeddingUncheckedCreateInput>
  }

  /**
   * Embedding createMany
   */
  export type EmbeddingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Embeddings.
     */
    data: EmbeddingCreateManyInput | EmbeddingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Embedding createManyAndReturn
   */
  export type EmbeddingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * The data used to create many Embeddings.
     */
    data: EmbeddingCreateManyInput | EmbeddingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Embedding update
   */
  export type EmbeddingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingInclude<ExtArgs> | null
    /**
     * The data needed to update a Embedding.
     */
    data: XOR<EmbeddingUpdateInput, EmbeddingUncheckedUpdateInput>
    /**
     * Choose, which Embedding to update.
     */
    where: EmbeddingWhereUniqueInput
  }

  /**
   * Embedding updateMany
   */
  export type EmbeddingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Embeddings.
     */
    data: XOR<EmbeddingUpdateManyMutationInput, EmbeddingUncheckedUpdateManyInput>
    /**
     * Filter which Embeddings to update
     */
    where?: EmbeddingWhereInput
    /**
     * Limit how many Embeddings to update.
     */
    limit?: number
  }

  /**
   * Embedding updateManyAndReturn
   */
  export type EmbeddingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * The data used to update Embeddings.
     */
    data: XOR<EmbeddingUpdateManyMutationInput, EmbeddingUncheckedUpdateManyInput>
    /**
     * Filter which Embeddings to update
     */
    where?: EmbeddingWhereInput
    /**
     * Limit how many Embeddings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Embedding upsert
   */
  export type EmbeddingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingInclude<ExtArgs> | null
    /**
     * The filter to search for the Embedding to update in case it exists.
     */
    where: EmbeddingWhereUniqueInput
    /**
     * In case the Embedding found by the `where` argument doesn't exist, create a new Embedding with this data.
     */
    create: XOR<EmbeddingCreateInput, EmbeddingUncheckedCreateInput>
    /**
     * In case the Embedding was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmbeddingUpdateInput, EmbeddingUncheckedUpdateInput>
  }

  /**
   * Embedding delete
   */
  export type EmbeddingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingInclude<ExtArgs> | null
    /**
     * Filter which Embedding to delete.
     */
    where: EmbeddingWhereUniqueInput
  }

  /**
   * Embedding deleteMany
   */
  export type EmbeddingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Embeddings to delete
     */
    where?: EmbeddingWhereInput
    /**
     * Limit how many Embeddings to delete.
     */
    limit?: number
  }

  /**
   * Embedding without action
   */
  export type EmbeddingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: EmbeddingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Embedding
     */
    omit?: EmbeddingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmbeddingInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AccountScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    type: 'type',
    provider: 'provider',
    providerAccountId: 'providerAccountId',
    refresh_token: 'refresh_token',
    access_token: 'access_token',
    expires_at: 'expires_at',
    token_type: 'token_type',
    scope: 'scope',
    id_token: 'id_token',
    session_state: 'session_state'
  };

  export type AccountScalarFieldEnum = (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum]


  export const SessionScalarFieldEnum: {
    id: 'id',
    sessionToken: 'sessionToken',
    userId: 'userId',
    expires: 'expires'
  };

  export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum]


  export const UsersScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    emailVerified: 'emailVerified',
    image: 'image',
    password: 'password',
    passwordResetToken: 'passwordResetToken',
    passwordResetTokenExp: 'passwordResetTokenExp',
    company: 'company',
    plan: 'plan',
    subscription_type: 'subscription_type',
    subscription_start_date: 'subscription_start_date',
    subscription_end_date: 'subscription_end_date',
    is_active: 'is_active',
    is_verified: 'is_verified',
    login_attempts: 'login_attempts',
    locked_until: 'locked_until',
    created_at: 'created_at',
    updated_at: 'updated_at',
    jobTitle: 'jobTitle',
    bio: 'bio',
    phone: 'phone'
  };

  export type UsersScalarFieldEnum = (typeof UsersScalarFieldEnum)[keyof typeof UsersScalarFieldEnum]


  export const VerificationTokenScalarFieldEnum: {
    identifier: 'identifier',
    token: 'token',
    expires: 'expires'
  };

  export type VerificationTokenScalarFieldEnum = (typeof VerificationTokenScalarFieldEnum)[keyof typeof VerificationTokenScalarFieldEnum]


  export const SubscriptionPlanScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    price: 'price',
    currency: 'currency',
    features: 'features',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SubscriptionPlanScalarFieldEnum = (typeof SubscriptionPlanScalarFieldEnum)[keyof typeof SubscriptionPlanScalarFieldEnum]


  export const SubscriptionScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    planId: 'planId',
    razorpaySubscriptionId: 'razorpaySubscriptionId',
    razorpayCustomerId: 'razorpayCustomerId',
    status: 'status',
    currentPeriodStart: 'currentPeriodStart',
    currentPeriodEnd: 'currentPeriodEnd',
    cancelledAt: 'cancelledAt',
    lastPaymentId: 'lastPaymentId',
    lastPaymentAmount: 'lastPaymentAmount',
    lastPaymentDate: 'lastPaymentDate',
    lastPaymentError: 'lastPaymentError',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SubscriptionScalarFieldEnum = (typeof SubscriptionScalarFieldEnum)[keyof typeof SubscriptionScalarFieldEnum]


  export const MessageScalarFieldEnum: {
    id: 'id',
    content: 'content',
    role: 'role',
    createdAt: 'createdAt',
    userId: 'userId'
  };

  export type MessageScalarFieldEnum = (typeof MessageScalarFieldEnum)[keyof typeof MessageScalarFieldEnum]


  export const ContactMessageScalarFieldEnum: {
    id: 'id',
    fullName: 'fullName',
    email: 'email',
    phone: 'phone',
    message: 'message',
    createdAt: 'createdAt'
  };

  export type ContactMessageScalarFieldEnum = (typeof ContactMessageScalarFieldEnum)[keyof typeof ContactMessageScalarFieldEnum]


  export const ChatConversationScalarFieldEnum: {
    id: 'id',
    visitorId: 'visitorId',
    userId: 'userId',
    userAgent: 'userAgent',
    deviceType: 'deviceType',
    browser: 'browser',
    os: 'os',
    ipAddress: 'ipAddress',
    referrer: 'referrer',
    firstSeen: 'firstSeen',
    lastSeen: 'lastSeen',
    totalMessages: 'totalMessages',
    avgResponseTime: 'avgResponseTime'
  };

  export type ChatConversationScalarFieldEnum = (typeof ChatConversationScalarFieldEnum)[keyof typeof ChatConversationScalarFieldEnum]


  export const ChatMessageScalarFieldEnum: {
    id: 'id',
    conversationId: 'conversationId',
    content: 'content',
    role: 'role',
    createdAt: 'createdAt'
  };

  export type ChatMessageScalarFieldEnum = (typeof ChatMessageScalarFieldEnum)[keyof typeof ChatMessageScalarFieldEnum]


  export const DocumentScalarFieldEnum: {
    id: 'id',
    fileName: 'fileName',
    originalName: 'originalName',
    fileType: 'fileType',
    fileSize: 'fileSize',
    category: 'category',
    description: 'description',
    content: 'content',
    keywords: 'keywords',
    uploadedAt: 'uploadedAt',
    userId: 'userId'
  };

  export type DocumentScalarFieldEnum = (typeof DocumentScalarFieldEnum)[keyof typeof DocumentScalarFieldEnum]


  export const DocumentChunkScalarFieldEnum: {
    id: 'id',
    documentId: 'documentId',
    content: 'content',
    chunkIndex: 'chunkIndex'
  };

  export type DocumentChunkScalarFieldEnum = (typeof DocumentChunkScalarFieldEnum)[keyof typeof DocumentChunkScalarFieldEnum]


  export const EmbeddingScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    chunkId: 'chunkId',
    vector: 'vector',
    createdAt: 'createdAt'
  };

  export type EmbeddingScalarFieldEnum = (typeof EmbeddingScalarFieldEnum)[keyof typeof EmbeddingScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'PlanType'
   */
  export type EnumPlanTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlanType'>
    


  /**
   * Reference to a field of type 'PlanType[]'
   */
  export type ListEnumPlanTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlanType[]'>
    


  /**
   * Reference to a field of type 'SubscriptionType'
   */
  export type EnumSubscriptionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SubscriptionType'>
    


  /**
   * Reference to a field of type 'SubscriptionType[]'
   */
  export type ListEnumSubscriptionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SubscriptionType[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type AccountWhereInput = {
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    id?: StringFilter<"Account"> | string
    userId?: StringFilter<"Account"> | string
    type?: StringFilter<"Account"> | string
    provider?: StringFilter<"Account"> | string
    providerAccountId?: StringFilter<"Account"> | string
    refresh_token?: StringNullableFilter<"Account"> | string | null
    access_token?: StringNullableFilter<"Account"> | string | null
    expires_at?: IntNullableFilter<"Account"> | number | null
    token_type?: StringNullableFilter<"Account"> | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    id_token?: StringNullableFilter<"Account"> | string | null
    session_state?: StringNullableFilter<"Account"> | string | null
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
  }

  export type AccountOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrderInput | SortOrder
    access_token?: SortOrderInput | SortOrder
    expires_at?: SortOrderInput | SortOrder
    token_type?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    id_token?: SortOrderInput | SortOrder
    session_state?: SortOrderInput | SortOrder
    user?: UsersOrderByWithRelationInput
  }

  export type AccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    provider_providerAccountId?: AccountProviderProviderAccountIdCompoundUniqueInput
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    userId?: StringFilter<"Account"> | string
    type?: StringFilter<"Account"> | string
    provider?: StringFilter<"Account"> | string
    providerAccountId?: StringFilter<"Account"> | string
    refresh_token?: StringNullableFilter<"Account"> | string | null
    access_token?: StringNullableFilter<"Account"> | string | null
    expires_at?: IntNullableFilter<"Account"> | number | null
    token_type?: StringNullableFilter<"Account"> | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    id_token?: StringNullableFilter<"Account"> | string | null
    session_state?: StringNullableFilter<"Account"> | string | null
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
  }, "id" | "provider_providerAccountId">

  export type AccountOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrderInput | SortOrder
    access_token?: SortOrderInput | SortOrder
    expires_at?: SortOrderInput | SortOrder
    token_type?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    id_token?: SortOrderInput | SortOrder
    session_state?: SortOrderInput | SortOrder
    _count?: AccountCountOrderByAggregateInput
    _avg?: AccountAvgOrderByAggregateInput
    _max?: AccountMaxOrderByAggregateInput
    _min?: AccountMinOrderByAggregateInput
    _sum?: AccountSumOrderByAggregateInput
  }

  export type AccountScalarWhereWithAggregatesInput = {
    AND?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    OR?: AccountScalarWhereWithAggregatesInput[]
    NOT?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Account"> | string
    userId?: StringWithAggregatesFilter<"Account"> | string
    type?: StringWithAggregatesFilter<"Account"> | string
    provider?: StringWithAggregatesFilter<"Account"> | string
    providerAccountId?: StringWithAggregatesFilter<"Account"> | string
    refresh_token?: StringNullableWithAggregatesFilter<"Account"> | string | null
    access_token?: StringNullableWithAggregatesFilter<"Account"> | string | null
    expires_at?: IntNullableWithAggregatesFilter<"Account"> | number | null
    token_type?: StringNullableWithAggregatesFilter<"Account"> | string | null
    scope?: StringNullableWithAggregatesFilter<"Account"> | string | null
    id_token?: StringNullableWithAggregatesFilter<"Account"> | string | null
    session_state?: StringNullableWithAggregatesFilter<"Account"> | string | null
  }

  export type SessionWhereInput = {
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    id?: StringFilter<"Session"> | string
    sessionToken?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
  }

  export type SessionOrderByWithRelationInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
    user?: UsersOrderByWithRelationInput
  }

  export type SessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sessionToken?: string
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
  }, "id" | "sessionToken">

  export type SessionOrderByWithAggregationInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
    _count?: SessionCountOrderByAggregateInput
    _max?: SessionMaxOrderByAggregateInput
    _min?: SessionMinOrderByAggregateInput
  }

  export type SessionScalarWhereWithAggregatesInput = {
    AND?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    OR?: SessionScalarWhereWithAggregatesInput[]
    NOT?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Session"> | string
    sessionToken?: StringWithAggregatesFilter<"Session"> | string
    userId?: StringWithAggregatesFilter<"Session"> | string
    expires?: DateTimeWithAggregatesFilter<"Session"> | Date | string
  }

  export type UsersWhereInput = {
    AND?: UsersWhereInput | UsersWhereInput[]
    OR?: UsersWhereInput[]
    NOT?: UsersWhereInput | UsersWhereInput[]
    id?: StringFilter<"Users"> | string
    name?: StringFilter<"Users"> | string
    email?: StringFilter<"Users"> | string
    emailVerified?: DateTimeNullableFilter<"Users"> | Date | string | null
    image?: StringNullableFilter<"Users"> | string | null
    password?: StringFilter<"Users"> | string
    passwordResetToken?: StringNullableFilter<"Users"> | string | null
    passwordResetTokenExp?: DateTimeNullableFilter<"Users"> | Date | string | null
    company?: StringFilter<"Users"> | string
    plan?: EnumPlanTypeFilter<"Users"> | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFilter<"Users"> | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFilter<"Users"> | Date | string
    subscription_end_date?: DateTimeFilter<"Users"> | Date | string
    is_active?: BoolFilter<"Users"> | boolean
    is_verified?: BoolFilter<"Users"> | boolean
    login_attempts?: IntFilter<"Users"> | number
    locked_until?: DateTimeNullableFilter<"Users"> | Date | string | null
    created_at?: DateTimeFilter<"Users"> | Date | string
    updated_at?: DateTimeFilter<"Users"> | Date | string
    jobTitle?: StringNullableFilter<"Users"> | string | null
    bio?: StringNullableFilter<"Users"> | string | null
    phone?: StringNullableFilter<"Users"> | string | null
    accounts?: AccountListRelationFilter
    sessions?: SessionListRelationFilter
    subscription?: XOR<SubscriptionNullableScalarRelationFilter, SubscriptionWhereInput> | null
    messages?: MessageListRelationFilter
    documents?: DocumentListRelationFilter
    embeddings?: EmbeddingListRelationFilter
    chatConversations?: ChatConversationListRelationFilter
  }

  export type UsersOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrderInput | SortOrder
    image?: SortOrderInput | SortOrder
    password?: SortOrder
    passwordResetToken?: SortOrderInput | SortOrder
    passwordResetTokenExp?: SortOrderInput | SortOrder
    company?: SortOrder
    plan?: SortOrder
    subscription_type?: SortOrder
    subscription_start_date?: SortOrder
    subscription_end_date?: SortOrder
    is_active?: SortOrder
    is_verified?: SortOrder
    login_attempts?: SortOrder
    locked_until?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    jobTitle?: SortOrderInput | SortOrder
    bio?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    accounts?: AccountOrderByRelationAggregateInput
    sessions?: SessionOrderByRelationAggregateInput
    subscription?: SubscriptionOrderByWithRelationInput
    messages?: MessageOrderByRelationAggregateInput
    documents?: DocumentOrderByRelationAggregateInput
    embeddings?: EmbeddingOrderByRelationAggregateInput
    chatConversations?: ChatConversationOrderByRelationAggregateInput
  }

  export type UsersWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    passwordResetToken?: string
    AND?: UsersWhereInput | UsersWhereInput[]
    OR?: UsersWhereInput[]
    NOT?: UsersWhereInput | UsersWhereInput[]
    name?: StringFilter<"Users"> | string
    emailVerified?: DateTimeNullableFilter<"Users"> | Date | string | null
    image?: StringNullableFilter<"Users"> | string | null
    password?: StringFilter<"Users"> | string
    passwordResetTokenExp?: DateTimeNullableFilter<"Users"> | Date | string | null
    company?: StringFilter<"Users"> | string
    plan?: EnumPlanTypeFilter<"Users"> | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFilter<"Users"> | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFilter<"Users"> | Date | string
    subscription_end_date?: DateTimeFilter<"Users"> | Date | string
    is_active?: BoolFilter<"Users"> | boolean
    is_verified?: BoolFilter<"Users"> | boolean
    login_attempts?: IntFilter<"Users"> | number
    locked_until?: DateTimeNullableFilter<"Users"> | Date | string | null
    created_at?: DateTimeFilter<"Users"> | Date | string
    updated_at?: DateTimeFilter<"Users"> | Date | string
    jobTitle?: StringNullableFilter<"Users"> | string | null
    bio?: StringNullableFilter<"Users"> | string | null
    phone?: StringNullableFilter<"Users"> | string | null
    accounts?: AccountListRelationFilter
    sessions?: SessionListRelationFilter
    subscription?: XOR<SubscriptionNullableScalarRelationFilter, SubscriptionWhereInput> | null
    messages?: MessageListRelationFilter
    documents?: DocumentListRelationFilter
    embeddings?: EmbeddingListRelationFilter
    chatConversations?: ChatConversationListRelationFilter
  }, "id" | "email" | "passwordResetToken">

  export type UsersOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrderInput | SortOrder
    image?: SortOrderInput | SortOrder
    password?: SortOrder
    passwordResetToken?: SortOrderInput | SortOrder
    passwordResetTokenExp?: SortOrderInput | SortOrder
    company?: SortOrder
    plan?: SortOrder
    subscription_type?: SortOrder
    subscription_start_date?: SortOrder
    subscription_end_date?: SortOrder
    is_active?: SortOrder
    is_verified?: SortOrder
    login_attempts?: SortOrder
    locked_until?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    jobTitle?: SortOrderInput | SortOrder
    bio?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    _count?: UsersCountOrderByAggregateInput
    _avg?: UsersAvgOrderByAggregateInput
    _max?: UsersMaxOrderByAggregateInput
    _min?: UsersMinOrderByAggregateInput
    _sum?: UsersSumOrderByAggregateInput
  }

  export type UsersScalarWhereWithAggregatesInput = {
    AND?: UsersScalarWhereWithAggregatesInput | UsersScalarWhereWithAggregatesInput[]
    OR?: UsersScalarWhereWithAggregatesInput[]
    NOT?: UsersScalarWhereWithAggregatesInput | UsersScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Users"> | string
    name?: StringWithAggregatesFilter<"Users"> | string
    email?: StringWithAggregatesFilter<"Users"> | string
    emailVerified?: DateTimeNullableWithAggregatesFilter<"Users"> | Date | string | null
    image?: StringNullableWithAggregatesFilter<"Users"> | string | null
    password?: StringWithAggregatesFilter<"Users"> | string
    passwordResetToken?: StringNullableWithAggregatesFilter<"Users"> | string | null
    passwordResetTokenExp?: DateTimeNullableWithAggregatesFilter<"Users"> | Date | string | null
    company?: StringWithAggregatesFilter<"Users"> | string
    plan?: EnumPlanTypeWithAggregatesFilter<"Users"> | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeWithAggregatesFilter<"Users"> | $Enums.SubscriptionType
    subscription_start_date?: DateTimeWithAggregatesFilter<"Users"> | Date | string
    subscription_end_date?: DateTimeWithAggregatesFilter<"Users"> | Date | string
    is_active?: BoolWithAggregatesFilter<"Users"> | boolean
    is_verified?: BoolWithAggregatesFilter<"Users"> | boolean
    login_attempts?: IntWithAggregatesFilter<"Users"> | number
    locked_until?: DateTimeNullableWithAggregatesFilter<"Users"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"Users"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Users"> | Date | string
    jobTitle?: StringNullableWithAggregatesFilter<"Users"> | string | null
    bio?: StringNullableWithAggregatesFilter<"Users"> | string | null
    phone?: StringNullableWithAggregatesFilter<"Users"> | string | null
  }

  export type VerificationTokenWhereInput = {
    AND?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    OR?: VerificationTokenWhereInput[]
    NOT?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    identifier?: StringFilter<"VerificationToken"> | string
    token?: StringFilter<"VerificationToken"> | string
    expires?: DateTimeFilter<"VerificationToken"> | Date | string
  }

  export type VerificationTokenOrderByWithRelationInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type VerificationTokenWhereUniqueInput = Prisma.AtLeast<{
    token?: string
    identifier_token?: VerificationTokenIdentifierTokenCompoundUniqueInput
    AND?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    OR?: VerificationTokenWhereInput[]
    NOT?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    identifier?: StringFilter<"VerificationToken"> | string
    expires?: DateTimeFilter<"VerificationToken"> | Date | string
  }, "token" | "identifier_token">

  export type VerificationTokenOrderByWithAggregationInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
    _count?: VerificationTokenCountOrderByAggregateInput
    _max?: VerificationTokenMaxOrderByAggregateInput
    _min?: VerificationTokenMinOrderByAggregateInput
  }

  export type VerificationTokenScalarWhereWithAggregatesInput = {
    AND?: VerificationTokenScalarWhereWithAggregatesInput | VerificationTokenScalarWhereWithAggregatesInput[]
    OR?: VerificationTokenScalarWhereWithAggregatesInput[]
    NOT?: VerificationTokenScalarWhereWithAggregatesInput | VerificationTokenScalarWhereWithAggregatesInput[]
    identifier?: StringWithAggregatesFilter<"VerificationToken"> | string
    token?: StringWithAggregatesFilter<"VerificationToken"> | string
    expires?: DateTimeWithAggregatesFilter<"VerificationToken"> | Date | string
  }

  export type SubscriptionPlanWhereInput = {
    AND?: SubscriptionPlanWhereInput | SubscriptionPlanWhereInput[]
    OR?: SubscriptionPlanWhereInput[]
    NOT?: SubscriptionPlanWhereInput | SubscriptionPlanWhereInput[]
    id?: StringFilter<"SubscriptionPlan"> | string
    name?: StringFilter<"SubscriptionPlan"> | string
    description?: StringFilter<"SubscriptionPlan"> | string
    price?: FloatFilter<"SubscriptionPlan"> | number
    currency?: StringFilter<"SubscriptionPlan"> | string
    features?: StringNullableListFilter<"SubscriptionPlan">
    isActive?: BoolFilter<"SubscriptionPlan"> | boolean
    createdAt?: DateTimeFilter<"SubscriptionPlan"> | Date | string
    updatedAt?: DateTimeFilter<"SubscriptionPlan"> | Date | string
    subscriptions?: SubscriptionListRelationFilter
  }

  export type SubscriptionPlanOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    features?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    subscriptions?: SubscriptionOrderByRelationAggregateInput
  }

  export type SubscriptionPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: SubscriptionPlanWhereInput | SubscriptionPlanWhereInput[]
    OR?: SubscriptionPlanWhereInput[]
    NOT?: SubscriptionPlanWhereInput | SubscriptionPlanWhereInput[]
    description?: StringFilter<"SubscriptionPlan"> | string
    price?: FloatFilter<"SubscriptionPlan"> | number
    currency?: StringFilter<"SubscriptionPlan"> | string
    features?: StringNullableListFilter<"SubscriptionPlan">
    isActive?: BoolFilter<"SubscriptionPlan"> | boolean
    createdAt?: DateTimeFilter<"SubscriptionPlan"> | Date | string
    updatedAt?: DateTimeFilter<"SubscriptionPlan"> | Date | string
    subscriptions?: SubscriptionListRelationFilter
  }, "id" | "name">

  export type SubscriptionPlanOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    features?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SubscriptionPlanCountOrderByAggregateInput
    _avg?: SubscriptionPlanAvgOrderByAggregateInput
    _max?: SubscriptionPlanMaxOrderByAggregateInput
    _min?: SubscriptionPlanMinOrderByAggregateInput
    _sum?: SubscriptionPlanSumOrderByAggregateInput
  }

  export type SubscriptionPlanScalarWhereWithAggregatesInput = {
    AND?: SubscriptionPlanScalarWhereWithAggregatesInput | SubscriptionPlanScalarWhereWithAggregatesInput[]
    OR?: SubscriptionPlanScalarWhereWithAggregatesInput[]
    NOT?: SubscriptionPlanScalarWhereWithAggregatesInput | SubscriptionPlanScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SubscriptionPlan"> | string
    name?: StringWithAggregatesFilter<"SubscriptionPlan"> | string
    description?: StringWithAggregatesFilter<"SubscriptionPlan"> | string
    price?: FloatWithAggregatesFilter<"SubscriptionPlan"> | number
    currency?: StringWithAggregatesFilter<"SubscriptionPlan"> | string
    features?: StringNullableListFilter<"SubscriptionPlan">
    isActive?: BoolWithAggregatesFilter<"SubscriptionPlan"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"SubscriptionPlan"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SubscriptionPlan"> | Date | string
  }

  export type SubscriptionWhereInput = {
    AND?: SubscriptionWhereInput | SubscriptionWhereInput[]
    OR?: SubscriptionWhereInput[]
    NOT?: SubscriptionWhereInput | SubscriptionWhereInput[]
    id?: StringFilter<"Subscription"> | string
    userId?: StringFilter<"Subscription"> | string
    planId?: StringFilter<"Subscription"> | string
    razorpaySubscriptionId?: StringFilter<"Subscription"> | string
    razorpayCustomerId?: StringFilter<"Subscription"> | string
    status?: StringFilter<"Subscription"> | string
    currentPeriodStart?: DateTimeFilter<"Subscription"> | Date | string
    currentPeriodEnd?: DateTimeFilter<"Subscription"> | Date | string
    cancelledAt?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    lastPaymentId?: StringNullableFilter<"Subscription"> | string | null
    lastPaymentAmount?: FloatNullableFilter<"Subscription"> | number | null
    lastPaymentDate?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    lastPaymentError?: StringNullableFilter<"Subscription"> | string | null
    createdAt?: DateTimeFilter<"Subscription"> | Date | string
    updatedAt?: DateTimeFilter<"Subscription"> | Date | string
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
    plan?: XOR<SubscriptionPlanScalarRelationFilter, SubscriptionPlanWhereInput>
  }

  export type SubscriptionOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    planId?: SortOrder
    razorpaySubscriptionId?: SortOrder
    razorpayCustomerId?: SortOrder
    status?: SortOrder
    currentPeriodStart?: SortOrder
    currentPeriodEnd?: SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    lastPaymentId?: SortOrderInput | SortOrder
    lastPaymentAmount?: SortOrderInput | SortOrder
    lastPaymentDate?: SortOrderInput | SortOrder
    lastPaymentError?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UsersOrderByWithRelationInput
    plan?: SubscriptionPlanOrderByWithRelationInput
  }

  export type SubscriptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    razorpaySubscriptionId?: string
    AND?: SubscriptionWhereInput | SubscriptionWhereInput[]
    OR?: SubscriptionWhereInput[]
    NOT?: SubscriptionWhereInput | SubscriptionWhereInput[]
    planId?: StringFilter<"Subscription"> | string
    razorpayCustomerId?: StringFilter<"Subscription"> | string
    status?: StringFilter<"Subscription"> | string
    currentPeriodStart?: DateTimeFilter<"Subscription"> | Date | string
    currentPeriodEnd?: DateTimeFilter<"Subscription"> | Date | string
    cancelledAt?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    lastPaymentId?: StringNullableFilter<"Subscription"> | string | null
    lastPaymentAmount?: FloatNullableFilter<"Subscription"> | number | null
    lastPaymentDate?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    lastPaymentError?: StringNullableFilter<"Subscription"> | string | null
    createdAt?: DateTimeFilter<"Subscription"> | Date | string
    updatedAt?: DateTimeFilter<"Subscription"> | Date | string
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
    plan?: XOR<SubscriptionPlanScalarRelationFilter, SubscriptionPlanWhereInput>
  }, "id" | "userId" | "razorpaySubscriptionId">

  export type SubscriptionOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    planId?: SortOrder
    razorpaySubscriptionId?: SortOrder
    razorpayCustomerId?: SortOrder
    status?: SortOrder
    currentPeriodStart?: SortOrder
    currentPeriodEnd?: SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    lastPaymentId?: SortOrderInput | SortOrder
    lastPaymentAmount?: SortOrderInput | SortOrder
    lastPaymentDate?: SortOrderInput | SortOrder
    lastPaymentError?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SubscriptionCountOrderByAggregateInput
    _avg?: SubscriptionAvgOrderByAggregateInput
    _max?: SubscriptionMaxOrderByAggregateInput
    _min?: SubscriptionMinOrderByAggregateInput
    _sum?: SubscriptionSumOrderByAggregateInput
  }

  export type SubscriptionScalarWhereWithAggregatesInput = {
    AND?: SubscriptionScalarWhereWithAggregatesInput | SubscriptionScalarWhereWithAggregatesInput[]
    OR?: SubscriptionScalarWhereWithAggregatesInput[]
    NOT?: SubscriptionScalarWhereWithAggregatesInput | SubscriptionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Subscription"> | string
    userId?: StringWithAggregatesFilter<"Subscription"> | string
    planId?: StringWithAggregatesFilter<"Subscription"> | string
    razorpaySubscriptionId?: StringWithAggregatesFilter<"Subscription"> | string
    razorpayCustomerId?: StringWithAggregatesFilter<"Subscription"> | string
    status?: StringWithAggregatesFilter<"Subscription"> | string
    currentPeriodStart?: DateTimeWithAggregatesFilter<"Subscription"> | Date | string
    currentPeriodEnd?: DateTimeWithAggregatesFilter<"Subscription"> | Date | string
    cancelledAt?: DateTimeNullableWithAggregatesFilter<"Subscription"> | Date | string | null
    lastPaymentId?: StringNullableWithAggregatesFilter<"Subscription"> | string | null
    lastPaymentAmount?: FloatNullableWithAggregatesFilter<"Subscription"> | number | null
    lastPaymentDate?: DateTimeNullableWithAggregatesFilter<"Subscription"> | Date | string | null
    lastPaymentError?: StringNullableWithAggregatesFilter<"Subscription"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Subscription"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Subscription"> | Date | string
  }

  export type MessageWhereInput = {
    AND?: MessageWhereInput | MessageWhereInput[]
    OR?: MessageWhereInput[]
    NOT?: MessageWhereInput | MessageWhereInput[]
    id?: StringFilter<"Message"> | string
    content?: StringFilter<"Message"> | string
    role?: StringFilter<"Message"> | string
    createdAt?: DateTimeFilter<"Message"> | Date | string
    userId?: StringFilter<"Message"> | string
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
  }

  export type MessageOrderByWithRelationInput = {
    id?: SortOrder
    content?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    user?: UsersOrderByWithRelationInput
  }

  export type MessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MessageWhereInput | MessageWhereInput[]
    OR?: MessageWhereInput[]
    NOT?: MessageWhereInput | MessageWhereInput[]
    content?: StringFilter<"Message"> | string
    role?: StringFilter<"Message"> | string
    createdAt?: DateTimeFilter<"Message"> | Date | string
    userId?: StringFilter<"Message"> | string
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
  }, "id">

  export type MessageOrderByWithAggregationInput = {
    id?: SortOrder
    content?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    _count?: MessageCountOrderByAggregateInput
    _max?: MessageMaxOrderByAggregateInput
    _min?: MessageMinOrderByAggregateInput
  }

  export type MessageScalarWhereWithAggregatesInput = {
    AND?: MessageScalarWhereWithAggregatesInput | MessageScalarWhereWithAggregatesInput[]
    OR?: MessageScalarWhereWithAggregatesInput[]
    NOT?: MessageScalarWhereWithAggregatesInput | MessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Message"> | string
    content?: StringWithAggregatesFilter<"Message"> | string
    role?: StringWithAggregatesFilter<"Message"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Message"> | Date | string
    userId?: StringWithAggregatesFilter<"Message"> | string
  }

  export type ContactMessageWhereInput = {
    AND?: ContactMessageWhereInput | ContactMessageWhereInput[]
    OR?: ContactMessageWhereInput[]
    NOT?: ContactMessageWhereInput | ContactMessageWhereInput[]
    id?: StringFilter<"ContactMessage"> | string
    fullName?: StringFilter<"ContactMessage"> | string
    email?: StringFilter<"ContactMessage"> | string
    phone?: StringFilter<"ContactMessage"> | string
    message?: StringFilter<"ContactMessage"> | string
    createdAt?: DateTimeFilter<"ContactMessage"> | Date | string
  }

  export type ContactMessageOrderByWithRelationInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    message?: SortOrder
    createdAt?: SortOrder
  }

  export type ContactMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ContactMessageWhereInput | ContactMessageWhereInput[]
    OR?: ContactMessageWhereInput[]
    NOT?: ContactMessageWhereInput | ContactMessageWhereInput[]
    fullName?: StringFilter<"ContactMessage"> | string
    email?: StringFilter<"ContactMessage"> | string
    phone?: StringFilter<"ContactMessage"> | string
    message?: StringFilter<"ContactMessage"> | string
    createdAt?: DateTimeFilter<"ContactMessage"> | Date | string
  }, "id">

  export type ContactMessageOrderByWithAggregationInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    message?: SortOrder
    createdAt?: SortOrder
    _count?: ContactMessageCountOrderByAggregateInput
    _max?: ContactMessageMaxOrderByAggregateInput
    _min?: ContactMessageMinOrderByAggregateInput
  }

  export type ContactMessageScalarWhereWithAggregatesInput = {
    AND?: ContactMessageScalarWhereWithAggregatesInput | ContactMessageScalarWhereWithAggregatesInput[]
    OR?: ContactMessageScalarWhereWithAggregatesInput[]
    NOT?: ContactMessageScalarWhereWithAggregatesInput | ContactMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ContactMessage"> | string
    fullName?: StringWithAggregatesFilter<"ContactMessage"> | string
    email?: StringWithAggregatesFilter<"ContactMessage"> | string
    phone?: StringWithAggregatesFilter<"ContactMessage"> | string
    message?: StringWithAggregatesFilter<"ContactMessage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ContactMessage"> | Date | string
  }

  export type ChatConversationWhereInput = {
    AND?: ChatConversationWhereInput | ChatConversationWhereInput[]
    OR?: ChatConversationWhereInput[]
    NOT?: ChatConversationWhereInput | ChatConversationWhereInput[]
    id?: StringFilter<"ChatConversation"> | string
    visitorId?: StringFilter<"ChatConversation"> | string
    userId?: StringFilter<"ChatConversation"> | string
    userAgent?: StringNullableFilter<"ChatConversation"> | string | null
    deviceType?: StringNullableFilter<"ChatConversation"> | string | null
    browser?: StringNullableFilter<"ChatConversation"> | string | null
    os?: StringNullableFilter<"ChatConversation"> | string | null
    ipAddress?: StringNullableFilter<"ChatConversation"> | string | null
    referrer?: StringNullableFilter<"ChatConversation"> | string | null
    firstSeen?: DateTimeFilter<"ChatConversation"> | Date | string
    lastSeen?: DateTimeFilter<"ChatConversation"> | Date | string
    totalMessages?: IntFilter<"ChatConversation"> | number
    avgResponseTime?: FloatNullableFilter<"ChatConversation"> | number | null
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
    messages?: ChatMessageListRelationFilter
  }

  export type ChatConversationOrderByWithRelationInput = {
    id?: SortOrder
    visitorId?: SortOrder
    userId?: SortOrder
    userAgent?: SortOrderInput | SortOrder
    deviceType?: SortOrderInput | SortOrder
    browser?: SortOrderInput | SortOrder
    os?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    referrer?: SortOrderInput | SortOrder
    firstSeen?: SortOrder
    lastSeen?: SortOrder
    totalMessages?: SortOrder
    avgResponseTime?: SortOrderInput | SortOrder
    user?: UsersOrderByWithRelationInput
    messages?: ChatMessageOrderByRelationAggregateInput
  }

  export type ChatConversationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    visitorId_userId?: ChatConversationVisitorIdUserIdCompoundUniqueInput
    AND?: ChatConversationWhereInput | ChatConversationWhereInput[]
    OR?: ChatConversationWhereInput[]
    NOT?: ChatConversationWhereInput | ChatConversationWhereInput[]
    visitorId?: StringFilter<"ChatConversation"> | string
    userId?: StringFilter<"ChatConversation"> | string
    userAgent?: StringNullableFilter<"ChatConversation"> | string | null
    deviceType?: StringNullableFilter<"ChatConversation"> | string | null
    browser?: StringNullableFilter<"ChatConversation"> | string | null
    os?: StringNullableFilter<"ChatConversation"> | string | null
    ipAddress?: StringNullableFilter<"ChatConversation"> | string | null
    referrer?: StringNullableFilter<"ChatConversation"> | string | null
    firstSeen?: DateTimeFilter<"ChatConversation"> | Date | string
    lastSeen?: DateTimeFilter<"ChatConversation"> | Date | string
    totalMessages?: IntFilter<"ChatConversation"> | number
    avgResponseTime?: FloatNullableFilter<"ChatConversation"> | number | null
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
    messages?: ChatMessageListRelationFilter
  }, "id" | "visitorId_userId">

  export type ChatConversationOrderByWithAggregationInput = {
    id?: SortOrder
    visitorId?: SortOrder
    userId?: SortOrder
    userAgent?: SortOrderInput | SortOrder
    deviceType?: SortOrderInput | SortOrder
    browser?: SortOrderInput | SortOrder
    os?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    referrer?: SortOrderInput | SortOrder
    firstSeen?: SortOrder
    lastSeen?: SortOrder
    totalMessages?: SortOrder
    avgResponseTime?: SortOrderInput | SortOrder
    _count?: ChatConversationCountOrderByAggregateInput
    _avg?: ChatConversationAvgOrderByAggregateInput
    _max?: ChatConversationMaxOrderByAggregateInput
    _min?: ChatConversationMinOrderByAggregateInput
    _sum?: ChatConversationSumOrderByAggregateInput
  }

  export type ChatConversationScalarWhereWithAggregatesInput = {
    AND?: ChatConversationScalarWhereWithAggregatesInput | ChatConversationScalarWhereWithAggregatesInput[]
    OR?: ChatConversationScalarWhereWithAggregatesInput[]
    NOT?: ChatConversationScalarWhereWithAggregatesInput | ChatConversationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ChatConversation"> | string
    visitorId?: StringWithAggregatesFilter<"ChatConversation"> | string
    userId?: StringWithAggregatesFilter<"ChatConversation"> | string
    userAgent?: StringNullableWithAggregatesFilter<"ChatConversation"> | string | null
    deviceType?: StringNullableWithAggregatesFilter<"ChatConversation"> | string | null
    browser?: StringNullableWithAggregatesFilter<"ChatConversation"> | string | null
    os?: StringNullableWithAggregatesFilter<"ChatConversation"> | string | null
    ipAddress?: StringNullableWithAggregatesFilter<"ChatConversation"> | string | null
    referrer?: StringNullableWithAggregatesFilter<"ChatConversation"> | string | null
    firstSeen?: DateTimeWithAggregatesFilter<"ChatConversation"> | Date | string
    lastSeen?: DateTimeWithAggregatesFilter<"ChatConversation"> | Date | string
    totalMessages?: IntWithAggregatesFilter<"ChatConversation"> | number
    avgResponseTime?: FloatNullableWithAggregatesFilter<"ChatConversation"> | number | null
  }

  export type ChatMessageWhereInput = {
    AND?: ChatMessageWhereInput | ChatMessageWhereInput[]
    OR?: ChatMessageWhereInput[]
    NOT?: ChatMessageWhereInput | ChatMessageWhereInput[]
    id?: StringFilter<"ChatMessage"> | string
    conversationId?: StringFilter<"ChatMessage"> | string
    content?: StringFilter<"ChatMessage"> | string
    role?: StringFilter<"ChatMessage"> | string
    createdAt?: DateTimeFilter<"ChatMessage"> | Date | string
    conversation?: XOR<ChatConversationScalarRelationFilter, ChatConversationWhereInput>
  }

  export type ChatMessageOrderByWithRelationInput = {
    id?: SortOrder
    conversationId?: SortOrder
    content?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    conversation?: ChatConversationOrderByWithRelationInput
  }

  export type ChatMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ChatMessageWhereInput | ChatMessageWhereInput[]
    OR?: ChatMessageWhereInput[]
    NOT?: ChatMessageWhereInput | ChatMessageWhereInput[]
    conversationId?: StringFilter<"ChatMessage"> | string
    content?: StringFilter<"ChatMessage"> | string
    role?: StringFilter<"ChatMessage"> | string
    createdAt?: DateTimeFilter<"ChatMessage"> | Date | string
    conversation?: XOR<ChatConversationScalarRelationFilter, ChatConversationWhereInput>
  }, "id">

  export type ChatMessageOrderByWithAggregationInput = {
    id?: SortOrder
    conversationId?: SortOrder
    content?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    _count?: ChatMessageCountOrderByAggregateInput
    _max?: ChatMessageMaxOrderByAggregateInput
    _min?: ChatMessageMinOrderByAggregateInput
  }

  export type ChatMessageScalarWhereWithAggregatesInput = {
    AND?: ChatMessageScalarWhereWithAggregatesInput | ChatMessageScalarWhereWithAggregatesInput[]
    OR?: ChatMessageScalarWhereWithAggregatesInput[]
    NOT?: ChatMessageScalarWhereWithAggregatesInput | ChatMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ChatMessage"> | string
    conversationId?: StringWithAggregatesFilter<"ChatMessage"> | string
    content?: StringWithAggregatesFilter<"ChatMessage"> | string
    role?: StringWithAggregatesFilter<"ChatMessage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ChatMessage"> | Date | string
  }

  export type DocumentWhereInput = {
    AND?: DocumentWhereInput | DocumentWhereInput[]
    OR?: DocumentWhereInput[]
    NOT?: DocumentWhereInput | DocumentWhereInput[]
    id?: StringFilter<"Document"> | string
    fileName?: StringFilter<"Document"> | string
    originalName?: StringFilter<"Document"> | string
    fileType?: StringFilter<"Document"> | string
    fileSize?: IntFilter<"Document"> | number
    category?: StringNullableFilter<"Document"> | string | null
    description?: StringNullableFilter<"Document"> | string | null
    content?: StringFilter<"Document"> | string
    keywords?: StringNullableFilter<"Document"> | string | null
    uploadedAt?: DateTimeFilter<"Document"> | Date | string
    userId?: StringFilter<"Document"> | string
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
    chunks?: DocumentChunkListRelationFilter
  }

  export type DocumentOrderByWithRelationInput = {
    id?: SortOrder
    fileName?: SortOrder
    originalName?: SortOrder
    fileType?: SortOrder
    fileSize?: SortOrder
    category?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    content?: SortOrder
    keywords?: SortOrderInput | SortOrder
    uploadedAt?: SortOrder
    userId?: SortOrder
    user?: UsersOrderByWithRelationInput
    chunks?: DocumentChunkOrderByRelationAggregateInput
  }

  export type DocumentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DocumentWhereInput | DocumentWhereInput[]
    OR?: DocumentWhereInput[]
    NOT?: DocumentWhereInput | DocumentWhereInput[]
    fileName?: StringFilter<"Document"> | string
    originalName?: StringFilter<"Document"> | string
    fileType?: StringFilter<"Document"> | string
    fileSize?: IntFilter<"Document"> | number
    category?: StringNullableFilter<"Document"> | string | null
    description?: StringNullableFilter<"Document"> | string | null
    content?: StringFilter<"Document"> | string
    keywords?: StringNullableFilter<"Document"> | string | null
    uploadedAt?: DateTimeFilter<"Document"> | Date | string
    userId?: StringFilter<"Document"> | string
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
    chunks?: DocumentChunkListRelationFilter
  }, "id">

  export type DocumentOrderByWithAggregationInput = {
    id?: SortOrder
    fileName?: SortOrder
    originalName?: SortOrder
    fileType?: SortOrder
    fileSize?: SortOrder
    category?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    content?: SortOrder
    keywords?: SortOrderInput | SortOrder
    uploadedAt?: SortOrder
    userId?: SortOrder
    _count?: DocumentCountOrderByAggregateInput
    _avg?: DocumentAvgOrderByAggregateInput
    _max?: DocumentMaxOrderByAggregateInput
    _min?: DocumentMinOrderByAggregateInput
    _sum?: DocumentSumOrderByAggregateInput
  }

  export type DocumentScalarWhereWithAggregatesInput = {
    AND?: DocumentScalarWhereWithAggregatesInput | DocumentScalarWhereWithAggregatesInput[]
    OR?: DocumentScalarWhereWithAggregatesInput[]
    NOT?: DocumentScalarWhereWithAggregatesInput | DocumentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Document"> | string
    fileName?: StringWithAggregatesFilter<"Document"> | string
    originalName?: StringWithAggregatesFilter<"Document"> | string
    fileType?: StringWithAggregatesFilter<"Document"> | string
    fileSize?: IntWithAggregatesFilter<"Document"> | number
    category?: StringNullableWithAggregatesFilter<"Document"> | string | null
    description?: StringNullableWithAggregatesFilter<"Document"> | string | null
    content?: StringWithAggregatesFilter<"Document"> | string
    keywords?: StringNullableWithAggregatesFilter<"Document"> | string | null
    uploadedAt?: DateTimeWithAggregatesFilter<"Document"> | Date | string
    userId?: StringWithAggregatesFilter<"Document"> | string
  }

  export type DocumentChunkWhereInput = {
    AND?: DocumentChunkWhereInput | DocumentChunkWhereInput[]
    OR?: DocumentChunkWhereInput[]
    NOT?: DocumentChunkWhereInput | DocumentChunkWhereInput[]
    id?: StringFilter<"DocumentChunk"> | string
    documentId?: StringFilter<"DocumentChunk"> | string
    content?: StringFilter<"DocumentChunk"> | string
    chunkIndex?: IntFilter<"DocumentChunk"> | number
    document?: XOR<DocumentScalarRelationFilter, DocumentWhereInput>
    embedding?: XOR<EmbeddingNullableScalarRelationFilter, EmbeddingWhereInput> | null
  }

  export type DocumentChunkOrderByWithRelationInput = {
    id?: SortOrder
    documentId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    document?: DocumentOrderByWithRelationInput
    embedding?: EmbeddingOrderByWithRelationInput
  }

  export type DocumentChunkWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DocumentChunkWhereInput | DocumentChunkWhereInput[]
    OR?: DocumentChunkWhereInput[]
    NOT?: DocumentChunkWhereInput | DocumentChunkWhereInput[]
    documentId?: StringFilter<"DocumentChunk"> | string
    content?: StringFilter<"DocumentChunk"> | string
    chunkIndex?: IntFilter<"DocumentChunk"> | number
    document?: XOR<DocumentScalarRelationFilter, DocumentWhereInput>
    embedding?: XOR<EmbeddingNullableScalarRelationFilter, EmbeddingWhereInput> | null
  }, "id">

  export type DocumentChunkOrderByWithAggregationInput = {
    id?: SortOrder
    documentId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    _count?: DocumentChunkCountOrderByAggregateInput
    _avg?: DocumentChunkAvgOrderByAggregateInput
    _max?: DocumentChunkMaxOrderByAggregateInput
    _min?: DocumentChunkMinOrderByAggregateInput
    _sum?: DocumentChunkSumOrderByAggregateInput
  }

  export type DocumentChunkScalarWhereWithAggregatesInput = {
    AND?: DocumentChunkScalarWhereWithAggregatesInput | DocumentChunkScalarWhereWithAggregatesInput[]
    OR?: DocumentChunkScalarWhereWithAggregatesInput[]
    NOT?: DocumentChunkScalarWhereWithAggregatesInput | DocumentChunkScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DocumentChunk"> | string
    documentId?: StringWithAggregatesFilter<"DocumentChunk"> | string
    content?: StringWithAggregatesFilter<"DocumentChunk"> | string
    chunkIndex?: IntWithAggregatesFilter<"DocumentChunk"> | number
  }

  export type EmbeddingWhereInput = {
    AND?: EmbeddingWhereInput | EmbeddingWhereInput[]
    OR?: EmbeddingWhereInput[]
    NOT?: EmbeddingWhereInput | EmbeddingWhereInput[]
    id?: StringFilter<"Embedding"> | string
    userId?: StringFilter<"Embedding"> | string
    chunkId?: StringFilter<"Embedding"> | string
    vector?: FloatNullableListFilter<"Embedding">
    createdAt?: DateTimeFilter<"Embedding"> | Date | string
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
    chunk?: XOR<DocumentChunkScalarRelationFilter, DocumentChunkWhereInput>
  }

  export type EmbeddingOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    chunkId?: SortOrder
    vector?: SortOrder
    createdAt?: SortOrder
    user?: UsersOrderByWithRelationInput
    chunk?: DocumentChunkOrderByWithRelationInput
  }

  export type EmbeddingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    chunkId?: string
    AND?: EmbeddingWhereInput | EmbeddingWhereInput[]
    OR?: EmbeddingWhereInput[]
    NOT?: EmbeddingWhereInput | EmbeddingWhereInput[]
    userId?: StringFilter<"Embedding"> | string
    vector?: FloatNullableListFilter<"Embedding">
    createdAt?: DateTimeFilter<"Embedding"> | Date | string
    user?: XOR<UsersScalarRelationFilter, UsersWhereInput>
    chunk?: XOR<DocumentChunkScalarRelationFilter, DocumentChunkWhereInput>
  }, "id" | "chunkId">

  export type EmbeddingOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    chunkId?: SortOrder
    vector?: SortOrder
    createdAt?: SortOrder
    _count?: EmbeddingCountOrderByAggregateInput
    _avg?: EmbeddingAvgOrderByAggregateInput
    _max?: EmbeddingMaxOrderByAggregateInput
    _min?: EmbeddingMinOrderByAggregateInput
    _sum?: EmbeddingSumOrderByAggregateInput
  }

  export type EmbeddingScalarWhereWithAggregatesInput = {
    AND?: EmbeddingScalarWhereWithAggregatesInput | EmbeddingScalarWhereWithAggregatesInput[]
    OR?: EmbeddingScalarWhereWithAggregatesInput[]
    NOT?: EmbeddingScalarWhereWithAggregatesInput | EmbeddingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Embedding"> | string
    userId?: StringWithAggregatesFilter<"Embedding"> | string
    chunkId?: StringWithAggregatesFilter<"Embedding"> | string
    vector?: FloatNullableListFilter<"Embedding">
    createdAt?: DateTimeWithAggregatesFilter<"Embedding"> | Date | string
  }

  export type AccountCreateInput = {
    id?: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    user: UsersCreateNestedOneWithoutAccountsInput
  }

  export type AccountUncheckedCreateInput = {
    id?: string
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
  }

  export type AccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UsersUpdateOneRequiredWithoutAccountsNestedInput
  }

  export type AccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AccountCreateManyInput = {
    id?: string
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
  }

  export type AccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SessionCreateInput = {
    id?: string
    sessionToken: string
    expires: Date | string
    user: UsersCreateNestedOneWithoutSessionsInput
  }

  export type SessionUncheckedCreateInput = {
    id?: string
    sessionToken: string
    userId: string
    expires: Date | string
  }

  export type SessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UsersUpdateOneRequiredWithoutSessionsNestedInput
  }

  export type SessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCreateManyInput = {
    id?: string
    sessionToken: string
    userId: string
    expires: Date | string
  }

  export type SessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsersCreateInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    subscription?: SubscriptionCreateNestedOneWithoutUserInput
    messages?: MessageCreateNestedManyWithoutUserInput
    documents?: DocumentCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationCreateNestedManyWithoutUserInput
  }

  export type UsersUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    subscription?: SubscriptionUncheckedCreateNestedOneWithoutUserInput
    messages?: MessageUncheckedCreateNestedManyWithoutUserInput
    documents?: DocumentUncheckedCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingUncheckedCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UsersUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUpdateOneWithoutUserNestedInput
    messages?: MessageUpdateManyWithoutUserNestedInput
    documents?: DocumentUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUpdateManyWithoutUserNestedInput
  }

  export type UsersUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUncheckedUpdateOneWithoutUserNestedInput
    messages?: MessageUncheckedUpdateManyWithoutUserNestedInput
    documents?: DocumentUncheckedUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUncheckedUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UsersCreateManyInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
  }

  export type UsersUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UsersUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type VerificationTokenCreateInput = {
    identifier: string
    token: string
    expires: Date | string
  }

  export type VerificationTokenUncheckedCreateInput = {
    identifier: string
    token: string
    expires: Date | string
  }

  export type VerificationTokenUpdateInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenUncheckedUpdateInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenCreateManyInput = {
    identifier: string
    token: string
    expires: Date | string
  }

  export type VerificationTokenUpdateManyMutationInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenUncheckedUpdateManyInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionPlanCreateInput = {
    id?: string
    name: string
    description: string
    price: number
    currency?: string
    features?: SubscriptionPlanCreatefeaturesInput | string[]
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    subscriptions?: SubscriptionCreateNestedManyWithoutPlanInput
  }

  export type SubscriptionPlanUncheckedCreateInput = {
    id?: string
    name: string
    description: string
    price: number
    currency?: string
    features?: SubscriptionPlanCreatefeaturesInput | string[]
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    subscriptions?: SubscriptionUncheckedCreateNestedManyWithoutPlanInput
  }

  export type SubscriptionPlanUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    features?: SubscriptionPlanUpdatefeaturesInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptions?: SubscriptionUpdateManyWithoutPlanNestedInput
  }

  export type SubscriptionPlanUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    features?: SubscriptionPlanUpdatefeaturesInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptions?: SubscriptionUncheckedUpdateManyWithoutPlanNestedInput
  }

  export type SubscriptionPlanCreateManyInput = {
    id?: string
    name: string
    description: string
    price: number
    currency?: string
    features?: SubscriptionPlanCreatefeaturesInput | string[]
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubscriptionPlanUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    features?: SubscriptionPlanUpdatefeaturesInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionPlanUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    features?: SubscriptionPlanUpdatefeaturesInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionCreateInput = {
    id?: string
    razorpaySubscriptionId: string
    razorpayCustomerId: string
    status: string
    currentPeriodStart: Date | string
    currentPeriodEnd: Date | string
    cancelledAt?: Date | string | null
    lastPaymentId?: string | null
    lastPaymentAmount?: number | null
    lastPaymentDate?: Date | string | null
    lastPaymentError?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UsersCreateNestedOneWithoutSubscriptionInput
    plan: SubscriptionPlanCreateNestedOneWithoutSubscriptionsInput
  }

  export type SubscriptionUncheckedCreateInput = {
    id?: string
    userId: string
    planId: string
    razorpaySubscriptionId: string
    razorpayCustomerId: string
    status: string
    currentPeriodStart: Date | string
    currentPeriodEnd: Date | string
    cancelledAt?: Date | string | null
    lastPaymentId?: string | null
    lastPaymentAmount?: number | null
    lastPaymentDate?: Date | string | null
    lastPaymentError?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubscriptionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    razorpaySubscriptionId?: StringFieldUpdateOperationsInput | string
    razorpayCustomerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentId?: NullableStringFieldUpdateOperationsInput | string | null
    lastPaymentAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    lastPaymentDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UsersUpdateOneRequiredWithoutSubscriptionNestedInput
    plan?: SubscriptionPlanUpdateOneRequiredWithoutSubscriptionsNestedInput
  }

  export type SubscriptionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    planId?: StringFieldUpdateOperationsInput | string
    razorpaySubscriptionId?: StringFieldUpdateOperationsInput | string
    razorpayCustomerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentId?: NullableStringFieldUpdateOperationsInput | string | null
    lastPaymentAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    lastPaymentDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionCreateManyInput = {
    id?: string
    userId: string
    planId: string
    razorpaySubscriptionId: string
    razorpayCustomerId: string
    status: string
    currentPeriodStart: Date | string
    currentPeriodEnd: Date | string
    cancelledAt?: Date | string | null
    lastPaymentId?: string | null
    lastPaymentAmount?: number | null
    lastPaymentDate?: Date | string | null
    lastPaymentError?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubscriptionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    razorpaySubscriptionId?: StringFieldUpdateOperationsInput | string
    razorpayCustomerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentId?: NullableStringFieldUpdateOperationsInput | string | null
    lastPaymentAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    lastPaymentDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    planId?: StringFieldUpdateOperationsInput | string
    razorpaySubscriptionId?: StringFieldUpdateOperationsInput | string
    razorpayCustomerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentId?: NullableStringFieldUpdateOperationsInput | string | null
    lastPaymentAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    lastPaymentDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageCreateInput = {
    id?: string
    content: string
    role: string
    createdAt?: Date | string
    user: UsersCreateNestedOneWithoutMessagesInput
  }

  export type MessageUncheckedCreateInput = {
    id?: string
    content: string
    role: string
    createdAt?: Date | string
    userId: string
  }

  export type MessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UsersUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type MessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type MessageCreateManyInput = {
    id?: string
    content: string
    role: string
    createdAt?: Date | string
    userId: string
  }

  export type MessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type ContactMessageCreateInput = {
    id?: string
    fullName: string
    email: string
    phone: string
    message: string
    createdAt?: Date | string
  }

  export type ContactMessageUncheckedCreateInput = {
    id?: string
    fullName: string
    email: string
    phone: string
    message: string
    createdAt?: Date | string
  }

  export type ContactMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactMessageCreateManyInput = {
    id?: string
    fullName: string
    email: string
    phone: string
    message: string
    createdAt?: Date | string
  }

  export type ContactMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatConversationCreateInput = {
    id?: string
    visitorId: string
    userAgent?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    ipAddress?: string | null
    referrer?: string | null
    firstSeen?: Date | string
    lastSeen?: Date | string
    totalMessages?: number
    avgResponseTime?: number | null
    user: UsersCreateNestedOneWithoutChatConversationsInput
    messages?: ChatMessageCreateNestedManyWithoutConversationInput
  }

  export type ChatConversationUncheckedCreateInput = {
    id?: string
    visitorId: string
    userId: string
    userAgent?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    ipAddress?: string | null
    referrer?: string | null
    firstSeen?: Date | string
    lastSeen?: Date | string
    totalMessages?: number
    avgResponseTime?: number | null
    messages?: ChatMessageUncheckedCreateNestedManyWithoutConversationInput
  }

  export type ChatConversationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    visitorId?: StringFieldUpdateOperationsInput | string
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    firstSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    totalMessages?: IntFieldUpdateOperationsInput | number
    avgResponseTime?: NullableFloatFieldUpdateOperationsInput | number | null
    user?: UsersUpdateOneRequiredWithoutChatConversationsNestedInput
    messages?: ChatMessageUpdateManyWithoutConversationNestedInput
  }

  export type ChatConversationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    visitorId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    firstSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    totalMessages?: IntFieldUpdateOperationsInput | number
    avgResponseTime?: NullableFloatFieldUpdateOperationsInput | number | null
    messages?: ChatMessageUncheckedUpdateManyWithoutConversationNestedInput
  }

  export type ChatConversationCreateManyInput = {
    id?: string
    visitorId: string
    userId: string
    userAgent?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    ipAddress?: string | null
    referrer?: string | null
    firstSeen?: Date | string
    lastSeen?: Date | string
    totalMessages?: number
    avgResponseTime?: number | null
  }

  export type ChatConversationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    visitorId?: StringFieldUpdateOperationsInput | string
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    firstSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    totalMessages?: IntFieldUpdateOperationsInput | number
    avgResponseTime?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ChatConversationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    visitorId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    firstSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    totalMessages?: IntFieldUpdateOperationsInput | number
    avgResponseTime?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ChatMessageCreateInput = {
    id?: string
    content: string
    role: string
    createdAt?: Date | string
    conversation: ChatConversationCreateNestedOneWithoutMessagesInput
  }

  export type ChatMessageUncheckedCreateInput = {
    id?: string
    conversationId: string
    content: string
    role: string
    createdAt?: Date | string
  }

  export type ChatMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    conversation?: ChatConversationUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type ChatMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    conversationId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatMessageCreateManyInput = {
    id?: string
    conversationId: string
    content: string
    role: string
    createdAt?: Date | string
  }

  export type ChatMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    conversationId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentCreateInput = {
    id?: string
    fileName: string
    originalName: string
    fileType: string
    fileSize: number
    category?: string | null
    description?: string | null
    content: string
    keywords?: string | null
    uploadedAt?: Date | string
    user: UsersCreateNestedOneWithoutDocumentsInput
    chunks?: DocumentChunkCreateNestedManyWithoutDocumentInput
  }

  export type DocumentUncheckedCreateInput = {
    id?: string
    fileName: string
    originalName: string
    fileType: string
    fileSize: number
    category?: string | null
    description?: string | null
    content: string
    keywords?: string | null
    uploadedAt?: Date | string
    userId: string
    chunks?: DocumentChunkUncheckedCreateNestedManyWithoutDocumentInput
  }

  export type DocumentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileType?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UsersUpdateOneRequiredWithoutDocumentsNestedInput
    chunks?: DocumentChunkUpdateManyWithoutDocumentNestedInput
  }

  export type DocumentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileType?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    chunks?: DocumentChunkUncheckedUpdateManyWithoutDocumentNestedInput
  }

  export type DocumentCreateManyInput = {
    id?: string
    fileName: string
    originalName: string
    fileType: string
    fileSize: number
    category?: string | null
    description?: string | null
    content: string
    keywords?: string | null
    uploadedAt?: Date | string
    userId: string
  }

  export type DocumentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileType?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileType?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type DocumentChunkCreateInput = {
    id?: string
    content: string
    chunkIndex: number
    document: DocumentCreateNestedOneWithoutChunksInput
    embedding?: EmbeddingCreateNestedOneWithoutChunkInput
  }

  export type DocumentChunkUncheckedCreateInput = {
    id?: string
    documentId: string
    content: string
    chunkIndex: number
    embedding?: EmbeddingUncheckedCreateNestedOneWithoutChunkInput
  }

  export type DocumentChunkUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    document?: DocumentUpdateOneRequiredWithoutChunksNestedInput
    embedding?: EmbeddingUpdateOneWithoutChunkNestedInput
  }

  export type DocumentChunkUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    embedding?: EmbeddingUncheckedUpdateOneWithoutChunkNestedInput
  }

  export type DocumentChunkCreateManyInput = {
    id?: string
    documentId: string
    content: string
    chunkIndex: number
  }

  export type DocumentChunkUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
  }

  export type DocumentChunkUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
  }

  export type EmbeddingCreateInput = {
    id?: string
    vector?: EmbeddingCreatevectorInput | number[]
    createdAt?: Date | string
    user: UsersCreateNestedOneWithoutEmbeddingsInput
    chunk: DocumentChunkCreateNestedOneWithoutEmbeddingInput
  }

  export type EmbeddingUncheckedCreateInput = {
    id?: string
    userId: string
    chunkId: string
    vector?: EmbeddingCreatevectorInput | number[]
    createdAt?: Date | string
  }

  export type EmbeddingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    vector?: EmbeddingUpdatevectorInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UsersUpdateOneRequiredWithoutEmbeddingsNestedInput
    chunk?: DocumentChunkUpdateOneRequiredWithoutEmbeddingNestedInput
  }

  export type EmbeddingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    chunkId?: StringFieldUpdateOperationsInput | string
    vector?: EmbeddingUpdatevectorInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmbeddingCreateManyInput = {
    id?: string
    userId: string
    chunkId: string
    vector?: EmbeddingCreatevectorInput | number[]
    createdAt?: Date | string
  }

  export type EmbeddingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    vector?: EmbeddingUpdatevectorInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmbeddingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    chunkId?: StringFieldUpdateOperationsInput | string
    vector?: EmbeddingUpdatevectorInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type UsersScalarRelationFilter = {
    is?: UsersWhereInput
    isNot?: UsersWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AccountProviderProviderAccountIdCompoundUniqueInput = {
    provider: string
    providerAccountId: string
  }

  export type AccountCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrder
    access_token?: SortOrder
    expires_at?: SortOrder
    token_type?: SortOrder
    scope?: SortOrder
    id_token?: SortOrder
    session_state?: SortOrder
  }

  export type AccountAvgOrderByAggregateInput = {
    expires_at?: SortOrder
  }

  export type AccountMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrder
    access_token?: SortOrder
    expires_at?: SortOrder
    token_type?: SortOrder
    scope?: SortOrder
    id_token?: SortOrder
    session_state?: SortOrder
  }

  export type AccountMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrder
    access_token?: SortOrder
    expires_at?: SortOrder
    token_type?: SortOrder
    scope?: SortOrder
    id_token?: SortOrder
    session_state?: SortOrder
  }

  export type AccountSumOrderByAggregateInput = {
    expires_at?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SessionCountOrderByAggregateInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
  }

  export type SessionMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
  }

  export type SessionMinOrderByAggregateInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type EnumPlanTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanType | EnumPlanTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PlanType[] | ListEnumPlanTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanType[] | ListEnumPlanTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanTypeFilter<$PrismaModel> | $Enums.PlanType
  }

  export type EnumSubscriptionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionType | EnumSubscriptionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionType[] | ListEnumSubscriptionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionType[] | ListEnumSubscriptionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionTypeFilter<$PrismaModel> | $Enums.SubscriptionType
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type AccountListRelationFilter = {
    every?: AccountWhereInput
    some?: AccountWhereInput
    none?: AccountWhereInput
  }

  export type SessionListRelationFilter = {
    every?: SessionWhereInput
    some?: SessionWhereInput
    none?: SessionWhereInput
  }

  export type SubscriptionNullableScalarRelationFilter = {
    is?: SubscriptionWhereInput | null
    isNot?: SubscriptionWhereInput | null
  }

  export type MessageListRelationFilter = {
    every?: MessageWhereInput
    some?: MessageWhereInput
    none?: MessageWhereInput
  }

  export type DocumentListRelationFilter = {
    every?: DocumentWhereInput
    some?: DocumentWhereInput
    none?: DocumentWhereInput
  }

  export type EmbeddingListRelationFilter = {
    every?: EmbeddingWhereInput
    some?: EmbeddingWhereInput
    none?: EmbeddingWhereInput
  }

  export type ChatConversationListRelationFilter = {
    every?: ChatConversationWhereInput
    some?: ChatConversationWhereInput
    none?: ChatConversationWhereInput
  }

  export type AccountOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DocumentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmbeddingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ChatConversationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UsersCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    password?: SortOrder
    passwordResetToken?: SortOrder
    passwordResetTokenExp?: SortOrder
    company?: SortOrder
    plan?: SortOrder
    subscription_type?: SortOrder
    subscription_start_date?: SortOrder
    subscription_end_date?: SortOrder
    is_active?: SortOrder
    is_verified?: SortOrder
    login_attempts?: SortOrder
    locked_until?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    jobTitle?: SortOrder
    bio?: SortOrder
    phone?: SortOrder
  }

  export type UsersAvgOrderByAggregateInput = {
    login_attempts?: SortOrder
  }

  export type UsersMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    password?: SortOrder
    passwordResetToken?: SortOrder
    passwordResetTokenExp?: SortOrder
    company?: SortOrder
    plan?: SortOrder
    subscription_type?: SortOrder
    subscription_start_date?: SortOrder
    subscription_end_date?: SortOrder
    is_active?: SortOrder
    is_verified?: SortOrder
    login_attempts?: SortOrder
    locked_until?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    jobTitle?: SortOrder
    bio?: SortOrder
    phone?: SortOrder
  }

  export type UsersMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    password?: SortOrder
    passwordResetToken?: SortOrder
    passwordResetTokenExp?: SortOrder
    company?: SortOrder
    plan?: SortOrder
    subscription_type?: SortOrder
    subscription_start_date?: SortOrder
    subscription_end_date?: SortOrder
    is_active?: SortOrder
    is_verified?: SortOrder
    login_attempts?: SortOrder
    locked_until?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    jobTitle?: SortOrder
    bio?: SortOrder
    phone?: SortOrder
  }

  export type UsersSumOrderByAggregateInput = {
    login_attempts?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumPlanTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanType | EnumPlanTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PlanType[] | ListEnumPlanTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanType[] | ListEnumPlanTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanTypeWithAggregatesFilter<$PrismaModel> | $Enums.PlanType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlanTypeFilter<$PrismaModel>
    _max?: NestedEnumPlanTypeFilter<$PrismaModel>
  }

  export type EnumSubscriptionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionType | EnumSubscriptionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionType[] | ListEnumSubscriptionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionType[] | ListEnumSubscriptionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionTypeWithAggregatesFilter<$PrismaModel> | $Enums.SubscriptionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSubscriptionTypeFilter<$PrismaModel>
    _max?: NestedEnumSubscriptionTypeFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type VerificationTokenIdentifierTokenCompoundUniqueInput = {
    identifier: string
    token: string
  }

  export type VerificationTokenCountOrderByAggregateInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type VerificationTokenMaxOrderByAggregateInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type VerificationTokenMinOrderByAggregateInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type SubscriptionListRelationFilter = {
    every?: SubscriptionWhereInput
    some?: SubscriptionWhereInput
    none?: SubscriptionWhereInput
  }

  export type SubscriptionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SubscriptionPlanCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    features?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubscriptionPlanAvgOrderByAggregateInput = {
    price?: SortOrder
  }

  export type SubscriptionPlanMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubscriptionPlanMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubscriptionPlanSumOrderByAggregateInput = {
    price?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type SubscriptionPlanScalarRelationFilter = {
    is?: SubscriptionPlanWhereInput
    isNot?: SubscriptionPlanWhereInput
  }

  export type SubscriptionCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    planId?: SortOrder
    razorpaySubscriptionId?: SortOrder
    razorpayCustomerId?: SortOrder
    status?: SortOrder
    currentPeriodStart?: SortOrder
    currentPeriodEnd?: SortOrder
    cancelledAt?: SortOrder
    lastPaymentId?: SortOrder
    lastPaymentAmount?: SortOrder
    lastPaymentDate?: SortOrder
    lastPaymentError?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubscriptionAvgOrderByAggregateInput = {
    lastPaymentAmount?: SortOrder
  }

  export type SubscriptionMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    planId?: SortOrder
    razorpaySubscriptionId?: SortOrder
    razorpayCustomerId?: SortOrder
    status?: SortOrder
    currentPeriodStart?: SortOrder
    currentPeriodEnd?: SortOrder
    cancelledAt?: SortOrder
    lastPaymentId?: SortOrder
    lastPaymentAmount?: SortOrder
    lastPaymentDate?: SortOrder
    lastPaymentError?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubscriptionMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    planId?: SortOrder
    razorpaySubscriptionId?: SortOrder
    razorpayCustomerId?: SortOrder
    status?: SortOrder
    currentPeriodStart?: SortOrder
    currentPeriodEnd?: SortOrder
    cancelledAt?: SortOrder
    lastPaymentId?: SortOrder
    lastPaymentAmount?: SortOrder
    lastPaymentDate?: SortOrder
    lastPaymentError?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubscriptionSumOrderByAggregateInput = {
    lastPaymentAmount?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type MessageCountOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
  }

  export type MessageMaxOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
  }

  export type MessageMinOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
  }

  export type ContactMessageCountOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    message?: SortOrder
    createdAt?: SortOrder
  }

  export type ContactMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    message?: SortOrder
    createdAt?: SortOrder
  }

  export type ContactMessageMinOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    message?: SortOrder
    createdAt?: SortOrder
  }

  export type ChatMessageListRelationFilter = {
    every?: ChatMessageWhereInput
    some?: ChatMessageWhereInput
    none?: ChatMessageWhereInput
  }

  export type ChatMessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ChatConversationVisitorIdUserIdCompoundUniqueInput = {
    visitorId: string
    userId: string
  }

  export type ChatConversationCountOrderByAggregateInput = {
    id?: SortOrder
    visitorId?: SortOrder
    userId?: SortOrder
    userAgent?: SortOrder
    deviceType?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    ipAddress?: SortOrder
    referrer?: SortOrder
    firstSeen?: SortOrder
    lastSeen?: SortOrder
    totalMessages?: SortOrder
    avgResponseTime?: SortOrder
  }

  export type ChatConversationAvgOrderByAggregateInput = {
    totalMessages?: SortOrder
    avgResponseTime?: SortOrder
  }

  export type ChatConversationMaxOrderByAggregateInput = {
    id?: SortOrder
    visitorId?: SortOrder
    userId?: SortOrder
    userAgent?: SortOrder
    deviceType?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    ipAddress?: SortOrder
    referrer?: SortOrder
    firstSeen?: SortOrder
    lastSeen?: SortOrder
    totalMessages?: SortOrder
    avgResponseTime?: SortOrder
  }

  export type ChatConversationMinOrderByAggregateInput = {
    id?: SortOrder
    visitorId?: SortOrder
    userId?: SortOrder
    userAgent?: SortOrder
    deviceType?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    ipAddress?: SortOrder
    referrer?: SortOrder
    firstSeen?: SortOrder
    lastSeen?: SortOrder
    totalMessages?: SortOrder
    avgResponseTime?: SortOrder
  }

  export type ChatConversationSumOrderByAggregateInput = {
    totalMessages?: SortOrder
    avgResponseTime?: SortOrder
  }

  export type ChatConversationScalarRelationFilter = {
    is?: ChatConversationWhereInput
    isNot?: ChatConversationWhereInput
  }

  export type ChatMessageCountOrderByAggregateInput = {
    id?: SortOrder
    conversationId?: SortOrder
    content?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type ChatMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    conversationId?: SortOrder
    content?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type ChatMessageMinOrderByAggregateInput = {
    id?: SortOrder
    conversationId?: SortOrder
    content?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type DocumentChunkListRelationFilter = {
    every?: DocumentChunkWhereInput
    some?: DocumentChunkWhereInput
    none?: DocumentChunkWhereInput
  }

  export type DocumentChunkOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DocumentCountOrderByAggregateInput = {
    id?: SortOrder
    fileName?: SortOrder
    originalName?: SortOrder
    fileType?: SortOrder
    fileSize?: SortOrder
    category?: SortOrder
    description?: SortOrder
    content?: SortOrder
    keywords?: SortOrder
    uploadedAt?: SortOrder
    userId?: SortOrder
  }

  export type DocumentAvgOrderByAggregateInput = {
    fileSize?: SortOrder
  }

  export type DocumentMaxOrderByAggregateInput = {
    id?: SortOrder
    fileName?: SortOrder
    originalName?: SortOrder
    fileType?: SortOrder
    fileSize?: SortOrder
    category?: SortOrder
    description?: SortOrder
    content?: SortOrder
    keywords?: SortOrder
    uploadedAt?: SortOrder
    userId?: SortOrder
  }

  export type DocumentMinOrderByAggregateInput = {
    id?: SortOrder
    fileName?: SortOrder
    originalName?: SortOrder
    fileType?: SortOrder
    fileSize?: SortOrder
    category?: SortOrder
    description?: SortOrder
    content?: SortOrder
    keywords?: SortOrder
    uploadedAt?: SortOrder
    userId?: SortOrder
  }

  export type DocumentSumOrderByAggregateInput = {
    fileSize?: SortOrder
  }

  export type DocumentScalarRelationFilter = {
    is?: DocumentWhereInput
    isNot?: DocumentWhereInput
  }

  export type EmbeddingNullableScalarRelationFilter = {
    is?: EmbeddingWhereInput | null
    isNot?: EmbeddingWhereInput | null
  }

  export type DocumentChunkCountOrderByAggregateInput = {
    id?: SortOrder
    documentId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
  }

  export type DocumentChunkAvgOrderByAggregateInput = {
    chunkIndex?: SortOrder
  }

  export type DocumentChunkMaxOrderByAggregateInput = {
    id?: SortOrder
    documentId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
  }

  export type DocumentChunkMinOrderByAggregateInput = {
    id?: SortOrder
    documentId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
  }

  export type DocumentChunkSumOrderByAggregateInput = {
    chunkIndex?: SortOrder
  }

  export type FloatNullableListFilter<$PrismaModel = never> = {
    equals?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    has?: number | FloatFieldRefInput<$PrismaModel> | null
    hasEvery?: number[] | ListFloatFieldRefInput<$PrismaModel>
    hasSome?: number[] | ListFloatFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type DocumentChunkScalarRelationFilter = {
    is?: DocumentChunkWhereInput
    isNot?: DocumentChunkWhereInput
  }

  export type EmbeddingCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    chunkId?: SortOrder
    vector?: SortOrder
    createdAt?: SortOrder
  }

  export type EmbeddingAvgOrderByAggregateInput = {
    vector?: SortOrder
  }

  export type EmbeddingMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    chunkId?: SortOrder
    createdAt?: SortOrder
  }

  export type EmbeddingMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    chunkId?: SortOrder
    createdAt?: SortOrder
  }

  export type EmbeddingSumOrderByAggregateInput = {
    vector?: SortOrder
  }

  export type UsersCreateNestedOneWithoutAccountsInput = {
    create?: XOR<UsersCreateWithoutAccountsInput, UsersUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: UsersCreateOrConnectWithoutAccountsInput
    connect?: UsersWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UsersUpdateOneRequiredWithoutAccountsNestedInput = {
    create?: XOR<UsersCreateWithoutAccountsInput, UsersUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: UsersCreateOrConnectWithoutAccountsInput
    upsert?: UsersUpsertWithoutAccountsInput
    connect?: UsersWhereUniqueInput
    update?: XOR<XOR<UsersUpdateToOneWithWhereWithoutAccountsInput, UsersUpdateWithoutAccountsInput>, UsersUncheckedUpdateWithoutAccountsInput>
  }

  export type UsersCreateNestedOneWithoutSessionsInput = {
    create?: XOR<UsersCreateWithoutSessionsInput, UsersUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UsersCreateOrConnectWithoutSessionsInput
    connect?: UsersWhereUniqueInput
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UsersUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: XOR<UsersCreateWithoutSessionsInput, UsersUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UsersCreateOrConnectWithoutSessionsInput
    upsert?: UsersUpsertWithoutSessionsInput
    connect?: UsersWhereUniqueInput
    update?: XOR<XOR<UsersUpdateToOneWithWhereWithoutSessionsInput, UsersUpdateWithoutSessionsInput>, UsersUncheckedUpdateWithoutSessionsInput>
  }

  export type AccountCreateNestedManyWithoutUserInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
  }

  export type SessionCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type SubscriptionCreateNestedOneWithoutUserInput = {
    create?: XOR<SubscriptionCreateWithoutUserInput, SubscriptionUncheckedCreateWithoutUserInput>
    connectOrCreate?: SubscriptionCreateOrConnectWithoutUserInput
    connect?: SubscriptionWhereUniqueInput
  }

  export type MessageCreateNestedManyWithoutUserInput = {
    create?: XOR<MessageCreateWithoutUserInput, MessageUncheckedCreateWithoutUserInput> | MessageCreateWithoutUserInput[] | MessageUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutUserInput | MessageCreateOrConnectWithoutUserInput[]
    createMany?: MessageCreateManyUserInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type DocumentCreateNestedManyWithoutUserInput = {
    create?: XOR<DocumentCreateWithoutUserInput, DocumentUncheckedCreateWithoutUserInput> | DocumentCreateWithoutUserInput[] | DocumentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DocumentCreateOrConnectWithoutUserInput | DocumentCreateOrConnectWithoutUserInput[]
    createMany?: DocumentCreateManyUserInputEnvelope
    connect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
  }

  export type EmbeddingCreateNestedManyWithoutUserInput = {
    create?: XOR<EmbeddingCreateWithoutUserInput, EmbeddingUncheckedCreateWithoutUserInput> | EmbeddingCreateWithoutUserInput[] | EmbeddingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmbeddingCreateOrConnectWithoutUserInput | EmbeddingCreateOrConnectWithoutUserInput[]
    createMany?: EmbeddingCreateManyUserInputEnvelope
    connect?: EmbeddingWhereUniqueInput | EmbeddingWhereUniqueInput[]
  }

  export type ChatConversationCreateNestedManyWithoutUserInput = {
    create?: XOR<ChatConversationCreateWithoutUserInput, ChatConversationUncheckedCreateWithoutUserInput> | ChatConversationCreateWithoutUserInput[] | ChatConversationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ChatConversationCreateOrConnectWithoutUserInput | ChatConversationCreateOrConnectWithoutUserInput[]
    createMany?: ChatConversationCreateManyUserInputEnvelope
    connect?: ChatConversationWhereUniqueInput | ChatConversationWhereUniqueInput[]
  }

  export type AccountUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
  }

  export type SessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type SubscriptionUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<SubscriptionCreateWithoutUserInput, SubscriptionUncheckedCreateWithoutUserInput>
    connectOrCreate?: SubscriptionCreateOrConnectWithoutUserInput
    connect?: SubscriptionWhereUniqueInput
  }

  export type MessageUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<MessageCreateWithoutUserInput, MessageUncheckedCreateWithoutUserInput> | MessageCreateWithoutUserInput[] | MessageUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutUserInput | MessageCreateOrConnectWithoutUserInput[]
    createMany?: MessageCreateManyUserInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type DocumentUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<DocumentCreateWithoutUserInput, DocumentUncheckedCreateWithoutUserInput> | DocumentCreateWithoutUserInput[] | DocumentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DocumentCreateOrConnectWithoutUserInput | DocumentCreateOrConnectWithoutUserInput[]
    createMany?: DocumentCreateManyUserInputEnvelope
    connect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
  }

  export type EmbeddingUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<EmbeddingCreateWithoutUserInput, EmbeddingUncheckedCreateWithoutUserInput> | EmbeddingCreateWithoutUserInput[] | EmbeddingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmbeddingCreateOrConnectWithoutUserInput | EmbeddingCreateOrConnectWithoutUserInput[]
    createMany?: EmbeddingCreateManyUserInputEnvelope
    connect?: EmbeddingWhereUniqueInput | EmbeddingWhereUniqueInput[]
  }

  export type ChatConversationUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ChatConversationCreateWithoutUserInput, ChatConversationUncheckedCreateWithoutUserInput> | ChatConversationCreateWithoutUserInput[] | ChatConversationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ChatConversationCreateOrConnectWithoutUserInput | ChatConversationCreateOrConnectWithoutUserInput[]
    createMany?: ChatConversationCreateManyUserInputEnvelope
    connect?: ChatConversationWhereUniqueInput | ChatConversationWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EnumPlanTypeFieldUpdateOperationsInput = {
    set?: $Enums.PlanType
  }

  export type EnumSubscriptionTypeFieldUpdateOperationsInput = {
    set?: $Enums.SubscriptionType
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type AccountUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    upsert?: AccountUpsertWithWhereUniqueWithoutUserInput | AccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    set?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    update?: AccountUpdateWithWhereUniqueWithoutUserInput | AccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccountUpdateManyWithWhereWithoutUserInput | AccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[]
  }

  export type SessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type SubscriptionUpdateOneWithoutUserNestedInput = {
    create?: XOR<SubscriptionCreateWithoutUserInput, SubscriptionUncheckedCreateWithoutUserInput>
    connectOrCreate?: SubscriptionCreateOrConnectWithoutUserInput
    upsert?: SubscriptionUpsertWithoutUserInput
    disconnect?: SubscriptionWhereInput | boolean
    delete?: SubscriptionWhereInput | boolean
    connect?: SubscriptionWhereUniqueInput
    update?: XOR<XOR<SubscriptionUpdateToOneWithWhereWithoutUserInput, SubscriptionUpdateWithoutUserInput>, SubscriptionUncheckedUpdateWithoutUserInput>
  }

  export type MessageUpdateManyWithoutUserNestedInput = {
    create?: XOR<MessageCreateWithoutUserInput, MessageUncheckedCreateWithoutUserInput> | MessageCreateWithoutUserInput[] | MessageUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutUserInput | MessageCreateOrConnectWithoutUserInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutUserInput | MessageUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MessageCreateManyUserInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutUserInput | MessageUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutUserInput | MessageUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type DocumentUpdateManyWithoutUserNestedInput = {
    create?: XOR<DocumentCreateWithoutUserInput, DocumentUncheckedCreateWithoutUserInput> | DocumentCreateWithoutUserInput[] | DocumentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DocumentCreateOrConnectWithoutUserInput | DocumentCreateOrConnectWithoutUserInput[]
    upsert?: DocumentUpsertWithWhereUniqueWithoutUserInput | DocumentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DocumentCreateManyUserInputEnvelope
    set?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    disconnect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    delete?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    connect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    update?: DocumentUpdateWithWhereUniqueWithoutUserInput | DocumentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DocumentUpdateManyWithWhereWithoutUserInput | DocumentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DocumentScalarWhereInput | DocumentScalarWhereInput[]
  }

  export type EmbeddingUpdateManyWithoutUserNestedInput = {
    create?: XOR<EmbeddingCreateWithoutUserInput, EmbeddingUncheckedCreateWithoutUserInput> | EmbeddingCreateWithoutUserInput[] | EmbeddingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmbeddingCreateOrConnectWithoutUserInput | EmbeddingCreateOrConnectWithoutUserInput[]
    upsert?: EmbeddingUpsertWithWhereUniqueWithoutUserInput | EmbeddingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: EmbeddingCreateManyUserInputEnvelope
    set?: EmbeddingWhereUniqueInput | EmbeddingWhereUniqueInput[]
    disconnect?: EmbeddingWhereUniqueInput | EmbeddingWhereUniqueInput[]
    delete?: EmbeddingWhereUniqueInput | EmbeddingWhereUniqueInput[]
    connect?: EmbeddingWhereUniqueInput | EmbeddingWhereUniqueInput[]
    update?: EmbeddingUpdateWithWhereUniqueWithoutUserInput | EmbeddingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: EmbeddingUpdateManyWithWhereWithoutUserInput | EmbeddingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: EmbeddingScalarWhereInput | EmbeddingScalarWhereInput[]
  }

  export type ChatConversationUpdateManyWithoutUserNestedInput = {
    create?: XOR<ChatConversationCreateWithoutUserInput, ChatConversationUncheckedCreateWithoutUserInput> | ChatConversationCreateWithoutUserInput[] | ChatConversationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ChatConversationCreateOrConnectWithoutUserInput | ChatConversationCreateOrConnectWithoutUserInput[]
    upsert?: ChatConversationUpsertWithWhereUniqueWithoutUserInput | ChatConversationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ChatConversationCreateManyUserInputEnvelope
    set?: ChatConversationWhereUniqueInput | ChatConversationWhereUniqueInput[]
    disconnect?: ChatConversationWhereUniqueInput | ChatConversationWhereUniqueInput[]
    delete?: ChatConversationWhereUniqueInput | ChatConversationWhereUniqueInput[]
    connect?: ChatConversationWhereUniqueInput | ChatConversationWhereUniqueInput[]
    update?: ChatConversationUpdateWithWhereUniqueWithoutUserInput | ChatConversationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ChatConversationUpdateManyWithWhereWithoutUserInput | ChatConversationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ChatConversationScalarWhereInput | ChatConversationScalarWhereInput[]
  }

  export type AccountUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    upsert?: AccountUpsertWithWhereUniqueWithoutUserInput | AccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    set?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    update?: AccountUpdateWithWhereUniqueWithoutUserInput | AccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccountUpdateManyWithWhereWithoutUserInput | AccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[]
  }

  export type SessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type SubscriptionUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<SubscriptionCreateWithoutUserInput, SubscriptionUncheckedCreateWithoutUserInput>
    connectOrCreate?: SubscriptionCreateOrConnectWithoutUserInput
    upsert?: SubscriptionUpsertWithoutUserInput
    disconnect?: SubscriptionWhereInput | boolean
    delete?: SubscriptionWhereInput | boolean
    connect?: SubscriptionWhereUniqueInput
    update?: XOR<XOR<SubscriptionUpdateToOneWithWhereWithoutUserInput, SubscriptionUpdateWithoutUserInput>, SubscriptionUncheckedUpdateWithoutUserInput>
  }

  export type MessageUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<MessageCreateWithoutUserInput, MessageUncheckedCreateWithoutUserInput> | MessageCreateWithoutUserInput[] | MessageUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutUserInput | MessageCreateOrConnectWithoutUserInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutUserInput | MessageUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MessageCreateManyUserInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutUserInput | MessageUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutUserInput | MessageUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type DocumentUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<DocumentCreateWithoutUserInput, DocumentUncheckedCreateWithoutUserInput> | DocumentCreateWithoutUserInput[] | DocumentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DocumentCreateOrConnectWithoutUserInput | DocumentCreateOrConnectWithoutUserInput[]
    upsert?: DocumentUpsertWithWhereUniqueWithoutUserInput | DocumentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DocumentCreateManyUserInputEnvelope
    set?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    disconnect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    delete?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    connect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    update?: DocumentUpdateWithWhereUniqueWithoutUserInput | DocumentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DocumentUpdateManyWithWhereWithoutUserInput | DocumentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DocumentScalarWhereInput | DocumentScalarWhereInput[]
  }

  export type EmbeddingUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<EmbeddingCreateWithoutUserInput, EmbeddingUncheckedCreateWithoutUserInput> | EmbeddingCreateWithoutUserInput[] | EmbeddingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmbeddingCreateOrConnectWithoutUserInput | EmbeddingCreateOrConnectWithoutUserInput[]
    upsert?: EmbeddingUpsertWithWhereUniqueWithoutUserInput | EmbeddingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: EmbeddingCreateManyUserInputEnvelope
    set?: EmbeddingWhereUniqueInput | EmbeddingWhereUniqueInput[]
    disconnect?: EmbeddingWhereUniqueInput | EmbeddingWhereUniqueInput[]
    delete?: EmbeddingWhereUniqueInput | EmbeddingWhereUniqueInput[]
    connect?: EmbeddingWhereUniqueInput | EmbeddingWhereUniqueInput[]
    update?: EmbeddingUpdateWithWhereUniqueWithoutUserInput | EmbeddingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: EmbeddingUpdateManyWithWhereWithoutUserInput | EmbeddingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: EmbeddingScalarWhereInput | EmbeddingScalarWhereInput[]
  }

  export type ChatConversationUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ChatConversationCreateWithoutUserInput, ChatConversationUncheckedCreateWithoutUserInput> | ChatConversationCreateWithoutUserInput[] | ChatConversationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ChatConversationCreateOrConnectWithoutUserInput | ChatConversationCreateOrConnectWithoutUserInput[]
    upsert?: ChatConversationUpsertWithWhereUniqueWithoutUserInput | ChatConversationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ChatConversationCreateManyUserInputEnvelope
    set?: ChatConversationWhereUniqueInput | ChatConversationWhereUniqueInput[]
    disconnect?: ChatConversationWhereUniqueInput | ChatConversationWhereUniqueInput[]
    delete?: ChatConversationWhereUniqueInput | ChatConversationWhereUniqueInput[]
    connect?: ChatConversationWhereUniqueInput | ChatConversationWhereUniqueInput[]
    update?: ChatConversationUpdateWithWhereUniqueWithoutUserInput | ChatConversationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ChatConversationUpdateManyWithWhereWithoutUserInput | ChatConversationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ChatConversationScalarWhereInput | ChatConversationScalarWhereInput[]
  }

  export type SubscriptionPlanCreatefeaturesInput = {
    set: string[]
  }

  export type SubscriptionCreateNestedManyWithoutPlanInput = {
    create?: XOR<SubscriptionCreateWithoutPlanInput, SubscriptionUncheckedCreateWithoutPlanInput> | SubscriptionCreateWithoutPlanInput[] | SubscriptionUncheckedCreateWithoutPlanInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutPlanInput | SubscriptionCreateOrConnectWithoutPlanInput[]
    createMany?: SubscriptionCreateManyPlanInputEnvelope
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
  }

  export type SubscriptionUncheckedCreateNestedManyWithoutPlanInput = {
    create?: XOR<SubscriptionCreateWithoutPlanInput, SubscriptionUncheckedCreateWithoutPlanInput> | SubscriptionCreateWithoutPlanInput[] | SubscriptionUncheckedCreateWithoutPlanInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutPlanInput | SubscriptionCreateOrConnectWithoutPlanInput[]
    createMany?: SubscriptionCreateManyPlanInputEnvelope
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SubscriptionPlanUpdatefeaturesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type SubscriptionUpdateManyWithoutPlanNestedInput = {
    create?: XOR<SubscriptionCreateWithoutPlanInput, SubscriptionUncheckedCreateWithoutPlanInput> | SubscriptionCreateWithoutPlanInput[] | SubscriptionUncheckedCreateWithoutPlanInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutPlanInput | SubscriptionCreateOrConnectWithoutPlanInput[]
    upsert?: SubscriptionUpsertWithWhereUniqueWithoutPlanInput | SubscriptionUpsertWithWhereUniqueWithoutPlanInput[]
    createMany?: SubscriptionCreateManyPlanInputEnvelope
    set?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    disconnect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    delete?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    update?: SubscriptionUpdateWithWhereUniqueWithoutPlanInput | SubscriptionUpdateWithWhereUniqueWithoutPlanInput[]
    updateMany?: SubscriptionUpdateManyWithWhereWithoutPlanInput | SubscriptionUpdateManyWithWhereWithoutPlanInput[]
    deleteMany?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
  }

  export type SubscriptionUncheckedUpdateManyWithoutPlanNestedInput = {
    create?: XOR<SubscriptionCreateWithoutPlanInput, SubscriptionUncheckedCreateWithoutPlanInput> | SubscriptionCreateWithoutPlanInput[] | SubscriptionUncheckedCreateWithoutPlanInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutPlanInput | SubscriptionCreateOrConnectWithoutPlanInput[]
    upsert?: SubscriptionUpsertWithWhereUniqueWithoutPlanInput | SubscriptionUpsertWithWhereUniqueWithoutPlanInput[]
    createMany?: SubscriptionCreateManyPlanInputEnvelope
    set?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    disconnect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    delete?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    update?: SubscriptionUpdateWithWhereUniqueWithoutPlanInput | SubscriptionUpdateWithWhereUniqueWithoutPlanInput[]
    updateMany?: SubscriptionUpdateManyWithWhereWithoutPlanInput | SubscriptionUpdateManyWithWhereWithoutPlanInput[]
    deleteMany?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
  }

  export type UsersCreateNestedOneWithoutSubscriptionInput = {
    create?: XOR<UsersCreateWithoutSubscriptionInput, UsersUncheckedCreateWithoutSubscriptionInput>
    connectOrCreate?: UsersCreateOrConnectWithoutSubscriptionInput
    connect?: UsersWhereUniqueInput
  }

  export type SubscriptionPlanCreateNestedOneWithoutSubscriptionsInput = {
    create?: XOR<SubscriptionPlanCreateWithoutSubscriptionsInput, SubscriptionPlanUncheckedCreateWithoutSubscriptionsInput>
    connectOrCreate?: SubscriptionPlanCreateOrConnectWithoutSubscriptionsInput
    connect?: SubscriptionPlanWhereUniqueInput
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UsersUpdateOneRequiredWithoutSubscriptionNestedInput = {
    create?: XOR<UsersCreateWithoutSubscriptionInput, UsersUncheckedCreateWithoutSubscriptionInput>
    connectOrCreate?: UsersCreateOrConnectWithoutSubscriptionInput
    upsert?: UsersUpsertWithoutSubscriptionInput
    connect?: UsersWhereUniqueInput
    update?: XOR<XOR<UsersUpdateToOneWithWhereWithoutSubscriptionInput, UsersUpdateWithoutSubscriptionInput>, UsersUncheckedUpdateWithoutSubscriptionInput>
  }

  export type SubscriptionPlanUpdateOneRequiredWithoutSubscriptionsNestedInput = {
    create?: XOR<SubscriptionPlanCreateWithoutSubscriptionsInput, SubscriptionPlanUncheckedCreateWithoutSubscriptionsInput>
    connectOrCreate?: SubscriptionPlanCreateOrConnectWithoutSubscriptionsInput
    upsert?: SubscriptionPlanUpsertWithoutSubscriptionsInput
    connect?: SubscriptionPlanWhereUniqueInput
    update?: XOR<XOR<SubscriptionPlanUpdateToOneWithWhereWithoutSubscriptionsInput, SubscriptionPlanUpdateWithoutSubscriptionsInput>, SubscriptionPlanUncheckedUpdateWithoutSubscriptionsInput>
  }

  export type UsersCreateNestedOneWithoutMessagesInput = {
    create?: XOR<UsersCreateWithoutMessagesInput, UsersUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: UsersCreateOrConnectWithoutMessagesInput
    connect?: UsersWhereUniqueInput
  }

  export type UsersUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<UsersCreateWithoutMessagesInput, UsersUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: UsersCreateOrConnectWithoutMessagesInput
    upsert?: UsersUpsertWithoutMessagesInput
    connect?: UsersWhereUniqueInput
    update?: XOR<XOR<UsersUpdateToOneWithWhereWithoutMessagesInput, UsersUpdateWithoutMessagesInput>, UsersUncheckedUpdateWithoutMessagesInput>
  }

  export type UsersCreateNestedOneWithoutChatConversationsInput = {
    create?: XOR<UsersCreateWithoutChatConversationsInput, UsersUncheckedCreateWithoutChatConversationsInput>
    connectOrCreate?: UsersCreateOrConnectWithoutChatConversationsInput
    connect?: UsersWhereUniqueInput
  }

  export type ChatMessageCreateNestedManyWithoutConversationInput = {
    create?: XOR<ChatMessageCreateWithoutConversationInput, ChatMessageUncheckedCreateWithoutConversationInput> | ChatMessageCreateWithoutConversationInput[] | ChatMessageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: ChatMessageCreateOrConnectWithoutConversationInput | ChatMessageCreateOrConnectWithoutConversationInput[]
    createMany?: ChatMessageCreateManyConversationInputEnvelope
    connect?: ChatMessageWhereUniqueInput | ChatMessageWhereUniqueInput[]
  }

  export type ChatMessageUncheckedCreateNestedManyWithoutConversationInput = {
    create?: XOR<ChatMessageCreateWithoutConversationInput, ChatMessageUncheckedCreateWithoutConversationInput> | ChatMessageCreateWithoutConversationInput[] | ChatMessageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: ChatMessageCreateOrConnectWithoutConversationInput | ChatMessageCreateOrConnectWithoutConversationInput[]
    createMany?: ChatMessageCreateManyConversationInputEnvelope
    connect?: ChatMessageWhereUniqueInput | ChatMessageWhereUniqueInput[]
  }

  export type UsersUpdateOneRequiredWithoutChatConversationsNestedInput = {
    create?: XOR<UsersCreateWithoutChatConversationsInput, UsersUncheckedCreateWithoutChatConversationsInput>
    connectOrCreate?: UsersCreateOrConnectWithoutChatConversationsInput
    upsert?: UsersUpsertWithoutChatConversationsInput
    connect?: UsersWhereUniqueInput
    update?: XOR<XOR<UsersUpdateToOneWithWhereWithoutChatConversationsInput, UsersUpdateWithoutChatConversationsInput>, UsersUncheckedUpdateWithoutChatConversationsInput>
  }

  export type ChatMessageUpdateManyWithoutConversationNestedInput = {
    create?: XOR<ChatMessageCreateWithoutConversationInput, ChatMessageUncheckedCreateWithoutConversationInput> | ChatMessageCreateWithoutConversationInput[] | ChatMessageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: ChatMessageCreateOrConnectWithoutConversationInput | ChatMessageCreateOrConnectWithoutConversationInput[]
    upsert?: ChatMessageUpsertWithWhereUniqueWithoutConversationInput | ChatMessageUpsertWithWhereUniqueWithoutConversationInput[]
    createMany?: ChatMessageCreateManyConversationInputEnvelope
    set?: ChatMessageWhereUniqueInput | ChatMessageWhereUniqueInput[]
    disconnect?: ChatMessageWhereUniqueInput | ChatMessageWhereUniqueInput[]
    delete?: ChatMessageWhereUniqueInput | ChatMessageWhereUniqueInput[]
    connect?: ChatMessageWhereUniqueInput | ChatMessageWhereUniqueInput[]
    update?: ChatMessageUpdateWithWhereUniqueWithoutConversationInput | ChatMessageUpdateWithWhereUniqueWithoutConversationInput[]
    updateMany?: ChatMessageUpdateManyWithWhereWithoutConversationInput | ChatMessageUpdateManyWithWhereWithoutConversationInput[]
    deleteMany?: ChatMessageScalarWhereInput | ChatMessageScalarWhereInput[]
  }

  export type ChatMessageUncheckedUpdateManyWithoutConversationNestedInput = {
    create?: XOR<ChatMessageCreateWithoutConversationInput, ChatMessageUncheckedCreateWithoutConversationInput> | ChatMessageCreateWithoutConversationInput[] | ChatMessageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: ChatMessageCreateOrConnectWithoutConversationInput | ChatMessageCreateOrConnectWithoutConversationInput[]
    upsert?: ChatMessageUpsertWithWhereUniqueWithoutConversationInput | ChatMessageUpsertWithWhereUniqueWithoutConversationInput[]
    createMany?: ChatMessageCreateManyConversationInputEnvelope
    set?: ChatMessageWhereUniqueInput | ChatMessageWhereUniqueInput[]
    disconnect?: ChatMessageWhereUniqueInput | ChatMessageWhereUniqueInput[]
    delete?: ChatMessageWhereUniqueInput | ChatMessageWhereUniqueInput[]
    connect?: ChatMessageWhereUniqueInput | ChatMessageWhereUniqueInput[]
    update?: ChatMessageUpdateWithWhereUniqueWithoutConversationInput | ChatMessageUpdateWithWhereUniqueWithoutConversationInput[]
    updateMany?: ChatMessageUpdateManyWithWhereWithoutConversationInput | ChatMessageUpdateManyWithWhereWithoutConversationInput[]
    deleteMany?: ChatMessageScalarWhereInput | ChatMessageScalarWhereInput[]
  }

  export type ChatConversationCreateNestedOneWithoutMessagesInput = {
    create?: XOR<ChatConversationCreateWithoutMessagesInput, ChatConversationUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: ChatConversationCreateOrConnectWithoutMessagesInput
    connect?: ChatConversationWhereUniqueInput
  }

  export type ChatConversationUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<ChatConversationCreateWithoutMessagesInput, ChatConversationUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: ChatConversationCreateOrConnectWithoutMessagesInput
    upsert?: ChatConversationUpsertWithoutMessagesInput
    connect?: ChatConversationWhereUniqueInput
    update?: XOR<XOR<ChatConversationUpdateToOneWithWhereWithoutMessagesInput, ChatConversationUpdateWithoutMessagesInput>, ChatConversationUncheckedUpdateWithoutMessagesInput>
  }

  export type UsersCreateNestedOneWithoutDocumentsInput = {
    create?: XOR<UsersCreateWithoutDocumentsInput, UsersUncheckedCreateWithoutDocumentsInput>
    connectOrCreate?: UsersCreateOrConnectWithoutDocumentsInput
    connect?: UsersWhereUniqueInput
  }

  export type DocumentChunkCreateNestedManyWithoutDocumentInput = {
    create?: XOR<DocumentChunkCreateWithoutDocumentInput, DocumentChunkUncheckedCreateWithoutDocumentInput> | DocumentChunkCreateWithoutDocumentInput[] | DocumentChunkUncheckedCreateWithoutDocumentInput[]
    connectOrCreate?: DocumentChunkCreateOrConnectWithoutDocumentInput | DocumentChunkCreateOrConnectWithoutDocumentInput[]
    createMany?: DocumentChunkCreateManyDocumentInputEnvelope
    connect?: DocumentChunkWhereUniqueInput | DocumentChunkWhereUniqueInput[]
  }

  export type DocumentChunkUncheckedCreateNestedManyWithoutDocumentInput = {
    create?: XOR<DocumentChunkCreateWithoutDocumentInput, DocumentChunkUncheckedCreateWithoutDocumentInput> | DocumentChunkCreateWithoutDocumentInput[] | DocumentChunkUncheckedCreateWithoutDocumentInput[]
    connectOrCreate?: DocumentChunkCreateOrConnectWithoutDocumentInput | DocumentChunkCreateOrConnectWithoutDocumentInput[]
    createMany?: DocumentChunkCreateManyDocumentInputEnvelope
    connect?: DocumentChunkWhereUniqueInput | DocumentChunkWhereUniqueInput[]
  }

  export type UsersUpdateOneRequiredWithoutDocumentsNestedInput = {
    create?: XOR<UsersCreateWithoutDocumentsInput, UsersUncheckedCreateWithoutDocumentsInput>
    connectOrCreate?: UsersCreateOrConnectWithoutDocumentsInput
    upsert?: UsersUpsertWithoutDocumentsInput
    connect?: UsersWhereUniqueInput
    update?: XOR<XOR<UsersUpdateToOneWithWhereWithoutDocumentsInput, UsersUpdateWithoutDocumentsInput>, UsersUncheckedUpdateWithoutDocumentsInput>
  }

  export type DocumentChunkUpdateManyWithoutDocumentNestedInput = {
    create?: XOR<DocumentChunkCreateWithoutDocumentInput, DocumentChunkUncheckedCreateWithoutDocumentInput> | DocumentChunkCreateWithoutDocumentInput[] | DocumentChunkUncheckedCreateWithoutDocumentInput[]
    connectOrCreate?: DocumentChunkCreateOrConnectWithoutDocumentInput | DocumentChunkCreateOrConnectWithoutDocumentInput[]
    upsert?: DocumentChunkUpsertWithWhereUniqueWithoutDocumentInput | DocumentChunkUpsertWithWhereUniqueWithoutDocumentInput[]
    createMany?: DocumentChunkCreateManyDocumentInputEnvelope
    set?: DocumentChunkWhereUniqueInput | DocumentChunkWhereUniqueInput[]
    disconnect?: DocumentChunkWhereUniqueInput | DocumentChunkWhereUniqueInput[]
    delete?: DocumentChunkWhereUniqueInput | DocumentChunkWhereUniqueInput[]
    connect?: DocumentChunkWhereUniqueInput | DocumentChunkWhereUniqueInput[]
    update?: DocumentChunkUpdateWithWhereUniqueWithoutDocumentInput | DocumentChunkUpdateWithWhereUniqueWithoutDocumentInput[]
    updateMany?: DocumentChunkUpdateManyWithWhereWithoutDocumentInput | DocumentChunkUpdateManyWithWhereWithoutDocumentInput[]
    deleteMany?: DocumentChunkScalarWhereInput | DocumentChunkScalarWhereInput[]
  }

  export type DocumentChunkUncheckedUpdateManyWithoutDocumentNestedInput = {
    create?: XOR<DocumentChunkCreateWithoutDocumentInput, DocumentChunkUncheckedCreateWithoutDocumentInput> | DocumentChunkCreateWithoutDocumentInput[] | DocumentChunkUncheckedCreateWithoutDocumentInput[]
    connectOrCreate?: DocumentChunkCreateOrConnectWithoutDocumentInput | DocumentChunkCreateOrConnectWithoutDocumentInput[]
    upsert?: DocumentChunkUpsertWithWhereUniqueWithoutDocumentInput | DocumentChunkUpsertWithWhereUniqueWithoutDocumentInput[]
    createMany?: DocumentChunkCreateManyDocumentInputEnvelope
    set?: DocumentChunkWhereUniqueInput | DocumentChunkWhereUniqueInput[]
    disconnect?: DocumentChunkWhereUniqueInput | DocumentChunkWhereUniqueInput[]
    delete?: DocumentChunkWhereUniqueInput | DocumentChunkWhereUniqueInput[]
    connect?: DocumentChunkWhereUniqueInput | DocumentChunkWhereUniqueInput[]
    update?: DocumentChunkUpdateWithWhereUniqueWithoutDocumentInput | DocumentChunkUpdateWithWhereUniqueWithoutDocumentInput[]
    updateMany?: DocumentChunkUpdateManyWithWhereWithoutDocumentInput | DocumentChunkUpdateManyWithWhereWithoutDocumentInput[]
    deleteMany?: DocumentChunkScalarWhereInput | DocumentChunkScalarWhereInput[]
  }

  export type DocumentCreateNestedOneWithoutChunksInput = {
    create?: XOR<DocumentCreateWithoutChunksInput, DocumentUncheckedCreateWithoutChunksInput>
    connectOrCreate?: DocumentCreateOrConnectWithoutChunksInput
    connect?: DocumentWhereUniqueInput
  }

  export type EmbeddingCreateNestedOneWithoutChunkInput = {
    create?: XOR<EmbeddingCreateWithoutChunkInput, EmbeddingUncheckedCreateWithoutChunkInput>
    connectOrCreate?: EmbeddingCreateOrConnectWithoutChunkInput
    connect?: EmbeddingWhereUniqueInput
  }

  export type EmbeddingUncheckedCreateNestedOneWithoutChunkInput = {
    create?: XOR<EmbeddingCreateWithoutChunkInput, EmbeddingUncheckedCreateWithoutChunkInput>
    connectOrCreate?: EmbeddingCreateOrConnectWithoutChunkInput
    connect?: EmbeddingWhereUniqueInput
  }

  export type DocumentUpdateOneRequiredWithoutChunksNestedInput = {
    create?: XOR<DocumentCreateWithoutChunksInput, DocumentUncheckedCreateWithoutChunksInput>
    connectOrCreate?: DocumentCreateOrConnectWithoutChunksInput
    upsert?: DocumentUpsertWithoutChunksInput
    connect?: DocumentWhereUniqueInput
    update?: XOR<XOR<DocumentUpdateToOneWithWhereWithoutChunksInput, DocumentUpdateWithoutChunksInput>, DocumentUncheckedUpdateWithoutChunksInput>
  }

  export type EmbeddingUpdateOneWithoutChunkNestedInput = {
    create?: XOR<EmbeddingCreateWithoutChunkInput, EmbeddingUncheckedCreateWithoutChunkInput>
    connectOrCreate?: EmbeddingCreateOrConnectWithoutChunkInput
    upsert?: EmbeddingUpsertWithoutChunkInput
    disconnect?: EmbeddingWhereInput | boolean
    delete?: EmbeddingWhereInput | boolean
    connect?: EmbeddingWhereUniqueInput
    update?: XOR<XOR<EmbeddingUpdateToOneWithWhereWithoutChunkInput, EmbeddingUpdateWithoutChunkInput>, EmbeddingUncheckedUpdateWithoutChunkInput>
  }

  export type EmbeddingUncheckedUpdateOneWithoutChunkNestedInput = {
    create?: XOR<EmbeddingCreateWithoutChunkInput, EmbeddingUncheckedCreateWithoutChunkInput>
    connectOrCreate?: EmbeddingCreateOrConnectWithoutChunkInput
    upsert?: EmbeddingUpsertWithoutChunkInput
    disconnect?: EmbeddingWhereInput | boolean
    delete?: EmbeddingWhereInput | boolean
    connect?: EmbeddingWhereUniqueInput
    update?: XOR<XOR<EmbeddingUpdateToOneWithWhereWithoutChunkInput, EmbeddingUpdateWithoutChunkInput>, EmbeddingUncheckedUpdateWithoutChunkInput>
  }

  export type EmbeddingCreatevectorInput = {
    set: number[]
  }

  export type UsersCreateNestedOneWithoutEmbeddingsInput = {
    create?: XOR<UsersCreateWithoutEmbeddingsInput, UsersUncheckedCreateWithoutEmbeddingsInput>
    connectOrCreate?: UsersCreateOrConnectWithoutEmbeddingsInput
    connect?: UsersWhereUniqueInput
  }

  export type DocumentChunkCreateNestedOneWithoutEmbeddingInput = {
    create?: XOR<DocumentChunkCreateWithoutEmbeddingInput, DocumentChunkUncheckedCreateWithoutEmbeddingInput>
    connectOrCreate?: DocumentChunkCreateOrConnectWithoutEmbeddingInput
    connect?: DocumentChunkWhereUniqueInput
  }

  export type EmbeddingUpdatevectorInput = {
    set?: number[]
    push?: number | number[]
  }

  export type UsersUpdateOneRequiredWithoutEmbeddingsNestedInput = {
    create?: XOR<UsersCreateWithoutEmbeddingsInput, UsersUncheckedCreateWithoutEmbeddingsInput>
    connectOrCreate?: UsersCreateOrConnectWithoutEmbeddingsInput
    upsert?: UsersUpsertWithoutEmbeddingsInput
    connect?: UsersWhereUniqueInput
    update?: XOR<XOR<UsersUpdateToOneWithWhereWithoutEmbeddingsInput, UsersUpdateWithoutEmbeddingsInput>, UsersUncheckedUpdateWithoutEmbeddingsInput>
  }

  export type DocumentChunkUpdateOneRequiredWithoutEmbeddingNestedInput = {
    create?: XOR<DocumentChunkCreateWithoutEmbeddingInput, DocumentChunkUncheckedCreateWithoutEmbeddingInput>
    connectOrCreate?: DocumentChunkCreateOrConnectWithoutEmbeddingInput
    upsert?: DocumentChunkUpsertWithoutEmbeddingInput
    connect?: DocumentChunkWhereUniqueInput
    update?: XOR<XOR<DocumentChunkUpdateToOneWithWhereWithoutEmbeddingInput, DocumentChunkUpdateWithoutEmbeddingInput>, DocumentChunkUncheckedUpdateWithoutEmbeddingInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumPlanTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanType | EnumPlanTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PlanType[] | ListEnumPlanTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanType[] | ListEnumPlanTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanTypeFilter<$PrismaModel> | $Enums.PlanType
  }

  export type NestedEnumSubscriptionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionType | EnumSubscriptionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionType[] | ListEnumSubscriptionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionType[] | ListEnumSubscriptionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionTypeFilter<$PrismaModel> | $Enums.SubscriptionType
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumPlanTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanType | EnumPlanTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PlanType[] | ListEnumPlanTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanType[] | ListEnumPlanTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanTypeWithAggregatesFilter<$PrismaModel> | $Enums.PlanType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlanTypeFilter<$PrismaModel>
    _max?: NestedEnumPlanTypeFilter<$PrismaModel>
  }

  export type NestedEnumSubscriptionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionType | EnumSubscriptionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionType[] | ListEnumSubscriptionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionType[] | ListEnumSubscriptionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionTypeWithAggregatesFilter<$PrismaModel> | $Enums.SubscriptionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSubscriptionTypeFilter<$PrismaModel>
    _max?: NestedEnumSubscriptionTypeFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type UsersCreateWithoutAccountsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    sessions?: SessionCreateNestedManyWithoutUserInput
    subscription?: SubscriptionCreateNestedOneWithoutUserInput
    messages?: MessageCreateNestedManyWithoutUserInput
    documents?: DocumentCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationCreateNestedManyWithoutUserInput
  }

  export type UsersUncheckedCreateWithoutAccountsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    subscription?: SubscriptionUncheckedCreateNestedOneWithoutUserInput
    messages?: MessageUncheckedCreateNestedManyWithoutUserInput
    documents?: DocumentUncheckedCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingUncheckedCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UsersCreateOrConnectWithoutAccountsInput = {
    where: UsersWhereUniqueInput
    create: XOR<UsersCreateWithoutAccountsInput, UsersUncheckedCreateWithoutAccountsInput>
  }

  export type UsersUpsertWithoutAccountsInput = {
    update: XOR<UsersUpdateWithoutAccountsInput, UsersUncheckedUpdateWithoutAccountsInput>
    create: XOR<UsersCreateWithoutAccountsInput, UsersUncheckedCreateWithoutAccountsInput>
    where?: UsersWhereInput
  }

  export type UsersUpdateToOneWithWhereWithoutAccountsInput = {
    where?: UsersWhereInput
    data: XOR<UsersUpdateWithoutAccountsInput, UsersUncheckedUpdateWithoutAccountsInput>
  }

  export type UsersUpdateWithoutAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    sessions?: SessionUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUpdateOneWithoutUserNestedInput
    messages?: MessageUpdateManyWithoutUserNestedInput
    documents?: DocumentUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUpdateManyWithoutUserNestedInput
  }

  export type UsersUncheckedUpdateWithoutAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUncheckedUpdateOneWithoutUserNestedInput
    messages?: MessageUncheckedUpdateManyWithoutUserNestedInput
    documents?: DocumentUncheckedUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUncheckedUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UsersCreateWithoutSessionsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountCreateNestedManyWithoutUserInput
    subscription?: SubscriptionCreateNestedOneWithoutUserInput
    messages?: MessageCreateNestedManyWithoutUserInput
    documents?: DocumentCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationCreateNestedManyWithoutUserInput
  }

  export type UsersUncheckedCreateWithoutSessionsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    subscription?: SubscriptionUncheckedCreateNestedOneWithoutUserInput
    messages?: MessageUncheckedCreateNestedManyWithoutUserInput
    documents?: DocumentUncheckedCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingUncheckedCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UsersCreateOrConnectWithoutSessionsInput = {
    where: UsersWhereUniqueInput
    create: XOR<UsersCreateWithoutSessionsInput, UsersUncheckedCreateWithoutSessionsInput>
  }

  export type UsersUpsertWithoutSessionsInput = {
    update: XOR<UsersUpdateWithoutSessionsInput, UsersUncheckedUpdateWithoutSessionsInput>
    create: XOR<UsersCreateWithoutSessionsInput, UsersUncheckedCreateWithoutSessionsInput>
    where?: UsersWhereInput
  }

  export type UsersUpdateToOneWithWhereWithoutSessionsInput = {
    where?: UsersWhereInput
    data: XOR<UsersUpdateWithoutSessionsInput, UsersUncheckedUpdateWithoutSessionsInput>
  }

  export type UsersUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUpdateOneWithoutUserNestedInput
    messages?: MessageUpdateManyWithoutUserNestedInput
    documents?: DocumentUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUpdateManyWithoutUserNestedInput
  }

  export type UsersUncheckedUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUncheckedUpdateOneWithoutUserNestedInput
    messages?: MessageUncheckedUpdateManyWithoutUserNestedInput
    documents?: DocumentUncheckedUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUncheckedUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type AccountCreateWithoutUserInput = {
    id?: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
  }

  export type AccountUncheckedCreateWithoutUserInput = {
    id?: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
  }

  export type AccountCreateOrConnectWithoutUserInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput>
  }

  export type AccountCreateManyUserInputEnvelope = {
    data: AccountCreateManyUserInput | AccountCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SessionCreateWithoutUserInput = {
    id?: string
    sessionToken: string
    expires: Date | string
  }

  export type SessionUncheckedCreateWithoutUserInput = {
    id?: string
    sessionToken: string
    expires: Date | string
  }

  export type SessionCreateOrConnectWithoutUserInput = {
    where: SessionWhereUniqueInput
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionCreateManyUserInputEnvelope = {
    data: SessionCreateManyUserInput | SessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SubscriptionCreateWithoutUserInput = {
    id?: string
    razorpaySubscriptionId: string
    razorpayCustomerId: string
    status: string
    currentPeriodStart: Date | string
    currentPeriodEnd: Date | string
    cancelledAt?: Date | string | null
    lastPaymentId?: string | null
    lastPaymentAmount?: number | null
    lastPaymentDate?: Date | string | null
    lastPaymentError?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    plan: SubscriptionPlanCreateNestedOneWithoutSubscriptionsInput
  }

  export type SubscriptionUncheckedCreateWithoutUserInput = {
    id?: string
    planId: string
    razorpaySubscriptionId: string
    razorpayCustomerId: string
    status: string
    currentPeriodStart: Date | string
    currentPeriodEnd: Date | string
    cancelledAt?: Date | string | null
    lastPaymentId?: string | null
    lastPaymentAmount?: number | null
    lastPaymentDate?: Date | string | null
    lastPaymentError?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubscriptionCreateOrConnectWithoutUserInput = {
    where: SubscriptionWhereUniqueInput
    create: XOR<SubscriptionCreateWithoutUserInput, SubscriptionUncheckedCreateWithoutUserInput>
  }

  export type MessageCreateWithoutUserInput = {
    id?: string
    content: string
    role: string
    createdAt?: Date | string
  }

  export type MessageUncheckedCreateWithoutUserInput = {
    id?: string
    content: string
    role: string
    createdAt?: Date | string
  }

  export type MessageCreateOrConnectWithoutUserInput = {
    where: MessageWhereUniqueInput
    create: XOR<MessageCreateWithoutUserInput, MessageUncheckedCreateWithoutUserInput>
  }

  export type MessageCreateManyUserInputEnvelope = {
    data: MessageCreateManyUserInput | MessageCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type DocumentCreateWithoutUserInput = {
    id?: string
    fileName: string
    originalName: string
    fileType: string
    fileSize: number
    category?: string | null
    description?: string | null
    content: string
    keywords?: string | null
    uploadedAt?: Date | string
    chunks?: DocumentChunkCreateNestedManyWithoutDocumentInput
  }

  export type DocumentUncheckedCreateWithoutUserInput = {
    id?: string
    fileName: string
    originalName: string
    fileType: string
    fileSize: number
    category?: string | null
    description?: string | null
    content: string
    keywords?: string | null
    uploadedAt?: Date | string
    chunks?: DocumentChunkUncheckedCreateNestedManyWithoutDocumentInput
  }

  export type DocumentCreateOrConnectWithoutUserInput = {
    where: DocumentWhereUniqueInput
    create: XOR<DocumentCreateWithoutUserInput, DocumentUncheckedCreateWithoutUserInput>
  }

  export type DocumentCreateManyUserInputEnvelope = {
    data: DocumentCreateManyUserInput | DocumentCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type EmbeddingCreateWithoutUserInput = {
    id?: string
    vector?: EmbeddingCreatevectorInput | number[]
    createdAt?: Date | string
    chunk: DocumentChunkCreateNestedOneWithoutEmbeddingInput
  }

  export type EmbeddingUncheckedCreateWithoutUserInput = {
    id?: string
    chunkId: string
    vector?: EmbeddingCreatevectorInput | number[]
    createdAt?: Date | string
  }

  export type EmbeddingCreateOrConnectWithoutUserInput = {
    where: EmbeddingWhereUniqueInput
    create: XOR<EmbeddingCreateWithoutUserInput, EmbeddingUncheckedCreateWithoutUserInput>
  }

  export type EmbeddingCreateManyUserInputEnvelope = {
    data: EmbeddingCreateManyUserInput | EmbeddingCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ChatConversationCreateWithoutUserInput = {
    id?: string
    visitorId: string
    userAgent?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    ipAddress?: string | null
    referrer?: string | null
    firstSeen?: Date | string
    lastSeen?: Date | string
    totalMessages?: number
    avgResponseTime?: number | null
    messages?: ChatMessageCreateNestedManyWithoutConversationInput
  }

  export type ChatConversationUncheckedCreateWithoutUserInput = {
    id?: string
    visitorId: string
    userAgent?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    ipAddress?: string | null
    referrer?: string | null
    firstSeen?: Date | string
    lastSeen?: Date | string
    totalMessages?: number
    avgResponseTime?: number | null
    messages?: ChatMessageUncheckedCreateNestedManyWithoutConversationInput
  }

  export type ChatConversationCreateOrConnectWithoutUserInput = {
    where: ChatConversationWhereUniqueInput
    create: XOR<ChatConversationCreateWithoutUserInput, ChatConversationUncheckedCreateWithoutUserInput>
  }

  export type ChatConversationCreateManyUserInputEnvelope = {
    data: ChatConversationCreateManyUserInput | ChatConversationCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AccountUpsertWithWhereUniqueWithoutUserInput = {
    where: AccountWhereUniqueInput
    update: XOR<AccountUpdateWithoutUserInput, AccountUncheckedUpdateWithoutUserInput>
    create: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput>
  }

  export type AccountUpdateWithWhereUniqueWithoutUserInput = {
    where: AccountWhereUniqueInput
    data: XOR<AccountUpdateWithoutUserInput, AccountUncheckedUpdateWithoutUserInput>
  }

  export type AccountUpdateManyWithWhereWithoutUserInput = {
    where: AccountScalarWhereInput
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyWithoutUserInput>
  }

  export type AccountScalarWhereInput = {
    AND?: AccountScalarWhereInput | AccountScalarWhereInput[]
    OR?: AccountScalarWhereInput[]
    NOT?: AccountScalarWhereInput | AccountScalarWhereInput[]
    id?: StringFilter<"Account"> | string
    userId?: StringFilter<"Account"> | string
    type?: StringFilter<"Account"> | string
    provider?: StringFilter<"Account"> | string
    providerAccountId?: StringFilter<"Account"> | string
    refresh_token?: StringNullableFilter<"Account"> | string | null
    access_token?: StringNullableFilter<"Account"> | string | null
    expires_at?: IntNullableFilter<"Account"> | number | null
    token_type?: StringNullableFilter<"Account"> | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    id_token?: StringNullableFilter<"Account"> | string | null
    session_state?: StringNullableFilter<"Account"> | string | null
  }

  export type SessionUpsertWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    update: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionUpdateWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    data: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
  }

  export type SessionUpdateManyWithWhereWithoutUserInput = {
    where: SessionScalarWhereInput
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyWithoutUserInput>
  }

  export type SessionScalarWhereInput = {
    AND?: SessionScalarWhereInput | SessionScalarWhereInput[]
    OR?: SessionScalarWhereInput[]
    NOT?: SessionScalarWhereInput | SessionScalarWhereInput[]
    id?: StringFilter<"Session"> | string
    sessionToken?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
  }

  export type SubscriptionUpsertWithoutUserInput = {
    update: XOR<SubscriptionUpdateWithoutUserInput, SubscriptionUncheckedUpdateWithoutUserInput>
    create: XOR<SubscriptionCreateWithoutUserInput, SubscriptionUncheckedCreateWithoutUserInput>
    where?: SubscriptionWhereInput
  }

  export type SubscriptionUpdateToOneWithWhereWithoutUserInput = {
    where?: SubscriptionWhereInput
    data: XOR<SubscriptionUpdateWithoutUserInput, SubscriptionUncheckedUpdateWithoutUserInput>
  }

  export type SubscriptionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    razorpaySubscriptionId?: StringFieldUpdateOperationsInput | string
    razorpayCustomerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentId?: NullableStringFieldUpdateOperationsInput | string | null
    lastPaymentAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    lastPaymentDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    plan?: SubscriptionPlanUpdateOneRequiredWithoutSubscriptionsNestedInput
  }

  export type SubscriptionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    planId?: StringFieldUpdateOperationsInput | string
    razorpaySubscriptionId?: StringFieldUpdateOperationsInput | string
    razorpayCustomerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentId?: NullableStringFieldUpdateOperationsInput | string | null
    lastPaymentAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    lastPaymentDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageUpsertWithWhereUniqueWithoutUserInput = {
    where: MessageWhereUniqueInput
    update: XOR<MessageUpdateWithoutUserInput, MessageUncheckedUpdateWithoutUserInput>
    create: XOR<MessageCreateWithoutUserInput, MessageUncheckedCreateWithoutUserInput>
  }

  export type MessageUpdateWithWhereUniqueWithoutUserInput = {
    where: MessageWhereUniqueInput
    data: XOR<MessageUpdateWithoutUserInput, MessageUncheckedUpdateWithoutUserInput>
  }

  export type MessageUpdateManyWithWhereWithoutUserInput = {
    where: MessageScalarWhereInput
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyWithoutUserInput>
  }

  export type MessageScalarWhereInput = {
    AND?: MessageScalarWhereInput | MessageScalarWhereInput[]
    OR?: MessageScalarWhereInput[]
    NOT?: MessageScalarWhereInput | MessageScalarWhereInput[]
    id?: StringFilter<"Message"> | string
    content?: StringFilter<"Message"> | string
    role?: StringFilter<"Message"> | string
    createdAt?: DateTimeFilter<"Message"> | Date | string
    userId?: StringFilter<"Message"> | string
  }

  export type DocumentUpsertWithWhereUniqueWithoutUserInput = {
    where: DocumentWhereUniqueInput
    update: XOR<DocumentUpdateWithoutUserInput, DocumentUncheckedUpdateWithoutUserInput>
    create: XOR<DocumentCreateWithoutUserInput, DocumentUncheckedCreateWithoutUserInput>
  }

  export type DocumentUpdateWithWhereUniqueWithoutUserInput = {
    where: DocumentWhereUniqueInput
    data: XOR<DocumentUpdateWithoutUserInput, DocumentUncheckedUpdateWithoutUserInput>
  }

  export type DocumentUpdateManyWithWhereWithoutUserInput = {
    where: DocumentScalarWhereInput
    data: XOR<DocumentUpdateManyMutationInput, DocumentUncheckedUpdateManyWithoutUserInput>
  }

  export type DocumentScalarWhereInput = {
    AND?: DocumentScalarWhereInput | DocumentScalarWhereInput[]
    OR?: DocumentScalarWhereInput[]
    NOT?: DocumentScalarWhereInput | DocumentScalarWhereInput[]
    id?: StringFilter<"Document"> | string
    fileName?: StringFilter<"Document"> | string
    originalName?: StringFilter<"Document"> | string
    fileType?: StringFilter<"Document"> | string
    fileSize?: IntFilter<"Document"> | number
    category?: StringNullableFilter<"Document"> | string | null
    description?: StringNullableFilter<"Document"> | string | null
    content?: StringFilter<"Document"> | string
    keywords?: StringNullableFilter<"Document"> | string | null
    uploadedAt?: DateTimeFilter<"Document"> | Date | string
    userId?: StringFilter<"Document"> | string
  }

  export type EmbeddingUpsertWithWhereUniqueWithoutUserInput = {
    where: EmbeddingWhereUniqueInput
    update: XOR<EmbeddingUpdateWithoutUserInput, EmbeddingUncheckedUpdateWithoutUserInput>
    create: XOR<EmbeddingCreateWithoutUserInput, EmbeddingUncheckedCreateWithoutUserInput>
  }

  export type EmbeddingUpdateWithWhereUniqueWithoutUserInput = {
    where: EmbeddingWhereUniqueInput
    data: XOR<EmbeddingUpdateWithoutUserInput, EmbeddingUncheckedUpdateWithoutUserInput>
  }

  export type EmbeddingUpdateManyWithWhereWithoutUserInput = {
    where: EmbeddingScalarWhereInput
    data: XOR<EmbeddingUpdateManyMutationInput, EmbeddingUncheckedUpdateManyWithoutUserInput>
  }

  export type EmbeddingScalarWhereInput = {
    AND?: EmbeddingScalarWhereInput | EmbeddingScalarWhereInput[]
    OR?: EmbeddingScalarWhereInput[]
    NOT?: EmbeddingScalarWhereInput | EmbeddingScalarWhereInput[]
    id?: StringFilter<"Embedding"> | string
    userId?: StringFilter<"Embedding"> | string
    chunkId?: StringFilter<"Embedding"> | string
    vector?: FloatNullableListFilter<"Embedding">
    createdAt?: DateTimeFilter<"Embedding"> | Date | string
  }

  export type ChatConversationUpsertWithWhereUniqueWithoutUserInput = {
    where: ChatConversationWhereUniqueInput
    update: XOR<ChatConversationUpdateWithoutUserInput, ChatConversationUncheckedUpdateWithoutUserInput>
    create: XOR<ChatConversationCreateWithoutUserInput, ChatConversationUncheckedCreateWithoutUserInput>
  }

  export type ChatConversationUpdateWithWhereUniqueWithoutUserInput = {
    where: ChatConversationWhereUniqueInput
    data: XOR<ChatConversationUpdateWithoutUserInput, ChatConversationUncheckedUpdateWithoutUserInput>
  }

  export type ChatConversationUpdateManyWithWhereWithoutUserInput = {
    where: ChatConversationScalarWhereInput
    data: XOR<ChatConversationUpdateManyMutationInput, ChatConversationUncheckedUpdateManyWithoutUserInput>
  }

  export type ChatConversationScalarWhereInput = {
    AND?: ChatConversationScalarWhereInput | ChatConversationScalarWhereInput[]
    OR?: ChatConversationScalarWhereInput[]
    NOT?: ChatConversationScalarWhereInput | ChatConversationScalarWhereInput[]
    id?: StringFilter<"ChatConversation"> | string
    visitorId?: StringFilter<"ChatConversation"> | string
    userId?: StringFilter<"ChatConversation"> | string
    userAgent?: StringNullableFilter<"ChatConversation"> | string | null
    deviceType?: StringNullableFilter<"ChatConversation"> | string | null
    browser?: StringNullableFilter<"ChatConversation"> | string | null
    os?: StringNullableFilter<"ChatConversation"> | string | null
    ipAddress?: StringNullableFilter<"ChatConversation"> | string | null
    referrer?: StringNullableFilter<"ChatConversation"> | string | null
    firstSeen?: DateTimeFilter<"ChatConversation"> | Date | string
    lastSeen?: DateTimeFilter<"ChatConversation"> | Date | string
    totalMessages?: IntFilter<"ChatConversation"> | number
    avgResponseTime?: FloatNullableFilter<"ChatConversation"> | number | null
  }

  export type SubscriptionCreateWithoutPlanInput = {
    id?: string
    razorpaySubscriptionId: string
    razorpayCustomerId: string
    status: string
    currentPeriodStart: Date | string
    currentPeriodEnd: Date | string
    cancelledAt?: Date | string | null
    lastPaymentId?: string | null
    lastPaymentAmount?: number | null
    lastPaymentDate?: Date | string | null
    lastPaymentError?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UsersCreateNestedOneWithoutSubscriptionInput
  }

  export type SubscriptionUncheckedCreateWithoutPlanInput = {
    id?: string
    userId: string
    razorpaySubscriptionId: string
    razorpayCustomerId: string
    status: string
    currentPeriodStart: Date | string
    currentPeriodEnd: Date | string
    cancelledAt?: Date | string | null
    lastPaymentId?: string | null
    lastPaymentAmount?: number | null
    lastPaymentDate?: Date | string | null
    lastPaymentError?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubscriptionCreateOrConnectWithoutPlanInput = {
    where: SubscriptionWhereUniqueInput
    create: XOR<SubscriptionCreateWithoutPlanInput, SubscriptionUncheckedCreateWithoutPlanInput>
  }

  export type SubscriptionCreateManyPlanInputEnvelope = {
    data: SubscriptionCreateManyPlanInput | SubscriptionCreateManyPlanInput[]
    skipDuplicates?: boolean
  }

  export type SubscriptionUpsertWithWhereUniqueWithoutPlanInput = {
    where: SubscriptionWhereUniqueInput
    update: XOR<SubscriptionUpdateWithoutPlanInput, SubscriptionUncheckedUpdateWithoutPlanInput>
    create: XOR<SubscriptionCreateWithoutPlanInput, SubscriptionUncheckedCreateWithoutPlanInput>
  }

  export type SubscriptionUpdateWithWhereUniqueWithoutPlanInput = {
    where: SubscriptionWhereUniqueInput
    data: XOR<SubscriptionUpdateWithoutPlanInput, SubscriptionUncheckedUpdateWithoutPlanInput>
  }

  export type SubscriptionUpdateManyWithWhereWithoutPlanInput = {
    where: SubscriptionScalarWhereInput
    data: XOR<SubscriptionUpdateManyMutationInput, SubscriptionUncheckedUpdateManyWithoutPlanInput>
  }

  export type SubscriptionScalarWhereInput = {
    AND?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
    OR?: SubscriptionScalarWhereInput[]
    NOT?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
    id?: StringFilter<"Subscription"> | string
    userId?: StringFilter<"Subscription"> | string
    planId?: StringFilter<"Subscription"> | string
    razorpaySubscriptionId?: StringFilter<"Subscription"> | string
    razorpayCustomerId?: StringFilter<"Subscription"> | string
    status?: StringFilter<"Subscription"> | string
    currentPeriodStart?: DateTimeFilter<"Subscription"> | Date | string
    currentPeriodEnd?: DateTimeFilter<"Subscription"> | Date | string
    cancelledAt?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    lastPaymentId?: StringNullableFilter<"Subscription"> | string | null
    lastPaymentAmount?: FloatNullableFilter<"Subscription"> | number | null
    lastPaymentDate?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    lastPaymentError?: StringNullableFilter<"Subscription"> | string | null
    createdAt?: DateTimeFilter<"Subscription"> | Date | string
    updatedAt?: DateTimeFilter<"Subscription"> | Date | string
  }

  export type UsersCreateWithoutSubscriptionInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    messages?: MessageCreateNestedManyWithoutUserInput
    documents?: DocumentCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationCreateNestedManyWithoutUserInput
  }

  export type UsersUncheckedCreateWithoutSubscriptionInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    messages?: MessageUncheckedCreateNestedManyWithoutUserInput
    documents?: DocumentUncheckedCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingUncheckedCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UsersCreateOrConnectWithoutSubscriptionInput = {
    where: UsersWhereUniqueInput
    create: XOR<UsersCreateWithoutSubscriptionInput, UsersUncheckedCreateWithoutSubscriptionInput>
  }

  export type SubscriptionPlanCreateWithoutSubscriptionsInput = {
    id?: string
    name: string
    description: string
    price: number
    currency?: string
    features?: SubscriptionPlanCreatefeaturesInput | string[]
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubscriptionPlanUncheckedCreateWithoutSubscriptionsInput = {
    id?: string
    name: string
    description: string
    price: number
    currency?: string
    features?: SubscriptionPlanCreatefeaturesInput | string[]
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubscriptionPlanCreateOrConnectWithoutSubscriptionsInput = {
    where: SubscriptionPlanWhereUniqueInput
    create: XOR<SubscriptionPlanCreateWithoutSubscriptionsInput, SubscriptionPlanUncheckedCreateWithoutSubscriptionsInput>
  }

  export type UsersUpsertWithoutSubscriptionInput = {
    update: XOR<UsersUpdateWithoutSubscriptionInput, UsersUncheckedUpdateWithoutSubscriptionInput>
    create: XOR<UsersCreateWithoutSubscriptionInput, UsersUncheckedCreateWithoutSubscriptionInput>
    where?: UsersWhereInput
  }

  export type UsersUpdateToOneWithWhereWithoutSubscriptionInput = {
    where?: UsersWhereInput
    data: XOR<UsersUpdateWithoutSubscriptionInput, UsersUncheckedUpdateWithoutSubscriptionInput>
  }

  export type UsersUpdateWithoutSubscriptionInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    messages?: MessageUpdateManyWithoutUserNestedInput
    documents?: DocumentUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUpdateManyWithoutUserNestedInput
  }

  export type UsersUncheckedUpdateWithoutSubscriptionInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    messages?: MessageUncheckedUpdateManyWithoutUserNestedInput
    documents?: DocumentUncheckedUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUncheckedUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type SubscriptionPlanUpsertWithoutSubscriptionsInput = {
    update: XOR<SubscriptionPlanUpdateWithoutSubscriptionsInput, SubscriptionPlanUncheckedUpdateWithoutSubscriptionsInput>
    create: XOR<SubscriptionPlanCreateWithoutSubscriptionsInput, SubscriptionPlanUncheckedCreateWithoutSubscriptionsInput>
    where?: SubscriptionPlanWhereInput
  }

  export type SubscriptionPlanUpdateToOneWithWhereWithoutSubscriptionsInput = {
    where?: SubscriptionPlanWhereInput
    data: XOR<SubscriptionPlanUpdateWithoutSubscriptionsInput, SubscriptionPlanUncheckedUpdateWithoutSubscriptionsInput>
  }

  export type SubscriptionPlanUpdateWithoutSubscriptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    features?: SubscriptionPlanUpdatefeaturesInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionPlanUncheckedUpdateWithoutSubscriptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    features?: SubscriptionPlanUpdatefeaturesInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsersCreateWithoutMessagesInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    subscription?: SubscriptionCreateNestedOneWithoutUserInput
    documents?: DocumentCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationCreateNestedManyWithoutUserInput
  }

  export type UsersUncheckedCreateWithoutMessagesInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    subscription?: SubscriptionUncheckedCreateNestedOneWithoutUserInput
    documents?: DocumentUncheckedCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingUncheckedCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UsersCreateOrConnectWithoutMessagesInput = {
    where: UsersWhereUniqueInput
    create: XOR<UsersCreateWithoutMessagesInput, UsersUncheckedCreateWithoutMessagesInput>
  }

  export type UsersUpsertWithoutMessagesInput = {
    update: XOR<UsersUpdateWithoutMessagesInput, UsersUncheckedUpdateWithoutMessagesInput>
    create: XOR<UsersCreateWithoutMessagesInput, UsersUncheckedCreateWithoutMessagesInput>
    where?: UsersWhereInput
  }

  export type UsersUpdateToOneWithWhereWithoutMessagesInput = {
    where?: UsersWhereInput
    data: XOR<UsersUpdateWithoutMessagesInput, UsersUncheckedUpdateWithoutMessagesInput>
  }

  export type UsersUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUpdateOneWithoutUserNestedInput
    documents?: DocumentUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUpdateManyWithoutUserNestedInput
  }

  export type UsersUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUncheckedUpdateOneWithoutUserNestedInput
    documents?: DocumentUncheckedUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUncheckedUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UsersCreateWithoutChatConversationsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    subscription?: SubscriptionCreateNestedOneWithoutUserInput
    messages?: MessageCreateNestedManyWithoutUserInput
    documents?: DocumentCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingCreateNestedManyWithoutUserInput
  }

  export type UsersUncheckedCreateWithoutChatConversationsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    subscription?: SubscriptionUncheckedCreateNestedOneWithoutUserInput
    messages?: MessageUncheckedCreateNestedManyWithoutUserInput
    documents?: DocumentUncheckedCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingUncheckedCreateNestedManyWithoutUserInput
  }

  export type UsersCreateOrConnectWithoutChatConversationsInput = {
    where: UsersWhereUniqueInput
    create: XOR<UsersCreateWithoutChatConversationsInput, UsersUncheckedCreateWithoutChatConversationsInput>
  }

  export type ChatMessageCreateWithoutConversationInput = {
    id?: string
    content: string
    role: string
    createdAt?: Date | string
  }

  export type ChatMessageUncheckedCreateWithoutConversationInput = {
    id?: string
    content: string
    role: string
    createdAt?: Date | string
  }

  export type ChatMessageCreateOrConnectWithoutConversationInput = {
    where: ChatMessageWhereUniqueInput
    create: XOR<ChatMessageCreateWithoutConversationInput, ChatMessageUncheckedCreateWithoutConversationInput>
  }

  export type ChatMessageCreateManyConversationInputEnvelope = {
    data: ChatMessageCreateManyConversationInput | ChatMessageCreateManyConversationInput[]
    skipDuplicates?: boolean
  }

  export type UsersUpsertWithoutChatConversationsInput = {
    update: XOR<UsersUpdateWithoutChatConversationsInput, UsersUncheckedUpdateWithoutChatConversationsInput>
    create: XOR<UsersCreateWithoutChatConversationsInput, UsersUncheckedCreateWithoutChatConversationsInput>
    where?: UsersWhereInput
  }

  export type UsersUpdateToOneWithWhereWithoutChatConversationsInput = {
    where?: UsersWhereInput
    data: XOR<UsersUpdateWithoutChatConversationsInput, UsersUncheckedUpdateWithoutChatConversationsInput>
  }

  export type UsersUpdateWithoutChatConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUpdateOneWithoutUserNestedInput
    messages?: MessageUpdateManyWithoutUserNestedInput
    documents?: DocumentUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUpdateManyWithoutUserNestedInput
  }

  export type UsersUncheckedUpdateWithoutChatConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUncheckedUpdateOneWithoutUserNestedInput
    messages?: MessageUncheckedUpdateManyWithoutUserNestedInput
    documents?: DocumentUncheckedUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ChatMessageUpsertWithWhereUniqueWithoutConversationInput = {
    where: ChatMessageWhereUniqueInput
    update: XOR<ChatMessageUpdateWithoutConversationInput, ChatMessageUncheckedUpdateWithoutConversationInput>
    create: XOR<ChatMessageCreateWithoutConversationInput, ChatMessageUncheckedCreateWithoutConversationInput>
  }

  export type ChatMessageUpdateWithWhereUniqueWithoutConversationInput = {
    where: ChatMessageWhereUniqueInput
    data: XOR<ChatMessageUpdateWithoutConversationInput, ChatMessageUncheckedUpdateWithoutConversationInput>
  }

  export type ChatMessageUpdateManyWithWhereWithoutConversationInput = {
    where: ChatMessageScalarWhereInput
    data: XOR<ChatMessageUpdateManyMutationInput, ChatMessageUncheckedUpdateManyWithoutConversationInput>
  }

  export type ChatMessageScalarWhereInput = {
    AND?: ChatMessageScalarWhereInput | ChatMessageScalarWhereInput[]
    OR?: ChatMessageScalarWhereInput[]
    NOT?: ChatMessageScalarWhereInput | ChatMessageScalarWhereInput[]
    id?: StringFilter<"ChatMessage"> | string
    conversationId?: StringFilter<"ChatMessage"> | string
    content?: StringFilter<"ChatMessage"> | string
    role?: StringFilter<"ChatMessage"> | string
    createdAt?: DateTimeFilter<"ChatMessage"> | Date | string
  }

  export type ChatConversationCreateWithoutMessagesInput = {
    id?: string
    visitorId: string
    userAgent?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    ipAddress?: string | null
    referrer?: string | null
    firstSeen?: Date | string
    lastSeen?: Date | string
    totalMessages?: number
    avgResponseTime?: number | null
    user: UsersCreateNestedOneWithoutChatConversationsInput
  }

  export type ChatConversationUncheckedCreateWithoutMessagesInput = {
    id?: string
    visitorId: string
    userId: string
    userAgent?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    ipAddress?: string | null
    referrer?: string | null
    firstSeen?: Date | string
    lastSeen?: Date | string
    totalMessages?: number
    avgResponseTime?: number | null
  }

  export type ChatConversationCreateOrConnectWithoutMessagesInput = {
    where: ChatConversationWhereUniqueInput
    create: XOR<ChatConversationCreateWithoutMessagesInput, ChatConversationUncheckedCreateWithoutMessagesInput>
  }

  export type ChatConversationUpsertWithoutMessagesInput = {
    update: XOR<ChatConversationUpdateWithoutMessagesInput, ChatConversationUncheckedUpdateWithoutMessagesInput>
    create: XOR<ChatConversationCreateWithoutMessagesInput, ChatConversationUncheckedCreateWithoutMessagesInput>
    where?: ChatConversationWhereInput
  }

  export type ChatConversationUpdateToOneWithWhereWithoutMessagesInput = {
    where?: ChatConversationWhereInput
    data: XOR<ChatConversationUpdateWithoutMessagesInput, ChatConversationUncheckedUpdateWithoutMessagesInput>
  }

  export type ChatConversationUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    visitorId?: StringFieldUpdateOperationsInput | string
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    firstSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    totalMessages?: IntFieldUpdateOperationsInput | number
    avgResponseTime?: NullableFloatFieldUpdateOperationsInput | number | null
    user?: UsersUpdateOneRequiredWithoutChatConversationsNestedInput
  }

  export type ChatConversationUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    visitorId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    firstSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    totalMessages?: IntFieldUpdateOperationsInput | number
    avgResponseTime?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type UsersCreateWithoutDocumentsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    subscription?: SubscriptionCreateNestedOneWithoutUserInput
    messages?: MessageCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationCreateNestedManyWithoutUserInput
  }

  export type UsersUncheckedCreateWithoutDocumentsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    subscription?: SubscriptionUncheckedCreateNestedOneWithoutUserInput
    messages?: MessageUncheckedCreateNestedManyWithoutUserInput
    embeddings?: EmbeddingUncheckedCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UsersCreateOrConnectWithoutDocumentsInput = {
    where: UsersWhereUniqueInput
    create: XOR<UsersCreateWithoutDocumentsInput, UsersUncheckedCreateWithoutDocumentsInput>
  }

  export type DocumentChunkCreateWithoutDocumentInput = {
    id?: string
    content: string
    chunkIndex: number
    embedding?: EmbeddingCreateNestedOneWithoutChunkInput
  }

  export type DocumentChunkUncheckedCreateWithoutDocumentInput = {
    id?: string
    content: string
    chunkIndex: number
    embedding?: EmbeddingUncheckedCreateNestedOneWithoutChunkInput
  }

  export type DocumentChunkCreateOrConnectWithoutDocumentInput = {
    where: DocumentChunkWhereUniqueInput
    create: XOR<DocumentChunkCreateWithoutDocumentInput, DocumentChunkUncheckedCreateWithoutDocumentInput>
  }

  export type DocumentChunkCreateManyDocumentInputEnvelope = {
    data: DocumentChunkCreateManyDocumentInput | DocumentChunkCreateManyDocumentInput[]
    skipDuplicates?: boolean
  }

  export type UsersUpsertWithoutDocumentsInput = {
    update: XOR<UsersUpdateWithoutDocumentsInput, UsersUncheckedUpdateWithoutDocumentsInput>
    create: XOR<UsersCreateWithoutDocumentsInput, UsersUncheckedCreateWithoutDocumentsInput>
    where?: UsersWhereInput
  }

  export type UsersUpdateToOneWithWhereWithoutDocumentsInput = {
    where?: UsersWhereInput
    data: XOR<UsersUpdateWithoutDocumentsInput, UsersUncheckedUpdateWithoutDocumentsInput>
  }

  export type UsersUpdateWithoutDocumentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUpdateOneWithoutUserNestedInput
    messages?: MessageUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUpdateManyWithoutUserNestedInput
  }

  export type UsersUncheckedUpdateWithoutDocumentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUncheckedUpdateOneWithoutUserNestedInput
    messages?: MessageUncheckedUpdateManyWithoutUserNestedInput
    embeddings?: EmbeddingUncheckedUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type DocumentChunkUpsertWithWhereUniqueWithoutDocumentInput = {
    where: DocumentChunkWhereUniqueInput
    update: XOR<DocumentChunkUpdateWithoutDocumentInput, DocumentChunkUncheckedUpdateWithoutDocumentInput>
    create: XOR<DocumentChunkCreateWithoutDocumentInput, DocumentChunkUncheckedCreateWithoutDocumentInput>
  }

  export type DocumentChunkUpdateWithWhereUniqueWithoutDocumentInput = {
    where: DocumentChunkWhereUniqueInput
    data: XOR<DocumentChunkUpdateWithoutDocumentInput, DocumentChunkUncheckedUpdateWithoutDocumentInput>
  }

  export type DocumentChunkUpdateManyWithWhereWithoutDocumentInput = {
    where: DocumentChunkScalarWhereInput
    data: XOR<DocumentChunkUpdateManyMutationInput, DocumentChunkUncheckedUpdateManyWithoutDocumentInput>
  }

  export type DocumentChunkScalarWhereInput = {
    AND?: DocumentChunkScalarWhereInput | DocumentChunkScalarWhereInput[]
    OR?: DocumentChunkScalarWhereInput[]
    NOT?: DocumentChunkScalarWhereInput | DocumentChunkScalarWhereInput[]
    id?: StringFilter<"DocumentChunk"> | string
    documentId?: StringFilter<"DocumentChunk"> | string
    content?: StringFilter<"DocumentChunk"> | string
    chunkIndex?: IntFilter<"DocumentChunk"> | number
  }

  export type DocumentCreateWithoutChunksInput = {
    id?: string
    fileName: string
    originalName: string
    fileType: string
    fileSize: number
    category?: string | null
    description?: string | null
    content: string
    keywords?: string | null
    uploadedAt?: Date | string
    user: UsersCreateNestedOneWithoutDocumentsInput
  }

  export type DocumentUncheckedCreateWithoutChunksInput = {
    id?: string
    fileName: string
    originalName: string
    fileType: string
    fileSize: number
    category?: string | null
    description?: string | null
    content: string
    keywords?: string | null
    uploadedAt?: Date | string
    userId: string
  }

  export type DocumentCreateOrConnectWithoutChunksInput = {
    where: DocumentWhereUniqueInput
    create: XOR<DocumentCreateWithoutChunksInput, DocumentUncheckedCreateWithoutChunksInput>
  }

  export type EmbeddingCreateWithoutChunkInput = {
    id?: string
    vector?: EmbeddingCreatevectorInput | number[]
    createdAt?: Date | string
    user: UsersCreateNestedOneWithoutEmbeddingsInput
  }

  export type EmbeddingUncheckedCreateWithoutChunkInput = {
    id?: string
    userId: string
    vector?: EmbeddingCreatevectorInput | number[]
    createdAt?: Date | string
  }

  export type EmbeddingCreateOrConnectWithoutChunkInput = {
    where: EmbeddingWhereUniqueInput
    create: XOR<EmbeddingCreateWithoutChunkInput, EmbeddingUncheckedCreateWithoutChunkInput>
  }

  export type DocumentUpsertWithoutChunksInput = {
    update: XOR<DocumentUpdateWithoutChunksInput, DocumentUncheckedUpdateWithoutChunksInput>
    create: XOR<DocumentCreateWithoutChunksInput, DocumentUncheckedCreateWithoutChunksInput>
    where?: DocumentWhereInput
  }

  export type DocumentUpdateToOneWithWhereWithoutChunksInput = {
    where?: DocumentWhereInput
    data: XOR<DocumentUpdateWithoutChunksInput, DocumentUncheckedUpdateWithoutChunksInput>
  }

  export type DocumentUpdateWithoutChunksInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileType?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UsersUpdateOneRequiredWithoutDocumentsNestedInput
  }

  export type DocumentUncheckedUpdateWithoutChunksInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileType?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type EmbeddingUpsertWithoutChunkInput = {
    update: XOR<EmbeddingUpdateWithoutChunkInput, EmbeddingUncheckedUpdateWithoutChunkInput>
    create: XOR<EmbeddingCreateWithoutChunkInput, EmbeddingUncheckedCreateWithoutChunkInput>
    where?: EmbeddingWhereInput
  }

  export type EmbeddingUpdateToOneWithWhereWithoutChunkInput = {
    where?: EmbeddingWhereInput
    data: XOR<EmbeddingUpdateWithoutChunkInput, EmbeddingUncheckedUpdateWithoutChunkInput>
  }

  export type EmbeddingUpdateWithoutChunkInput = {
    id?: StringFieldUpdateOperationsInput | string
    vector?: EmbeddingUpdatevectorInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UsersUpdateOneRequiredWithoutEmbeddingsNestedInput
  }

  export type EmbeddingUncheckedUpdateWithoutChunkInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    vector?: EmbeddingUpdatevectorInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsersCreateWithoutEmbeddingsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    subscription?: SubscriptionCreateNestedOneWithoutUserInput
    messages?: MessageCreateNestedManyWithoutUserInput
    documents?: DocumentCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationCreateNestedManyWithoutUserInput
  }

  export type UsersUncheckedCreateWithoutEmbeddingsInput = {
    id?: string
    name: string
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password: string
    passwordResetToken?: string | null
    passwordResetTokenExp?: Date | string | null
    company: string
    plan: $Enums.PlanType
    subscription_type: $Enums.SubscriptionType
    subscription_start_date?: Date | string
    subscription_end_date: Date | string
    is_active?: boolean
    is_verified?: boolean
    login_attempts?: number
    locked_until?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    subscription?: SubscriptionUncheckedCreateNestedOneWithoutUserInput
    messages?: MessageUncheckedCreateNestedManyWithoutUserInput
    documents?: DocumentUncheckedCreateNestedManyWithoutUserInput
    chatConversations?: ChatConversationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UsersCreateOrConnectWithoutEmbeddingsInput = {
    where: UsersWhereUniqueInput
    create: XOR<UsersCreateWithoutEmbeddingsInput, UsersUncheckedCreateWithoutEmbeddingsInput>
  }

  export type DocumentChunkCreateWithoutEmbeddingInput = {
    id?: string
    content: string
    chunkIndex: number
    document: DocumentCreateNestedOneWithoutChunksInput
  }

  export type DocumentChunkUncheckedCreateWithoutEmbeddingInput = {
    id?: string
    documentId: string
    content: string
    chunkIndex: number
  }

  export type DocumentChunkCreateOrConnectWithoutEmbeddingInput = {
    where: DocumentChunkWhereUniqueInput
    create: XOR<DocumentChunkCreateWithoutEmbeddingInput, DocumentChunkUncheckedCreateWithoutEmbeddingInput>
  }

  export type UsersUpsertWithoutEmbeddingsInput = {
    update: XOR<UsersUpdateWithoutEmbeddingsInput, UsersUncheckedUpdateWithoutEmbeddingsInput>
    create: XOR<UsersCreateWithoutEmbeddingsInput, UsersUncheckedCreateWithoutEmbeddingsInput>
    where?: UsersWhereInput
  }

  export type UsersUpdateToOneWithWhereWithoutEmbeddingsInput = {
    where?: UsersWhereInput
    data: XOR<UsersUpdateWithoutEmbeddingsInput, UsersUncheckedUpdateWithoutEmbeddingsInput>
  }

  export type UsersUpdateWithoutEmbeddingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUpdateOneWithoutUserNestedInput
    messages?: MessageUpdateManyWithoutUserNestedInput
    documents?: DocumentUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUpdateManyWithoutUserNestedInput
  }

  export type UsersUncheckedUpdateWithoutEmbeddingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    passwordResetToken?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResetTokenExp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    company?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanTypeFieldUpdateOperationsInput | $Enums.PlanType
    subscription_type?: EnumSubscriptionTypeFieldUpdateOperationsInput | $Enums.SubscriptionType
    subscription_start_date?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription_end_date?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    is_verified?: BoolFieldUpdateOperationsInput | boolean
    login_attempts?: IntFieldUpdateOperationsInput | number
    locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    subscription?: SubscriptionUncheckedUpdateOneWithoutUserNestedInput
    messages?: MessageUncheckedUpdateManyWithoutUserNestedInput
    documents?: DocumentUncheckedUpdateManyWithoutUserNestedInput
    chatConversations?: ChatConversationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type DocumentChunkUpsertWithoutEmbeddingInput = {
    update: XOR<DocumentChunkUpdateWithoutEmbeddingInput, DocumentChunkUncheckedUpdateWithoutEmbeddingInput>
    create: XOR<DocumentChunkCreateWithoutEmbeddingInput, DocumentChunkUncheckedCreateWithoutEmbeddingInput>
    where?: DocumentChunkWhereInput
  }

  export type DocumentChunkUpdateToOneWithWhereWithoutEmbeddingInput = {
    where?: DocumentChunkWhereInput
    data: XOR<DocumentChunkUpdateWithoutEmbeddingInput, DocumentChunkUncheckedUpdateWithoutEmbeddingInput>
  }

  export type DocumentChunkUpdateWithoutEmbeddingInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    document?: DocumentUpdateOneRequiredWithoutChunksNestedInput
  }

  export type DocumentChunkUncheckedUpdateWithoutEmbeddingInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
  }

  export type AccountCreateManyUserInput = {
    id?: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
  }

  export type SessionCreateManyUserInput = {
    id?: string
    sessionToken: string
    expires: Date | string
  }

  export type MessageCreateManyUserInput = {
    id?: string
    content: string
    role: string
    createdAt?: Date | string
  }

  export type DocumentCreateManyUserInput = {
    id?: string
    fileName: string
    originalName: string
    fileType: string
    fileSize: number
    category?: string | null
    description?: string | null
    content: string
    keywords?: string | null
    uploadedAt?: Date | string
  }

  export type EmbeddingCreateManyUserInput = {
    id?: string
    chunkId: string
    vector?: EmbeddingCreatevectorInput | number[]
    createdAt?: Date | string
  }

  export type ChatConversationCreateManyUserInput = {
    id?: string
    visitorId: string
    userAgent?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    ipAddress?: string | null
    referrer?: string | null
    firstSeen?: Date | string
    lastSeen?: Date | string
    totalMessages?: number
    avgResponseTime?: number | null
  }

  export type AccountUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AccountUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AccountUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileType?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    chunks?: DocumentChunkUpdateManyWithoutDocumentNestedInput
  }

  export type DocumentUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileType?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    chunks?: DocumentChunkUncheckedUpdateManyWithoutDocumentNestedInput
  }

  export type DocumentUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileType?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmbeddingUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    vector?: EmbeddingUpdatevectorInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    chunk?: DocumentChunkUpdateOneRequiredWithoutEmbeddingNestedInput
  }

  export type EmbeddingUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    chunkId?: StringFieldUpdateOperationsInput | string
    vector?: EmbeddingUpdatevectorInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmbeddingUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    chunkId?: StringFieldUpdateOperationsInput | string
    vector?: EmbeddingUpdatevectorInput | number[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatConversationUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    visitorId?: StringFieldUpdateOperationsInput | string
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    firstSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    totalMessages?: IntFieldUpdateOperationsInput | number
    avgResponseTime?: NullableFloatFieldUpdateOperationsInput | number | null
    messages?: ChatMessageUpdateManyWithoutConversationNestedInput
  }

  export type ChatConversationUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    visitorId?: StringFieldUpdateOperationsInput | string
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    firstSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    totalMessages?: IntFieldUpdateOperationsInput | number
    avgResponseTime?: NullableFloatFieldUpdateOperationsInput | number | null
    messages?: ChatMessageUncheckedUpdateManyWithoutConversationNestedInput
  }

  export type ChatConversationUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    visitorId?: StringFieldUpdateOperationsInput | string
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    firstSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSeen?: DateTimeFieldUpdateOperationsInput | Date | string
    totalMessages?: IntFieldUpdateOperationsInput | number
    avgResponseTime?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type SubscriptionCreateManyPlanInput = {
    id?: string
    userId: string
    razorpaySubscriptionId: string
    razorpayCustomerId: string
    status: string
    currentPeriodStart: Date | string
    currentPeriodEnd: Date | string
    cancelledAt?: Date | string | null
    lastPaymentId?: string | null
    lastPaymentAmount?: number | null
    lastPaymentDate?: Date | string | null
    lastPaymentError?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubscriptionUpdateWithoutPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    razorpaySubscriptionId?: StringFieldUpdateOperationsInput | string
    razorpayCustomerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentId?: NullableStringFieldUpdateOperationsInput | string | null
    lastPaymentAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    lastPaymentDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UsersUpdateOneRequiredWithoutSubscriptionNestedInput
  }

  export type SubscriptionUncheckedUpdateWithoutPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    razorpaySubscriptionId?: StringFieldUpdateOperationsInput | string
    razorpayCustomerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentId?: NullableStringFieldUpdateOperationsInput | string | null
    lastPaymentAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    lastPaymentDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionUncheckedUpdateManyWithoutPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    razorpaySubscriptionId?: StringFieldUpdateOperationsInput | string
    razorpayCustomerId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentPeriodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    currentPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentId?: NullableStringFieldUpdateOperationsInput | string | null
    lastPaymentAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    lastPaymentDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastPaymentError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatMessageCreateManyConversationInput = {
    id?: string
    content: string
    role: string
    createdAt?: Date | string
  }

  export type ChatMessageUpdateWithoutConversationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatMessageUncheckedUpdateWithoutConversationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatMessageUncheckedUpdateManyWithoutConversationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentChunkCreateManyDocumentInput = {
    id?: string
    content: string
    chunkIndex: number
  }

  export type DocumentChunkUpdateWithoutDocumentInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    embedding?: EmbeddingUpdateOneWithoutChunkNestedInput
  }

  export type DocumentChunkUncheckedUpdateWithoutDocumentInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    embedding?: EmbeddingUncheckedUpdateOneWithoutChunkNestedInput
  }

  export type DocumentChunkUncheckedUpdateManyWithoutDocumentInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}