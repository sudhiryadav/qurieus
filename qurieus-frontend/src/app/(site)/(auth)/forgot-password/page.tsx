import React from "react";
import ForgotPassword from "@/components/Auth/ForgotPassword";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Qurieus - AI-Powered Document Conversations",
};

const ForgotPasswordPage = () => {
  return (
    <>
      <Breadcrumb pageName="Forgot Password" />
      <ForgotPassword />
    </>
  );
};

export default ForgotPasswordPage;
