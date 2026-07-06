import DisplayClient from "./DisplayClient";

export default async function DisplayPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <DisplayClient roomId={roomId.toUpperCase()} />;
}
