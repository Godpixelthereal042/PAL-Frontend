import ConnectScreen from "@/components/ConnectScreen";

interface PageProps {
    params: Promise<{ source: string }>;
}

export default async function Page({ params }: PageProps) {
    const resolvedParams = await params;
    return <ConnectScreen source={resolvedParams.source} />;
}
