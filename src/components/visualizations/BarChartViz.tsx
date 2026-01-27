import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AggregatedData } from '@/utils/dataAggregation';
import { PreparedChartData } from '@/utils/visualizationPreparers';
import { getBrandGradient } from '@/utils/chartColors';

interface BarChartVizProps {
    data: AggregatedData[];
    metadata?: PreparedChartData['metadata'];
}

export const BarChartViz = ({ data, metadata }: BarChartVizProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
                <p>No data available for bar chart</p>
            </div>
        );
    }

    // Generate brand color gradient
    const colors = getBrandGradient(data.length, true); // true = dark to light


    return (
        <div className="w-full h-96 pt-4" style={{ overflow: 'visible' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 40, right: 30, left: 80, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="label"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        stroke="hsl(var(--border))"
                        label={{ value: metadata?.xAxisLabel || 'Category', position: 'insideBottom', offset: -10, fill: 'hsl(var(--foreground))' }}
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
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
