/**
 * PAL Developer Platform & Agent SDK (PAL-TDD-006, Sprint 18)
 *
 * Developer SDK allowing third-party developers to package, test, and publish custom
 * agent skills to the PAL Marketplace under a 70/30 revenue-sharing model.
 */

export interface CustomAgentPackage {
    packageId: string;
    developerId: string;
    developerName: string;
    packageName: string;
    description: string;
    priceMonthlyUSD: number;
    revenueShareDeveloperPct: number; // 70%
    revenueSharePlatformPct: number;  // 30%
    status: "published" | "pending_review" | "draft";
    createdAt: number;
}

export class PalAgentSdk {
    private static instance: PalAgentSdk;
    private packages: Map<string, CustomAgentPackage> = new Map();

    public static getInstance(): PalAgentSdk {
        if (!PalAgentSdk.instance) {
            PalAgentSdk.instance = new PalAgentSdk();
        }
        return PalAgentSdk.instance;
    }

    public publishAgentPackage(params: {
        developerId: string;
        developerName: string;
        packageName: string;
        description: string;
        priceMonthlyUSD: number;
    }): CustomAgentPackage {
        const pkg: CustomAgentPackage = {
            packageId: `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            developerId: params.developerId,
            developerName: params.developerName,
            packageName: params.packageName,
            description: params.description,
            priceMonthlyUSD: params.priceMonthlyUSD,
            revenueShareDeveloperPct: 70,
            revenueSharePlatformPct: 30,
            status: "published",
            createdAt: Date.now()
        };

        this.packages.set(pkg.packageId, pkg);
        return pkg;
    }

    public getPackage(packageId: string): CustomAgentPackage | undefined {
        return this.packages.get(packageId);
    }
}
