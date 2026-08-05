/**
 * Immutable Append-Only Decision Ledger (PAL-TDD-005, PAL-TDD-005A, PAL-ARCH-DOC-036, PAL-ARCH-DOC-041)
 */

import crypto from "crypto";
import type { DecisionLedgerEntry } from "./feedbackTypes.ts";
import { DecisionLedgerRepository } from "../db/repositories/governanceRepositories.ts";

export class DecisionLedger {
    private ledger: DecisionLedgerEntry[] = [];
    private repo?: DecisionLedgerRepository;

    constructor(repo?: DecisionLedgerRepository) {
        this.repo = repo !== undefined ? repo : new DecisionLedgerRepository();
    }

    private computeHash(entry: Partial<DecisionLedgerEntry>): string {
        const payload = JSON.stringify({
            decisionId: entry.decisionId,
            proposalId: entry.proposalId,
            strategyVersion: entry.strategyVersion,
            policyVersion: entry.policyVersion,
            constraintVersion: entry.constraintVersion,
            predictedOutcome: entry.predictedOutcome,
            observedOutcome: entry.observedOutcome,
            entryType: entry.entryType || "prediction",
            recordedAt: entry.recordedAt
        });
        return crypto.createHash("sha256").update(payload).digest("hex");
    }

    appendEntry(entry: Omit<DecisionLedgerEntry, "recordedAt">): DecisionLedgerEntry {
        const recordedAt = Date.now();
        const baseEntry: Partial<DecisionLedgerEntry> = {
            ...entry,
            entryType: entry.entryType || "prediction",
            recordedAt
        };
        const contentHash = this.computeHash(baseEntry);

        const frozenEntry: DecisionLedgerEntry = Object.freeze({
            ...baseEntry,
            contentHash
        } as DecisionLedgerEntry);

        this.ledger.push(frozenEntry);

        if (this.repo) {
            this.repo.insertEntity({
                id: `dl_${recordedAt}_${Math.random().toString(36).substring(2, 6)}`,
                workspace_id: "default_workspace",
                decision_id: frozenEntry.decisionId,
                entry_type: frozenEntry.entryType || "prediction",
                proposal_id: frozenEntry.proposalId,
                strategy_version: frozenEntry.strategyVersion,
                policy_version: frozenEntry.policyVersion,
                constraint_version: frozenEntry.constraintVersion,
                memory_snapshot_version: frozenEntry.memorySnapshotVersion,
                simulation_id: frozenEntry.simulationId,
                council_votes: JSON.stringify(frozenEntry.councilVotes || []),
                predicted_outcome: JSON.stringify(frozenEntry.predictedOutcome || {}),
                observed_outcome: frozenEntry.observedOutcome ? JSON.stringify(frozenEntry.observedOutcome) : null,
                outcome_delta: frozenEntry.outcomeDelta ? JSON.stringify(frozenEntry.outcomeDelta) : null,
                content_hash: contentHash,
                recorded_at: recordedAt
            }).catch(err => console.error("Failed to persist decision ledger entry", err));
        }

        return frozenEntry;
    }

    recordObservedOutcome(decisionId: string, observedOutcome: Record<string, number>): DecisionLedgerEntry | undefined {
        const history = this.ledger.filter((e) => e.decisionId === decisionId);
        if (history.length === 0) return undefined;

        const original = history[0];

        // Calculate prediction error % (outcomeDelta)
        const outcomeDelta: Record<string, number> = {};
        for (const [key, predictedVal] of Object.entries(original.predictedOutcome)) {
            const actualVal = observedOutcome[key] ?? predictedVal;
            const diff = actualVal - predictedVal;
            const errorPct = predictedVal !== 0 ? Number(((diff / predictedVal) * 100).toFixed(2)) : 0;
            outcomeDelta[key] = errorPct;
        }

        const recordedAt = Date.now();
        const baseEntry: Partial<DecisionLedgerEntry> = {
            ...original,
            entryType: "observation",
            observedOutcome,
            outcomeDelta,
            recordedAt
        };
        const contentHash = this.computeHash(baseEntry);

        const newEntry: DecisionLedgerEntry = Object.freeze({
            ...baseEntry,
            contentHash
        } as DecisionLedgerEntry);

        // True append-only (never mutates existing prediction at index 0)
        this.ledger.push(newEntry);

        if (this.repo) {
            this.repo.insertEntity({
                id: `dl_${recordedAt}_${Math.random().toString(36).substring(2, 6)}`,
                workspace_id: "default_workspace",
                decision_id: decisionId,
                entry_type: "observation",
                proposal_id: original.proposalId,
                strategy_version: original.strategyVersion,
                policy_version: original.policyVersion,
                constraint_version: original.constraintVersion,
                memory_snapshot_version: original.memorySnapshotVersion,
                simulation_id: original.simulationId,
                council_votes: JSON.stringify(original.councilVotes || []),
                predicted_outcome: JSON.stringify(original.predictedOutcome || {}),
                observed_outcome: JSON.stringify(observedOutcome),
                outcome_delta: JSON.stringify(outcomeDelta),
                content_hash: contentHash,
                recorded_at: recordedAt
            }).catch(err => console.error("Failed to persist decision ledger observation", err));
        }

        return newEntry;
    }

    verifyEntryIntegrity(entry: DecisionLedgerEntry): boolean {
        if (!entry.contentHash) return false;
        return this.computeHash(entry) === entry.contentHash;
    }

    getEntry(decisionId: string): DecisionLedgerEntry | undefined {
        const matches = this.ledger.filter((e) => e.decisionId === decisionId);
        if (matches.length === 0) return undefined;
        // Return latest entry (observation if present, else prediction)
        return matches[matches.length - 1];
    }

    getEntriesByProposal(proposalId: string): DecisionLedgerEntry[] {
        return this.ledger.filter((e) => e.proposalId === proposalId);
    }

    getEntriesByStrategy(strategyVersion: string): DecisionLedgerEntry[] {
        return this.ledger.filter((e) => e.strategyVersion === strategyVersion);
    }

    getLedgerHistory(): readonly DecisionLedgerEntry[] {
        return Object.freeze([...this.ledger]);
    }
}
