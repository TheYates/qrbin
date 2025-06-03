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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Save, Trash2, Download, Upload } from "lucide-react";

export function SettingsPage() {
  const [settings, setSettings] = useState({
    defaultDomain: "",
    customDomain: "",
    enableAnalytics: true,
    enableQRCodes: true,
    defaultQRSize: 200,
    defaultQRColor: "#000000",
    defaultQRBackground: "#ffffff",
    linkExpiration: false,
    expirationDays: 30,
  });

  // Set default domain after component mounts to avoid SSR issues
  useEffect(() => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      defaultDomain: window.location.origin,
    }));
  }, []);

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Settings saved!",
      description: "Your settings have been updated successfully.",
    });
  };

  const exportData = () => {
    // In a real app, this would export user data
    toast({
      title: "Export started!",
      description: "Your data export will be ready shortly.",
    });
  };

  const importData = () => {
    // In a real app, this would handle data import
    toast({
      title: "Import feature",
      description: "Data import functionality coming soon.",
    });
  };

  const deleteAllData = () => {
    if (
      confirm(
        "Are you sure you want to delete all your data? This action cannot be undone."
      )
    ) {
      toast({
        title: "Data deletion",
        description: "This would delete all data in a real application.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure your basic application settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="defaultDomain">Default Domain</Label>
            <Input
              id="defaultDomain"
              value={settings.defaultDomain}
              onChange={(e) =>
                setSettings({ ...settings, defaultDomain: e.target.value })
              }
              placeholder="https://your-domain.com"
            />
            <p className="text-sm text-muted-foreground">
              The domain used for your shortened links
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
            <Input
              id="customDomain"
              value={settings.customDomain}
              onChange={(e) =>
                setSettings({ ...settings, customDomain: e.target.value })
              }
              placeholder="https://short.yourdomain.com"
            />
            <p className="text-sm text-muted-foreground">
              Use your own custom domain for branding
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Track clicks and gather insights
              </p>
            </div>
            <Switch
              checked={settings.enableAnalytics}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableAnalytics: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable QR Codes</Label>
              <p className="text-sm text-muted-foreground">
                Generate QR codes for all links
              </p>
            </div>
            <Switch
              checked={settings.enableQRCodes}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableQRCodes: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* QR Code Settings */}
      <Card>
        <CardHeader>
          <CardTitle>QR Code Defaults</CardTitle>
          <CardDescription>
            Set default appearance for new QR codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qrSize">Default Size (px)</Label>
              <Input
                id="qrSize"
                type="number"
                min="100"
                max="500"
                value={settings.defaultQRSize}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultQRSize: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qrColor">Default Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="qrColor"
                  type="color"
                  value={settings.defaultQRColor}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultQRColor: e.target.value })
                  }
                  className="w-12 h-8 p-1"
                />
                <Input
                  type="text"
                  value={settings.defaultQRColor}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultQRColor: e.target.value })
                  }
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qrBackground">Default Background</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="qrBackground"
                  type="color"
                  value={settings.defaultQRBackground}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultQRBackground: e.target.value,
                    })
                  }
                  className="w-12 h-8 p-1"
                />
                <Input
                  type="text"
                  value={settings.defaultQRBackground}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultQRBackground: e.target.value,
                    })
                  }
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Link Management */}
      <Card>
        <CardHeader>
          <CardTitle>Link Management</CardTitle>
          <CardDescription>Configure how your links behave</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Link Expiration</Label>
              <p className="text-sm text-muted-foreground">
                Automatically expire links after a set time
              </p>
            </div>
            <Switch
              checked={settings.linkExpiration}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, linkExpiration: checked })
              }
            />
          </div>

          {settings.linkExpiration && (
            <div className="space-y-2">
              <Label htmlFor="expirationDays">Expiration Period (days)</Label>
              <Input
                id="expirationDays"
                type="number"
                min="1"
                max="365"
                value={settings.expirationDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    expirationDays: Number(e.target.value),
                  })
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export, import, or delete your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={importData} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-destructive">Danger Zone</Label>
            <p className="text-sm text-muted-foreground">
              Permanently delete all your links, QR codes, and analytics data
            </p>
            <Button onClick={deleteAllData} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>Your current usage and limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">Active Links</div>
              <Badge variant="secondary" className="mt-1">
                Unlimited
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">318</div>
              <div className="text-sm text-muted-foreground">Total Clicks</div>
              <Badge variant="secondary" className="mt-1">
                Unlimited
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">QR Codes</div>
              <Badge variant="secondary" className="mt-1">
                Unlimited
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
