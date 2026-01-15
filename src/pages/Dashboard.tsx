import { useState } from "react";
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

interface RecentFile {
  id: string;
  name: string;
  rows: number;
  uploadedAt: string;
}

const mockRecentFiles: RecentFile[] = [
  { id: "1", name: "sales_2024.csv", rows: 15420, uploadedAt: "2 hours ago" },
  { id: "2", name: "customers.csv", rows: 8234, uploadedAt: "Yesterday" },
  { id: "3", name: "inventory_report.csv", rows: 3102, uploadedAt: "3 days ago" },
];

import { fileService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(mockRecentFiles);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentFiles(prev => prev.filter(f => f.id !== id));
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
                  <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {recentFiles.length} files
                  </span>
                )}
              </div>

              {/* NOTE: Recent files are still mock data until API is ready */}
              {hasRecentFiles ? (
                <div className="space-y-3">
                  {recentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 cursor-pointer group border border-transparent hover:border-primary/10"
                      onClick={() => navigate("/query-builder")}
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-background rounded-lg p-2.5 shadow-sm group-hover:shadow-md transition-all">
                          <FileSpreadsheet size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground font-medium">
                              {file.rows.toLocaleString()} rows
                            </p>
                            <span className="text-muted-foreground/40">•</span>
                            <p className="text-xs text-muted-foreground">
                              {file.uploadedAt}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeleteFile(file.id, e)}
                      >
                        <Trash2 size={16} />
                      </Button>
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
                    {user?.total_saved_queries || 0}
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
                    {user?.total_queries || 0}
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
                    {user?.total_files_processed || 0}
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
      />
    </div>
  );
};

export default Dashboard;
