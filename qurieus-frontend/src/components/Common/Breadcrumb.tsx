import Link from "next/link";

const Breadcrumb = ({
  pageName,
  pageDescription,
}: {
  pageName: string;
  pageDescription?: string;
}) => {
  return (
    <nav
      className="bg-white dark:bg-dark border-b border-gray-100 dark:border-dark-3 px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 items-start"
      aria-label="Breadcrumb"
    >
      <div className="flex items-center gap-2">
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
