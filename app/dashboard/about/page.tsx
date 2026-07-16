"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Users,
  Target,
  Info,
  FileText,
  Quote,
  RefreshCw,
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { uploadFileToMedia } from "@/app/lib/utils/media";

interface AboutStat {
  statTitle: string;
  statValue: string;
}

interface ApproachCard {
  cardTitle: string;
  cardDescription: string;
}

interface TeamMember {
  name: string;
  designation: string;
  bio: string;
  location: string;
  imgUrl: string;
}

interface AboutFormData {
  metaTitle: string;
  metaDescription: string;
  heroSection: {
    heroBadgeTitle: string;
    heroHeading: string;
    heroDescription: string;
    heroImgUrl: string;
  };
  aboutSection: {
    aboutBadgeTitle: string;
    aboutHeading: string;
    aboutDescription: string;
    aboutImgUrl: string;
    aboutStats: AboutStat[];
  };
  approachSection: {
    approachBadgeTitle: string;
    approachHeading: string;
    approachDescription: string;
    approachCards: ApproachCard[];
  };
  teamSection: {
    teamBadgeTitle: string;
    teamHeading: string;
    teamDescription: string;
    teamMemberCards: TeamMember[];
  };
  foundersNoteSection: {
    founderName: string;
    founderDesignation: string;
    founderLocation: string;
    founderEmail: string;
    founderCoordinates: string;
    quote: string;
    documentNote: string;
    documentNo: string;
  };
}

const defaultFormData: AboutFormData = {
  metaTitle: "",
  metaDescription: "",
  heroSection: {
    heroBadgeTitle: "",
    heroHeading: "",
    heroDescription: "",
    heroImgUrl: "",
  },
  aboutSection: {
    aboutBadgeTitle: "",
    aboutHeading: "",
    aboutDescription: "",
    aboutImgUrl: "",
    aboutStats: [],
  },
  approachSection: {
    approachBadgeTitle: "",
    approachHeading: "",
    approachDescription: "",
    approachCards: [],
  },
  teamSection: {
    teamBadgeTitle: "",
    teamHeading: "",
    teamDescription: "",
    teamMemberCards: [],
  },
  foundersNoteSection: {
    founderName: "",
    founderDesignation: "",
    founderLocation: "",
    founderEmail: "",
    founderCoordinates: "",
    quote: "",
    documentNote: "",
    documentNo: "",
  },
};

export default function AboutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AboutFormData>(defaultFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNewPage, setIsNewPage] = useState(false);

  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    meta: true,
    hero: true,
    about: true,
    approach: true,
    team: true,
    foundersNote: false,
  });

  // Image upload states
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [uploadingTeamImage, setUploadingTeamImage] = useState<number | null>(null);
  const heroImageRef = useRef<HTMLInputElement>(null);
  const teamImageRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Fetch existing About page data
  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/about", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setFormData({
            metaTitle: data.data.metaTitle || "",
            metaDescription: data.data.metaDescription || "",
            heroSection: {
              heroBadgeTitle: data.data.heroSection?.heroBadgeTitle || "",
              heroHeading: data.data.heroSection?.heroHeading || "",
              heroDescription: data.data.heroSection?.heroDescription || "",
              heroImgUrl: data.data.heroSection?.heroImgUrl || "",
            },
            aboutSection: {
              aboutBadgeTitle: data.data.aboutSection?.aboutBadgeTitle || "",
              aboutHeading: data.data.aboutSection?.aboutHeading || "",
              aboutDescription: data.data.aboutSection?.aboutDescription || "",
              aboutImgUrl: data.data.aboutSection?.aboutImgUrl || "",
              aboutStats: data.data.aboutSection?.aboutStats || [],
            },
            approachSection: {
              approachBadgeTitle: data.data.approachSection?.approachBadgeTitle || "",
              approachHeading: data.data.approachSection?.approachHeading || "",
              approachDescription: data.data.approachSection?.approachDescription || "",
              approachCards: data.data.approachSection?.approachCards || [],
            },
            teamSection: {
              teamBadgeTitle: data.data.teamSection?.teamBadgeTitle || "",
              teamHeading: data.data.teamSection?.teamHeading || "",
              teamDescription: data.data.teamSection?.teamDescription || "",
              teamMemberCards: data.data.teamSection?.teamMemberCards || [],
            },
            foundersNoteSection: {
              founderName:        data.data.foundersNoteSection?.founderName        || "",
              founderDesignation: data.data.foundersNoteSection?.founderDesignation || "",
              founderLocation:    data.data.foundersNoteSection?.founderLocation    || "",
              founderEmail:       data.data.foundersNoteSection?.founderEmail       || "",
              founderCoordinates: data.data.foundersNoteSection?.founderCoordinates || "",
              quote:              data.data.foundersNoteSection?.quote              || "",
              documentNote:       data.data.foundersNoteSection?.documentNote       || "",
              documentNo:         data.data.foundersNoteSection?.documentNo         || "",
            },
          });
          setIsNewPage(false);
        }
      } else if (res.status === 404) {
        // No About page exists yet
        setIsNewPage(true);
        toast.info("No About page found. Create one by filling out the form.", {
          closeButton: true,
        });
      }
    } catch (error) {
      console.error("Error fetching About page:", error);
      toast.error("Failed to load About page data", { closeButton: true });
    } finally {
      setLoading(false);
    }
  };

  // Toggle section
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Update nested form fields
  const updateMetaField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateHeroField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      heroSection: { ...prev.heroSection, [field]: value },
    }));
  };

  const updateAboutField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      aboutSection: { ...prev.aboutSection, [field]: value },
    }));
  };

  const updateApproachField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      approachSection: { ...prev.approachSection, [field]: value },
    }));
  };

  const updateTeamField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      teamSection: { ...prev.teamSection, [field]: value },
    }));
  };

  const updateFoundersNote = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      foundersNoteSection: { ...prev.foundersNoteSection, [field]: value },
    }));
  };

  // Stats management
  const addStat = () => {
    setFormData((prev) => ({
      ...prev,
      aboutSection: {
        ...prev.aboutSection,
        aboutStats: [...prev.aboutSection.aboutStats, { statTitle: "", statValue: "" }],
      },
    }));
  };

  const updateStat = (index: number, field: keyof AboutStat, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.aboutSection.aboutStats];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        aboutSection: { ...prev.aboutSection, aboutStats: updated },
      };
    });
  };

  const removeStat = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      aboutSection: {
        ...prev.aboutSection,
        aboutStats: prev.aboutSection.aboutStats.filter((_, i) => i !== index),
      },
    }));
  };

  // Approach cards management
  const addApproachCard = () => {
    setFormData((prev) => ({
      ...prev,
      approachSection: {
        ...prev.approachSection,
        approachCards: [...prev.approachSection.approachCards, { cardTitle: "", cardDescription: "" }],
      },
    }));
  };

  const updateApproachCard = (index: number, field: keyof ApproachCard, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.approachSection.approachCards];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        approachSection: { ...prev.approachSection, approachCards: updated },
      };
    });
  };

  const removeApproachCard = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      approachSection: {
        ...prev.approachSection,
        approachCards: prev.approachSection.approachCards.filter((_, i) => i !== index),
      },
    }));
  };

  // Team members management
  const addTeamMember = () => {
    setFormData((prev) => ({
      ...prev,
      teamSection: {
        ...prev.teamSection,
        teamMemberCards: [...prev.teamSection.teamMemberCards, { name: "", designation: "", bio: "", location: "", imgUrl: "" }],
      },
    }));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.teamSection.teamMemberCards];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        teamSection: { ...prev.teamSection, teamMemberCards: updated },
      };
    });
  };

  const removeTeamMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      teamSection: {
        ...prev.teamSection,
        teamMemberCards: prev.teamSection.teamMemberCards.filter((_, i) => i !== index),
      },
    }));
  };

  // Hero image upload
  const handleHeroImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file", { closeButton: true });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size should be less than 10MB", { closeButton: true });
      return;
    }

    setUploadingHeroImage(true);
    const loadingToastId = toast.loading("Uploading hero image...", { closeButton: true });

    try {
      const result = await uploadFileToMedia(file);
      updateHeroField("heroImgUrl", result.url);
      toast.dismiss(loadingToastId);
      toast.success("Hero image uploaded successfully!", { closeButton: true });
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      toast.error(error.message || "Failed to upload image", { closeButton: true });
    } finally {
      setUploadingHeroImage(false);
      if (heroImageRef.current) {
        heroImageRef.current.value = "";
      }
    }
  };

  // Team member image upload
  const handleTeamImageUpload = async (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file", { closeButton: true });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size should be less than 10MB", { closeButton: true });
      return;
    }

    setUploadingTeamImage(index);
    const loadingToastId = toast.loading("Uploading team member image...", { closeButton: true });

    try {
      const result = await uploadFileToMedia(file);
      updateTeamMember(index, "imgUrl", result.url);
      toast.dismiss(loadingToastId);
      toast.success("Team member image uploaded successfully!", { closeButton: true });
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      toast.error(error.message || "Failed to upload image", { closeButton: true });
    } finally {
      setUploadingTeamImage(null);
    }
  };

  const handleRevalidate = async () => {
    const toastId = toast.loading("Revalidating cache...");
    try {
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: ["about-page"] }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Cache cleared — frontend will fetch fresh content", { id: toastId });
      } else {
        toast.error(data.message || "Revalidation failed", { id: toastId });
      }
    } catch {
      toast.error("Revalidation failed", { id: toastId });
    }
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    const loadingToastId = toast.loading(
      isNewPage ? "Creating About page..." : "Saving changes...",
      { closeButton: true }
    );

    try {
      const method = isNewPage ? "POST" : "PATCH";
      const res = await fetch("/api/about", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      toast.dismiss(loadingToastId);

      if (res.ok && data.success) {
        toast.success(data.message || "About page saved successfully!", { closeButton: true });
        setIsNewPage(false);
      } else {
        toast.error(data.message || "Failed to save About page", { closeButton: true });
      }
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      toast.error(error.message || "Something went wrong", { closeButton: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-slate-700 rounded"></div>
            <div className="h-4 w-96 bg-slate-700 rounded"></div>
            <div className="bg-white/10 rounded-2xl p-6 space-y-4">
              <div className="h-10 bg-slate-700 rounded"></div>
              <div className="h-10 bg-slate-700 rounded"></div>
              <div className="h-32 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isNewPage ? "Create About Us Page" : "Edit About Us Page"}
            </h1>
            <p className="text-slate-400">
              {isNewPage
                ? "Fill in the details to create your About Us page"
                : "Manage your About Us page content"}
            </p>
          </div>
          {!isNewPage && (
            <Button
              variant="outline"
              onClick={handleRevalidate}
              title="Clear frontend cache for About Us page"
              className="shrink-0 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Revalidate Cache
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Meta Information Section */}
          <Collapsible.Root open={openSections.meta} onOpenChange={() => toggleSection("meta")}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-400" />
                    <span className="text-lg font-semibold text-white">SEO / Meta Information</span>
                  </div>
                  {openSections.meta ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 space-y-4 border-t border-white/10">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Meta Title</label>
                    <Input
                      value={formData.metaTitle}
                      onChange={(e) => updateMetaField("metaTitle", e.target.value)}
                      placeholder="Enter meta title for SEO"
                      className="bg-slate-900/60 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Meta Description</label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => updateMetaField("metaDescription", e.target.value)}
                      placeholder="Enter meta description for SEO"
                      rows={3}
                      className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                    />
                  </div>
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* Hero Section */}
          <Collapsible.Root open={openSections.hero} onOpenChange={() => toggleSection("hero")}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-indigo-400" />
                    <span className="text-lg font-semibold text-white">Hero Section</span>
                  </div>
                  {openSections.hero ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 space-y-4 border-t border-white/10">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Badge Title <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={formData.heroSection.heroBadgeTitle}
                      onChange={(e) => updateHeroField("heroBadgeTitle", e.target.value)}
                      placeholder="e.g., About Us"
                      className="bg-slate-900/60 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Heading <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={formData.heroSection.heroHeading}
                      onChange={(e) => updateHeroField("heroHeading", e.target.value)}
                      placeholder="Enter hero heading"
                      className="bg-slate-900/60 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.heroSection.heroDescription}
                      onChange={(e) => updateHeroField("heroDescription", e.target.value)}
                      placeholder="Enter hero description"
                      rows={4}
                      className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Hero Image (Add Media Library URL)</label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.heroSection.heroImgUrl}
                        onChange={(e) => updateHeroField("heroImgUrl", e.target.value)}
                        placeholder="Enter image URL or upload"
                        className="flex-1 bg-slate-900/60 border-slate-600 text-white"
                      />
                      <input
                        ref={heroImageRef}
                        type="file"
                        accept="image/*"
                        onChange={handleHeroImageUpload}
                        className="hidden"
                        disabled={uploadingHeroImage}
                      />
                    </div>
                    {formData.heroSection.heroImgUrl && (
                      <div className="mt-2">
                        <img
                          src={formData.heroSection.heroImgUrl}
                          alt="Hero preview"
                          className="max-w-full h-48 object-cover rounded-lg border border-slate-600"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* About Section */}
          <Collapsible.Root open={openSections.about} onOpenChange={() => toggleSection("about")}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-400" />
                    <span className="text-lg font-semibold text-white">About Section</span>
                  </div>
                  {openSections.about ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 space-y-4 border-t border-white/10">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Badge Title <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={formData.aboutSection.aboutBadgeTitle}
                      onChange={(e) => updateAboutField("aboutBadgeTitle", e.target.value)}
                      placeholder="e.g., Who We Are"
                      className="bg-slate-900/60 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Heading <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={formData.aboutSection.aboutHeading}
                      onChange={(e) => updateAboutField("aboutHeading", e.target.value)}
                      placeholder="Enter about heading"
                      className="bg-slate-900/60 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.aboutSection.aboutDescription}
                      onChange={(e) => updateAboutField("aboutDescription", e.target.value)}
                      placeholder="Enter about description"
                      rows={4}
                      className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Section Image URL</label>
                    <Input
                      value={formData.aboutSection.aboutImgUrl}
                      onChange={(e) => updateAboutField("aboutImgUrl", e.target.value)}
                      placeholder="Paste image URL from media library"
                      className="bg-slate-900/60 border-slate-600 text-white"
                    />
                    {formData.aboutSection.aboutImgUrl && (
                      <img
                        src={formData.aboutSection.aboutImgUrl}
                        alt="Section preview"
                        className="max-w-full h-48 object-cover rounded-lg border border-slate-600"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    )}
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-slate-200">Statistics</h4>
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
                    {formData.aboutSection.aboutStats.length > 0 ? (
                      <div className="space-y-3">
                        {formData.aboutSection.aboutStats.map((stat, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 bg-slate-800/30 p-3 rounded-lg border border-slate-700"
                          >
                            <div className="flex-1">
                              <Input
                                value={stat.statTitle}
                                onChange={(e) => updateStat(index, "statTitle", e.target.value)}
                                placeholder="Stat title (e.g., Projects)"
                                className="bg-slate-900/60 border-slate-600 text-white"
                              />
                            </div>
                            <div className="w-32">
                              <Input
                                type="text"
                                value={stat.statValue}
                                onChange={(e) => updateStat(index, "statValue", e.target.value)}
                                placeholder="e.g. 2025, 11°N, ∞"
                                className="bg-slate-900/60 border-slate-600 text-white"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeStat(index)}
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
                      <div className="text-center py-6 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                        <p className="text-sm">No statistics added yet</p>
                        <p className="text-xs mt-1">Click "Add Stat" to create statistics</p>
                      </div>
                    )}
                  </div>
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* Approach Section */}
          <Collapsible.Root open={openSections.approach} onOpenChange={() => toggleSection("approach")}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-indigo-400" />
                    <span className="text-lg font-semibold text-white">Approach Section</span>
                  </div>
                  {openSections.approach ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 space-y-4 border-t border-white/10">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Badge Title <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={formData.approachSection.approachBadgeTitle}
                      onChange={(e) => updateApproachField("approachBadgeTitle", e.target.value)}
                      placeholder="e.g., Our Approach"
                      className="bg-slate-900/60 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Heading <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={formData.approachSection.approachHeading}
                      onChange={(e) => updateApproachField("approachHeading", e.target.value)}
                      placeholder="Enter approach heading"
                      className="bg-slate-900/60 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.approachSection.approachDescription}
                      onChange={(e) => updateApproachField("approachDescription", e.target.value)}
                      placeholder="Enter approach description"
                      rows={4}
                      className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                    />
                  </div>

                  {/* Approach Cards */}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-slate-200">Approach Cards</h4>
                      <Button
                        type="button"
                        onClick={addApproachCard}
                        variant="outline"
                        size="sm"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Card
                      </Button>
                    </div>
                    {formData.approachSection.approachCards.length > 0 ? (
                      <div className="space-y-4">
                        {formData.approachSection.approachCards.map((card, index) => (
                          <div
                            key={index}
                            className="bg-slate-800/30 p-4 rounded-lg border border-slate-700"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-slate-300">
                                Card #{index + 1}
                              </span>
                              <Button
                                type="button"
                                onClick={() => removeApproachCard(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              <Input
                                value={card.cardTitle}
                                onChange={(e) => updateApproachCard(index, "cardTitle", e.target.value)}
                                placeholder="Card title"
                                className="bg-slate-900/60 border-slate-600 text-white"
                              />
                              <textarea
                                value={card.cardDescription}
                                onChange={(e) => updateApproachCard(index, "cardDescription", e.target.value)}
                                placeholder="Card description"
                                rows={3}
                                className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                        <p className="text-sm">No approach cards added yet</p>
                        <p className="text-xs mt-1">Click "Add Card" to create approach cards</p>
                      </div>
                    )}
                  </div>
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* Team Section */}
          <Collapsible.Root open={openSections.team} onOpenChange={() => toggleSection("team")}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-indigo-400" />
                    <span className="text-lg font-semibold text-white">Team Section</span>
                  </div>
                  {openSections.team ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 space-y-4 border-t border-white/10">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Badge Title <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={formData.teamSection.teamBadgeTitle}
                      onChange={(e) => updateTeamField("teamBadgeTitle", e.target.value)}
                      placeholder="e.g., Our Team"
                      className="bg-slate-900/60 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Heading <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={formData.teamSection.teamHeading}
                      onChange={(e) => updateTeamField("teamHeading", e.target.value)}
                      placeholder="Enter team heading"
                      className="bg-slate-900/60 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.teamSection.teamDescription}
                      onChange={(e) => updateTeamField("teamDescription", e.target.value)}
                      placeholder="Enter team description"
                      rows={4}
                      className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                    />
                  </div>

                  {/* Team Members */}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-slate-200">Team Members</h4>
                      <Button
                        type="button"
                        onClick={addTeamMember}
                        variant="outline"
                        size="sm"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Member
                      </Button>
                    </div>
                    {formData.teamSection.teamMemberCards.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {formData.teamSection.teamMemberCards.map((member, index) => (
                          <div
                            key={index}
                            className="bg-slate-800/30 p-4 rounded-lg border border-slate-700"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-slate-300">
                                Member #{index + 1}
                              </span>
                              <Button
                                type="button"
                                onClick={() => removeTeamMember(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {member.imgUrl && (
                                <div className="flex justify-center">
                                  <img
                                    src={member.imgUrl}
                                    alt={member.name || "Team member"}
                                    className="w-20 h-20 object-cover rounded-full border-2 border-slate-600"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                  />
                                </div>
                              )}
                              <Input
                                value={member.name}
                                onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                                placeholder="Full Name *"
                                className="bg-slate-900/60 border-slate-600 text-white"
                              />
                              <Input
                                value={member.designation}
                                onChange={(e) => updateTeamMember(index, "designation", e.target.value)}
                                placeholder="Role (e.g., Product, Engineering, Design)"
                                className="bg-slate-900/60 border-slate-600 text-white"
                              />
                              <textarea
                                value={(member as any).bio || ""}
                                onChange={(e) => updateTeamMember(index, "bio" as any, e.target.value)}
                                placeholder="Short bio (2 sentences max)"
                                rows={2}
                                className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                              />
                              <Input
                                value={(member as any).location || ""}
                                onChange={(e) => updateTeamMember(index, "location" as any, e.target.value)}
                                placeholder="Location (e.g., COIMBATORE or MADURAI → COIMBATORE)"
                                className="bg-slate-900/60 border-slate-600 text-white"
                              />
                              <div className="flex gap-2 items-center">
                                <label className="text-sm font-semibold text-slate-300 shrink-0">Image URL</label>
                                <Input
                                  value={member.imgUrl}
                                  onChange={(e) => updateTeamMember(index, "imgUrl", e.target.value)}
                                  placeholder="https://... or media library URL"
                                  className="flex-1 bg-slate-900/60 border-slate-600 text-white text-sm"
                                />
                                <input
                                  ref={(el) => { teamImageRefs.current[index] = el; }}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleTeamImageUpload(e, index)}
                                  className="hidden"
                                  disabled={uploadingTeamImage === index}
                                />
                                <Button
                                  type="button"
                                  onClick={() => teamImageRefs.current[index]?.click()}
                                  disabled={uploadingTeamImage === index}
                                  variant="outline"
                                  size="sm"
                                  className="shrink-0 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 text-xs"
                                >
                                  {uploadingTeamImage === index ? "..." : "Upload"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                        <p className="text-sm">No team members added yet</p>
                        <p className="text-xs mt-1">Click "Add Member" to add team members</p>
                      </div>
                    )}
                  </div>
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* Founder's Note Section */}
          <Collapsible.Root open={openSections.foundersNote} onOpenChange={() => toggleSection("foundersNote")}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Collapsible.Trigger asChild>
                <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Quote className="h-5 w-5 text-indigo-400" />
                    <span className="text-lg font-semibold text-white">Founder's Note Section</span>
                  </div>
                  {openSections.foundersNote ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div className="p-6 pt-2 space-y-4 border-t border-white/10">
                  <p className="text-xs text-slate-400">Fields for the founder card on the left and the quote block on the right.</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-200">Founder Name</label>
                      <input
                        value={formData.foundersNoteSection.founderName}
                        onChange={(e) => updateFoundersNote("founderName", e.target.value)}
                        placeholder="Vivek"
                        className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-200">Designation</label>
                      <input
                        value={formData.foundersNoteSection.founderDesignation}
                        onChange={(e) => updateFoundersNote("founderDesignation", e.target.value)}
                        placeholder="Co-Founder, Product"
                        className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-200">Location</label>
                      <input
                        value={formData.foundersNoteSection.founderLocation}
                        onChange={(e) => updateFoundersNote("founderLocation", e.target.value)}
                        placeholder="Coimbatore, Tamil Nadu"
                        className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-200">Email</label>
                      <input
                        value={formData.foundersNoteSection.founderEmail}
                        onChange={(e) => updateFoundersNote("founderEmail", e.target.value)}
                        placeholder="vivek@global-elite-cms.in"
                        className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-200">Coordinates</label>
                      <input
                        value={formData.foundersNoteSection.founderCoordinates}
                        onChange={(e) => updateFoundersNote("founderCoordinates", e.target.value)}
                        placeholder="11.0168° N · 76.9558° E"
                        className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-700">
                    <label className="block text-sm font-medium text-slate-200">Quote (blockquote text)</label>
                    <div className="flex gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                      <span className="shrink-0">ⓘ</span>
                      <span>
                        Wrap a word with <code className="rounded bg-amber-500/20 px-1 font-mono">*asterisks*</code> to render it in brand accent italic on the live site.
                      </span>
                    </div>
                    <textarea
                      value={formData.foundersNoteSection.quote}
                      onChange={(e) => updateFoundersNote("quote", e.target.value)}
                      placeholder="We named the company after the elephant — patient, careful with what it carries, and quietly stronger than it looks."
                      rows={3}
                      className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-200">Document Note (line 1)</label>
                      <input
                        value={formData.foundersNoteSection.documentNote}
                        onChange={(e) => updateFoundersNote("documentNote", e.target.value)}
                        placeholder="Founders' Note · Global Elite Technologies · 2025"
                        className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-200">Document Number (line 2)</label>
                      <input
                        value={formData.foundersNoteSection.documentNo}
                        onChange={(e) => updateFoundersNote("documentNo", e.target.value)}
                        placeholder="Document No. MD-2026-001"
                        className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </Collapsible.Content>
            </div>
          </Collapsible.Root>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="bg-slate-800/60 text-white border-slate-600 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : isNewPage ? "Create Page" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


