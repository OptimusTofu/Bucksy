import { Collection, Db, Document, InsertOneResult, DeleteResult, UpdateResult } from 'mongodb';

/**
 * Interface for user document in the database
 */
export interface User extends Document {
    /** User ID (Discord user ID) */
    id: string;

    /** User's points balance */
    points: number;

    /** When the user was registered */
    registeredAt?: Date;

    /** Last time the user used a command */
    lastActive?: Date;

    /** User's role (admin, user, etc.) */
    role?: string;

    /** User's username for admin login */
    username?: string;

    /** User's password hash for admin login */
    passwordHash?: string;
}

/**
 * Interface for shiny Pokémon document in the database
 */
export interface Shiny extends Document {
    /** Pokémon name/title */
    title: string;

    /** When the shiny was added */
    addedAt?: Date;

    /** Who added the shiny */
    addedBy?: string;
}

/**
 * Interface for question document in the database
 */
export interface Question extends Document {
    /** Question text */
    text: string;

    /** When the question was added */
    addedAt?: Date;

    /** Whether the question has been used */
    used?: boolean;

    /** When the question was last used */
    usedAt?: Date;

    /** Priority of the question (lower number = higher priority) */
    priority?: number;
}

/**
 * Interface for database collections
 */
export interface DatabaseCollections {
    /** Users collection */
    users: Collection<User>;

    /** Shinies collection */
    shinies: Collection<Shiny>;

    /** Questions collection */
    questions: Collection<Question>;
}

/**
 * Interface for database operations result
 */
export interface DatabaseResult<T> {
    /** Whether the operation was successful */
    success: boolean;

    /** Data returned from the operation */
    data?: T;

    /** Error message if the operation failed */
    error?: string;
}

/**
 * Interface for user operation result
 */
export interface UserResult extends DatabaseResult<User> { }

/**
 * Interface for shiny operation result
 */
export interface ShinyResult extends DatabaseResult<Shiny> { }

/**
 * Interface for question operation result
 */
export interface QuestionResult extends DatabaseResult<Question> { }

/**
 * Interface for insert operation result
 */
export interface InsertResult extends DatabaseResult<InsertOneResult> { }

/**
 * Interface for update operation result
 */
export interface UpdateOperationResult extends DatabaseResult<UpdateResult> { }

/**
 * Interface for delete operation result
 */
export interface DeleteOperationResult extends DatabaseResult<DeleteResult> { } 