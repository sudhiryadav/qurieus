import ResetPassword from "@/components/Auth/ResetPassword";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Queriuz - AI-Powered Document Conversations",
  description: "Reset your Queriuz account password to continue managing your AI-powered document conversations.",
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <>
      <Breadcrumb pageName="Reset Password" />
      <ResetPassword token={token} />
    </>
  );
}
