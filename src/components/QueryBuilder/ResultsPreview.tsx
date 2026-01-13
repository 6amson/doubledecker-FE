import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Loader2 } from "lucide-react";

interface ResultsPreviewProps {
  headers: string[];
  rows: string[][];
  selectedColumns: string[];
  isLoading?: boolean;
}

export const ResultsPreview = ({ headers, rows, selectedColumns, isLoading }: ResultsPreviewProps) => {
  const displayColumns = selectedColumns.length > 0 ? selectedColumns : headers;
  const columnIndices = displayColumns.map(col => headers.indexOf(col)).filter(i => i !== -1);

  if (isLoading) {
    return (
      <div className="query-panel">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 size={18} className="text-primary animate-spin" />
          <h3 className="font-display font-semibold text-foreground">Running Query...</h3>
        </div>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <Loader2 size={32} className="animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="query-panel">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle size={18} className="text-green-500" />
        <h3 className="font-display font-semibold text-foreground">Query Results</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {rows.length} rows returned
        </span>
      </div>

      <ScrollArea className="h-[300px] rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              {displayColumns.map((header, i) => (
                <TableHead key={i} className="table-header whitespace-nowrap">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 50).map((row, rowIndex) => (
              <TableRow key={rowIndex} className="border-border hover:bg-muted/30">
                {columnIndices.map((colIndex, cellIndex) => (
                  <TableCell key={cellIndex} className="text-sm text-foreground/90 whitespace-nowrap">
                    {row[colIndex] || <span className="text-muted-foreground italic">null</span>}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
