"use client";

import { Dispatch, SetStateAction, useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export function CustomPagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: CustomPaginationProps) {
  // Helper function to generate visible pages
  const getVisiblePages = useMemo(() => {
    const maxPages = 7;
    const pages = [];

    if (totalPages <= maxPages) {
      // If total pages are less than or equal to maxPages, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxPages / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, currentPage + half);

      // Adjust if too close to the start or end
      if (currentPage - half <= 0) {
        end = Math.min(maxPages, totalPages);
      } else if (currentPage + half > totalPages) {
        start = Math.max(totalPages - maxPages + 1, 1);
      }

      // Generate pages with ellipsis
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationPrevious
          onClick={() => {
            setCurrentPage(currentPage - 1);
          }}
          className={`${
            currentPage === 1 ? "hidden cursor-pointer" : "cursor-pointer"
          }`}
        />
        {getVisiblePages.map((page, index) => (
          <PaginationItem key={index}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                className="cursor-pointer"
                isActive={page === currentPage}
                onClick={() => {
                  setCurrentPage(page as number);
                }}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationNext
          onClick={() => {
            setCurrentPage(currentPage + 1);
          }}
          className={
            `${
              currentPage === totalPages
                ? "hidden cursor-pointer"
                : "cursor-pointer"
            }` + ""
          }
        />
      </PaginationContent>
    </Pagination>
  );
}
