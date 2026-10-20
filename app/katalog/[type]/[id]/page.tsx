import { DetailKatalog } from "@/components/katalog/DetailKatalog";

export default async function Page({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  return <DetailKatalog params={params} />;
}
