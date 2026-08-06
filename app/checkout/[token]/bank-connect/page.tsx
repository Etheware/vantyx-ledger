import { redirect } from "next/navigation";

export default function BankConnectPage({
  params,
}: {
  params: { token: string };
}) {
  redirect(`/checkout/${encodeURIComponent(params.token)}/review`);
}
