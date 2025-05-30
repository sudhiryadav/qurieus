import { Metadata } from "next";
import ClientLayout from "./ClientLayout";
import "@/styles/index.css";
import "@/styles/prism-vsc-dark-plus.css";

export const metadata: Metadata = {
  title: 'Qurieus',
  description: 'Qurieus',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning={true} className="!scroll-smooth" lang="en">
      <body className="bg-white dark:bg-dark-1 dark:text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
} 