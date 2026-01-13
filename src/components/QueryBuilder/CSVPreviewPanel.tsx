import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FileSpreadsheet } from "lucide-react";

interface CSVPreviewPanelProps {
  headers: string[];
  rows: string[][];
  fileName?: string;
}

const PREVIEW_ROWS = 15;

export const CSVPreviewPanel = ({ headers, rows }: CSVPreviewPanelProps) => {
  const displayRows = rows.slice(0, PREVIEW_ROWS);
  
  return (
    <div className="query-panel">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet size={18} className="text-muted-foreground" />
        <h3 className="font-display font-semibold text-foreground">CSV Preview</h3>
      </div>

      <ScrollArea className="h-[320px] rounded-lg border border-border">
        <div className="min-w-max">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                {headers.map((header, i) => (
                  <TableHead key={i} className="table-header whitespace-nowrap px-4">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="border-border hover:bg-muted/30">
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="text-sm text-foreground/90 whitespace-nowrap px-4">
                      {cell || <span className="text-muted-foreground italic">empty</span>}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
