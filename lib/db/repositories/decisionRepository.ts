/**
 * PAL Decision Repository
 * 
 * Governing Bible Chapters:
 * - Chapter 4: Core Domain Model & Business Entities
 * - Chapter 5: Executive Memory Architecture
 */

import { BaseRepository } from "../baseRepository.ts";

export interface DecisionEntity {
    id: string;
    title: string;
    description?: string;
    category?: string;
    status: 'pending_confirmation' | 'active' | 'archived' | 'superseded';
    impact?: 'low' | 'medium' | 'high' | 'critical';
    confidence_score?: number;
    evidence_json?: string;
    project_id?: string;
    superseded_by?: string;
    created_at?: string;
    updated_at?: string;
}

export class DecisionRepository extends BaseRepository<DecisionEntity> {
    constructor() {
        super("decisions");
    }

    public async findActiveDecisions(): Promise<DecisionEntity[]> {
        return this.findAll("status = ?", ['active']);
    }

    public async findByProject(projectId: string): Promise<DecisionEntity[]> {
        return this.findAll("project_id = ?", [projectId]);
    }

    public async updateStatus(id: string, status: DecisionEntity['status'], supersededBy?: string): Promise<void> {
        try {
            const database = await this.db();
            const now = new Date().toISOString();
            const sql = supersededBy
                ? `UPDATE ${this.tableName} SET status = ?, superseded_by = ?, updated_at = ? WHERE id = ?`
                : `UPDATE ${this.tableName} SET status = ?, updated_at = ? WHERE id = ?`;
            
            const params = supersededBy ? [status, supersededBy, now, id] : [status, now, id];
            await database.run(sql, params);
        } catch (err: any) {
            this.logger.error("Failed to updateStatus on decision", { id, status }, err);
            throw err;
        }
    }
}

export const decisionRepository = new DecisionRepository();
