"use client";

import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useAutoAnimate } from "@/components/auto-animate";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { ListItemsEmpty } from "./list-empty";
import { CustomPagination } from "./custom-pagination";

interface ShinyTableProps<T extends object> {
  service?: () => UseQueryResult<any> | any;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  cols: {
    header: string;
    accessorKey?: keyof T;
    cell?: (
      row: T,
      options: {
        index: number;
      }
    ) => React.ReactNode;
    headerClassName?: string;
    cellClassName?: string;
  }[];
  data?: T[];
  striped?: boolean;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  setCurrentPage?: React.Dispatch<React.SetStateAction<number>>;
  resolveData?: (data: any) => T[];
}

/**
 * A component that renders a table with built-in animation support.
 *
 * @param {ShinyTableProps<T>} props - The props for the ShinyTable component.
 * @return {React.ReactElement<HTMLTableElement>} The rendered ShinyTable component.
 */
export function ShinyTable<T extends object>({
  service,
  className,
  headerClassName,
  cellClassName,
  cols,
  data: _data,
  striped,
  isLoading: _isLoading,
  currentPage: _currentPage,
  totalPages: _totalPages,
  setCurrentPage,
  resolveData,
}: ShinyTableProps<T>) {
  const [ref] = useAutoAnimate();
  const [visibleSkeletonCount, setVisibleSkeletonCount] = useState(2);

  const queryData = service?.();
  const qData = queryData?.data as {
    data?: any[];
    page?: number;
    pages?: number;
  };
  const data = resolveData
    ? resolveData(qData)
    : // @ts-ignore
      qData?.data?.data ?? qData?.data ?? _data ?? [];

  const isLoading = queryData?.isPending || _isLoading;

  const currentPage = qData?.page;
  const totalPages = qData?.pages;

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      // show first row immediately
      setVisibleSkeletonCount((prev) => (prev === 2 ? 3 : prev));
      interval = setInterval(() => {
        setVisibleSkeletonCount((prev) => (prev < 6 ? prev + 1 : 2));
      }, 300);
    } else {
      setVisibleSkeletonCount(2);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <Table className={cn(className)}>
        <TableHeader>
          <TableRow>
            {cols.map((col, index) => (
              <TableHead
                key={index}
                className={cn(
                  col.headerClassName,
                  headerClassName,
                  "text-sm text-gray3 font-normal p-3 bg-muted"
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody ref={ref}>
          {isLoading && visibleSkeletonCount > 0 ? (
            Array.from({ length: visibleSkeletonCount }).map((_, index) => (
              <TableRow
                key={`skeleton-${index}`}
                className={cn(
                  "rounded-[10px] overflow-hidden hover:bg-transparent",
                  striped && index % 2 === 0 && "bg-light3"
                )}
              >
                {cols.map((_, indexCol) => (
                  <TableCell
                    key={`skeleton-cell-${index}-${indexCol}`}
                    className={cn(
                      cellClassName,
                      striped && index % 2 === 0 && "bg-light3",
                      indexCol === 0 && "rounded-l-[10px]",
                      indexCol === cols.length - 1 && "rounded-r-[10px]"
                    )}
                  >
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : !Array.isArray(data) || data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={cols.length}>
                <ListItemsEmpty />
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={index}
                className={cn(
                  "rounded-[10px] overflow-hidden hover:bg-transparent",
                  striped && index % 2 === 0 && "bg-light3"
                )}
              >
                {cols.map((col, indexCol) => {
                  const value =
                    col.cell?.(row, { index }) ||
                    (col?.accessorKey && col.accessorKey in row
                      ? row[col.accessorKey as keyof T]
                      : "-");
                  return (
                    <TableCell
                      key={`${indexCol}-${index}`}
                      className={cn(
                        col.cellClassName,
                        cellClassName,
                        striped && index % 2 === 0 && "bg-light3",
                        indexCol === 0 && "rounded-l-[10px]",
                        indexCol === cols.length - 1 && "rounded-r-[10px]"
                      )}
                    >
                      {value as any}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {currentPage !== undefined &&
        totalPages !== undefined &&
        typeof setCurrentPage === "function" && (
          <div className="mt-4 flex w-full justify-end">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
    </div>
  );
}
