"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  logoUrl?: string;
  logoSize?: number;
  onSave?: (config: QRCodeConfig) => void;
}

export interface QRCodeConfig {
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  logoUrl?: string;
  logoSize?: number;
}

export function QRCodeGenerator({
  value,
  size = 200,
  foregroundColor = "#000000",
  backgroundColor = "#ffffff",
  errorCorrectionLevel = "M",
  logoUrl,
  logoSize = 50,
  onSave,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<QRCodeConfig>({
    foregroundColor,
    backgroundColor,
    size,
    errorCorrectionLevel,
    logoUrl,
    logoSize,
  });
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const generateQR = async () => {
      try {
        // Generate QR code on canvas
        await QRCode.toCanvas(canvas, value, {
          width: config.size,
          margin: 1,
          color: {
            dark: config.foregroundColor,
            light: config.backgroundColor,
          },
          errorCorrectionLevel: config.errorCorrectionLevel,
        });

        // Add logo if provided
        if (config.logoUrl) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const logo = new Image();
            logo.crossOrigin = "anonymous";
            logo.src = config.logoUrl;

            logo.onload = () => {
              // Calculate position to center the logo
              const logoWidth = config.logoSize || config.size * 0.2;
              const logoHeight = logoWidth;
              const logoX = (config.size - logoWidth) / 2;
              const logoY = (config.size - logoHeight) / 2;

              // Draw white background for logo
              ctx.fillStyle = "#FFFFFF";
              ctx.fillRect(
                logoX - 5,
                logoY - 5,
                logoWidth + 10,
                logoHeight + 10
              );

              // Draw logo
              ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
            };
          }
        }
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQR();
  }, [value, config]);

  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
    setIsCustomizing(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig({
          ...config,
          logoUrl: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQRCode = (format: "png" | "jpeg" | "svg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a sanitized filename from the QR code value
    const filename = `qrcode-${value
      .replace(/[^a-z0-9]/gi, "-")
      .substring(0, 20)}`;

    // Create temporary canvas for resizing
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");
    if (!tempContext) return;

    switch (format) {
      case "png":
        // Create 1000x1000 PNG
        tempCanvas.width = 1000;
        tempCanvas.height = 1000;
        tempContext.fillStyle = config.backgroundColor;
        tempContext.fillRect(0, 0, 1000, 1000);
        // Draw the original canvas content scaled up
        tempContext.drawImage(
          canvas,
          0,
          0,
          canvas.width,
          canvas.height,
          0,
          0,
          1000,
          1000
        );

        // If we have a logo, manually redraw it at the correct scale for high res
        if (config.logoUrl) {
          const logo = new Image();
          logo.crossOrigin = "anonymous";
          logo.src = config.logoUrl;

          logo.onload = () => {
            const scaleFactor = 1000 / config.size;
            const logoSize = config.logoSize || config.size * 0.2; // Use default size if not specified
            const logoWidth = logoSize * scaleFactor;
            const logoHeight = logoWidth;
            const logoX = (1000 - logoWidth) / 2;
            const logoY = (1000 - logoHeight) / 2;

            // Draw white background for logo
            tempContext.fillStyle = "#FFFFFF";
            tempContext.fillRect(
              logoX - 10,
              logoY - 10,
              logoWidth + 20,
              logoHeight + 20
            );

            // Draw logo
            tempContext.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

            // Get the updated dataURL and trigger download
            const pngDataUrl = tempCanvas.toDataURL("image/png");
            downloadDataUrl(pngDataUrl, `${filename}.png`);
          };

          // Return early to wait for logo to load
          return;
        }

        const pngDataUrl = tempCanvas.toDataURL("image/png");
        downloadDataUrl(pngDataUrl, `${filename}.png`);
        break;

      case "jpeg":
        // Create 800x800 JPEG
        tempCanvas.width = 800;
        tempCanvas.height = 800;
        tempContext.fillStyle = config.backgroundColor;
        tempContext.fillRect(0, 0, 800, 800);
        // Draw the original canvas content scaled up
        tempContext.drawImage(
          canvas,
          0,
          0,
          canvas.width,
          canvas.height,
          0,
          0,
          800,
          800
        );

        // If we have a logo, manually redraw it at the correct scale for high res
        if (config.logoUrl) {
          const logo = new Image();
          logo.crossOrigin = "anonymous";
          logo.src = config.logoUrl;

          logo.onload = () => {
            const scaleFactor = 800 / config.size;
            const logoSize = config.logoSize || config.size * 0.2; // Use default size if not specified
            const logoWidth = logoSize * scaleFactor;
            const logoHeight = logoWidth;
            const logoX = (800 - logoWidth) / 2;
            const logoY = (800 - logoHeight) / 2;

            // Draw white background for logo
            tempContext.fillStyle = "#FFFFFF";
            tempContext.fillRect(
              logoX - 10,
              logoY - 10,
              logoWidth + 20,
              logoHeight + 20
            );

            // Draw logo
            tempContext.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

            // Get the updated dataURL and trigger download
            const jpegDataUrl = tempCanvas.toDataURL("image/jpeg", 0.9);
            downloadDataUrl(jpegDataUrl, `${filename}.jpg`);
          };

          // Return early to wait for logo to load
          return;
        }

        const jpegDataUrl = tempCanvas.toDataURL("image/jpeg", 0.9);
        downloadDataUrl(jpegDataUrl, `${filename}.jpg`);
        break;

      case "svg":
        // For SVG, we need to generate it using QRCode.toString
        QRCode.toString(value, {
          type: "svg",
          width: 1000,
          margin: 1,
          color: {
            dark: config.foregroundColor,
            light: config.backgroundColor,
          },
          errorCorrectionLevel: config.errorCorrectionLevel,
        })
          .then((svgString: string) => {
            // If we have a logo and need to add it to the SVG
            if (config.logoUrl) {
              const scaleFactor = 1000 / config.size;
              const logoSize = config.logoSize || config.size * 0.2; // Use default size if not specified
              const logoWidth = logoSize * scaleFactor;
              const logoHeight = logoWidth;
              const logoX = (1000 - logoWidth) / 2;
              const logoY = (1000 - logoHeight) / 2;

              // Add a white rectangle and the logo image to the SVG
              const logoBackground = `<rect x="${logoX - 10}" y="${
                logoY - 10
              }" width="${logoWidth + 20}" height="${
                logoHeight + 20
              }" fill="white"/>`;
              const logoElement = `<image href="${config.logoUrl}" x="${logoX}" y="${logoY}" width="${logoWidth}" height="${logoHeight}"/>`;

              // Insert before the SVG closing tag
              svgString = svgString.replace(
                "</svg>",
                `${logoBackground}${logoElement}</svg>`
              );
            }

            // Create a blob from the SVG string
            const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
            const svgUrl = URL.createObjectURL(svgBlob);

            // Download the SVG
            downloadDataUrl(svgUrl, `${filename}.svg`, true);
          })
          .catch((err: Error) => {
            console.error("Error generating SVG:", err);
          });
        break;
    }
  };

  const downloadDataUrl = (
    dataUrl: string,
    filename: string,
    isObjectUrl = false
  ) => {
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release object URL if created
    if (isObjectUrl) {
      URL.revokeObjectURL(dataUrl);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="border rounded-lg" />
      </div>

      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => downloadQRCode("png")}>
              Download as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadQRCode("jpeg")}>
              Download as JPEG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadQRCode("svg")}>
              Download as SVG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {!isCustomizing ? (
          <Button
            onClick={() => setIsCustomizing(true)}
            variant="outline"
            className="flex-1"
          >
            Customize QR Code
          </Button>
        ) : null}
      </div>

      {isCustomizing && (
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="size">Size</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fgColor">Foreground Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="fgColor"
                  type="color"
                  value={config.foregroundColor}
                  onChange={(e) =>
                    setConfig({ ...config, foregroundColor: e.target.value })
                  }
                  className="w-12 h-8 p-1"
                />
                <Input
                  type="text"
                  value={config.foregroundColor}
                  onChange={(e) =>
                    setConfig({ ...config, foregroundColor: e.target.value })
                  }
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bgColor">Background Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="bgColor"
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) =>
                    setConfig({ ...config, backgroundColor: e.target.value })
                  }
                  className="w-12 h-8 p-1"
                />
                <Input
                  type="text"
                  value={config.backgroundColor}
                  onChange={(e) =>
                    setConfig({ ...config, backgroundColor: e.target.value })
                  }
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="errorLevel">Error Correction Level</Label>
              <select
                id="errorLevel"
                value={config.errorCorrectionLevel}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    errorCorrectionLevel: e.target.value as
                      | "L"
                      | "M"
                      | "Q"
                      | "H",
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          </TabsContent>

          <TabsContent value="size" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="size">Size: {config.size}px</Label>
              </div>
              <Slider
                id="size"
                min={100}
                max={400}
                step={10}
                value={[config.size]}
                onValueChange={(value) =>
                  setConfig({ ...config, size: value[0] })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="logo" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Upload Logo</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>

            {config.logoUrl && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="logoSize">
                    Logo Size: {config.logoSize}px
                  </Label>
                </div>
                <Slider
                  id="logoSize"
                  min={20}
                  max={config.size / 2}
                  step={5}
                  value={[config.logoSize || 50]}
                  onValueChange={(value) =>
                    setConfig({ ...config, logoSize: value[0] })
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfig({ ...config, logoUrl: undefined })}
                >
                  Remove Logo
                </Button>
              </div>
            )}
          </TabsContent>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsCustomizing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </Tabs>
      )}
    </div>
  );
}
