/**
 * Structured JSON Prompts & Schemas for Gemini LLM Reasoning (PAL-TDD-006, PAL-ARCH-DOC-041)
 */

export const REASONING_PROMPTS = {
    GENERATE_OKRS: (intentTitle: string, priority: string, successMetrics: string[]) => `
System: You are an Executive Strategy AI (PAL Executive OS). Translate the following Executive Intent into structured Objectives and Key Results (OKRs).
Output MUST be strict valid JSON adhering to the following schema:
{
  "objective": "Clear high-level strategic goal",
  "keyResults": ["Quantifiable Key Result 1", "Quantifiable Key Result 2"],
  "initiatives": ["Actionable Initiative 1", "Actionable Initiative 2"],
  "alignmentScore": 90
}

Executive Intent:
- Title: "${intentTitle}"
- Priority: "${priority}"
- Success Metrics: ${JSON.stringify(successMetrics)}
`,

    EVALUATE_VOTE: (proposalTitle: string, objective: string, memberName: string, department: string) => `
System: You are ${memberName}, Executive Leader for ${department} at an enterprise business. Evaluate the proposal below and cast your executive vote.
Output MUST be strict valid JSON adhering to the following schema:
{
  "memberId": "mem_${department.toLowerCase()}",
  "memberName": "${memberName}",
  "department": "${department}",
  "vote": "approve",
  "confidence": 0.95,
  "voteWeight": 1.0,
  "rationale": "Detailed strategic justification for vote",
  "timestamp": ${Date.now()}
}

Proposal:
- Title: "${proposalTitle}"
- Objective: "${objective}"
`,

    GENERATE_CRITIQUE: (proposalTitle: string, costUSD: number, risk: number) => `
System: You are an Executive Council Member conducting adversarial critique of a proposal.
Output MUST be strict valid JSON adhering to the following schema:
[
  {
    "memberId": "mem_cfo",
    "targetDepartment": "engineering",
    "critiquePoints": ["Point 1", "Point 2"],
    "suggestedAdjustments": ["Adjustment 1"],
    "timestamp": ${Date.now()}
  }
]

Proposal:
- Title: "${proposalTitle}"
- Estimated Cost (USD): $${costUSD}
- Estimated Risk Score: ${risk}/100
`,

    ALIGNMENT_SCORE: (taskTitle: string, intentTitle: string, strategyVersion: string) => `
System: Evaluate how strongly the given Task aligns with the Executive Strategy.
Output MUST be strict valid JSON adhering to the following schema:
{
  "score": 85,
  "alignmentBreakdown": {
    "intentOverlap": 90,
    "kpiContribution": 85,
    "riskPenalty": 5
  },
  "rationale": "Strategy Alignment Score 85/100 computed based on alignment with Executive Strategy ${strategyVersion}."
}

Task: "${taskTitle}"
Executive Intent: "${intentTitle}"
Strategy Version: "${strategyVersion}"
`
};
