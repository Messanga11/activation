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
import type { UseQueryResult } from "@tanstack/react-query";
import { ListItemsEmpty } from "./list-empty";
import { CustomPagination } from "./custom-pagination";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface ShinyTableProps<T extends object> {
  service?: () => UseQueryResult<any> | any;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  cols: {
    header: string;
    accessorKey?: keyof T;
    hidden?: (row: T) => boolean;
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
  setCurrentPage?: (page: number) => void;
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

  return (
    <ScrollArea className="border border-gray-300 w-full rounded-[15px]">
      <Table className={className}>
        <TableHeader>
          <TableRow>
            {cols.map((col) => (
              <TableHead
                key={col.header}
                className={cn(
                  col.headerClassName,
                  headerClassName,
                  "text-sm text-gray3 font-normal py-3 px-5 bg-muted"
                )}
              >
                <pre>{col.header}</pre>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody ref={ref}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <TableRow
                key={`skeleton-loading-row-${_}-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: cannot find another key
                  index
                }`}
                className={cn(
                  "rounded-[10px] overflow-hidden hover:bg-transparent",
                  striped && index % 2 === 0 && "bg-light3"
                )}
              >
                {cols.map((_, indexCol) => (
                  <TableCell
                    key={`skeleton-loading-cell-${index}-${_.header}-${indexCol}`}
                    className={cn(
                      "py-3 px-5",
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
              <TableCell colSpan={cols.length} className="py-3 px-5">
                <ListItemsEmpty />
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={row.id}
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
                      key={`${indexCol}-${col.header}`}
                      className={cn(
                        "py-3 px-5",
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
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
