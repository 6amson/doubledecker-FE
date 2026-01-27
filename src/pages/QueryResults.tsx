import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, RefreshCw, ChevronLeft, ChevronRight, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, ScatterChart, Table as TableIcon, Info } from "lucide-react";
import {
  prepareBarChartData,
  prepareLineChartData,
  preparePieChartData,
  prepareScatterPlotData
} from "@/utils/visualizationPreparers";
import { suggestVisualization, detectColumnTypes } from "@/utils/dataAggregation";
import { BarChartViz } from "@/components/visualizations/BarChartViz";
import { LineChartViz } from "@/components/visualizations/LineChartViz";
import { PieChartViz } from "@/components/visualizations/PieChartViz";
import { ScatterPlotViz } from "@/components/visualizations/ScatterPlotViz";

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
  const [vizType, setVizType] = useState<string>('table');

  // User column selections for each visualization type
  const [barCategoryCol, setBarCategoryCol] = useState<string | undefined>();
  const [barValueCol, setBarValueCol] = useState<string | undefined>();
  const [lineDateCol, setLineDateCol] = useState<string | undefined>();
  const [lineValueCol, setLineValueCol] = useState<string | undefined>();
  const [pieCategoryCol, setPieCategoryCol] = useState<string | undefined>();
  const [pieValueCol, setPieValueCol] = useState<string | undefined>();
  const [scatterXCol, setScatterXCol] = useState<string | undefined>();
  const [scatterYCol, setScatterYCol] = useState<string | undefined>();

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

  const { headers, rows, selectedColumns, tableName, queryMetadata } = state as {
    headers: string[];
    rows: string[][];
    selectedColumns: string[];
    tableName: string;
    queryMetadata?: {
      hasGroupBy: boolean;
      groupByColumns: string[];
      aggregationColumns: string[];
      isAggregated: boolean;
    };
  };
  const displayColumns = selectedColumns.length > 0 ? selectedColumns : headers;
  const columnIndices = displayColumns.map(col => headers.indexOf(col)).filter(i => i !== -1);

  // Convert rows to objects for easier processing
  const rowObjects = useMemo(() =>
    rows.map(row =>
      headers.reduce((obj, header, i) => ({ ...obj, [header]: row[i] }), {} as Record<string, any>)
    ),
    [rows, headers]
  );

  // Detect column types for smart filtering
  const columnTypes = useMemo(() => detectColumnTypes(rowObjects, headers), [rowObjects, headers]);
  const numericColumns = useMemo(() => headers.filter(h => columnTypes[h] === 'numeric'), [headers, columnTypes]);
  const temporalColumns = useMemo(() => headers.filter(h => columnTypes[h] === 'temporal'), [headers, columnTypes]);

  // Detect available visualizations
  const availableViz = useMemo(() =>
    suggestVisualization(rowObjects, headers),
    [rowObjects, headers]
  );

  // Prepare data for each visualization type with user selections
  const barData = useMemo(() =>
    availableViz.includes('bar') ? prepareBarChartData(rowObjects, headers, {
      categoryColumn: barCategoryCol,
      valueColumn: barValueCol,
      queryMetadata
    }) : null,
    [rowObjects, headers, availableViz, queryMetadata, barCategoryCol, barValueCol]
  );

  const lineData = useMemo(() =>
    availableViz.includes('line') ? prepareLineChartData(rowObjects, headers, {
      timeColumn: lineDateCol,
      valueColumn: lineValueCol,
      queryMetadata
    }) : null,
    [rowObjects, headers, availableViz, queryMetadata, lineDateCol, lineValueCol]
  );

  const pieData = useMemo(() =>
    availableViz.includes('pie') ? preparePieChartData(rowObjects, headers, {
      categoryColumn: pieCategoryCol,
      valueColumn: pieValueCol,
      queryMetadata
    }) : null,
    [rowObjects, headers, availableViz, queryMetadata, pieCategoryCol, pieValueCol]
  );

  const scatterData = useMemo(() =>
    availableViz.includes('scatter') ? prepareScatterPlotData(rowObjects, headers, {
      xColumn: scatterXCol,
      yColumn: scatterYCol,
      queryMetadata
    }) : null,
    [rowObjects, headers, availableViz, queryMetadata, scatterXCol, scatterYCol]
  );

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
        <Button variant="bus" size="sm" onClick={handleDownloadCSV} disabled={!rows || rows.length === 0}>
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
                {totalRows.toLocaleString()} rows • {headers.length} columns
              </p>
            </div>
          </div>

          {/* Visualization Tabs */}
          <Tabs value={vizType} onValueChange={setVizType} className="w-full">
            <TabsList className="grid w-full mb-4" style={{ gridTemplateColumns: `repeat(${availableViz.length}, 1fr)` }}>
              {availableViz.includes('table') && (
                <TabsTrigger value="table">
                  <TableIcon size={16} className="mr-2" />
                  Table
                </TabsTrigger>
              )}
              {availableViz.includes('bar') && (
                <TabsTrigger value="bar">
                  <BarChart3 size={16} className="mr-2" />
                  Bar Chart
                </TabsTrigger>
              )}
              {availableViz.includes('line') && (
                <TabsTrigger value="line">
                  <LineChartIcon size={16} className="mr-2" />
                  Line Chart
                </TabsTrigger>
              )}
              {availableViz.includes('pie') && (
                <TabsTrigger value="pie">
                  <PieChartIcon size={16} className="mr-2" />
                  Pie Chart
                </TabsTrigger>
              )}
              {availableViz.includes('scatter') && (
                <TabsTrigger value="scatter">
                  <ScatterChart size={16} className="mr-2" />
                  Scatter Plot
                </TabsTrigger>
              )}
            </TabsList>

            {/* Table View */}
            <TabsContent value="table">
              <div className="flex items-center justify-between mb-4">
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

              <div className="overflow-x-auto rounded-lg border border-border" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                <div className="min-w-max">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="table-header w-12 text-center sticky left-0 bg-background z-10">#</TableHead>
                        {displayColumns.map((header, i) => (
                          <TableHead key={i} className="table-header whitespace-nowrap px-4">
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRows.map((row, rowIndex) => (
                        <TableRow key={rowIndex} className="border-border hover:bg-muted/30">
                          <TableCell className="text-xs text-muted-foreground text-center font-mono sticky left-0 bg-background z-10">
                            {startIndex + rowIndex + 1}
                          </TableCell>
                          {columnIndices.map((colIndex, cellIndex) => (
                            <TableCell key={cellIndex} className="text-sm text-foreground/90 whitespace-nowrap px-4">
                              {row[colIndex] || <span className="text-muted-foreground italic">null</span>}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

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
            </TabsContent>

            {/* Bar Chart */}
            <TabsContent value="bar">
              {/* Column Selection Controls */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Category Column</label>
                  <Select value={barCategoryCol || barData?.metadata.xAxisLabel || ''} onValueChange={setBarCategoryCol}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Auto: ${barData?.metadata.xAxisLabel || 'Select column'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Value Column</label>
                  <Select value={barValueCol || barData?.metadata.yAxisLabel || ''} onValueChange={setBarValueCol}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Auto: ${barData?.metadata.yAxisLabel || 'Select column'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {barData?.metadata.warning && (
                <Alert className="mb-4">
                  <Info size={16} />
                  <AlertDescription>{barData.metadata.warning}</AlertDescription>
                </Alert>
              )}
              {barData && <BarChartViz data={barData.data} metadata={barData.metadata} />}
            </TabsContent>

            {/* Line Chart */}
            <TabsContent value="line">
              {/* Column Selection Controls */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Time/Date Column</label>
                  <Select value={lineDateCol || lineData?.metadata.xAxisLabel || ''} onValueChange={setLineDateCol}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Auto: ${lineData?.metadata.xAxisLabel || 'Select column'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(temporalColumns.length > 0 ? temporalColumns : headers).map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Value Column</label>
                  <Select value={lineValueCol || lineData?.metadata.yAxisLabel || ''} onValueChange={setLineValueCol}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Auto: ${lineData?.metadata.yAxisLabel || 'Select column'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {lineData?.metadata.warning && (
                <Alert className="mb-4">
                  <Info size={16} />
                  <AlertDescription>{lineData.metadata.warning}</AlertDescription>
                </Alert>
              )}
              {lineData && <LineChartViz data={lineData.data} metadata={lineData.metadata} />}
            </TabsContent>

            {/* Pie Chart */}
            <TabsContent value="pie">
              {/* Column Selection Controls */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Category Column</label>
                  <Select value={pieCategoryCol || pieData?.metadata.xAxisLabel || ''} onValueChange={setPieCategoryCol}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Auto: ${pieData?.metadata.xAxisLabel || 'Select column'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Value Column</label>
                  <Select value={pieValueCol || pieData?.metadata.yAxisLabel || ''} onValueChange={setPieValueCol}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Auto: ${pieData?.metadata.yAxisLabel || 'Select column'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {pieData?.metadata.warning && (
                <Alert className="mb-4">
                  <Info size={16} />
                  <AlertDescription>{pieData.metadata.warning}</AlertDescription>
                </Alert>
              )}
              {pieData && <PieChartViz data={pieData.data} metadata={pieData.metadata} />}
            </TabsContent>

            {/* Scatter Plot */}
            <TabsContent value="scatter">
              {/* Column Selection Controls */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">X Column</label>
                  <Select value={scatterXCol || scatterData?.metadata.xAxisLabel || ''} onValueChange={setScatterXCol}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Auto: ${scatterData?.metadata.xAxisLabel || 'Select column'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Y Column</label>
                  <Select value={scatterYCol || scatterData?.metadata.yAxisLabel || ''} onValueChange={setScatterYCol}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Auto: ${scatterData?.metadata.yAxisLabel || 'Select column'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {scatterData?.metadata.warning && (
                <Alert className="mb-4">
                  <Info size={16} />
                  <AlertDescription>{scatterData.metadata.warning}</AlertDescription>
                </Alert>
              )}
              {scatterData && <ScatterPlotViz data={scatterData.data} metadata={scatterData.metadata} />}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default QueryResults;
