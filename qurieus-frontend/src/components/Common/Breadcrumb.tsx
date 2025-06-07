import Link from "next/link";

const Breadcrumb = ({
  pageName,
  pageDescription,
}: {
  pageName: string;
  pageDescription?: string;
}) => {
  return (
    <>
      <div className="dark:bg-dark relative z-10 overflow-hidden pb-[30px] pt-[60px] md:pt-[70px] lg:pt-[80px]">
        <div className="from-stroke/0 via-stroke to-stroke/0 dark:via-dark-3 absolute bottom-0 left-0 h-px w-full bg-gradient-to-r"></div>
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4">
              <div className="text-center">
                <h1 className="text-dark mb-2 text-2xl font-bold dark:text-white sm:text-3xl md:text-[32px] md:leading-[1.2]">
                  {pageName}
                </h1>
                {pageDescription && (
                  <p className="text-body-color dark:text-dark-6 mb-3 text-sm">
                    {pageDescription}
                  </p>
                )}

                <ul className="flex items-center justify-center gap-[8px]">
                  <li>
                    <Link
                      href="/"
                      className="text-dark flex items-center gap-[8px] text-sm font-medium dark:text-white"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <p className="text-body-color flex items-center gap-[8px] text-sm font-medium">
                      <span className="text-body-color dark:text-dark-6">
                        {" "}
                        /{" "}
                      </span>
                      {pageName}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Breadcrumb;
