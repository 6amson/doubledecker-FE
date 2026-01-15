import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Search, FolderOpen, Calendar, Filter, ArrowUpDown,
  Columns, Trash2, ChevronLeft, ChevronRight, FileSpreadsheet
} from "lucide-react";
import { SavedQuery } from "@/types/api";
import { savedQueriesService } from "@/services/api";
import { format } from "date-fns";
import { toast } from "sonner";

const QUERIES_PER_PAGE = 10;

export const SavedQueries = () => {
  const navigate = useNavigate();
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const data = await savedQueriesService.list();
        setQueries(data);
      } catch (error) {
        toast.error("Failed to load saved queries");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueries();
  }, []);

  const filteredQueries = queries.filter(q =>
    q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQueries.length / QUERIES_PER_PAGE);
  const startIndex = (currentPage - 1) * QUERIES_PER_PAGE;
  const paginatedQueries = filteredQueries.slice(startIndex, startIndex + QUERIES_PER_PAGE);

  const handleDelete = async (queryId: string) => {
    if (confirm("Are you sure you want to delete this saved query?")) {
      try {
        await savedQueriesService.delete(queryId);
        setQueries(prev => prev.filter(q => q.id !== queryId));
        toast.success("Query deleted");
      } catch (error) {
        toast.error("Failed to delete query");
        console.error(error);
      }
    }
  };

  const getQueryStats = (query: SavedQuery) => {
    const stats = [];

    // Parse operations to get stats
    const ops = query.query;
    const selectedCols = ops.filter(o => o.type === 'Select').flatMap(o => (o as any).columns || []);
    const filters = ops.filter(o => o.type === 'Filter');
    const sorts = ops.filter(o => o.type === 'Sort');
    const transforms = ops.filter(o => o.type === 'Transform');

    if (selectedCols.length > 0) {
      stats.push({ icon: Columns, label: `${selectedCols.length} cols` });
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
    <div className="min-h-screen bg-background">
      <Header showBack backTo="/" />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2 tracking-tight">Saved Queries</h1>
          <p className="text-xl text-muted-foreground font-light">
            Manage and reload your saved query configurations
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search queries..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10"
          />
        </div>

        {/* Queries List */}
        {queries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FolderOpen size={64} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Saved Queries</h3>
            <p>Create and save queries from the Query Builder</p>
            <Button variant="bus" className="mt-4" onClick={() => navigate("/")}>
              Go to Dashboard
            </Button>
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p>No queries match your search</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedQueries.map((query) => (
                <div
                  key={query.id}
                  className="query-panel p-5 flex items-start justify-between gap-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-lg">{query.name}</h3>
                    {query.description && (
                      <p className="text-sm text-muted-foreground mt-1">{query.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Created {format(new Date(query.created_at || new Date()), "MMM d, yyyy")}
                      </span>
                      {getQueryStats(query).map((stat, i) => (
                        <span key={i} className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                          <stat.icon size={12} />
                          {stat.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(query.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + QUERIES_PER_PAGE, filteredQueries.length)} of {filteredQueries.length} queries
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SavedQueries;
