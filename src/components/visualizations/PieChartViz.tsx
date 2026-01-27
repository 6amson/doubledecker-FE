import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AggregatedData } from '@/utils/dataAggregation';
import { PreparedChartData } from '@/utils/visualizationPreparers';
import { getBrandColorPalette } from '@/utils/chartColors';

interface PieChartVizProps {
    data: AggregatedData[];
    metadata?: PreparedChartData['metadata'];
}

export const PieChartViz = ({ data, metadata }: PieChartVizProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
                <p>No data available for pie chart</p>
            </div>
        );
    }

    // Brand color palette
    const COLORS = getBrandColorPalette();

    const renderLabel = (entry: any) => {
        const percent = entry.percentage?.toFixed(1) || '0.0';
        return `${percent}%`;
    };

    // Custom legend formatter to show category name with value
    const renderLegend = (props: any) => {
        const { payload } = props;
        return (
            <div className="flex flex-wrap justify-center gap-4 mt-2">
                {payload.map((entry: any, index: number) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-foreground">
                            {entry.payload.label}: {entry.payload.value.toLocaleString()} ({entry.payload.percentage?.toFixed(1)}%)
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full h-[500px] pt-4" style={{ overflow: 'visible' }}>
            {metadata?.yAxisLabel && (
                <h3 className="text-center text-lg font-semibold text-foreground mb-2">
                    {metadata.yAxisLabel}
                </h3>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        labelLine={{
                            stroke: 'hsl(var(--foreground))',
                            strokeWidth: 1
                        }}
                        label={renderLabel}
                        outerRadius={140}
                        innerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number, name: string, props: any) => [
                            `${value.toLocaleString()} (${props.payload.percentage?.toFixed(1)}%)`,
                            'Value'
                        ]}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={60}
                        content={renderLegend}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
