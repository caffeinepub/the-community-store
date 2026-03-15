import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Book {
    id: bigint;
    title: string;
    rentalPrice: bigint;
    description: string;
    author: string;
    available: boolean;
}
export type Time = bigint;
export interface RentalRequest {
    id: bigint;
    status: RentalRequestStatus;
    borrowerEmail: string;
    submittedAt: Time;
    bookId: bigint;
    borrowerName: string;
}
export interface UserProfile {
    name: string;
}
export enum RentalRequestStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBook(title: string, author: string, description: string, rentalPrice: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getBooks(): Promise<Array<Book>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRentalRequests(): Promise<Array<RentalRequest>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRentalRequest(borrowerName: string, borrowerEmail: string, bookId: bigint): Promise<bigint>;
    updateBookAvailability(bookId: bigint, available: boolean): Promise<void>;
    updateRequestStatus(requestId: bigint, newStatus: RentalRequestStatus): Promise<void>;
}
