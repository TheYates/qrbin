"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeGenerator } from "./qr-code-generator";
import { toast } from "@/hooks/use-toast";
import {
  Globe,
  MessageSquare,
  Phone,
  Mail,
  Wifi,
  MapPin,
  CreditCard,
  Calendar,
  User,
  FileText,
} from "lucide-react";

export type QRCodeType =
  | "url"
  | "text"
  | "ussd"
  | "phone"
  | "sms"
  | "email"
  | "wifi"
  | "location"
  | "vcard"
  | "event";

interface QRCodeData {
  type: QRCodeType;
  content: string;
  title?: string;
  description?: string;
}

const qrCodeTypes = [
  {
    value: "url",
    label: "Website URL",
    icon: Globe,
    description: "Link to a website",
  },
  {
    value: "text",
    label: "Plain Text",
    icon: FileText,
    description: "Simple text message",
  },
  {
    value: "ussd",
    label: "USSD Code",
    icon: Phone,
    description: "Mobile service codes like *123#",
  },
  {
    value: "phone",
    label: "Phone Number",
    icon: Phone,
    description: "Call a phone number",
  },
  {
    value: "sms",
    label: "SMS Message",
    icon: MessageSquare,
    description: "Send a text message",
  },
  { value: "email", label: "Email", icon: Mail, description: "Send an email" },
  {
    value: "wifi",
    label: "WiFi Network",
    icon: Wifi,
    description: "Connect to WiFi",
  },
  {
    value: "location",
    label: "Location",
    icon: MapPin,
    description: "GPS coordinates",
  },
  {
    value: "vcard",
    label: "Contact Card",
    icon: User,
    description: "Contact information",
  },
  {
    value: "event",
    label: "Calendar Event",
    icon: Calendar,
    description: "Add to calendar",
  },
];

interface QRCodeCreatorProps {
  onQRCodeCreated?: () => void;
}

export function QRCodeCreator({ onQRCodeCreated }: QRCodeCreatorProps = {}) {
  const [selectedType, setSelectedType] = useState<QRCodeType>("url");
  const [qrData, setQrData] = useState<QRCodeData>({
    type: "url",
    content: "",
    title: "",
    description: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const generateQRContent = (type: QRCodeType, formData: any): string => {
    switch (type) {
      case "url":
        return formData.url;
      case "text":
        return formData.text;
      case "ussd":
        return formData.ussdCode;
      case "phone":
        return `tel:${formData.phoneNumber}`;
      case "sms":
        return `sms:${formData.phoneNumber}${
          formData.message
            ? `?body=${encodeURIComponent(formData.message)}`
            : ""
        }`;
      case "email":
        const emailParts = [`mailto:${formData.email}`];
        if (formData.subject)
          emailParts.push(`subject=${encodeURIComponent(formData.subject)}`);
        if (formData.body)
          emailParts.push(`body=${encodeURIComponent(formData.body)}`);
        return emailParts.length > 1
          ? `${emailParts[0]}?${emailParts.slice(1).join("&")}`
          : emailParts[0];
      case "wifi":
        return `WIFI:T:${formData.security};S:${formData.ssid};P:${
          formData.password
        };H:${formData.hidden ? "true" : "false"};;`;
      case "location":
        return `geo:${formData.latitude},${formData.longitude}`;
      case "vcard":
        return `BEGIN:VCARD
VERSION:3.0
FN:${formData.fullName}
ORG:${formData.organization || ""}
TEL:${formData.phone || ""}
EMAIL:${formData.email || ""}
URL:${formData.website || ""}
END:VCARD`;
      case "event":
        const startDate =
          new Date(formData.startDate)
            .toISOString()
            .replace(/[-:]/g, "")
            .split(".")[0] + "Z";
        const endDate =
          new Date(formData.endDate)
            .toISOString()
            .replace(/[-:]/g, "")
            .split(".")[0] + "Z";
        return `BEGIN:VEVENT
SUMMARY:${formData.title}
DTSTART:${startDate}
DTEND:${endDate}
DESCRIPTION:${formData.description || ""}
LOCATION:${formData.location || ""}
END:VEVENT`;
      default:
        return formData.content || "";
    }
  };

  const handleCreateQR = async (formData: any) => {
    setIsCreating(true);
    try {
      const content = generateQRContent(selectedType, formData);

      // For now, we'll create a "link" entry even for non-URL QR codes
      // This maintains compatibility with the existing database structure
      const response = await fetch("/api/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          content: content,
          title:
            qrData.title ||
            `${
              qrCodeTypes.find((t) => t.value === selectedType)?.label
            } QR Code`,
          description: qrData.description,
        }),
      });

      if (response.ok) {
        toast({
          title: "QR Code created!",
          description: "Your QR code has been created successfully.",
        });
        // Reset form
        setQrData({
          type: selectedType,
          content: "",
          title: "",
          description: "",
        });
        // Notify parent component
        onQRCodeCreated?.();
      } else {
        throw new Error("Failed to create QR code");
      }
    } catch (error) {
      console.error("Failed to create QR code:", error);
      toast({
        title: "Error",
        description: "Failed to create QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Create QR Code</CardTitle>
        <CardDescription>
          Generate QR codes for various types of content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* QR Code Type Selection */}
          <div>
            <Label>QR Code Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value: QRCodeType) => setSelectedType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select QR code type" />
              </SelectTrigger>
              <SelectContent>
                {qrCodeTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="QR Code title"
                value={qrData.title}
                onChange={(e) =>
                  setQrData({ ...qrData, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="QR Code description"
                value={qrData.description}
                onChange={(e) =>
                  setQrData({ ...qrData, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* Type-specific Forms */}
          <Tabs value={selectedType} className="w-full">
            <TabsList className="hidden" />

            <TabsContent value="url">
              <URLForm onSubmit={handleCreateQR} isCreating={isCreating} />
            </TabsContent>

            <TabsContent value="text">
              <TextForm onSubmit={handleCreateQR} isCreating={isCreating} />
            </TabsContent>

            <TabsContent value="ussd">
              <USSDForm onSubmit={handleCreateQR} isCreating={isCreating} />
            </TabsContent>

            <TabsContent value="phone">
              <PhoneForm onSubmit={handleCreateQR} isCreating={isCreating} />
            </TabsContent>

            <TabsContent value="sms">
              <SMSForm onSubmit={handleCreateQR} isCreating={isCreating} />
            </TabsContent>

            <TabsContent value="email">
              <EmailForm onSubmit={handleCreateQR} isCreating={isCreating} />
            </TabsContent>

            <TabsContent value="wifi">
              <WiFiForm onSubmit={handleCreateQR} isCreating={isCreating} />
            </TabsContent>

            <TabsContent value="location">
              <LocationForm onSubmit={handleCreateQR} isCreating={isCreating} />
            </TabsContent>

            <TabsContent value="vcard">
              <VCardForm onSubmit={handleCreateQR} isCreating={isCreating} />
            </TabsContent>

            <TabsContent value="event">
              <EventForm onSubmit={handleCreateQR} isCreating={isCreating} />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}

// URL Form Component
function URLForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: (data: any) => void;
  isCreating: boolean;
}) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onSubmit({ url });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="url">Website URL *</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isCreating || !url}>
        {isCreating ? "Creating..." : "Create QR Code"}
      </Button>
    </form>
  );
}

// Text Form Component
function TextForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: (data: any) => void;
  isCreating: boolean;
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;
    onSubmit({ text });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="text">Text Content *</Label>
        <Textarea
          id="text"
          placeholder="Enter your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={4}
        />
      </div>
      <Button type="submit" disabled={isCreating || !text}>
        {isCreating ? "Creating..." : "Create QR Code"}
      </Button>
    </form>
  );
}

// USSD Form Component
function USSDForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: (data: any) => void;
  isCreating: boolean;
}) {
  const [ussdCode, setUssdCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ussdCode) return;
    onSubmit({ ussdCode });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="ussd">USSD Code *</Label>
        <Input
          id="ussd"
          placeholder="*123# or *555*1234#"
          value={ussdCode}
          onChange={(e) => setUssdCode(e.target.value)}
          required
        />
        <p className="text-sm text-muted-foreground mt-1">
          Enter USSD codes like *123# for balance check, *555*1234# for airtime
          transfer, etc.
        </p>
      </div>
      <Button type="submit" disabled={isCreating || !ussdCode}>
        {isCreating ? "Creating..." : "Create QR Code"}
      </Button>
    </form>
  );
}

// Phone Form Component
function PhoneForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: (data: any) => void;
  isCreating: boolean;
}) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    onSubmit({ phoneNumber });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1234567890"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isCreating || !phoneNumber}>
        {isCreating ? "Creating..." : "Create QR Code"}
      </Button>
    </form>
  );
}

// SMS Form Component
function SMSForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: (data: any) => void;
  isCreating: boolean;
}) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    onSubmit({ phoneNumber, message });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="sms-phone">Phone Number *</Label>
        <Input
          id="sms-phone"
          type="tel"
          placeholder="+1234567890"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="sms-message">Message (optional)</Label>
        <Textarea
          id="sms-message"
          placeholder="Pre-filled message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
      </div>
      <Button type="submit" disabled={isCreating || !phoneNumber}>
        {isCreating ? "Creating..." : "Create QR Code"}
      </Button>
    </form>
  );
}

// Email Form Component
function EmailForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: (data: any) => void;
  isCreating: boolean;
}) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onSubmit({ email, subject, body });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="email-subject">Subject (optional)</Label>
        <Input
          id="email-subject"
          placeholder="Email subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="email-body">Message (optional)</Label>
        <Textarea
          id="email-body"
          placeholder="Email message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
        />
      </div>
      <Button type="submit" disabled={isCreating || !email}>
        {isCreating ? "Creating..." : "Create QR Code"}
      </Button>
    </form>
  );
}

// WiFi Form Component
function WiFiForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: (data: any) => void;
  isCreating: boolean;
}) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState("WPA");
  const [hidden, setHidden] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssid) return;
    onSubmit({ ssid, password, security, hidden });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="wifi-ssid">Network Name (SSID) *</Label>
        <Input
          id="wifi-ssid"
          placeholder="MyWiFiNetwork"
          value={ssid}
          onChange={(e) => setSsid(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="wifi-password">Password</Label>
        <Input
          id="wifi-password"
          type="password"
          placeholder="WiFi password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="wifi-security">Security Type</Label>
        <Select value={security} onValueChange={setSecurity}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WPA">WPA/WPA2</SelectItem>
            <SelectItem value="WEP">WEP</SelectItem>
            <SelectItem value="nopass">Open (No Password)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="wifi-hidden"
          checked={hidden}
          onCheckedChange={setHidden}
        />
        <Label htmlFor="wifi-hidden">Hidden Network</Label>
      </div>
      <Button type="submit" disabled={isCreating || !ssid}>
        {isCreating ? "Creating..." : "Create QR Code"}
      </Button>
    </form>
  );
}

// Location Form Component
function LocationForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: (data: any) => void;
  isCreating: boolean;
}) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!latitude || !longitude) return;
    onSubmit({ latitude, longitude });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Could not get your current location.",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude *</Label>
          <Input
            id="latitude"
            placeholder="40.7128"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude *</Label>
          <Input
            id="longitude"
            placeholder="-74.0060"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="button" variant="outline" onClick={getCurrentLocation}>
        Use Current Location
      </Button>
      <Button type="submit" disabled={isCreating || !latitude || !longitude}>
        {isCreating ? "Creating..." : "Create QR Code"}
      </Button>
    </form>
  );
}

// VCard Form Component
function VCardForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: (data: any) => void;
  isCreating: boolean;
}) {
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;
    onSubmit({ fullName, organization, phone, email, website });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="vcard-name">Full Name *</Label>
        <Input
          id="vcard-name"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="vcard-org">Organization</Label>
        <Input
          id="vcard-org"
          placeholder="Company Name"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vcard-phone">Phone</Label>
          <Input
            id="vcard-phone"
            type="tel"
            placeholder="+1234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="vcard-email">Email</Label>
          <Input
            id="vcard-email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="vcard-website">Website</Label>
        <Input
          id="vcard-website"
          type="url"
          placeholder="https://example.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isCreating || !fullName}>
        {isCreating ? "Creating..." : "Create QR Code"}
      </Button>
    </form>
  );
}

// Event Form Component
function EventForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: (data: any) => void;
  isCreating: boolean;
}) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;
    onSubmit({ title, startDate, endDate, description, location });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="event-title">Event Title *</Label>
        <Input
          id="event-title"
          placeholder="Meeting with team"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event-start">Start Date & Time *</Label>
          <Input
            id="event-start"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="event-end">End Date & Time *</Label>
          <Input
            id="event-end"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="event-location">Location</Label>
        <Input
          id="event-location"
          placeholder="Conference Room A"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="event-description">Description</Label>
        <Textarea
          id="event-description"
          placeholder="Event description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <Button
        type="submit"
        disabled={isCreating || !title || !startDate || !endDate}
      >
        {isCreating ? "Creating..." : "Create QR Code"}
      </Button>
    </form>
  );
}
