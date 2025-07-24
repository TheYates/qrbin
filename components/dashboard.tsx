"use client";

import type React from "react";
import type { QRCodeConfig } from "./qr-code-generator";

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
import { Copy, ExternalLink, QrCode, Edit, Trash2 } from "lucide-react";
import { QRCodeGenerator } from "./qr-code-generator";
import { QRCodeCreator } from "./qr-code-creator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

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
  qr_type?: string;
  qr_content?: string;
}

export function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/links");
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error("Failed to fetch links:", error);
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

  const updateQRCode = async (linkId: number, config: QRCodeConfig) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrConfig: config }),
      });

      if (response.ok) {
        const updatedLink = await response.json();
        setLinks(
          links.map((link) => (link.id === linkId ? updatedLink : link))
        );
        toast({
          title: "QR Code updated!",
          description: "Your QR code has been customized successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to update QR code:", error);
      toast({
        title: "Error",
        description: "Failed to update QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getShortUrl = (shortCode: string) => {
    return `${window.location.origin}/${shortCode}`;
  };

  const getQRContent = (link: Link) => {
    // If it's a new QR code with specific content, use that
    if (link.qr_content) {
      return link.qr_content;
    }
    // Otherwise, use the short URL for backward compatibility
    return getShortUrl(link.short_code);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">URL Shortener</h1>
        <p className="text-muted-foreground">
          Create shortened links and QR codes
        </p>
      </div>

      {/* QR Code Creator */}
      <QRCodeCreator onQRCodeCreated={fetchLinks} />

      {/* Links List */}
      <div className="grid gap-6">
        {links.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No links created yet. Create your first one above!
              </p>
            </CardContent>
          </Card>
        ) : (
          links.map((link) => (
            <Card key={link.id}>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Link Info */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {link.title || "Untitled Link"}
                        </h3>
                        <Badge variant="secondary">
                          {link.click_count} clicks
                        </Badge>
                      </div>
                      {link.description && (
                        <p className="text-muted-foreground text-sm mb-2">
                          {link.description}
                        </p>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Short URL:
                          </span>
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {getShortUrl(link.short_code)}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(getShortUrl(link.short_code))
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Original:</span>
                          <a
                            href={link.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm truncate max-w-md"
                          >
                            {link.original_url}
                          </a>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit URL
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <QrCode className="h-4 w-4 mr-2" />
                            Customize QR
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Customize QR Code</DialogTitle>
                            <DialogDescription>
                              Customize the appearance of your QR code
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <QRCodeGenerator
                              value={getQRContent(link)}
                              size={link.size || 200}
                              foregroundColor={
                                link.foreground_color || "#000000"
                              }
                              backgroundColor={
                                link.background_color || "#ffffff"
                              }
                              errorCorrectionLevel={
                                (link.error_correction_level as
                                  | "L"
                                  | "M"
                                  | "Q"
                                  | "H") || "M"
                              }
                              logoUrl={link.logo_url}
                              logoSize={link.logo_size}
                              onSave={(config) => updateQRCode(link.id, config)}
                            />
                            {/* QR customization controls would go here */}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteLink(link.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center space-y-2">
                    <QRCodeGenerator
                      value={getQRContent(link)}
                      size={link.size || 150}
                      foregroundColor={link.foreground_color || "#000000"}
                      backgroundColor={link.background_color || "#ffffff"}
                      errorCorrectionLevel={
                        (link.error_correction_level as
                          | "L"
                          | "M"
                          | "Q"
                          | "H") || "M"
                      }
                      logoUrl={link.logo_url}
                      logoSize={link.logo_size}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Created {new Date(link.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
