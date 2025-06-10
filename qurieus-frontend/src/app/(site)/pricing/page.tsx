import Breadcrumb from "@/components/Common/Breadcrumb";
import Faq from "@/components/Faq";
import Pricing from "@/components/Pricing";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/utils/prismaDB";
import { createCustomer, createSubscription } from "@/utils/razorpay";
import { Prisma } from "@prisma/client";
import { Metadata } from "next";
import { getServerSession } from "next-auth";

export const metadata: Metadata = {
  title: "Pricing | Qurieus - AI-Powered Document Conversations",
  description:
    "Choose the perfect Qurieus plan for your organization's document conversation needs.",
};

export type SubscriptionPlanWithPaddle = Prisma.SubscriptionPlanGetPayload<{
  include: { paddleConfig: true };
}>;

export default async function PricingPage() {
  return (
    <>
      <Breadcrumb pageName="Pricing" />
      <Pricing />
      <Faq />
    </>
  );
}
