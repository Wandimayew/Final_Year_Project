"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Breadcrumb = () => {
  const pathname = usePathname();
  
  // Convert pathname into breadcrumb items
  const pathSegments = pathname.split("/").filter((segment) => segment);

  return (
    <div className="flex items-center gap-2 text-gray-600 mb-4">
      {/* Home Link */}
      <Link href="/" className="hover:text-blue-500">Home</Link>
      
      {pathSegments.map((segment, index) => {
        // Construct path for each segment
        const href = "/" + pathSegments.slice(0, index + 1).join("/");
        const isLast = index === pathSegments.length - 1;

        return (
          <div key={href} className="flex items-center gap-2">
            <span>-</span>
            {!isLast ? (
              <Link href={href} className="hover:text-blue-500 capitalize">
                {decodeURIComponent(segment)}
              </Link>
            ) : (
              <span className="text-gray-800 font-semibold capitalize">
                {decodeURIComponent(segment)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
