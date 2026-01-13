import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

interface SaveQueryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, description: string) => void;
}

export const SaveQueryModal = ({ open, onOpenChange, onSave }: SaveQueryModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Query name is required");
      return;
    }
    if (trimmedName.length > 100) {
      setError("Query name must be less than 100 characters");
      return;
    }
    if (description.length > 500) {
      setError("Description must be less than 500 characters");
      return;
    }
    onSave(trimmedName, description.trim());
    setName("");
    setDescription("");
    setError("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Save size={20} className="text-primary" />
            Save Query
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="query-name">Query Name *</Label>
            <Input
              id="query-name"
              placeholder="e.g., High Revenue Customers"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="query-description">Description (optional)</Label>
            <Textarea
              id="query-description"
              placeholder="Describe what this query does..."
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(""); }}
              maxLength={500}
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="bus" onClick={handleSave}>
            <Save size={16} />
            Save Query
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
