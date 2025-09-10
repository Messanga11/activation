"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export interface TableDataParams {
  page?: number;
  limit?: number;
  search?: string;
  // biome-ignore lint/suspicious/noExplicitAny: any is required
  filters?: Record<string, any>;
  refetchInterval?: number;
}

export interface TableDataResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useTableData<T>(
  fetchFunction: (
    params: TableDataParams & { organizationId?: string }
  ) => Promise<{
    success: boolean;
    data?: TableDataResponse<T>;
    error?: string;
  }>,
  title: string,
  initialParams: TableDataParams = {}
) {
  const { organizationId } = useParams();
  const [params, setParams] = useState<TableDataParams>({
    page: 1,
    limit: 100,
    search: "",
    ...initialParams,
  });

  const {
    data: queryData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "tableData",
      title,
      Object.entries(params)
        .map(([key, value]) => [key, value])
        .filter(([key, value]) => key !== "refetchInterval" && !!value)
        .join("-"),
    ],
    queryFn: async () => {
      const result = await fetchFunction({
        ...Object.fromEntries(
          Object.entries(params).filter(
            ([key, value]) => key !== "refetchInterval" && !!value
          )
        ),
        organizationId: organizationId as string,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch data");
      }

      return result.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: initialParams.refetchInterval,
    refetchIntervalInBackground: false,
    gcTime: 5 * 60 * 1000,
  });

  const updateParams = (newParams: Partial<TableDataParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return {
    data: queryData?.data || [],
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    params,
    pagination: queryData?.pagination || {
      page: 1,
      limit: 100,
      total: 0,
      pages: 0,
    },
    updateParams,
    refresh: refetch,
  };
}
