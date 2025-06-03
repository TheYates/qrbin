"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeGenerator } from "./qr-code-generator";
import { Download, Copy, ExternalLink } from "lucide-react";
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
}

export function QRCodesPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const getShortUrl = (shortCode: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${shortCode}`;
    }
    return `/${shortCode}`;
  };

  const downloadQRCode = (shortCode: string) => {
    // Find canvas by looking for the one inside the container with the short code
    const container = document.querySelector(
      `[data-short-code="${shortCode}"]`
    );
    const canvas = container?.querySelector("canvas") as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement("a");
      link.download = `qr-${shortCode}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const copyQRCode = async (shortCode: string) => {
    try {
      const container = document.querySelector(
        `[data-short-code="${shortCode}"]`
      );
      const canvas = container?.querySelector("canvas") as HTMLCanvasElement;
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob && navigator.clipboard && navigator.clipboard.write) {
            navigator.clipboard
              .write([
                new ClipboardItem({
                  "image/png": blob,
                }),
              ])
              .then(() => {
                toast({
                  title: "QR Code copied!",
                  description: "QR code has been copied to clipboard.",
                });
              })
              .catch(() => {
                // Fallback: just copy the URL instead
                navigator.clipboard.writeText(getShortUrl(shortCode));
                toast({
                  title: "URL copied!",
                  description: "Short URL has been copied to clipboard.",
                });
              });
          } else {
            // Fallback: copy URL to clipboard
            navigator.clipboard.writeText(getShortUrl(shortCode));
            toast({
              title: "URL copied!",
              description: "Short URL has been copied to clipboard.",
            });
          }
        });
      }
    } catch (error) {
      console.error("Copy failed:", error);
      toast({
        title: "Copy failed",
        description: "Unable to copy QR code. Try downloading instead.",
        variant: "destructive",
      });
    }
  };

  const handleSaveQRConfig = async (id: number, config: any) => {
    try {
      const response = await fetch("/api/links", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          foregroundColor: config.foregroundColor,
          backgroundColor: config.backgroundColor,
          size: config.size,
          errorCorrectionLevel: config.errorCorrectionLevel,
          logoUrl: config.logoUrl,
          logoSize: config.logoSize,
        }),
      });
      if (response.ok) {
        toast({
          title: "QR Code configuration saved!",
          description: "QR code configuration has been saved successfully.",
        });
        fetchLinks();
      } else {
        console.error("Failed to save QR code configuration");
        toast({
          title: "Save failed",
          description:
            "Failed to save QR code configuration. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving QR code configuration:", error);
      toast({
        title: "Save failed",
        description:
          "An error occurred while saving QR code configuration. Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading QR codes...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">QR Codes</h1>
        <p className="text-muted-foreground">
          Manage and download your QR codes
        </p>
      </div>

      {links.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No QR codes available. Create some links first!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <Card key={link.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {link.title || "Untitled Link"}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="secondary">{link.click_count} clicks</Badge>
                  <span className="text-xs">/{link.short_code}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div data-short-code={link.short_code}>
                    <QRCodeGenerator
                      value={getShortUrl(link.short_code)}
                      size={link.size || 200}
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
                      onSave={(config) => handleSaveQRConfig(link.id, config)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Short URL:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded text-xs flex-1">
                        {getShortUrl(link.short_code)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            getShortUrl(link.short_code)
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Original URL:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={link.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs truncate flex-1"
                      >
                        {link.original_url}
                      </a>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadQRCode(link.short_code)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyQRCode(link.short_code)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Created {new Date(link.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
