import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
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

export const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(mockRecentFiles);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleConfirm = () => {
    setShowPreview(false);
    navigate("/query-builder", { state: { file: selectedFile } });
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentFiles(prev => prev.filter(f => f.id !== id));
  };

  const hasRecentFiles = recentFiles.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
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
                  user@example.com
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut size={14} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Upload a CSV file to start building queries
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Recent Files */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Zone Card */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Database size={18} className="text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">New Query</h2>
              </div>
              <FileUploadZone onFileSelect={handleFileSelect} />
            </div>

            {/* Recent Files Section */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-muted-foreground" />
                  <h2 className="font-display text-lg font-semibold text-foreground">Recent Files</h2>
                </div>
                {hasRecentFiles && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {recentFiles.length} files
                  </span>
                )}
              </div>

              {hasRecentFiles ? (
                <div className="space-y-2">
                  {recentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
                      onClick={() => navigate("/query-builder")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg p-2 group-hover:bg-primary/20 transition-colors">
                          <FileSpreadsheet size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {file.rows.toLocaleString()} rows • {file.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDeleteFile(file.id, e)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileSpreadsheet size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No recent files</p>
                  <p className="text-xs mt-1">Upload a CSV to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Stats & Tips */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="glass-card p-6">
              <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <FolderOpen size={14} className="text-primary" />
                    </div>
                    <span className="text-sm text-foreground">Saved Queries</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <BarChart3 size={14} className="text-primary" />
                    </div>
                    <span className="text-sm text-foreground">Queries Run</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">48</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <FileSpreadsheet size={14} className="text-primary" />
                    </div>
                    <span className="text-sm text-foreground">Files Processed</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">23</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="secondary" 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={() => navigate("/saved-queries")}
                >
                  <FolderOpen size={14} className="mr-2" />
                  Browse Saved Queries
                </Button>
              </div>
            </div>

            {/* Tips Card */}
            <div className="glass-card p-6 border-l-4 border-l-primary">
              <div className="flex items-start gap-3">
                <Zap size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground mb-1">
                    Pro Tip
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
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
