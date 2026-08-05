/**
 * PAL User Repository
 * 
 * Governing Bible Chapters:
 * - Chapter 4: Core Domain Model & Business Entities
 * - Chapter 23: Identity, Authentication & Authorization Architecture
 */

import { BaseRepository } from "../baseRepository.ts";

export interface UserEntity {
    id: string;
    email: string;
    name: string;
    role: string;
    organization_id?: string;
    created_at?: string;
    updated_at?: string;
}

export class UserRepository extends BaseRepository<UserEntity> {
    constructor() {
        super("users");
    }

    public async findByEmail(email: string): Promise<UserEntity | null> {
        try {
            const database = await this.db();
            const sql = `SELECT * FROM ${this.tableName} WHERE email = ?`;
            const row = await database.get(sql, [email]);
            return row ? (row as UserEntity) : null;
        } catch (err: any) {
            this.logger.error("Failed to findByEmail", { email }, err);
            return null;
        }
    }

    public async findByOrganization(orgId: string): Promise<UserEntity[]> {
        return this.findAll("organization_id = ?", [orgId]);
    }
}

export const userRepository = new UserRepository();
