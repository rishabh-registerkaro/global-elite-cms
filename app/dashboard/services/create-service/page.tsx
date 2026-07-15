"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  FileText,
  Image as ImageIcon,
  Mic,
  ShoppingBasket,
  ListOrdered,
  Tag,
  Sparkles,
  Plug,
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VOChefFormData {
  slug: string;
  metaTitle: string;
  metaDescription: string;

  heroSection: {
    versionTag: string;
    title: string;
    heading: string;
    subHeading: string;
    description: string;
    ctaPrimaryText: string;
    ctaPrimaryUrl: string;
    ctaSecondaryText: string;
    ctaSecondaryUrl: string;
    ratingScore: string;
    ratingCount: string;
    phoneMockupImageUrl: string;
  };

  featuresSection: {
    features: Array<{ iconName: string; title: string; body: string; href: string }>;
  };

  pantryScannerSection: {
    tagText: string;
    heading: string;
    subHeading: string;
    bullets: string[];
    ctaText: string;
    ctaHref: string;
    imageUrl: string;
  };

  voiceListeningSection: {
    tagText: string;
    heading: string;
    subHeading: string;
    sampleQuote: string;
    languageTag: string;
    stats: Array<{ value: string; label: string }>;
    ctaText: string;
    ctaHref: string;
    imageUrl: string;
  };

  howItWorksSection: {
    heading: string;
    subHeading: string;
    steps: Array<{ label: string; title: string; body: string }>;
  };

  pricingSection: {
    tagText: string;
    heading: string;
    subHeading: string;
    plans: Array<{
      planLabel: string;
      planName: string;
      price: string;
      currency: string;
      billingNote: string;
      badge: string;
      features: string[];
      ctaText: string;
      ctaUrl: string;
      launchDate: string;
      refundNote: string;
    }>;
  };

  integrationsSection: {
    heading: string;
    subHeading: string;
    integrations: Array<{
      platformName: string;
      imageUrl: string;
      status: string;
      whatItDoes: string;
    }>;
  };

  status: "draft" | "published";
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultFormData: VOChefFormData = {
  slug: "",
  metaTitle: "",
  metaDescription: "",

  heroSection: {
    versionTag: "",
    title: "",
    heading: "",
    subHeading: "",
    description: "",
    ctaPrimaryText: "",
    ctaPrimaryUrl: "",
    ctaSecondaryText: "",
    ctaSecondaryUrl: "",
    ratingScore: "",
    ratingCount: "",
    phoneMockupImageUrl: "",
  },

  featuresSection: {
    features: [],
  },

  pantryScannerSection: {
    tagText: "",
    heading: "",
    subHeading: "",
    bullets: [""],
    ctaText: "",
    ctaHref: "",
    imageUrl: "",
  },

  voiceListeningSection: {
    tagText: "",
    heading: "",
    subHeading: "",
    sampleQuote: "",
    languageTag: "",
    stats: [],
    ctaText: "",
    ctaHref: "",
    imageUrl: "",
  },

  howItWorksSection: {
    heading: "",
    subHeading: "",
    steps: [],
  },

  pricingSection: {
    tagText: "",
    heading: "",
    subHeading: "",
    plans: [
      {
        planLabel: "",
        planName: "",
        price: "",
        currency: "₹",
        billingNote: "",
        badge: "",
        features: [""],
        ctaText: "",
        ctaUrl: "",
        launchDate: "",
        refundNote: "",
      },
    ],
  },

  integrationsSection: {
    heading: "",
    subHeading: "",
    integrations: [],
  },

  status: "draft",
};

// ─── Shared style constants ────────────────────────────────────────────────────

const inputCls = "bg-slate-900/60 border-slate-600 text-white placeholder-slate-400";
const textareaCls =
  "w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 resize-y";
const cardWrapCls = "bg-slate-800/30 p-4 rounded-lg border border-slate-700";
const emptyStateCls =
  "text-center py-6 text-slate-500 border border-dashed border-slate-700 rounded-lg";

// ─── Section header helper ─────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
  open,
  ...rest
}: {
  icon: React.ElementType;
  label: string;
  open: boolean;
  [key: string]: any;
}) {
  return (
    <button {...rest} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-indigo-400" />
        <span className="text-lg font-semibold text-white">{label}</span>
      </div>
      {open ? (
        <ChevronDown className="h-5 w-5 text-slate-400" />
      ) : (
        <ChevronRight className="h-5 w-5 text-slate-400" />
      )}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateServicePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<VOChefFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  const [openSections, setOpenSections] = useState({
    meta: true,
    hero: true,
    features: true,
    pantry: false,
    voice: false,
    howItWorks: false,
    pricing: false,
    integrations: false,
  });

  const toggleSection = (s: keyof typeof openSections) =>
    setOpenSections((p) => ({ ...p, [s]: !p[s] }));

  const generateSlug = (t: string) =>
    t
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // ── Generic updaters ──────────────────────────────────────────────────────

  const updateMeta = (field: string, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const updateHero = (field: string, value: string) =>
    setFormData((p) => {
      const updated = { ...p, heroSection: { ...p.heroSection, [field]: value } };
      if (field === "title" && autoGenerateSlug) updated.slug = generateSlug(value);
      return updated;
    });

  const updatePantry = (field: string, value: string) =>
    setFormData((p) => ({
      ...p,
      pantryScannerSection: { ...p.pantryScannerSection, [field]: value },
    }));

  const updateVoice = (field: string, value: string) =>
    setFormData((p) => ({
      ...p,
      voiceListeningSection: { ...p.voiceListeningSection, [field]: value },
    }));

  const updateHowItWorks = (field: string, value: string) =>
    setFormData((p) => ({
      ...p,
      howItWorksSection: { ...p.howItWorksSection, [field]: value },
    }));

  const updatePricing = (field: string, value: string) =>
    setFormData((p) => ({ ...p, pricingSection: { ...p.pricingSection, [field]: value } }));

  // ── Features section ──────────────────────────────────────────────────────

  const addFeature = () =>
    setFormData((p) => ({
      ...p,
      featuresSection: {
        features: [...p.featuresSection.features, { iconName: "", title: "", body: "", href: "" }],
      },
    }));

  const updateFeature = (i: number, field: string, value: string) =>
    setFormData((p) => {
      const updated = [...p.featuresSection.features];
      updated[i] = { ...updated[i], [field]: value };
      return { ...p, featuresSection: { features: updated } };
    });

  const removeFeature = (i: number) =>
    setFormData((p) => ({
      ...p,
      featuresSection: { features: p.featuresSection.features.filter((_, idx) => idx !== i) },
    }));

  // ── Pantry bullets ────────────────────────────────────────────────────────

  const addBullet = () =>
    setFormData((p) => ({
      ...p,
      pantryScannerSection: {
        ...p.pantryScannerSection,
        bullets: [...p.pantryScannerSection.bullets, ""],
      },
    }));

  const updateBullet = (i: number, value: string) =>
    setFormData((p) => {
      const updated = [...p.pantryScannerSection.bullets];
      updated[i] = value;
      return { ...p, pantryScannerSection: { ...p.pantryScannerSection, bullets: updated } };
    });

  const removeBullet = (i: number) =>
    setFormData((p) => ({
      ...p,
      pantryScannerSection: {
        ...p.pantryScannerSection,
        bullets: p.pantryScannerSection.bullets.filter((_, idx) => idx !== i),
      },
    }));

  // ── Voice stats ───────────────────────────────────────────────────────────

  const addStat = () =>
    setFormData((p) => ({
      ...p,
      voiceListeningSection: {
        ...p.voiceListeningSection,
        stats: [...p.voiceListeningSection.stats, { value: "", label: "" }],
      },
    }));

  const updateStat = (i: number, field: string, value: string) =>
    setFormData((p) => {
      const updated = [...p.voiceListeningSection.stats];
      updated[i] = { ...updated[i], [field]: value };
      return { ...p, voiceListeningSection: { ...p.voiceListeningSection, stats: updated } };
    });

  const removeStat = (i: number) =>
    setFormData((p) => ({
      ...p,
      voiceListeningSection: {
        ...p.voiceListeningSection,
        stats: p.voiceListeningSection.stats.filter((_, idx) => idx !== i),
      },
    }));

  // ── HowItWorks steps ──────────────────────────────────────────────────────

  const addStep = () =>
    setFormData((p) => ({
      ...p,
      howItWorksSection: {
        ...p.howItWorksSection,
        steps: [...p.howItWorksSection.steps, { label: "", title: "", body: "" }],
      },
    }));

  const updateStep = (i: number, field: string, value: string) =>
    setFormData((p) => {
      const updated = [...p.howItWorksSection.steps];
      updated[i] = { ...updated[i], [field]: value };
      return { ...p, howItWorksSection: { ...p.howItWorksSection, steps: updated } };
    });

  const removeStep = (i: number) =>
    setFormData((p) => ({
      ...p,
      howItWorksSection: {
        ...p.howItWorksSection,
        steps: p.howItWorksSection.steps.filter((_, idx) => idx !== i),
      },
    }));

  // ── Pricing plans ─────────────────────────────────────────────────────────

  const addPlan = () =>
    setFormData((p) => ({
      ...p,
      pricingSection: {
        ...p.pricingSection,
        plans: [
          ...p.pricingSection.plans,
          {
            planLabel: "",
            planName: "",
            price: "",
            currency: "₹",
            billingNote: "",
            badge: "",
            features: [""],
            ctaText: "",
            ctaUrl: "",
            launchDate: "",
            refundNote: "",
          },
        ],
      },
    }));

  const removePlan = (pi: number) =>
    setFormData((p) => ({
      ...p,
      pricingSection: {
        ...p.pricingSection,
        plans: p.pricingSection.plans.filter((_, idx) => idx !== pi),
      },
    }));

  const updatePlan = (pi: number, field: string, value: string) =>
    setFormData((p) => {
      const updated = [...p.pricingSection.plans];
      updated[pi] = { ...updated[pi], [field]: value };
      return { ...p, pricingSection: { ...p.pricingSection, plans: updated } };
    });

  const addPlanFeature = (pi: number) =>
    setFormData((p) => {
      const updated = [...p.pricingSection.plans];
      updated[pi] = { ...updated[pi], features: [...updated[pi].features, ""] };
      return { ...p, pricingSection: { ...p.pricingSection, plans: updated } };
    });

  const updatePlanFeature = (pi: number, fi: number, value: string) =>
    setFormData((p) => {
      const updatedPlans = [...p.pricingSection.plans];
      const updatedFeatures = [...updatedPlans[pi].features];
      updatedFeatures[fi] = value;
      updatedPlans[pi] = { ...updatedPlans[pi], features: updatedFeatures };
      return { ...p, pricingSection: { ...p.pricingSection, plans: updatedPlans } };
    });

  const removePlanFeature = (pi: number, fi: number) =>
    setFormData((p) => {
      const updatedPlans = [...p.pricingSection.plans];
      updatedPlans[pi] = {
        ...updatedPlans[pi],
        features: updatedPlans[pi].features.filter((_, idx) => idx !== fi),
      };
      return { ...p, pricingSection: { ...p.pricingSection, plans: updatedPlans } };
    });

  // ── Integrations ─────────────────────────────────────────────────────────

  const updateIntegrationsHeader = (field: string, value: string) =>
    setFormData((p) => ({
      ...p,
      integrationsSection: { ...p.integrationsSection, [field]: value },
    }));

  const addIntegration = () =>
    setFormData((p) => ({
      ...p,
      integrationsSection: {
        ...p.integrationsSection,
        integrations: [
          ...p.integrationsSection.integrations,
          { platformName: "", imageUrl: "", status: "", whatItDoes: "" },
        ],
      },
    }));

  const removeIntegration = (i: number) =>
    setFormData((p) => ({
      ...p,
      integrationsSection: {
        ...p.integrationsSection,
        integrations: p.integrationsSection.integrations.filter((_, idx) => idx !== i),
      },
    }));

  const updateIntegration = (i: number, field: string, value: string) =>
    setFormData((p) => {
      const updated = [...p.integrationsSection.integrations];
      updated[i] = { ...updated[i], [field]: value };
      return { ...p, integrationsSection: { ...p.integrationsSection, integrations: updated } };
    });

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (status: "draft" | "published") => {
    if (!formData.slug.trim()) {
      toast.error("Please enter a slug", { closeButton: true });
      return;
    }
    if (!formData.heroSection.heading.trim()) {
      toast.error("Please enter a hero heading", { closeButton: true });
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading(
      status === "published" ? "Publishing..." : "Saving draft...",
      { closeButton: true }
    );

    try {
      const payload = {
        ...formData,
        status,
        pantryScannerSection: {
          ...formData.pantryScannerSection,
          bullets: formData.pantryScannerSection.bullets.filter((b) => b.trim()),
        },
        pricingSection: {
          ...formData.pricingSection,
          plans: formData.pricingSection.plans.map((plan) => ({
            ...plan,
            features: plan.features.filter((f) => f.trim()),
          })),
        },
        integrationsSection: {
          ...formData.integrationsSection,
          integrations: formData.integrationsSection.integrations.filter(
            (item) => item.platformName.trim()
          ),
        },
        featuresSection: {
          features: formData.featuresSection.features.filter(
            (f) => f.title.trim() && f.body.trim()
          ),
        },
        howItWorksSection: {
          ...formData.howItWorksSection,
          steps: formData.howItWorksSection.steps.filter((s) => s.title.trim() && s.body.trim()),
        },
        voiceListeningSection: {
          ...formData.voiceListeningSection,
          stats: formData.voiceListeningSection.stats.filter(
            (s) => s.value.trim() && s.label.trim()
          ),
        },
      };

      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      toast.dismiss(loadingToastId);

      if (res.ok) {
        toast.success(data.message || "Created successfully!", { closeButton: true });
        setTimeout(() => router.push("/dashboard/services"), 1000);
      } else {
        toast.error(data.message || "Failed to create", { closeButton: true });
      }
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      toast.error(error.message || "Something went wrong", { closeButton: true });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Create VOChef Page</h1>
          <p className="text-slate-400">Fill in content for each section of the VOChef product page</p>
        </div>

        {/* Formatting tip — heading fields across sections support *asterisk* markup */}
        <div className="mb-4 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <span className="mt-0.5 shrink-0">ⓘ</span>
          <div>
            <span className="font-semibold">Formatting tip:</span> In heading fields, wrap a word with{" "}
            <code className="rounded bg-amber-500/20 px-1 py-0.5 font-mono text-xs">*asterisks*</code>{" "}
            to render it in the brand accent color and italic style on the live site.
            <div className="mt-1 font-mono text-xs text-amber-400/80">
              Example: <code className="rounded bg-amber-500/20 px-1 py-0.5">Cook smarter with *AI-powered* recipes.</code>
            </div>
          </div>
        </div>

        <div className="space-y-4">

          {/* ── SEO / Meta ─────────────────────────────────────────────────── */}
          <Collapsible.Root open={openSections.meta} onOpenChange={() => toggleSection("meta")}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <SectionHeader icon={FileText} label="SEO / Meta" open={openSections.meta} />
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 space-y-4 border-t border-white/10">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-200">
                        Slug <span className="text-red-400">*</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-400">
                        <input
                          type="checkbox"
                          checked={autoGenerateSlug}
                          onChange={(e) => setAutoGenerateSlug(e.target.checked)}
                          className="rounded"
                        />
                        Auto-generate from title
                      </label>
                    </div>
                    <Input
                      value={formData.slug}
                      onChange={(e) => updateMeta("slug", e.target.value)}
                      placeholder="vochef"
                      disabled={autoGenerateSlug}
                      className={cn(inputCls, autoGenerateSlug && "opacity-60 cursor-not-allowed")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Meta Title</label>
                    <Input
                      value={formData.metaTitle}
                      onChange={(e) => updateMeta("metaTitle", e.target.value)}
                      placeholder="VOChef — The kitchen finally answers back · MagDee"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Meta Description</label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => updateMeta("metaDescription", e.target.value)}
                      placeholder="A voice-first cooking companion…"
                      rows={3}
                      className={textareaCls}
                    />
                  </div>
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* ── Hero ───────────────────────────────────────────────────────── */}
          <Collapsible.Root open={openSections.hero} onOpenChange={() => toggleSection("hero")}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <SectionHeader icon={ImageIcon} label="Hero Section" open={openSections.hero} />
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 space-y-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Version Tag</label>
                      <Input
                        value={formData.heroSection.versionTag}
                        onChange={(e) => updateHero("versionTag", e.target.value)}
                        placeholder="v1.2 on iOS"
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Rating Score</label>
                      <Input
                        value={formData.heroSection.ratingScore}
                        onChange={(e) => updateHero("ratingScore", e.target.value)}
                        placeholder="4.9"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Title (Product Name) <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={formData.heroSection.title}
                      onChange={(e) => updateHero("title", e.target.value)}
                      placeholder="VOChef"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Heading (Tagline) <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={formData.heroSection.heading}
                      onChange={(e) => updateHero("heading", e.target.value)}
                      placeholder="The kitchen finally answers back."
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Sub-heading</label>
                    <Input
                      value={formData.heroSection.subHeading}
                      onChange={(e) => updateHero("subHeading", e.target.value)}
                      placeholder="Your AI chef assistant"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Description</label>
                    <textarea
                      value={formData.heroSection.description}
                      onChange={(e) => updateHero("description", e.target.value)}
                      placeholder="A voice-first cooking companion that adapts to your pantry…"
                      rows={3}
                      className={textareaCls}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Primary CTA Text</label>
                      <Input
                        value={formData.heroSection.ctaPrimaryText}
                        onChange={(e) => updateHero("ctaPrimaryText", e.target.value)}
                        placeholder="Download on iOS"
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Primary CTA URL</label>
                      <Input
                        value={formData.heroSection.ctaPrimaryUrl}
                        onChange={(e) => updateHero("ctaPrimaryUrl", e.target.value)}
                        placeholder="#ios"
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Secondary CTA Text</label>
                      <Input
                        value={formData.heroSection.ctaSecondaryText}
                        onChange={(e) => updateHero("ctaSecondaryText", e.target.value)}
                        placeholder="Watch 90-sec demo"
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Secondary CTA URL</label>
                      <Input
                        value={formData.heroSection.ctaSecondaryUrl}
                        onChange={(e) => updateHero("ctaSecondaryUrl", e.target.value)}
                        placeholder="#demo"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Rating Count Text</label>
                    <Input
                      value={formData.heroSection.ratingCount}
                      onChange={(e) => updateHero("ratingCount", e.target.value)}
                      placeholder="1,240 ratings on App Store"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Phone Mockup Image URL</label>
                    <Input
                      value={formData.heroSection.phoneMockupImageUrl}
                      onChange={(e) => updateHero("phoneMockupImageUrl", e.target.value)}
                      placeholder="Enter image URL from Media Library"
                      className={inputCls}
                    />
                    {formData.heroSection.phoneMockupImageUrl && (
                      <img
                        src={formData.heroSection.phoneMockupImageUrl}
                        alt="Phone mockup preview"
                        className="mt-2 h-48 object-contain rounded-lg border border-slate-600"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                  </div>
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* ── Features (3-column grid) ───────────────────────────────────── */}
          <Collapsible.Root
            open={openSections.features}
            onOpenChange={() => toggleSection("features")}
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <SectionHeader icon={Sparkles} label="Features Section (3-column grid)" open={openSections.features} />
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-slate-400">Each card maps to one column in the features strip</p>
                    <Button
                      type="button"
                      onClick={addFeature}
                      variant="outline"
                      size="sm"
                      className="bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Feature
                    </Button>
                  </div>
                  {formData.featuresSection.features.length > 0 ? (
                    <div className="space-y-4">
                      {formData.featuresSection.features.map((feat, i) => (
                        <div key={i} className={cardWrapCls}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-slate-300">
                              Feature #{i + 1}
                            </span>
                            <Button
                              type="button"
                              onClick={() => removeFeature(i)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400">Icon Name (lucide)</label>
                              <Input
                                value={feat.iconName}
                                onChange={(e) => updateFeature(i, "iconName", e.target.value)}
                                placeholder="Lock / Globe / CloudOff"
                                className={inputCls}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400">Anchor href</label>
                              <Input
                                value={feat.href}
                                onChange={(e) => updateFeature(i, "href", e.target.value)}
                                placeholder="#privacy"
                                className={inputCls}
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Input
                              value={feat.title}
                              onChange={(e) => updateFeature(i, "title", e.target.value)}
                              placeholder="Feature title"
                              className={inputCls}
                            />
                            <textarea
                              value={feat.body}
                              onChange={(e) => updateFeature(i, "body", e.target.value)}
                              placeholder="Feature description"
                              rows={2}
                              className={textareaCls}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={emptyStateCls}>
                      <p className="text-sm">No features added yet</p>
                      <p className="text-xs mt-1">Click "Add Feature" to create feature cards</p>
                    </div>
                  )}
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* ── Pantry Scanner ─────────────────────────────────────────────── */}
          <Collapsible.Root
            open={openSections.pantry}
            onOpenChange={() => toggleSection("pantry")}
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <SectionHeader icon={ShoppingBasket} label="Pantry Scanner Section" open={openSections.pantry} />
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 space-y-4 border-t border-white/10">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Tag Text</label>
                    <Input
                      value={formData.pantryScannerSection.tagText}
                      onChange={(e) => updatePantry("tagText", e.target.value)}
                      placeholder="Feature · AI"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Heading</label>
                    <Input
                      value={formData.pantryScannerSection.heading}
                      onChange={(e) => updatePantry("heading", e.target.value)}
                      placeholder="Knows what's in your pantry."
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Sub-heading</label>
                    <textarea
                      value={formData.pantryScannerSection.subHeading}
                      onChange={(e) => updatePantry("subHeading", e.target.value)}
                      placeholder="Snap a photo of your shelves…"
                      rows={2}
                      className={textareaCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">CTA Text</label>
                    <Input
                      value={formData.pantryScannerSection.ctaText}
                      onChange={(e) => updatePantry("ctaText", e.target.value)}
                      placeholder="See how the scanner works →"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">CTA href</label>
                    <Input
                      value={formData.pantryScannerSection.ctaHref}
                      onChange={(e) => updatePantry("ctaHref", e.target.value)}
                      placeholder="#scanner"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Section Image URL</label>
                    <Input
                      value={formData.pantryScannerSection.imageUrl}
                      onChange={(e) => updatePantry("imageUrl", e.target.value)}
                      placeholder="Enter image URL from Media Library"
                      className={inputCls}
                    />
                    {formData.pantryScannerSection.imageUrl && (
                      <img
                        src={formData.pantryScannerSection.imageUrl}
                        alt="Pantry scanner preview"
                        className="mt-2 h-48 object-contain rounded-lg border border-slate-600"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                  </div>

                  {/* Bullets */}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-slate-200">Bullet Points</label>
                      <Button
                        type="button"
                        onClick={addBullet}
                        variant="outline"
                        size="sm"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Bullet
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.pantryScannerSection.bullets.map((b, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-slate-400 text-sm w-4">{i + 1}.</span>
                          <Input
                            value={b}
                            onChange={(e) => updateBullet(i, e.target.value)}
                            placeholder="Recognizes 800+ Indian ingredients"
                            className={cn("flex-1", inputCls)}
                          />
                          {formData.pantryScannerSection.bullets.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeBullet(i)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* ── Voice Listening ────────────────────────────────────────────── */}
          <Collapsible.Root
            open={openSections.voice}
            onOpenChange={() => toggleSection("voice")}
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <SectionHeader icon={Mic} label="Voice Listening Section" open={openSections.voice} />
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 space-y-4 border-t border-white/10">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Tag Text</label>
                    <Input
                      value={formData.voiceListeningSection.tagText}
                      onChange={(e) => updateVoice("tagText", e.target.value)}
                      placeholder="Feature · AI"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Heading</label>
                    <Input
                      value={formData.voiceListeningSection.heading}
                      onChange={(e) => updateVoice("heading", e.target.value)}
                      placeholder="Listens in your actual voice."
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Sub-heading</label>
                    <textarea
                      value={formData.voiceListeningSection.subHeading}
                      onChange={(e) => updateVoice("subHeading", e.target.value)}
                      placeholder="Switch between Tamil, English, and Hindi mid-sentence…"
                      rows={2}
                      className={textareaCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Sample Quote (shown in the demo card)</label>
                    <textarea
                      value={formData.voiceListeningSection.sampleQuote}
                      onChange={(e) => updateVoice("sampleQuote", e.target.value)}
                      placeholder='"Adha aiyo, ipdi panrein. Next step la onion add panren."'
                      rows={2}
                      className={textareaCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Language Tag</label>
                    <Input
                      value={formData.voiceListeningSection.languageTag}
                      onChange={(e) => updateVoice("languageTag", e.target.value)}
                      placeholder="Tamil + English"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Section Image URL</label>
                    <Input
                      value={formData.voiceListeningSection.imageUrl}
                      onChange={(e) => updateVoice("imageUrl", e.target.value)}
                      placeholder="Enter image URL from Media Library"
                      className={inputCls}
                    />
                    {formData.voiceListeningSection.imageUrl && (
                      <img
                        src={formData.voiceListeningSection.imageUrl}
                        alt="Voice listening preview"
                        className="mt-2 h-48 object-contain rounded-lg border border-slate-600"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">CTA Text</label>
                      <Input
                        value={formData.voiceListeningSection.ctaText}
                        onChange={(e) => updateVoice("ctaText", e.target.value)}
                        placeholder="Hear it in Tamil →"
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">CTA href</label>
                      <Input
                        value={formData.voiceListeningSection.ctaHref}
                        onChange={(e) => updateVoice("ctaHref", e.target.value)}
                        placeholder="#voice-demo"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-slate-200">Stats (e.g. 3 Languages, 142ms latency)</label>
                      <Button
                        type="button"
                        onClick={addStat}
                        variant="outline"
                        size="sm"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Stat
                      </Button>
                    </div>
                    {formData.voiceListeningSection.stats.length > 0 ? (
                      <div className="space-y-3">
                        {formData.voiceListeningSection.stats.map((stat, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Input
                              value={stat.value}
                              onChange={(e) => updateStat(i, "value", e.target.value)}
                              placeholder="142ms"
                              className={cn("w-28", inputCls)}
                            />
                            <Input
                              value={stat.label}
                              onChange={(e) => updateStat(i, "label", e.target.value)}
                              placeholder="Avg latency"
                              className={cn("flex-1", inputCls)}
                            />
                            <Button
                              type="button"
                              onClick={() => removeStat(i)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={emptyStateCls}>
                        <p className="text-sm">No stats added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* ── How It Works ───────────────────────────────────────────────── */}
          <Collapsible.Root
            open={openSections.howItWorks}
            onOpenChange={() => toggleSection("howItWorks")}
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <SectionHeader icon={ListOrdered} label="How It Works Section" open={openSections.howItWorks} />
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 space-y-4 border-t border-white/10">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Section Heading</label>
                    <Input
                      value={formData.howItWorksSection.heading}
                      onChange={(e) => updateHowItWorks("heading", e.target.value)}
                      placeholder="From hungry to plated in three quiet steps."
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Sub-heading</label>
                    <Input
                      value={formData.howItWorksSection.subHeading}
                      onChange={(e) => updateHowItWorks("subHeading", e.target.value)}
                      placeholder="How it works"
                      className={inputCls}
                    />
                  </div>

                  {/* Steps */}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-slate-200">Steps</label>
                      <Button
                        type="button"
                        onClick={addStep}
                        variant="outline"
                        size="sm"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Step
                      </Button>
                    </div>
                    {formData.howItWorksSection.steps.length > 0 ? (
                      <div className="space-y-4">
                        {formData.howItWorksSection.steps.map((step, i) => (
                          <div key={i} className={cardWrapCls}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-slate-300">
                                Step {String(i + 1).padStart(2, "0")}
                              </span>
                              <Button
                                type="button"
                                onClick={() => removeStep(i)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              <Input
                                value={step.label}
                                onChange={(e) => updateStep(i, "label", e.target.value)}
                                placeholder='Short label  (e.g. "Tell")'
                                className={inputCls}
                              />
                              <Input
                                value={step.title}
                                onChange={(e) => updateStep(i, "title", e.target.value)}
                                placeholder="Step title"
                                className={inputCls}
                              />
                              <textarea
                                value={step.body}
                                onChange={(e) => updateStep(i, "body", e.target.value)}
                                placeholder="Step description"
                                rows={2}
                                className={textareaCls}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={emptyStateCls}>
                        <p className="text-sm">No steps added yet</p>
                        <p className="text-xs mt-1">Click "Add Step" to create steps</p>
                      </div>
                    )}
                  </div>
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* ── Pricing ────────────────────────────────────────────────────── */}
          <Collapsible.Root
            open={openSections.pricing}
            onOpenChange={() => toggleSection("pricing")}
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <SectionHeader icon={Tag} label="Pricing Section" open={openSections.pricing} />
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 space-y-4 border-t border-white/10">
                  {/* Section-level fields */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Tag Text</label>
                    <Input
                      value={formData.pricingSection.tagText}
                      onChange={(e) => updatePricing("tagText", e.target.value)}
                      placeholder="Access"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Heading</label>
                    <Input
                      value={formData.pricingSection.heading}
                      onChange={(e) => updatePricing("heading", e.target.value)}
                      placeholder="One tier, paid once. No subscriptions."
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Sub-heading</label>
                    <textarea
                      value={formData.pricingSection.subHeading}
                      onChange={(e) => updatePricing("subHeading", e.target.value)}
                      placeholder="You get VOChef forever. Updates and new languages roll in automatically — no upsells."
                      rows={2}
                      className={textareaCls}
                    />
                  </div>

                  {/* Plans */}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-slate-200">Pricing Plans</label>
                      <Button
                        type="button"
                        onClick={addPlan}
                        variant="outline"
                        size="sm"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Plan
                      </Button>
                    </div>
                    <div className="space-y-6">
                      {formData.pricingSection.plans.map((plan, pi) => (
                        <div key={pi} className={cardWrapCls}>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-slate-300">Plan #{pi + 1}</span>
                            {formData.pricingSection.plans.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removePlan(pi)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400">Plan Label</label>
                              <Input
                                value={plan.planLabel}
                                onChange={(e) => updatePlan(pi, "planLabel", e.target.value)}
                                placeholder="VOChef / Pro / Free"
                                className={inputCls}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400">Plan Name</label>
                              <Input
                                value={plan.planName}
                                onChange={(e) => updatePlan(pi, "planName", e.target.value)}
                                placeholder="Lifetime / Monthly"
                                className={inputCls}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400">Currency Symbol</label>
                              <Input
                                value={plan.currency}
                                onChange={(e) => updatePlan(pi, "currency", e.target.value)}
                                placeholder="₹"
                                className={inputCls}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400">Price</label>
                              <Input
                                value={plan.price}
                                onChange={(e) => updatePlan(pi, "price", e.target.value)}
                                placeholder="1,499"
                                className={inputCls}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400">Billing Note</label>
                              <Input
                                value={plan.billingNote}
                                onChange={(e) => updatePlan(pi, "billingNote", e.target.value)}
                                placeholder="one-time · no subscription"
                                className={inputCls}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400">Badge</label>
                              <Input
                                value={plan.badge}
                                onChange={(e) => updatePlan(pi, "badge", e.target.value)}
                                placeholder="Best Value"
                                className={inputCls}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400">CTA Text</label>
                              <Input
                                value={plan.ctaText}
                                onChange={(e) => updatePlan(pi, "ctaText", e.target.value)}
                                placeholder="Download VOChef on iOS"
                                className={inputCls}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400">CTA URL</label>
                              <Input
                                value={plan.ctaUrl}
                                onChange={(e) => updatePlan(pi, "ctaUrl", e.target.value)}
                                placeholder="#ios"
                                className={inputCls}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400">Launch Date</label>
                              <Input
                                value={plan.launchDate}
                                onChange={(e) => updatePlan(pi, "launchDate", e.target.value)}
                                placeholder="Spring 2026"
                                className={inputCls}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-400">Refund Note</label>
                              <Input
                                value={plan.refundNote}
                                onChange={(e) => updatePlan(pi, "refundNote", e.target.value)}
                                placeholder="30 days · no questions"
                                className={inputCls}
                              />
                            </div>
                          </div>

                          {/* Per-plan features */}
                          <div className="pt-3 border-t border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium text-slate-300">Feature Checklist</label>
                              <Button
                                type="button"
                                onClick={() => addPlanFeature(pi)}
                                variant="outline"
                                size="sm"
                                className="bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500 h-7 text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {plan.features.map((feat, fi) => (
                                <div key={fi} className="flex items-center gap-2">
                                  <span className="text-slate-400 text-xs w-4">{fi + 1}.</span>
                                  <Input
                                    value={feat}
                                    onChange={(e) => updatePlanFeature(pi, fi, e.target.value)}
                                    placeholder="Unlimited recipes, hands-free cooking"
                                    className={cn("flex-1", inputCls)}
                                  />
                                  {plan.features.length > 1 && (
                                    <Button
                                      type="button"
                                      onClick={() => removePlanFeature(pi, fi)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* ── Integrations ───────────────────────────────────────────────── */}
          <Collapsible.Root
            open={openSections.integrations}
            onOpenChange={() => toggleSection("integrations")}
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <SectionHeader icon={Plug} label="Integrations Section" open={openSections.integrations} />
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 space-y-4 border-t border-white/10">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Heading</label>
                    <Input
                      value={formData.integrationsSection.heading}
                      onChange={(e) => updateIntegrationsHeader("heading", e.target.value)}
                      placeholder="Works with the apps you already use"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Sub-heading</label>
                    <textarea
                      value={formData.integrationsSection.subHeading}
                      onChange={(e) => updateIntegrationsHeader("subHeading", e.target.value)}
                      placeholder="Connect your favourite tools in one tap."
                      rows={2}
                      className={textareaCls}
                    />
                  </div>

                  {/* Integration items */}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-slate-200">Integrations</label>
                      <Button
                        type="button"
                        onClick={addIntegration}
                        variant="outline"
                        size="sm"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Integration
                      </Button>
                    </div>
                    {formData.integrationsSection.integrations.length > 0 ? (
                      <div className="space-y-4">
                        {formData.integrationsSection.integrations.map((item, i) => (
                          <div key={i} className={cardWrapCls}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-slate-300">
                                Integration #{i + 1}
                              </span>
                              <Button
                                type="button"
                                onClick={() => removeIntegration(i)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs text-slate-400">Platform Name</label>
                                <Input
                                  value={item.platformName}
                                  onChange={(e) => updateIntegration(i, "platformName", e.target.value)}
                                  placeholder="Slack / WhatsApp / Notion"
                                  className={inputCls}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-slate-400">Status</label>
                                <Input
                                  value={item.status}
                                  onChange={(e) => updateIntegration(i, "status", e.target.value)}
                                  placeholder="Live / Coming Soon / Beta"
                                  className={inputCls}
                                />
                              </div>
                              <div className="space-y-1 col-span-2">
                                <label className="text-xs text-slate-400">Image URL (logo)</label>
                                <Input
                                  value={item.imageUrl}
                                  onChange={(e) => updateIntegration(i, "imageUrl", e.target.value)}
                                  placeholder="https://..."
                                  className={inputCls}
                                />
                              </div>
                              <div className="space-y-1 col-span-2">
                                <label className="text-xs text-slate-400">What it does</label>
                                <textarea
                                  value={item.whatItDoes}
                                  onChange={(e) => updateIntegration(i, "whatItDoes", e.target.value)}
                                  placeholder="Send meal plans directly to Slack channels"
                                  rows={2}
                                  className={textareaCls}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={emptyStateCls}>
                        <p className="text-sm">No integrations added yet</p>
                        <p className="text-xs mt-1">Click "Add Integration" to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* ── Action Buttons ─────────────────────────────────────────────── */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/services")}
              className="bg-slate-800/60 text-white border-slate-600 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save as Draft"}
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit("published")}
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Publishing..." : "Publish"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OLD GENERIC SERVICE FORM (commented out — did not align with VOChef template)
// ─────────────────────────────────────────────────────────────────────────────
/*
interface ServiceFormData {
  pageType: "service" | "service-detail";
  slug: string;
  metaTitle: string;
  metaDescription: string;
  heroSection: {
    heroheading: string;
    heroDescription: string;
    heroImgUrl: string;
  };
  ourServicesSection: {
    serviceHeading: string;
    serviceDescription: string;
    serviceCards: Array<{ cardHeading: string; cardImg: string; cardUrl: string }>;
  };
  serviceIntroSection: {
    serviceHeading: string;
    serviceDescription: string[];
  };
  serviceDetailSection: {
    serviceDetailHeading: string;
    serviceDetailDescription: string;
    serviceCards: Array<{ serviceCardTitle: string; serviceCardDescription: string }>;
  };
  whyChooseSection: {
    sectionHeading: string;
    sectionDescription: string;
    sectionCards: Array<{ cardHeading: string; cardDescription: string }>;
  };
  whyInvestSection: {
    sectionHeading: string;
    sectionDescription: string;
    sectionCards: Array<{ cardHeading: string; cardDescription: string }>;
  };
  technologySection: {
    heading: string;
    description: string;
    technologyImages: string[];
  };
  faqSection: {
    faqHeading: string;
    faqDescription: string;
    faqQuestions: Array<{ question: string; answer: string }>;
  };
  status: "draft" | "published";
}

// ... full old form implementation removed.
// Sections covered: pageType selector, SEO/meta, heroSection, ourServicesSection,
// serviceIntroSection, serviceDetailSection, whyChooseSection, whyInvestSection,
// technologySection, faqSection.
// None of these sections mapped to the actual VOChef page components.
*/
