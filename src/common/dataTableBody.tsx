"use client";

import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import Pagination from "./pagination";
import EmptyState from "./emptyState";

interface EmptyAction {
  label: string;
  onClick: () => void;
  className: string;
}

interface DataTableProps<T extends object> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
  showCheckbox?: boolean;
  emptyIcon?: any;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActions?: EmptyAction[]; // 👈 reusable empty actions
  onRowClick?: (row: T) => void; // 👈 row click handler
}

const DataTableBody = <T extends object>({
  columns,
  data,
  isLoading,
  totalPages = 1,
  currentPage,
  showPagination = false,
  onPageChange,
  showCheckbox = false,
  emptyIcon: EmptyIcon = FiUsers,
  emptyTitle = "No data found",
  emptyDescription = "There are currently no records to show.",
  emptyActions = [], // 👈 default no actions
  onRowClick, // 👈 row click handler
}: DataTableProps<T>) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedRows, setSelectedRows] = React.useState<
    Record<string, boolean>
  >({});
  const [selectAll, setSelectAll] = React.useState(false);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleRowSelect = (rowId: string) => {
    setSelectedRows((prev) => {
      const newSelection = { ...prev, [rowId]: !prev[rowId] };
      const allSelected =
        Object.keys(newSelection).length > 0 &&
        Object.values(newSelection).every(Boolean);
      setSelectAll(allSelected);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const newSelections: Record<string, boolean> = {};
    if (newSelectAll) {
      table.getRowModel().rows.forEach((row) => {
        newSelections[row.id] = true;
      });
    }
    setSelectedRows(newSelections);
  };

  const hasData = table.getRowModel().rows.length > 0;

  return (
    <div className="w-full mx-auto">
      {isLoading ? (
        // Loading skeleton
        <div className="bg-white border border-neutral-200 rounded-b-xl dark:bg-neutral-800 dark:border-neutral-700">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-600">
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-neutral-200 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : hasData ? (
        // Show table
        <div className="flex flex-col">
          <div className="-m-2 overflow-x-auto relative">
            <div className="p-2 min-w-full inline-block align-middle">
              <div className="bg-white border border-neutral-200 rounded-b-xl dark:bg-neutral-800 dark:border-neutral-700">
                <table className="min-w-full divide-y bg-white divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-600">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {showCheckbox && (
                          <th className="px-6 py-3 text-start">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="h-4 w-4 text-black border-neutral-200 rounded cursor-pointer"
                            />
                          </th>
                        )}
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            className="px-6 py-3 text-start"
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                className={
                                  header.column.getCanSort()
                                    ? "cursor-pointer select-none flex items-center gap-x-2"
                                    : "flex items-center gap-x-2"
                                }
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                <span className="text-sm font-normal text-neutral-500 dark:text-neutral-300">
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                </span>
                                <span>
                                  {{
                                    asc: (
                                      <FaSortUp className="w-4 h-4 text-neutral-400" />
                                    ),
                                    desc: (
                                      <FaSortDown className="w-4 h-4 text-neutral-400" />
                                    ),
                                  }[header.column.getIsSorted() as string] ?? (
                                    <FaSort className="w-4 h-4 text-neutral-400" />
                                  )}
                                </span>
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={(e) => {
                          // Don't trigger row click if clicking on action buttons or checkboxes
                          const target = e.target as HTMLElement;
                          if (
                            target.closest("button") ||
                            target.closest("a") ||
                            target.closest('input[type="checkbox"]') ||
                            target.closest("[data-actions-menu]")
                          ) {
                            return;
                          }
                          onRowClick?.(row.original);
                        }}
                        className={
                          onRowClick
                            ? "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                            : ""
                        }
                      >
                        {showCheckbox && (
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={!!selectedRows[row.id]}
                              onChange={() => handleRowSelect(row.id)}
                              className="h-4 w-4 text-[#129D93] border-neutral-200 rounded cursor-pointer"
                            />
                          </td>
                        )}
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-normal text-wrap max-w-xs"
                          >
                            <span className="block text-sm font-normal text-neutral-800 dark:text-neutral-100">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {showPagination && (
            <Pagination
              page={currentPage || 1}
              totalPages={totalPages}
              onChange={onPageChange!}
            />
          )}
        </div>
      ) : (
        // 👇 Reusable EmptyState
        <EmptyState
          icon={EmptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          actions={emptyActions}
        />
      )}
    </div>
  );
};

export default DataTableBody;
