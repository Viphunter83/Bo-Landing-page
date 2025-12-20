'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Filter } from 'lucide-react'

interface Column<T> {
    header: string
    accessorKey?: keyof T
    cell?: (item: T) => React.ReactNode
    className?: string
    sortable?: boolean
}

interface AdminDataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    searchKeys?: (keyof T)[]
    searchPlaceholder?: string
    actions?: (item: T) => React.ReactNode
    filters?: {
        key: keyof T
        label: string
        options: { value: string; label: string }[]
    }[]
    isLoading?: boolean
}

export default function AdminDataTable<T extends { id: string | number }>({
    columns,
    data,
    searchKeys = [],
    searchPlaceholder = "Search...",
    actions,
    filters,
    isLoading
}: AdminDataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
    const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null)

    const itemsPerPage = 10

    // Filter & Search Logic
    const filteredData = useMemo(() => {
        return data.filter(item => {
            // Search
            const matchesSearch = searchKeys.length === 0 || searchKeys.some(key => {
                const val = item[key]
                return String(val).toLowerCase().includes(searchTerm.toLowerCase())
            })

            // Filters
            const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
                if (!value) return true
                return String(item[key as keyof T]) === value
            })

            return matchesSearch && matchesFilters
        })
    }, [data, searchTerm, searchKeys, activeFilters])

    // Sorting Logic
    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key]
            const bVal = b[sortConfig.key]

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }, [filteredData, sortConfig])

    // Pagination Logic
    const totalPages = Math.ceil(sortedData.length / itemsPerPage)
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleSort = (key: keyof T) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return current.direction === 'asc'
                    ? { key, direction: 'desc' }
                    : null
            }
            return { key, direction: 'asc' }
        })
    }

    if (isLoading) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-4">
                <div className="h-8 bg-zinc-800 rounded w-1/3 animate-pulse" />
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 bg-zinc-800/50 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 w-full sm:w-64 text-sm text-white focus:border-red-600 outline-none transition-colors"
                    />
                </div>

                <div className="flex gap-2">
                    {filters?.map(filter => (
                        <select
                            key={String(filter.key)}
                            value={activeFilters[String(filter.key)] || ''}
                            onChange={e => setActiveFilters(prev => ({
                                ...prev,
                                [String(filter.key)]: e.target.value
                            }))}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-red-600 outline-none"
                        >
                            <option value="">All {filter.label}</option>
                            {filter.options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-950/50 text-zinc-200 uppercase font-bold text-xs">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className={`p-4 whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:bg-zinc-800/50 transition-colors' : ''} ${col.className || ''}`}
                                        onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col.header}
                                            {col.sortable && (
                                                <ArrowUpDown size={12} className={sortConfig?.key === col.accessorKey ? 'text-red-500' : 'text-zinc-600'} />
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {actions && <th className="p-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                                    {columns.map((col, idx) => (
                                        <td key={idx} className={`p-4 ${col.className || ''}`}>
                                            {col.cell
                                                ? col.cell(item)
                                                : col.accessorKey
                                                    ? String(item[col.accessorKey])
                                                    : null
                                            }
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="p-4 text-right">
                                            {actions(item)}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length + (actions ? 1 : 0)} className="p-12 text-center text-zinc-600">
                                        No results found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-zinc-800 p-4 flex items-center justify-between">
                        <div className="text-xs text-zinc-500">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-4 py-2 text-sm text-zinc-300 font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
