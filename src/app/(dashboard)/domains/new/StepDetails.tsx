"use client";

import { useBuilderStore } from "@/store/builder-store";
import { domainApi } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

const DURATION_OPTIONS = [
  { value: 1, label: "1 month" },
  { value: 3, label: "3 months" },
  { value: 6, label: "6 months" },
];

export function StepDetails() {
  const { details, setDetails, setStep, setSavedDomainId, savedDomainId } = useBuilderStore();
  const [loading, setLoading] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setDetails({ title: val, iconUrl: details.iconUrl });
    // We store slug as derived — no separate field in store needed;
    // the API generates it server-side. We just show it as preview.
    (document.getElementById("slug-preview") as HTMLInputElement | null)!.value = slug;
  };

  const toggleDuration = (val: number) => {
    const current = details.durationOptions;
    if (current.includes(val)) {
      if (current.length === 1) return; // keep at least one
      setDetails({ durationOptions: current.filter((v) => v !== val) });
    } else {
      setDetails({ durationOptions: [...current, val].sort((a, b) => a - b) });
    }
  };

  const handleNext = async () => {
    if (!details.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!details.isFree && !details.priceINR) {
      toast.error("Set a price or mark as free");
      return;
    }

    setLoading(true);
    try {
      // Only create in DB if not yet saved
      if (!savedDomainId) {
        const res = await domainApi.create({
          title: details.title,
          description: details.description || undefined,
          iconUrl: details.iconUrl || undefined,
          bannerUrl: details.bannerUrl || undefined,
          priceINR: details.priceINR ? parseFloat(details.priceINR) : undefined,
          priceMYR: details.priceMYR ? parseFloat(details.priceMYR) : undefined,
          isFree: details.isFree,
          durationOptions: details.durationOptions,
          isFeatured: details.isFeatured,
        });
        setSavedDomainId(res.data.id);
        toast.success("Domain created — now build the curriculum");
      }
      setStep(1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Slug */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g. Frontend Development Internship"
            value={details.title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug-preview">
            Slug{" "}
            <span className="text-muted-foreground text-xs font-normal">(auto-generated)</span>
          </Label>
          <Input
            id="slug-preview"
            className="font-mono text-sm text-muted-foreground"
            readOnly
            defaultValue=""
            placeholder="frontend-development-internship"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="What will learners gain from this internship?"
            className="min-h-[100px]"
            value={details.description}
            onChange={(e) => setDetails({ description: e.target.value })}
          />
        </div>
      </div>

      <Separator />

      {/* Pricing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Pricing</p>
            <p className="text-xs text-muted-foreground">Set prices in both currencies</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="free"
              checked={details.isFree}
              onCheckedChange={(v) => setDetails({ isFree: v })}
            />
            <Label htmlFor="free" className="text-sm cursor-pointer">
              Free
            </Label>
          </div>
        </div>

        {!details.isFree && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceINR">Price (INR ₹)</Label>
              <Input
                id="priceINR"
                type="number"
                placeholder="4999"
                value={details.priceINR}
                onChange={(e) => setDetails({ priceINR: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMYR">Price (MYR RM)</Label>
              <Input
                id="priceMYR"
                type="number"
                placeholder="249"
                value={details.priceMYR}
                onChange={(e) => setDetails({ priceMYR: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Duration options */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">Duration options</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Shown to learners at enrollment — pick all that apply
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {DURATION_OPTIONS.map((opt) => {
            const active = details.durationOptions.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleDuration(opt.value)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/40"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Featured */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Feature on homepage</p>
          <p className="text-xs text-muted-foreground">
            Pinned to the top of the public listing
          </p>
        </div>
        <Switch
          checked={details.isFeatured}
          onCheckedChange={(v) => setDetails({ isFeatured: v })}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleNext} disabled={loading} className="min-w-[160px]">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Continue to curriculum →"
          )}
        </Button>
      </div>
    </div>
  );
}
