import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { FileUploadZone } from "@/components/FileUploadZone";
import { CSVPreviewModal } from "@/components/CSVPreviewModal";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Clock,
  Trash2,
  FolderOpen,
  LogOut,
  Database,
  BarChart3,
  Zap,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SavedFilesModal } from "@/components/SavedFilesModal";

interface RecentFile {
  id: string;
  name: string;
  tableName: string;
  rows: number;
  uploadedAt: string;
  fileLink: string | null;
}

import { fileService, uploadsService, userService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Helper function to format relative time
const formatRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSavedFilesModal, setShowSavedFilesModal] = useState(false);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [userStats, setUserStats] = useState({
    total_saved_queries: 0,
    total_queries: 0,
    total_files_processed: 0,
  });

  // Fetch recent files on mount
  useEffect(() => {
    fetchRecentFiles();
    fetchUserStats();
  }, []);

  const fetchRecentFiles = async () => {
    try {
      setIsLoadingFiles(true);
      const response = await uploadsService.getRecentUploads({ page: 1, page_size: 10 });

      // Transform Upload[] to RecentFile[]
      const files: RecentFile[] = response.data.map(upload => ({
        id: upload.id,
        name: upload.file_name,
        tableName: upload.table_name,
        rows: 0, // We don't have row count from backend yet
        uploadedAt: formatRelativeTime(upload.created_at),
        fileLink: upload.file_link
      }));

      // In real implementation, this should come from API metadata
      // For now, assume if we got 10 files (default page_size), there might be more
      const hasMoreFiles = files.length === 10;

      setRecentFiles(files);
      // setIsMoreFilesAvailable(hasMoreFiles); // Could store this in state if needed
    } catch (error) {
      console.error('Failed to fetch recent files:', error);
      toast.error("Failed to load recent files");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const profile = await userService.getProfile();
      setUserStats({
        total_saved_queries: profile.total_saved_queries || 0,
        total_queries: profile.total_queries || 0,
        total_files_processed: profile.total_files_processed || 0,
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      // Fallback to user object from auth context
      setUserStats({
        total_saved_queries: user?.total_saved_queries || 0,
        total_queries: user?.total_queries || 0,
        total_files_processed: user?.total_files_processed || 0,
      });
    }
  };

  const handleDeleteFile = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await uploadsService.deleteUpload(id);
        toast.success("File deleted");
        fetchRecentFiles(); // Refresh list
        fetchUserStats();   // Refresh stats
      } catch (error) {
        toast.error("Failed to delete file");
      }
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading file...");

    try {
      const tableName = await fileService.uploadCSV(selectedFile);

      toast.dismiss(toastId);
      toast.success("File uploaded successfully");
      setShowPreview(false);

      // Refresh recent files list (optional, since user navigates away)
      // fetchRecentFiles();

      navigate("/query-builder", {
        state: {
          file: selectedFile,
          tableName: tableName
        }
      });
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to upload file");
      console.error(error);
      setIsUploading(false);
    }
  };

  const handleFileClick = (file: RecentFile) => {
    navigate("/query-builder", {
      state: {
        tableName: file.tableName,
        fileName: file.name,
        fileLink: file.fileLink
      }
    });
  };

  const hasRecentFiles = recentFiles.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header>
        <Button variant="ghost" size="sm" onClick={() => navigate("/saved-queries")}>
          <FolderOpen size={16} />
          Saved Queries
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-primary/10 hover:bg-primary/20">
              <User size={16} className="text-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-muted-foreground text-xs" disabled>
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={logout}>
              <LogOut size={14} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="text-xl text-muted-foreground font-light">
            Upload a CSV file to start building queries
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Recent Files */}
          <div className="lg:col-span-2 space-y-8">
            {/* ... Upload Zone ... */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database size={20} className="text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold text-foreground">New Query</h2>
              </div>
              <FileUploadZone onFileSelect={handleFileSelect} />
            </div>

            {/* ... Recent Files ... */}
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock size={20} className="text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">Recent Files</h2>
                </div>
                {hasRecentFiles && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2 text-muted-foreground hover:text-primary"
                      onClick={() => setShowSavedFilesModal(true)}
                    >
                      See all
                    </Button>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {recentFiles.length > 5 ? '5+' : recentFiles.length} files
                    </span>
                  </div>
                )}
              </div>

              {/* Recent Files List */}
              {isLoadingFiles ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="bg-secondary/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <FileSpreadsheet size={32} className="opacity-40" />
                  </div>
                  <p className="font-medium text-foreground">Loading recent files...</p>
                </div>
              ) : hasRecentFiles ? (
                <div className="space-y-3">
                  {recentFiles.slice(0, 5).map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 cursor-pointer group border border-transparent hover:border-primary/10"
                      onClick={() => handleFileClick(file)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="bg-background rounded-lg p-2.5 shadow-sm group-hover:shadow-md transition-all">
                          <FileSpreadsheet size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {file.rows > 0 && (
                              <>
                                <p className="text-xs text-muted-foreground font-medium">
                                  {file.rows.toLocaleString()} rows
                                </p>
                                <span className="text-muted-foreground/40">•</span>
                              </>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {file.uploadedAt}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Delete Action */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                          onClick={(e) => handleDeleteFile(e, file.id, file.name)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="bg-secondary/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet size={32} className="opacity-40" />
                  </div>
                  <p className="font-medium text-foreground">No recent files</p>
                  <p className="text-sm mt-1">Upload a CSV to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Stats & Tips */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="glass-card p-8">
              <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">
                Overview
              </h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-lg p-2 group-hover:bg-primary/20 transition-colors">
                      <FolderOpen size={16} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Saved Queries</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground font-sans">
                    {userStats.total_saved_queries}
                  </span>
                </div>
                <div className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-lg p-2 group-hover:bg-primary/20 transition-colors">
                      <BarChart3 size={16} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Queries Run</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground font-sans">
                    {userStats.total_queries}
                  </span>
                </div>
                <div className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-lg p-2 group-hover:bg-primary/20 transition-colors">
                      <FileSpreadsheet size={16} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Files Processed</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground font-sans">
                    {userStats.total_files_processed}
                  </span>
                </div>
              </div>
            </div>

            {/* ... Quick Actions ... */}


            {/* Quick Actions */}
            <div className="glass-card p-8">
              <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full justify-start h-10 font-medium hover:bg-secondary/80"
                  onClick={() => navigate("/saved-queries")}
                >
                  <FolderOpen size={16} className="mr-2 text-primary" />
                  Browse Saved Queries
                </Button>
              </div>
            </div>

            {/* Tips Card */}
            <div className="glass-card p-6 border-l-4 border-l-primary bg-primary/5">
              <div className="flex items-start gap-3">
                <Zap size={18} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground mb-1">
                    Pro Tip
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Save your frequently used queries to quickly re-run them on new datasets. Your saved queries will validate against the new file's columns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      <CSVPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirm}
        file={selectedFile}
        isLoading={isUploading}
      />
      {/* Saved Files Modal */}
      <SavedFilesModal
        isOpen={showSavedFilesModal}
        onClose={() => setShowSavedFilesModal(false)}
        onFileSelect={handleFileClick}
        onFileDeleted={() => {
          fetchRecentFiles();
          fetchUserStats();
        }}
      />
    </div>
  );
};


export default Dashboard;
