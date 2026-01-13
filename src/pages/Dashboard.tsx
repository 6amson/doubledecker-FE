import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { FileUploadZone } from "@/components/FileUploadZone";
import { CSVPreviewModal } from "@/components/CSVPreviewModal";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Clock, Star, Trash2, MoreVertical } from "lucide-react";

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

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleConfirm = () => {
    setShowPreview(false);
    navigate("/query-builder", { state: { file: selectedFile } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Documentation
            </Button>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Query your CSV files
            <span className="gradient-text"> instantly</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your data, build powerful queries with our visual builder, and get results in seconds. No SQL knowledge required.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="mb-16 animate-slide-up">
          <FileUploadZone onFileSelect={handleFileSelect} />
        </div>

        {/* Recent Files Section */}
        <section className="max-w-4xl mx-auto animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-muted-foreground" />
            <h2 className="font-display text-xl font-semibold text-foreground">Recent Files</h2>
          </div>

          <div className="grid gap-3">
            {mockRecentFiles.map((file) => (
              <div
                key={file.id}
                className="glass-card p-4 flex items-center justify-between hover-lift cursor-pointer group"
                onClick={() => navigate("/query-builder")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-lg p-2.5 group-hover:bg-primary/20 transition-colors">
                    <FileSpreadsheet size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {file.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {file.rows.toLocaleString()} rows • {file.uploadedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Star size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
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
