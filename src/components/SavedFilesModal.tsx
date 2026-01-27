import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSpreadsheet, Trash2, ArrowRight, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Upload } from "@/types/api"; // Assuming Upload type matches structure
import { uploadsService } from "@/services/api";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export interface FileSelectData {
    id: string;
    name: string;
    tableName: string;
    rows: number;
    uploadedAt: string;
}

interface SavedFilesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFileSelect: (file: FileSelectData) => void;
    onFileDeleted: () => void; // Callback to refresh dashboard list
}

export const SavedFilesModal = ({ isOpen, onClose, onFileSelect, onFileDeleted }: SavedFilesModalProps) => {
    const [files, setFiles] = useState<Upload[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            // Fetch more items for the modal view
            const response = await uploadsService.getRecentUploads({ page, page_size: 10 });
            setFiles(response.data);
            setTotalPages(response.total_pages);
        } catch (error) {
            console.error("Failed to fetch files:", error);
            toast.error("Failed to load saved files");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchFiles();
        }
    }, [isOpen, page]);

    // Filter files locally for now (replace with API search if available)
    const filteredFiles = files.filter(file =>
        file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation(); // Prevent opening the file
        if (confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
            setDeletingId(id);
            try {
                await uploadsService.deleteUpload(id);
                toast.success("File deleted successfully");
                onFileDeleted(); // Notify parent
                fetchFiles(); // Refresh local list
            } catch (error) {
                console.error("Delete error:", error);
                toast.error("Failed to delete file");
            } finally {
                setDeletingId(null);
            }
        }
    };

    const handleOpen = (file: Upload) => {
        // Transform to Dashboard's expected format if needed, or pass full object
        onFileSelect({
            id: file.id,
            name: file.file_name,
            tableName: file.table_name,
            rows: 0,
            uploadedAt: new Date(file.created_at).toLocaleDateString(),
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl bg-card border-border h-[600px] flex flex-col">
                <DialogHeader className="pb-4 border-b border-border/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 rounded-lg p-2">
                                <FileSpreadsheet size={20} className="text-primary" />
                            </div>
                            <DialogTitle className="font-display text-xl">Saved Files</DialogTitle>
                        </div>
                        <div className="relative w-64 mr-8">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-9"
                            />
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden py-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <FileSpreadsheet size={48} className="mb-4 opacity-20" />
                            <p>No files found</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-2">
                                {filteredFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="p-2 bg-secondary rounded-md">
                                                <FileSpreadsheet size={18} className="text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-medium text-foreground truncate">{file.file_name}</h4>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>{formatBytes(file.file_size)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={(e) => handleDelete(e, file.id, file.file_name)}
                                                disabled={deletingId === file.id}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8"
                                                onClick={() => handleOpen(file)}
                                            >
                                                Open
                                                <ArrowRight size={14} className="ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                        >
                            <ChevronLeft size={16} className="mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || isLoading}
                        >
                            Next
                            <ChevronRight size={16} className="ml-1" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
