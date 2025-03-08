/**
 * Type for a function that returns a promise
 */
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

/**
 * Type for a function that returns a value or a promise
 */
export type MaybeAsync<T = any> = T | Promise<T>;

/**
 * Type for a nullable value
 */
export type Nullable<T> = T | null | undefined;

/**
 * Type for a record with string keys and any values
 */
export type StringRecord<T = any> = Record<string, T>;

/**
 * Type for a function that takes a value and returns a boolean
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * Type for a function that takes a value and returns a transformed value
 */
export type Transformer<T, R = T> = (value: T) => R;

/**
 * Type for a logger function
 */
export type LoggerFunction = (message: string, ...args: any[]) => void;

/**
 * Interface for a logger
 */
export interface Logger {
    debug: LoggerFunction;
    info: LoggerFunction;
    warn: LoggerFunction;
    error: LoggerFunction;
}

/**
 * Interface for a cache
 */
export interface Cache<K = string, V = any> {
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
}

/**
 * Interface for a rate limiter
 */
export interface RateLimiter {
    /**
     * Check if a key is rate limited
     */
    isLimited(key: string): boolean;

    /**
     * Record a hit for a key
     */
    hit(key: string): void;

    /**
     * Reset the rate limit for a key
     */
    reset(key: string): void;
} 