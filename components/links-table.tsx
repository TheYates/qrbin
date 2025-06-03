"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Copy,
  ExternalLink,
  QrCode,
  Edit,
  Trash2,
  SearchIcon,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeGenerator } from "./qr-code-generator";

interface Link {
  id: number;
  original_url: string;
  short_code: string;
  title?: string;
  description?: string;
  created_at: string;
  click_count: number;
  foreground_color?: string;
  background_color?: string;
  size?: number;
  error_correction_level?: string;
  logo_url?: string;
  logo_size?: number;
}

export function LinksTable() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [openQRDialog, setOpenQRDialog] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/links");
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error("Failed to fetch links:", error);
      toast({
        title: "Error",
        description: "Failed to fetch links. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: newUrl,
          title: newTitle || undefined,
          description: newDescription || undefined,
        }),
      });

      if (response.ok) {
        const newLink = await response.json();
        setLinks([newLink, ...links]);
        setNewUrl("");
        setNewTitle("");
        setNewDescription("");
        toast({
          title: "Link created!",
          description: "Your shortened link has been created successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to create link:", error);
      toast({
        title: "Error",
        description: "Failed to create link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard.",
    });
  };

  const deleteLink = async (id: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLinks(links.filter((link) => link.id !== id));
        toast({
          title: "Link deleted!",
          description: "The link has been deleted successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to delete link:", error);
      toast({
        title: "Error",
        description: "Failed to delete link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getShortUrl = (shortCode: string) => {
    return `${window.location.origin}/${shortCode}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const filteredLinks = links.filter((link) => {
    return (
      link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.original_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const showQRCode = (link: Link) => {
    setSelectedLink(link);
    setOpenQRDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Create New Link Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Link</CardTitle>
          <CardDescription>
            Enter a URL to create a shortened link with QR code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createLink} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="My awesome link"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <div className="flex justify-end h-full items-end">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Short Link"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Your Links</CardTitle>
              <CardDescription>Manage all your shortened links</CardDescription>
            </div>
            <div className="w-full md:w-80">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search links..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "No links found matching your search."
                : "No links created yet."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Short URL</TableHead>
                    <TableHead>Original URL</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-24 text-center">Clicks</TableHead>
                    <TableHead className="w-36">Created</TableHead>
                    <TableHead className="w-32 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            /{link.short_code}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() =>
                              copyToClipboard(getShortUrl(link.short_code))
                            }
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-xs">
                          <span className="truncate text-sm">
                            {link.original_url}
                          </span>
                          <a
                            href={link.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        {link.title || (
                          <span className="text-muted-foreground italic">
                            Untitled
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{link.click_count}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(link.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => showQRCode(link)}
                          >
                            <QrCode className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteLink(link.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openQRDialog} onOpenChange={setOpenQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              {selectedLink?.title ||
                selectedLink?.short_code ||
                "Link QR Code"}
            </DialogDescription>
          </DialogHeader>
          {selectedLink && (
            <div className="flex justify-center">
              <QRCodeGenerator
                value={getShortUrl(selectedLink.short_code)}
                size={selectedLink.size || 200}
                foregroundColor={selectedLink.foreground_color || "#000000"}
                backgroundColor={selectedLink.background_color || "#ffffff"}
                errorCorrectionLevel={
                  (selectedLink.error_correction_level as
                    | "L"
                    | "M"
                    | "Q"
                    | "H") || "M"
                }
                logoUrl={selectedLink.logo_url}
                logoSize={selectedLink.logo_size}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
