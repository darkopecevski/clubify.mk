import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ clubId: string }>;
};

export default async function PaymentsPage({ params }: Props) {
  const { clubId } = await params;
  // Redirect to fees page as the default payments view
  redirect(`/club/${clubId}/payments/fees`);
}
