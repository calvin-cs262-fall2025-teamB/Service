/**
 * Type definitions for the Adventure Game API
 */

// Basic types for the adventure game entities
export interface Adventurer {
    id: number;
    username: string;
    password: string;
    profilePicture?: string;
}

export interface AdventurerInput {
    username: string;
    password: string;
    profilePicture?: string;
}

export interface Region {
    id: number;
    adventurerID: number;
    name: string;
    description?: string;
    location: { x: number; y: number };
    radius: number;
}

export interface Adventure {
    id: number;
    adventurerID: number;
    regionID: number;
    name: string;
    numTokens?: number;
    location: { x: number; y: number };
}

export interface Token {
    id: number;
    adventureID: number;
    location: { x: number; y: number };
    hint?: string;
    tokenOrder: number;
}

export interface CompletedAdventure {
    id: number;
    adventurerID: number;
    adventureID: number;
    completionDate: Date;
    completionTime: string; // interval type from PostgreSQL
}

export interface AdventureInProgress {
    id: number;
    adventurerID: number;
    adventureID: number;
    dateStarted: Date;
    lastUpdated: Date;
    tokensCollected: number;
}

export interface CollectedToken {
    id: number;
    adventureInProgressID: number;
    tokenID: number;
    collectedAt: Date;
}

export interface Landmark {
    id: number;
    regionID: number;
    name: string;
    location: { x: number; y: number };
}

// Legacy types for compatibility (you can remove these if not needed)
export interface Player {
    id: number;
    name: string;
    email: string;
}

export interface PlayerInput {
    name: string;
    email: string;
}

export interface MonopolyGame {
    id: number;
    time: Date;
    playerId: number;
}