
import { useState } from "react";
import { MessageTemplate } from "@/types/messageTemplate";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, Pencil, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SortableHeader } from "@/components/ui/sortable-header";
import { useSortableTable } from "@/hooks/useSortableTable";

interface MessageTemplateTableProps {
  templates: MessageTemplate[];
  onUpdateTemplate: (template: MessageTemplate) => void;
}

export function MessageTemplateTable({ templates, onUpdateTemplate }: MessageTemplateTableProps) {
  const { toast } = useToast();
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Use the sortable table hook with better typing
  const { sortField, sortDirection, handleSort, sortedData } = 
    useSortableTable<MessageTemplate, keyof MessageTemplate>(
      templates, 
      'id',
      'asc'
    );

  // Function to copy message to clipboard
  const copyToClipboard = async (template: MessageTemplate) => {
    try {
      await navigator.clipboard.writeText(template.message);
      setCopiedId(template.id);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard"
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive"
      });
    }
  };

  // Function to open edit dialog
  const openEditDialog = (template: MessageTemplate) => {
    setEditingTemplate({ ...template });
  };

  // Function to save edited template
  const saveTemplate = () => {
    if (editingTemplate) {
      onUpdateTemplate(editingTemplate);
      setEditingTemplate(null);
    }
  };

  // Function to update editing template field
  const updateEditingField = (field: keyof MessageTemplate, value: string) => {
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        [field]: value
      });
    }
  };

  return (
    <>
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader
                title="ID"
                field="id"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                width="w-20"
              />
              <SortableHeader
                title="Category"
                field="category"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                width="w-32"
              />
              <SortableHeader
                title="Situation"
                field="situation"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <TableHead>Message</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.id}</TableCell>
                <TableCell>{template.category}</TableCell>
                <TableCell>{template.situation}</TableCell>
                <TableCell className="max-w-md">
                  <div className="truncate">
                    {template.message.split('\n')[0]}
                    {template.message.split('\n').length > 1 && '...'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(template)}
                      className={copiedId === template.id ? "bg-green-100" : ""}
                    >
                      {copiedId === template.id ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(template)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Template {editingTemplate?.id}</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id" className="text-right">
                  ID
                </Label>
                <Input
                  id="id"
                  value={editingTemplate.id}
                  onChange={(e) => updateEditingField('id', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  value={editingTemplate.category}
                  onChange={(e) => updateEditingField('category', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="situation" className="text-right">
                  Situation
                </Label>
                <Input
                  id="situation"
                  value={editingTemplate.situation}
                  onChange={(e) => updateEditingField('situation', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="message" className="text-right">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={editingTemplate.message}
                  onChange={(e) => updateEditingField('message', e.target.value)}
                  className="col-span-3 min-h-[200px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={saveTemplate}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
