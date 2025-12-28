'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag, ArrowRight } from 'lucide-react'
import { format, subDays, startOfMonth, type Interval } from 'date-fns'
import { getOrders } from '../../lib/db/orders'
import { getExpenses, type Expense } from '../../lib/db/expenses'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Types
interface FinancialMetrics {
    revenue: number
    cogs: number
    labor: number
    opex: number // Rent + Utilities + Marketing + Other
    grossProfit: number
    netProfit: number
    orderCount: number
    avgTicket: number
}

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<{ from: Date, to: Date }>({
        from: startOfMonth(new Date()),
        to: new Date()
    })
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState<FinancialMetrics>({
        revenue: 0, cogs: 0, labor: 0, opex: 0, grossProfit: 0, netProfit: 0, orderCount: 0, avgTicket: 0
    })
    const [topItems, setTopItems] = useState<{ name: string, count: number, sales: number }[]>([])
    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        fetchData()
    }, [dateRange])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [orders, expenses] = await Promise.all([
                getOrders(dateRange.from, dateRange.to),
                getExpenses(dateRange.from, dateRange.to)
            ])

            // Filter out cancelled orders
            // @ts-ignore
            const validOrders = orders.filter(o => o.status !== 'cancelled')

            // Calculate Revenue
            let totalRevenue = 0
            const itemMap: Record<string, { count: number, sales: number }> = {}
            const dailyRevenue: Record<string, number> = {}

            validOrders.forEach(o => {
                const amount = parseFloat((o.total || '0').replace(/[^0-9.]/g, ''))
                totalRevenue += amount

                // Chart Data
                const dayKey = format(o.createdAt, 'MMM dd')
                dailyRevenue[dayKey] = (dailyRevenue[dayKey] || 0) + amount

                o.items?.forEach(i => {
                    const iPrice = parseFloat((i.price || '0').replace(/[^0-9.]/g, ''))
                    if (!itemMap[i.name]) itemMap[i.name] = { count: 0, sales: 0 }
                    itemMap[i.name].count += (i.quantity || 1)
                    itemMap[i.name].sales += (iPrice * (i.quantity || 1))
                })
            })

            // Prepare Chart Data
            // We need to fill in dates in the range, but for now filtering existing days is a good start
            // To make it look professional, let's just map the existing data points nicely
            const chartDataArray = Object.entries(dailyRevenue).map(([date, revenue]) => ({
                date,
                revenue
            }))
            // Sort by date is tricky with 'MMM dd' format if spanning years, but within short range usually ok
            // A better way is to rely on the object key insertion order if iterating or just sort the source validOrders
            // Since validOrders is sorted by date desc, dailyRevenue keys creation order is desc
            // So reversing makes it asc
            chartDataArray.reverse()
            setChartData(chartDataArray)

            // Calculate Expenses
            let cogs = 0
            let labor = 0
            let opex = 0

            expenses.forEach(e => {
                if (e.category === 'COGS') cogs += e.amount
                else if (e.category === 'Labor') labor += e.amount
                else opex += e.amount
            })

            setMetrics({
                revenue: totalRevenue,
                cogs,
                labor,
                opex,
                grossProfit: totalRevenue - cogs,
                netProfit: totalRevenue - cogs - labor - opex,
                orderCount: validOrders.length,
                avgTicket: validOrders.length ? totalRevenue / validOrders.length : 0
            })

            // Top Items
            const sortedItems = Object.entries(itemMap)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5)
            setTopItems(sortedItems)

        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    const setPresetRange = (value: string) => {
        const today = new Date()

        switch (value) {
            case 'today':
                const startToday = new Date(today); startToday.setHours(0, 0, 0, 0);
                setDateRange({ from: startToday, to: today })
                break
            case 'week':
                setDateRange({ from: subDays(today, 7), to: today })
                break
            case 'month':
                setDateRange({ from: startOfMonth(today), to: today })
                break
            case '90days':
                setDateRange({ from: subDays(today, 90), to: today })
                break
        }
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Financial Overview</h1>
                    <p className="text-zinc-400">Profit & Loss Statement and KPIs</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select onValueChange={setPresetRange} defaultValue="month">
                        <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800 text-white">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="90days">Last 3 Months</SelectItem>
                        </SelectContent>
                    </Select>

                    <Link href="/admin/analytics/expenses">
                        <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                            Manage Expenses <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                    title="Total Revenue"
                    value={`${metrics.revenue.toLocaleString()} AED`}
                    icon={DollarSign}
                    trend={metrics.revenue > 0 ? "+0%" : "0%"} // To implement real trend needs prev period
                    color="text-white"
                />
                <KPICard
                    title="Net Profit"
                    value={`${metrics.netProfit.toLocaleString()} AED`}
                    icon={TrendingUp}
                    color={metrics.netProfit >= 0 ? "text-green-500" : "text-red-500"}
                />
                <KPICard
                    title="Total Orders"
                    value={metrics.orderCount.toString()}
                    icon={ShoppingBag}
                />
                <KPICard
                    title="Avg Ticket"
                    value={`${Math.round(metrics.avgTicket).toLocaleString()} AED`}
                    icon={Users}
                />
            </div>

            <Tabs defaultValue="pnl" className="w-full">
                <TabsList className="bg-zinc-900 border border-zinc-800">
                    <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
                    <TabsTrigger value="charts">Charts</TabsTrigger>
                    <TabsTrigger value="menu">Menu Matrix</TabsTrigger>
                </TabsList>

                <TabsContent value="pnl" className="mt-4 space-y-4">
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader>
                            <CardTitle>P&L Statement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <PnlRow label="Revenue" value={metrics.revenue} isHeader />
                            <PnlRow label="Cost of Goods Sold (COGS)" value={-metrics.cogs} color="text-red-400" indent />
                            <div className="border-t border-zinc-800 my-2" />
                            <PnlRow label="Gross Profit" value={metrics.grossProfit} isTotal />

                            <div className="h-4" />

                            <PnlRow label="Operating Expenses" value={0} isHeader />
                            <PnlRow label="Labor Cost" value={-metrics.labor} color="text-red-400" indent />
                            <PnlRow label="Rent & Utilities etc." value={-metrics.opex} color="text-red-400" indent />
                            <div className="border-t border-zinc-800 my-2" />
                            <PnlRow label="Net Profit (EBITDA)" value={metrics.netProfit} isTotal
                                color={metrics.netProfit >= 0 ? "text-green-500" : "text-red-500"} />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <KPICard title="Food Cost %" value={`${metrics.revenue ? Math.round((metrics.cogs / metrics.revenue) * 100) : 0}%`} sub="(Target: <30%)" />
                        <KPICard title="Labor Cost %" value={`${metrics.revenue ? Math.round((metrics.labor / metrics.revenue) * 100) : 0}%`} sub="(Target: <25%)" />
                        <KPICard title="Profit Margin" value={`${metrics.revenue ? Math.round((metrics.netProfit / metrics.revenue) * 100) : 0}%`} color={metrics.netProfit >= 0 ? "text-green-500" : "text-red-500"} />
                    </div>
                </TabsContent>

                <TabsContent value="charts" className="mt-4">
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
                        <CardContent className="h-[400px]">
                            <SimpleBarChart data={chartData} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="menu" className="mt-4">
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader><CardTitle>Top Performing Items</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topItems.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-zinc-500 font-mono">#{i + 1}</span>
                                            <span className="font-bold">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">{item.sales.toLocaleString()} AED</div>
                                            <div className="text-xs text-zinc-500">{item.count} orders</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function PnlRow({ label, value, color, isHeader, isTotal, indent }: any) {
    return (
        <div className={`flex justify-between items-center ${isHeader ? 'font-bold text-lg mb-2' : ''} ${isTotal ? 'font-bold text-xl py-2' : 'text-sm'} ${indent ? 'pl-6' : ''}`}>
            <span className={`${isHeader || isTotal ? 'text-white' : 'text-zinc-400'}`}>{label}</span>
            <span className={`${color || 'text-white'}`}>{value.toLocaleString()} AED</span>
        </div>
    )
}

function KPICard({ title, value, icon: Icon, trend, sub, color }: any) {
    return (
        <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-zinc-500" />}
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                {(trend || sub) && (
                    <p className="text-xs text-zinc-500 mt-1">
                        {trend && <span className={trend.includes('+') ? 'text-green-500' : 'text-red-500'}>{trend} </span>}
                        {sub}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

function SimpleBarChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="flex h-full items-center justify-center text-zinc-500">No data for this period</div>
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `AED ${value}`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: '#27272a' }}
                />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
