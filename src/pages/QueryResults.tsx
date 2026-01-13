import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface QueryResultsState {
  headers: string[];
  rows: string[][];
  selectedColumns: string[];
  tableName: string;
}

export const QueryResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as QueryResultsState | null;

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Fallback if no state
  if (!state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground">No Results Found</h2>
          <p className="text-muted-foreground">Please run a query first.</p>
          <Button variant="bus" onClick={() => navigate("/")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { headers, rows, selectedColumns, tableName } = state;
  const displayColumns = selectedColumns.length > 0 ? selectedColumns : headers;
  const columnIndices = displayColumns.map(col => headers.indexOf(col)).filter(i => i !== -1);

  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const paginatedRows = rows.slice(startIndex, endIndex);

  const handleDownloadCSV = () => {
    const csvContent = [
      displayColumns.join(","),
      ...rows.map(row => 
        columnIndices.map(i => {
          const cell = row[i] || "";
          // Escape quotes and wrap in quotes if contains comma
          if (cell.includes(",") || cell.includes('"')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${tableName}_results.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleNewQuery = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBack backTo={-1}>
        <Button variant="outline" size="sm" onClick={handleNewQuery}>
          <RefreshCw size={16} />
          New Query
        </Button>
        <Button variant="bus" size="sm" onClick={handleDownloadCSV}>
          <Download size={16} />
          Download CSV
        </Button>
      </Header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="query-panel">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-lg text-foreground">Query Results</h2>
              <p className="text-sm text-muted-foreground">
                {totalRows.toLocaleString()} rows • {displayColumns.length} columns
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <ScrollArea className="h-[calc(100vh-320px)] rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="table-header w-12 text-center">#</TableHead>
                  {displayColumns.map((header, i) => (
                    <TableHead key={i} className="table-header whitespace-nowrap">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="border-border hover:bg-muted/30">
                    <TableCell className="text-xs text-muted-foreground text-center font-mono">
                      {startIndex + rowIndex + 1}
                    </TableCell>
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {endIndex} of {totalRows.toLocaleString()} rows
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "bus" : "ghost"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QueryResults;
