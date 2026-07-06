import HostClient from "./HostClient";

export default async function HostPage({ params, searchParams }: { params: Promise<{ roomId: string }>; searchParams: Promise<{ token?: string }> }) {
  const { roomId } = await params;
  const { token } = await searchParams;
  return <HostClient roomId={roomId.toUpperCase()} initialToken={token ?? ""} />;
}
