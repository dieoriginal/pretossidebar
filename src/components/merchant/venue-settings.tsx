"use client";

import React, { useEffect, useState } from "react";
import {
    Building2,
    Save,
    MapPin,
    Users,
    Phone,
    Mail,
    Globe,
    Camera,
    Instagram,
    Facebook,
    Music,
    Clock,
    CreditCard,
    FileText,
    Info,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    getVenue,
    updateVenue,
    getAllVenues,
    Venue
} from "@/lib/venuesDb";
import VenuesMap from "@/components/venues/VenuesMap";
import { toast } from "sonner";

export default function MerchantVenueSettings() {
    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    useEffect(() => {
        async function loadData() {
            try {
                const venues = await getAllVenues();
                if (venues.length > 0) {
                    // For demo, pick the first one
                    setVenue(venues[0]);
                }
            } catch (error) {
                console.error("Error loading venue:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleSave = async () => {
        if (!venue) return;
        setSaving(true);
        try {
            await updateVenue(venue.id, venue);
            toast.success("Venue profile updated successfully!");
        } catch (error) {
            console.error("Error saving venue:", error);
            toast.error("Failed to update venue profile.");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof Venue, value: any) => {
        if (!venue) return;
        setVenue({ ...venue, [field]: value });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!venue) {
        return (
            <div className="text-center p-12 bg-muted/50 rounded-xl border border-dashed">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No venue profile found</h3>
                <p className="text-muted-foreground mt-2">Create your venue profile to get started.</p>
                <Button className="mt-4">Create Profile</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Venue Settings</h1>
                    <p className="text-muted-foreground">Manage your venue's public profile, technical details, and logistics.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="general" className="gap-2">
                        <Info className="h-4 w-4" /> General
                    </TabsTrigger>
                    <TabsTrigger value="technical" className="gap-2">
                        <Music className="h-4 w-4" /> Technical
                    </TabsTrigger>
                    <TabsTrigger value="logistics" className="gap-2">
                        <Clock className="h-4 w-4" /> Logistics
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="gap-2">
                        <CreditCard className="h-4 w-4" /> Financial
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Core Information</CardTitle>
                                <CardDescription>Public details that users will see on the platform.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Venue Name</Label>
                                        <Input
                                            id="name"
                                            value={venue.name}
                                            onChange={(e) => updateField("name", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={venue.city || ""}
                                            onChange={(e) => updateField("city", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <div className="space-y-4">
                                        <Input
                                            id="address"
                                            value={venue.address || ""}
                                            onChange={(e) => updateField("address", e.target.value)}
                                            placeholder="Full street address"
                                        />
                                        <div className="h-64 mt-2">
                                            <VenuesMap venues={[venue]} />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">Capacity (Pax)</Label>
                                        <Input
                                            id="capacity"
                                            value={venue.capacity || ""}
                                            onChange={(e) => updateField("capacity", e.target.value)}
                                            placeholder="e.g. 50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="url">Website URL</Label>
                                        <Input
                                            id="url"
                                            value={venue.url || ""}
                                            onChange={(e) => updateField("url", e.target.value)}
                                            placeholder="https://yourvenue.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Venue Description / Bio</Label>
                                    <Textarea
                                        id="notes"
                                        rows={4}
                                        value={venue.notes || ""}
                                        onChange={(e) => updateField("notes", e.target.value)}
                                        placeholder="Tell users about your venue..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactName">Manager Name</Label>
                                        <Input
                                            id="contactName"
                                            value={venue.contactName || ""}
                                            onChange={(e) => updateField("contactName", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactEmail">Contact Email</Label>
                                        <Input
                                            id="contactEmail"
                                            value={venue.contactEmail || ""}
                                            onChange={(e) => updateField("contactEmail", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactPhone">Contact Phone</Label>
                                        <Input
                                            id="contactPhone"
                                            value={venue.contactPhone || ""}
                                            onChange={(e) => updateField("contactPhone", e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Social Media</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Instagram className="h-4 w-4 text-pink-500" />
                                        <Input
                                            placeholder="Instagram URL"
                                            value={venue.instagramUrl || ""}
                                            onChange={(e) => updateField("instagramUrl", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Facebook className="h-4 w-4 text-blue-600" />
                                        <Input
                                            placeholder="Facebook URL"
                                            value={venue.facebookUrl || ""}
                                            onChange={(e) => updateField("facebookUrl", e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="technical" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Technical Infrastructure</CardTitle>
                            <CardDescription>Details about your PA, lighting, and stage equipment.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="equipment">Audio/Video Equipment</Label>
                                <Textarea
                                    id="equipment"
                                    rows={6}
                                    value={venue.equipment || ""}
                                    onChange={(e) => updateField("equipment", e.target.value)}
                                    placeholder="List PA system, microphones, mixer, backline, etc."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="technicalRider">Technical Rider Policy</Label>
                                <Input
                                    id="technicalRider"
                                    value={venue.technicalRider || ""}
                                    onChange={(e) => updateField("technicalRider", e.target.value)}
                                    placeholder="e.g. Contact technical@venue.com for latest rider"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roomConfiguration">Room Configuration</Label>
                                <Select
                                    value={venue.roomConfiguration || "standing"}
                                    onValueChange={(v) => updateField("roomConfiguration", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select configuration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="standing">Mainly Standing</SelectItem>
                                        <SelectItem value="seated">Fully Seated</SelectItem>
                                        <SelectItem value="mixed">Mixed (Standing & Seated)</SelectItem>
                                        <SelectItem value="tables">CabaretStyle / Tables</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logistics" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Timing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="openingHours">Standard Opening Hours</Label>
                                    <Input
                                        id="openingHours"
                                        value={venue.openingHours || ""}
                                        onChange={(e) => updateField("openingHours", e.target.value)}
                                        placeholder="e.g. Mon-Fri 18:00 - 02:00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="curfew">Curfew / Noise Limits</Label>
                                    <Input
                                        id="curfew"
                                        value={venue.curfew || ""}
                                        onChange={(e) => updateField("curfew", e.target.value)}
                                        placeholder="e.g. Live music must end by 23:00"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="loadIn">Load-in Window</Label>
                                        <Input
                                            id="loadIn"
                                            value={venue.loadIn || ""}
                                            onChange={(e) => updateField("loadIn", e.target.value)}
                                            placeholder="16:00 - 18:00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="loadOut">Load-out Window</Label>
                                        <Input
                                            id="loadOut"
                                            value={venue.loadOut || ""}
                                            onChange={(e) => updateField("loadOut", e.target.value)}
                                            placeholder="End of show + 1hr"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Staff & Access</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="access">Loading Access</Label>
                                    <Textarea
                                        id="access"
                                        value={venue.access || ""}
                                        onChange={(e) => updateField("access", e.target.value)}
                                        placeholder="e.g. Ramp available, narrow elevator, street level..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="doorStaff">Door/Security Staff</Label>
                                    <Input
                                        id="doorStaff"
                                        value={venue.doorStaff || ""}
                                        onChange={(e) => updateField("doorStaff", e.target.value)}
                                        placeholder="e.g. Venue provides 2 security guards"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="technicalStaff">Sound/Light Engineer</Label>
                                    <Input
                                        id="technicalStaff"
                                        value={venue.technicalStaff || ""}
                                        onChange={(e) => updateField("technicalStaff", e.target.value)}
                                        placeholder="e.g. Inhouse tech included in rental"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial & Billing Information</CardTitle>
                            <CardDescription>Standard agreements and payment terms for events.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="remunerationModel">Default Remuneration Model</Label>
                                    <Select
                                        value={venue.remunerationModel || "negotiable"}
                                        onValueChange={(v) => updateField("remunerationModel", v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flat">Flat Fee (Rental)</SelectItem>
                                            <SelectItem value="bar_split">Bar Split</SelectItem>
                                            <SelectItem value="percentage">Ticket % Split</SelectItem>
                                            <SelectItem value="minimum_guaranteed">Minimum Guaranteed</SelectItem>
                                            <SelectItem value="negotiable">Case-by-Case Negotiable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="agreement">Standard Agreement Details</Label>
                                    <Input
                                        id="agreement"
                                        value={venue.agreement || ""}
                                        onChange={(e) => updateField("agreement", e.target.value)}
                                        placeholder="e.g. 70/30 split in favor of artist"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nif">Tax ID (NIF)</Label>
                                    <Input
                                        id="nif"
                                        value={venue.nif || ""}
                                        onChange={(e) => updateField("nif", e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="responsibleEntity">Responsible Entity Name</Label>
                                    <Input
                                        id="responsibleEntity"
                                        value={venue.responsibleEntity || ""}
                                        onChange={(e) => updateField("responsibleEntity", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
                                    <Input
                                        id="paymentMethod"
                                        value={venue.paymentMethod || ""}
                                        onChange={(e) => updateField("paymentMethod", e.target.value)}
                                        placeholder="e.g. Bank Transfer / SEPA"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                                    <Input
                                        id="paymentTerms"
                                        value={venue.paymentTerms || ""}
                                        onChange={(e) => updateField("paymentTerms", e.target.value)}
                                        placeholder="e.g. NET 30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="billingConditions">Further Billing Conditions</Label>
                                <Textarea
                                    id="billingConditions"
                                    value={venue.billingConditions || ""}
                                    onChange={(e) => updateField("billingConditions", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Copyright & Reporting</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="spaNumber">SPA / Collective Licensing Number</Label>
                                <Input
                                    id="spaNumber"
                                    value={venue.spaNumber || ""}
                                    onChange={(e) => updateField("spaNumber", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reportPolicy">Setlist Reporting Policy</Label>
                                <Input
                                    id="reportPolicy"
                                    value={venue.reportPolicy || ""}
                                    onChange={(e) => updateField("reportPolicy", e.target.value)}
                                    placeholder="e.g. Venue reports to SPA automatically"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
