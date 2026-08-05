/**
 * Customer Deployment Framework (PAL-TDD-009, Sprint 22 Milestone 5)
 *
 * Provides customer onboarding wizards, step-by-step deployment checklists,
 * customer adoption scoring (0-100), support escalation logging, and admin tools.
 *
 * Architecture: PAL-ARCH-DOC-056
 */

export interface DeploymentStep {
    stepNumber: 1 | 2 | 3 | 4 | 5;
    stepName: string;
    description: string;
    isCompleted: boolean;
    completedAt?: number;
}

export interface CustomerDeploymentStatus {
    deploymentId: string;
    workspaceId: string;
    companyName: string;
    currentStepNumber: 1 | 2 | 3 | 4 | 5;
    steps: DeploymentStep[];
    isGoLiveCompleted: boolean;
    palAdoptionScorePct: number;    // 0 - 100
    supportEscalationCount: number;
    goLiveDate?: string;
    createdAt: number;
}

export class CustomerDeploymentFramework {
    private static instance: CustomerDeploymentFramework;
    private deployments: Map<string, CustomerDeploymentStatus> = new Map(); // workspaceId -> deployment

    public static getInstance(): CustomerDeploymentFramework {
        if (!CustomerDeploymentFramework.instance) {
            CustomerDeploymentFramework.instance = new CustomerDeploymentFramework();
        }
        return CustomerDeploymentFramework.instance;
    }

    public initializeCustomerDeployment(workspaceId: string, companyName: string): CustomerDeploymentStatus {
        const timestamp = Date.now();
        const deploymentId = `dep_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;

        const steps: DeploymentStep[] = [
            { stepNumber: 1, stepName: "Company Information Profile", description: "Set up company name, industry, revenue, and team size", isCompleted: true, completedAt: timestamp },
            { stepNumber: 2, stepName: "SSO & Identity Provider Setup", description: "Configure SAML / OIDC single sign-on", isCompleted: false },
            { stepNumber: 3, stepName: "Enterprise Connector Activation", description: "Connect Stripe, HubSpot, Slack, and cloud providers", isCompleted: false },
            { stepNumber: 4, stepName: "Initial Business Intelligence Scan", description: "Run Day Zero scan for risks, opportunities, and baseline score", isCompleted: false },
            { stepNumber: 5, stepName: "Executive Go Live Certification", description: "Certify production readiness and launch executive mobile cockpit", isCompleted: false }
        ];

        const status: CustomerDeploymentStatus = {
            deploymentId,
            workspaceId,
            companyName,
            currentStepNumber: 2,
            steps,
            isGoLiveCompleted: false,
            palAdoptionScorePct: 20, // 20% per completed step
            supportEscalationCount: 0,
            createdAt: timestamp
        };

        this.deployments.set(workspaceId, status);
        return status;
    }

    public advanceDeploymentStep(workspaceId: string, stepCompleted: 1 | 2 | 3 | 4 | 5): CustomerDeploymentStatus {
        const deployment = this.deployments.get(workspaceId);
        if (!deployment) throw new Error(`Deployment for workspace '${workspaceId}' not found.`);

        const timestamp = Date.now();
        const step = deployment.steps.find(s => s.stepNumber === stepCompleted);
        if (step) {
            step.isCompleted = true;
            step.completedAt = timestamp;
        }

        const completedCount = deployment.steps.filter(s => s.isCompleted).length;
        deployment.palAdoptionScorePct = Math.round((completedCount / 5) * 100);

        if (stepCompleted < 5) {
            deployment.currentStepNumber = (stepCompleted + 1) as any;
        } else {
            deployment.isGoLiveCompleted = true;
            deployment.goLiveDate = new Date(timestamp).toISOString();
        }

        this.deployments.set(workspaceId, deployment);
        return deployment;
    }

    public getDeploymentStatus(workspaceId: string): CustomerDeploymentStatus | undefined {
        return this.deployments.get(workspaceId);
    }
}
