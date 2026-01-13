import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSpreadsheet } from "lucide-react";

interface CSVPreviewPanelProps {
  headers: string[];
  rows: string[][];
  fileName: string;
}

export const CSVPreviewPanel = ({ headers, rows, fileName }: CSVPreviewPanelProps) => {
  return (
    <div className="query-panel">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet size={18} className="text-primary" />
        <h3 className="font-display font-semibold text-foreground">CSV Preview</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {fileName} • {rows.length} rows × {headers.length} cols
        </span>
      </div>

      <ScrollArea className="h-[200px] rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              {headers.map((header, i) => (
                <TableHead key={i} className="table-header whitespace-nowrap">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 5).map((row, rowIndex) => (
              <TableRow key={rowIndex} className="border-border hover:bg-muted/30">
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-sm text-foreground/90 whitespace-nowrap">
                    {cell || <span className="text-muted-foreground italic">empty</span>}
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
