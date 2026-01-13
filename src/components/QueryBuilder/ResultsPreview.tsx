import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye } from "lucide-react";

interface ResultsPreviewProps {
  headers: string[];
  rows: string[][];
  selectedColumns: string[];
}

export const ResultsPreview = ({ headers, rows, selectedColumns }: ResultsPreviewProps) => {
  const displayColumns = selectedColumns.length > 0 
    ? selectedColumns 
    : headers;

  const columnIndices = displayColumns.map(col => headers.indexOf(col)).filter(i => i !== -1);

  return (
    <div className="query-panel">
      <div className="flex items-center gap-2 mb-4">
        <Eye size={18} className="text-primary" />
        <h3 className="font-display font-semibold text-foreground">Results Preview</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {rows.length} rows
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
            {rows.slice(0, 10).map((row, rowIndex) => (
              <TableRow key={rowIndex} className="border-border hover:bg-muted/30">
                {columnIndices.map((colIndex, cellIndex) => (
                  <TableCell key={cellIndex} className="text-sm text-foreground/90 whitespace-nowrap">
                    {row[colIndex] || <span className="text-muted-foreground italic">empty</span>}
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
