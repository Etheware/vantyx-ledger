import { redirect } from "next/navigation";

export default function CardCheckoutPage({
  params,
}: {
  params: { token: string };
}) {
  redirect(`/checkout/${encodeURIComponent(params.token)}/review`);
}
