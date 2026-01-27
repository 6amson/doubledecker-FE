import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, ArrowRight, X, Loader2 } from "lucide-react";

interface CSVPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  file: File | null;
  isLoading?: boolean;
}

export const CSVPreviewModal = ({ isOpen, onClose, onConfirm, file, isLoading = false }: CSVPreviewModalProps) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length > 0) {
          const headerLine = lines[0];
          const parsedHeaders = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
          setHeaders(parsedHeaders);

          const dataRows = lines.slice(1, 11).map(line =>
            line.split(',').map(cell => cell.trim().replace(/"/g, ''))
          );
          setRows(dataRows);
          setTotalRows(lines.length - 1);
        }
      };
      reader.readAsText(file);
    }
  }, [file]);

  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
      <DialogContent className="max-w-4xl bg-card border-border">
        {/* ... existing header ... */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <FileSpreadsheet size={20} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl">Preview CSV</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {file?.name} • {totalRows.toLocaleString()} rows
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] rounded-lg border border-border">
          <div className="overflow-x-auto">
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
                {rows.map((row, rowIndex) => (
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
          </div>
        </ScrollArea>

        {totalRows > 10 && (
          <p className="text-xs text-muted-foreground text-center">
            Showing first 10 of {totalRows.toLocaleString()} rows
          </p>
        )}

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X size={16} />
            Cancel
          </Button>
          <Button variant="bus" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                Build Query
                <ArrowRight size={16} />
              </>
            )}
          </Button>
      </DialogFooter>
    </DialogContent>
    </Dialog >
  );
};
