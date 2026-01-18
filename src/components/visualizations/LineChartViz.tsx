import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { AggregatedData } from '@/utils/dataAggregation';
import { PreparedChartData } from '@/utils/visualizationPreparers';

interface LineChartVizProps {
    data: AggregatedData[];
    metadata?: PreparedChartData['metadata'];
}

export const LineChartViz = ({ data, metadata }: LineChartVizProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
                <p>No data available for line chart</p>
            </div>
        );
    }

    return (
        <div className="w-full h-96 pt-4" style={{ overflow: 'visible' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 40, right: 30, left: 80, bottom: 60 }}
                >
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="label"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        stroke="hsl(var(--border))"
                        label={{ value: metadata?.xAxisLabel || 'Time/Category', position: 'insideBottom', offset: -10, fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        stroke="hsl(var(--border))"
                        label={{ value: metadata?.yAxisLabel || 'Value', angle: -90, position: 'left', style: { textAnchor: 'middle' }, dy: -10, fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'Value']}
                        labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#colorValue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
