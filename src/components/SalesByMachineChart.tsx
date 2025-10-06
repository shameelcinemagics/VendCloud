import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from 'recharts'

type Period = 'daily' | 'weekly' | 'monthly'

interface VendingMachine {
  id: string
  machine_id: string
  location: string
}

interface Product {
  id: string
  price: string
}

interface SaleRow {
  id: string
  vending_machine_id: string
  quantity: number
  sold_at: string
  vending_machines: VendingMachine | null
  products: Product | null
}

interface ChartRow {
  machine: string
  revenue: number
}

function getPeriodRange(period: Period) {
  const now = new Date()
  if (period === 'daily') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return { from: start.toISOString(), to: new Date().toISOString() }
  }
  if (period === 'weekly') {
    const start = new Date(now)
    const day = start.getDay() || 7 // Monday as start (ISO)
    const diffToMonday = day === 1 ? 0 : day - 1
    start.setDate(start.getDate() - diffToMonday)
    start.setHours(0, 0, 0, 0)
    return { from: start.toISOString(), to: new Date().toISOString() }
  }
  // monthly -> last 30 days to avoid empty current month
  const start = new Date(now)
  start.setDate(start.getDate() - 30)
  start.setHours(0, 0, 0, 0)
  return { from: start.toISOString(), to: new Date().toISOString() }
}

const currency = (value: number) => `KWD ${value.toFixed(2)}`

export default function SalesByMachineChart() {
  const [period, setPeriod] = useState<Period>('monthly')
  const [rows, setRows] = useState<ChartRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { from, to } = getPeriodRange(period)
        const { data, error } = await supabase
          .from('sales')
          .select(`
            id,
            vending_machine_id,
            quantity,
            sold_at,
            vending_machines ( id, machine_id, location ),
            products ( id, price )
          `)
          .gte('sold_at', from)
          .lte('sold_at', to)
        if (error) throw error

        let rowsData = data as unknown as SaleRow[] | null

        // Fallback: if empty, try fetching all-time data to ensure chart shows something
        if (!rowsData || rowsData.length === 0) {
          const { data: allData, error: allErr } = await supabase
            .from('sales')
            .select(`
              id,
              vending_machine_id,
              quantity,
              sold_at,
              vending_machines ( id, machine_id, location ),
              products ( id, price )
            `)
          if (!allErr) {
            rowsData = allData as unknown as SaleRow[] | null
          }
        }

        const aggregated = new Map<string, number>()

        rowsData?.forEach((row) => {
          const unitPrice = Number(row.products?.price || 0)
          const revenue = unitPrice * Number(row.quantity || 0)
          const label = row.vending_machines
            ? `${row.vending_machines.machine_id} - ${row.vending_machines.location}`
            : row.vending_machine_id
          aggregated.set(label, (aggregated.get(label) || 0) + revenue)
        })

        const chartRows: ChartRow[] = Array.from(aggregated.entries())
          .map(([machine, revenue]) => ({ machine, revenue }))
          .sort((a, b) => b.revenue - a.revenue)

        setRows(chartRows)
      } catch (err) {
        console.error('Failed to load sales by machine', err)
        setRows([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  const config = useMemo(
    () => ({
      revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
    }),
    []
  )

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant={period === 'daily' ? 'default' : 'outline'} onClick={() => setPeriod('daily')}>Daily</Button>
          <Button variant={period === 'weekly' ? 'default' : 'outline'} onClick={() => setPeriod('weekly')}>Weekly</Button>
          <Button variant={period === 'monthly' ? 'default' : 'outline'} onClick={() => setPeriod('monthly')}>Monthly</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No sales in this period.</div>
        ) : (
          <ChartContainer config={config} className="w-full">
            <ReBarChart data={rows} margin={{ left: 8, right: 16 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="machine" interval={0} angle={-45} textAnchor="end" height={80} tickLine={false} />
              <YAxis tickFormatter={(v) => `KWD ${v}`} width={70} />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent labelKey="revenue" formatter={(value) => [currency(Number(value)), 'Revenue']} />}
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4}>
                <LabelList dataKey="revenue" position="top" formatter={(v: number) => (v ? v.toFixed(2) : '')} />
              </Bar>
            </ReBarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}


