import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FileSpreadsheet, Database, Columns3, HardDrive } from "lucide-react";

interface CSVPreviewPanelProps {
  headers: string[];
  rows: string[][];
  fileName?: string;
  fileSize?: number;
}

const PREVIEW_ROWS = 5;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const CSVPreviewPanel = ({ headers, rows, fileName = "uploaded_data.csv", fileSize }: CSVPreviewPanelProps) => {
  const displayRows = rows.slice(0, PREVIEW_ROWS);
  const totalRows = rows.length;
  const totalColumns = headers.length;
  
  return (
    <div className="query-panel">
      {/* Table Preview - No header text, just the table */}
      <div className="overflow-x-auto rounded-lg border border-border">
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
      </div>

      {/* Metadata Section */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={14} />
          <span className="text-foreground/80">{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Database size={14} />
          <span>{totalRows.toLocaleString()} rows</span>
        </div>
        <div className="flex items-center gap-2">
          <Columns3 size={14} />
          <span>{totalColumns} columns</span>
        </div>
        {fileSize && (
          <div className="flex items-center gap-2">
            <HardDrive size={14} />
            <span>{formatFileSize(fileSize)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
