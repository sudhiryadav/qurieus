"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const Breadcrumb = ({
  pageName,
  pageDescription,
  showBackButton = false,
}: {
  pageName: string;
  pageDescription?: string;
  showBackButton?: boolean;
}) => {
  const router = useRouter();

  return (
    <nav
      className="bg-white dark:bg-dark border-b border-gray-100 dark:border-dark-3 px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 items-start"
      aria-label="Breadcrumb"
    >
      <div className="flex items-center gap-2">
        {showBackButton && (
          <>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1 text-gray-500 dark:text-gray-300 hover:text-primary transition-colors text-sm font-medium"
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <span className="text-gray-400 dark:text-dark-6">|</span>
          </>
        )}
        <Link
          href="/"
          className="text-gray-500 dark:text-gray-300 hover:text-primary transition-colors text-sm font-medium"
        >
          Home
        </Link>
        <span className="text-gray-400 dark:text-dark-6">/</span>
        <span className="text-gray-700 dark:text-white text-sm font-semibold">
          {pageName}
        </span>
      </div>
      <div className="flex flex-col sm:items-end">
        <h1 className="text-lg font-bold text-dark dark:text-white leading-tight mb-0">
          {pageName}
        </h1>
        {pageDescription && (
          <p className="text-xs text-gray-500 dark:text-dark-6 mt-0.5 max-w-xs truncate">
            {pageDescription}
          </p>
        )}
      </div>
    </nav>
  );
};

export default Breadcrumb;
