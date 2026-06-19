import ProjectDetailsScreen from "@/components/ProjectDetailsScreen";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const resolvedParams = await params;
    return <ProjectDetailsScreen id={resolvedParams.id} />;
}
