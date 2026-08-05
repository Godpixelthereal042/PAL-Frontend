/**
 * Case Study Generator Test Suite (PAL-TDD-011, Sprint 24 Milestone 5)
 *
 * Verifies:
 *   1. Generates 5-section customer case studies (Before, Problems, Actions, Outcomes, Net ROI).
 *   2. Formats sales proof collateral with headline, total value USD ($95.4k), and 31.8x ROI multiple.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CaseStudyGenerator } from "../lib/marketing/caseStudyGenerator.ts";

describe("Sprint 24 Milestone 5 — Customer Case Study Generator", () => {
    const caseStudyGen = CaseStudyGenerator.getInstance();

    it("1. Generates 5-section case study with before state, problems, actions, outcomes, and ROI", () => {
        const story = caseStudyGen.generateCaseStudy({
            workspaceId: "ws_acme_saas_prod",
            companyName: "Acme Cloud SaaS",
            industry: "B2B SaaS"
        });

        assert.ok(story.caseStudyId.startsWith("cs_story_"));
        assert.ok(story.headline.includes("How Acme Cloud SaaS Automated $95,400"));
        assert.equal(story.problemsIdentified.length, 3);
        assert.equal(story.actionsExecuted.length, 3);
        assert.equal(story.outcomesAchieved.length, 3);
        assert.equal(story.netRoiMultiple, 31.8);
    });

    it("2. Formats full Markdown story suitable for sales proof and investor collateral", () => {
        const story = caseStudyGen.generateCaseStudy({
            workspaceId: "ws_acme_saas_prod",
            companyName: "Acme Cloud SaaS"
        });

        assert.ok(story.fullCaseStudyMarkdown.includes("## 1. Before PAL State"));
        assert.ok(story.fullCaseStudyMarkdown.includes("## 2. Problems Identified"));
        assert.ok(story.fullCaseStudyMarkdown.includes("## 3. Autonomous Actions Executed by PAL"));
        assert.ok(story.fullCaseStudyMarkdown.includes("## 4. Outcomes Achieved"));
        assert.ok(story.fullCaseStudyMarkdown.includes("## 5. Net ROI & Value Summary"));
        assert.ok(story.fullCaseStudyMarkdown.includes("31.8x return on investment"));
    });
});
