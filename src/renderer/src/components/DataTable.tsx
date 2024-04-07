'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/Table'
import { Button } from './Button'
import { memo, useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from './Popover'
import { Input } from './Input'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

const PAGE_SIZE = 100

export const DataTable = <TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: PAGE_SIZE
  })

  const moreThanOnePage = data.length > PAGE_SIZE

  const table = useReactTable({
    data,
    columns,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination, //update the pagination state when internal APIs mutate the pagination state
    state: {
      //...
      pagination
    }
  })

  const [showPageSettings, setShowPageSettings] = useState(false)

  return (
    <>
      <Table wrapperClassName="grow">
        <TableHeader className="sticky top-0 bg-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="h-8">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {moreThanOnePage && (
        <div className="flex items-center justify-center h-8 shrink-0 border-t">
          <Button
            onClick={() => table.previousPage()}
            size="sm"
            variant="ghost"
            disabled={!table.getCanPreviousPage()}
            className="w-5 h-5 p-0"
          >
            <span className="i-tabler-chevron-left"></span>
          </Button>

          <Popover open={showPageSettings} onOpenChange={setShowPageSettings}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="w-5 h-5 p-0">
                {pagination.pageIndex + 1}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  const data = new FormData(e.currentTarget)
                  table.setPageIndex(Number(data.get('page')) - 1)
                  setShowPageSettings(false)
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="w-20 text-right shrink-0">Page</span>
                  <Input
                    type="number"
                    classNames={{ wrapper: 'grow' }}
                    className="w-full"
                    autoFocus
                    name="page"
                    min={1}
                    max={table.getPageCount()}
                    defaultValue={pagination.pageIndex + 1}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-20 shrink-0"></span>
                  <div>
                    <Button variant="primary" type="submit">
                      Confirm
                    </Button>
                  </div>
                </div>
              </form>
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="w-5 h-5 p-0"
          >
            <span className="i-tabler-chevron-right"></span>
          </Button>
        </div>
      )}
    </>
  )
}
