'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

// DB
import { addExpense, getExpenses, deleteExpense, type Expense, type ExpenseCategory } from '@/app/lib/db/expenses'
import { useToast } from '@/app/admin/context/ToastContext'

const CATEGORIES: ExpenseCategory[] = ['COGS', 'Labor', 'Rent', 'Marketing', 'Utilities', 'Maintenance', 'Other']

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { showToast } = useToast()

    // Form State
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState<ExpenseCategory>('Other')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState<Date>(new Date())

    useEffect(() => {
        fetchExpenses()
    }, [])

    const fetchExpenses = async () => {
        setLoading(true)
        try {
            // Get last 90 days by default for the list
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 90)

            const data = await getExpenses(start, end)
            setExpenses(data)
        } catch (error) {
            console.error(error)
            showToast('Failed to load expenses', 'error')
        }
        setLoading(false)
    }

    const handleSubmit = async () => {
        if (!amount || !description) {
            showToast('Please fill all fields', 'error')
            return
        }

        setIsSubmitting(true)
        try {
            await addExpense({
                amount: parseFloat(amount),
                category,
                description,
                date
            })
            showToast('Expense added successfully', 'success')
            setIsAddOpen(false)
            resetForm()
            fetchExpenses()
        } catch (error) {
            console.error(error)
            showToast('Failed to add expense', 'error')
        }
        setIsSubmitting(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return
        try {
            await deleteExpense(id)
            showToast('Expense deleted', 'success')
            fetchExpenses()
        } catch (error) {
            console.error(error)
            showToast('Failed to delete expense', 'error')
        }
    }

    const resetForm = () => {
        setAmount('')
        setDescription('')
        setCategory('Other')
        setDate(new Date())
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/analytics" className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Expenses Manager</h2>
                        <p className="text-zinc-400">Track all operational costs.</p>
                    </div>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-white text-black hover:bg-zinc-200">
                            <Plus className="mr-2 h-4 w-4" /> Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Add New Expense</DialogTitle>
                            <DialogDescription>
                                Enter the details of the expense.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">
                                    Amount (AED)
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="col-span-3 bg-black border-zinc-700 text-white"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">
                                    Category
                                </Label>
                                <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                                    <SelectTrigger className="col-span-3 bg-black border-zinc-700 text-white">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">
                                    Date
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={`col-span-3 justify-start text-left font-normal bg-black border-zinc-700 text-white`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(d) => d && setDate(d)}
                                            initialFocus
                                            className="text-white bg-zinc-900"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Description
                                </Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="col-span-3 bg-black border-zinc-700 text-white"
                                    placeholder="e.g. Weekly vegetable supply"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white bg-transparent">Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-white text-black hover:bg-zinc-200">
                                {isSubmitting ? 'Saving...' : 'Save Expense'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                            <TableHead className="text-zinc-400">Date</TableHead>
                            <TableHead className="text-zinc-400">Description</TableHead>
                            <TableHead className="text-zinc-400">Category</TableHead>
                            <TableHead className="text-right text-zinc-400">Amount</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-zinc-500 py-8">Loading expenses...</TableCell>
                            </TableRow>
                        ) : expenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-zinc-500 py-8">No expenses found for the last 90 days.</TableCell>
                            </TableRow>
                        ) : (
                            expenses.map((expense) => (
                                <TableRow key={expense.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableCell className="font-medium text-white">{format(expense.date, 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-zinc-300">{expense.description}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${expense.category === 'COGS' ? 'bg-orange-500/10 text-orange-400' :
                                                expense.category === 'Labor' ? 'bg-blue-500/10 text-blue-400' :
                                                    expense.category === 'Marketing' ? 'bg-purple-500/10 text-purple-400' :
                                                        'bg-zinc-700/30 text-zinc-400'}`}>
                                            {expense.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-white">{expense.amount.toLocaleString()} AED</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)} className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8">
                                            <Trash2 size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
