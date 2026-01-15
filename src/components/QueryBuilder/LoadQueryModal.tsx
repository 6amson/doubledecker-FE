import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderOpen, ChevronLeft, ChevronRight, Calendar, Filter, ArrowUpDown, Columns, Trash2, FileSpreadsheet } from "lucide-react";
import { SavedQuery } from "@/types/api";
import { savedQueriesService } from "@/services/api";
import { format } from "date-fns";
import { toast } from "sonner";

interface LoadQueryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentColumns: string[];
  onLoad: (query: SavedQuery) => void;
}

const QUERIES_PER_PAGE = 5;

export const LoadQueryModal = ({ open, onOpenChange, currentColumns, onLoad }: LoadQueryModalProps) => {
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<SavedQuery | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadQueries();
      setSelectedQuery(null);
      setCurrentPage(1);
    }
  }, [open]);

  const loadQueries = async () => {
    setIsLoading(true);
    try {
      const data = await savedQueriesService.list();
      setQueries(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load saved queries");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(queries.length / QUERIES_PER_PAGE);
  const paginatedQueries = useMemo(() => {
    const start = (currentPage - 1) * QUERIES_PER_PAGE;
    return queries.slice(start, start + QUERIES_PER_PAGE);
  }, [queries, currentPage]);

  const handleSelect = (query: SavedQuery) => {
    setSelectedQuery(query);
  };

  const handleLoad = () => {
    if (!selectedQuery) return;
    // Simplified validation could go here, but for now trusting the user/backend
    onLoad(selectedQuery);
    onOpenChange(false);
  };

  const handleDelete = async (e: React.MouseEvent, queryId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this saved query?")) {
      try {
        await savedQueriesService.delete(queryId);
        toast.success("Query deleted");

        // Refresh list locally
        setQueries(prev => prev.filter(q => q.id !== queryId));
        if (selectedQuery?.id === queryId) {
          setSelectedQuery(null);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete query");
      }
    }
  };

  const getQueryStats = (query: SavedQuery) => {
    const stats = [];
    const ops = query.query;
    const selectedCols = ops.filter(o => o.type === 'Select').flatMap(o => (o as any).columns || []);
    const filters = ops.filter(o => o.type === 'Filter');
    const sorts = ops.filter(o => o.type === 'Sort');
    const transforms = ops.filter(o => o.type === 'Transform');

    if (selectedCols.length > 0) {
      stats.push({ icon: Columns, label: `${selectedCols.length} columns` });
    }
    if (filters.length > 0) {
      stats.push({ icon: Filter, label: `${filters.length} filters` });
    }
    if (sorts.length > 0) {
      stats.push({ icon: ArrowUpDown, label: `${sorts.length} sorts` });
    }
    if (transforms.length > 0) {
      stats.push({ icon: FileSpreadsheet, label: `${transforms.length} transforms` });
    }
    return stats;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <FolderOpen size={20} className="text-primary" />
            Load Saved Query
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : queries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No saved queries yet</p>
              <p className="text-sm mt-1">Save a query to see it here</p>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {paginatedQueries.map((query) => (
                    <div
                      key={query.id}
                      onClick={() => handleSelect(query)}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-all
                        ${selectedQuery?.id === query.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{query.name}</h4>
                          {query.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {query.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {format(new Date(query.updated_at || new Date()), "MMM d, yyyy")}
                            </span>
                            {getQueryStats(query).map((stat, i) => (
                              <span key={i} className="flex items-center gap-1">
                                <stat.icon size={12} />
                                {stat.label}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={(e) => handleDelete(e, query.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="bus"
            onClick={handleLoad}
            disabled={!selectedQuery}
          >
            <FolderOpen size={16} />
            Load Query
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
