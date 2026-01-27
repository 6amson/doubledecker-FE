import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { PreparedChartData } from '@/utils/visualizationPreparers';

interface ScatterPlotVizProps {
    data: Array<{ x: number; y: number; label: string }>;
    metadata?: PreparedChartData['metadata'];
}

export const ScatterPlotViz = ({ data, metadata }: ScatterPlotVizProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
                <p>No data available for scatter plot</p>
            </div>
        );
    }

    return (
        <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        type="number"
                        dataKey="x"
                        name="X"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        stroke="hsl(var(--border))"
                        label={{
                            value: metadata?.xAxisLabel || 'X Axis',
                            position: 'insideBottom',
                            offset: -10,
                            fill: 'hsl(var(--foreground))'
                        }}
                    />
                    <YAxis
                        type="number"
                        dataKey="y"
                        name="Y"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        stroke="hsl(var(--border))"
                        label={{
                            value: metadata?.yAxisLabel || 'Y Axis',
                            angle: -90,
                            position: 'insideLeft',
                            fill: 'hsl(var(--foreground))'
                        }}
                    />
                    <ZAxis range={[60, 60]} />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number) => value.toLocaleString()}
                        labelFormatter={(label) => `Point: ${label}`}
                    />
                    <Scatter
                        name="Data Points"
                        data={data}
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};
