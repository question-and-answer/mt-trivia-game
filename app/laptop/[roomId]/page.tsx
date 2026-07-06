import LaptopClient from "./LaptopClient";

export default async function LaptopPage({ params, searchParams }: { params: Promise<{ roomId: string }>; searchParams: Promise<{ token?: string }> }) {
  const { roomId } = await params;
  const { token } = await searchParams;
  return <LaptopClient roomId={roomId.toUpperCase()} initialToken={token ?? ""} />;
}
