/**
 * PAL Business Brain Repository
 * 
 * Governing Bible Chapters:
 * - Chapter 4: Core Domain Model & Business Entities
 * - Chapter 6: Business Brain
 */

import { BaseRepository } from "../baseRepository.ts";

export interface BusinessBrainEntity {
    id: string;
    category: string;
    key: string;
    value: string;
    source?: string;
    updated_at?: string;
}

export class BusinessBrainRepository extends BaseRepository<BusinessBrainEntity> {
    constructor() {
        super("business_brain");
    }

    public async findByCategory(category: string): Promise<BusinessBrainEntity[]> {
        return this.findAll("category = ?", [category]);
    }

    public async findByKey(category: string, key: string): Promise<BusinessBrainEntity | null> {
        try {
            const database = await this.db();
            const sql = `SELECT * FROM ${this.tableName} WHERE category = ? AND key = ?`;
            const row = await database.get(sql, [category, key]);
            return row ? (row as BusinessBrainEntity) : null;
        } catch (err: any) {
            this.logger.error("Failed to findByKey", { category, key }, err);
            return null;
        }
    }

    public async upsertBrainItem(item: Omit<BusinessBrainEntity, 'updated_at'>): Promise<void> {
        try {
            const database = await this.db();
            const now = new Date().toISOString();
            const sql = `
                INSERT OR REPLACE INTO ${this.tableName} (id, category, key, value, source, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await database.run(sql, [
                item.id,
                item.category,
                item.key,
                typeof item.value === 'object' ? JSON.stringify(item.value) : item.value,
                item.source || 'user',
                now
            ]);
        } catch (err: any) {
            this.logger.error("Failed to upsertBrainItem", { item }, err);
            throw err;
        }
    }
}

export const businessBrainRepository = new BusinessBrainRepository();
