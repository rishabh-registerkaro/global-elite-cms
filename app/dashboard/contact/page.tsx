"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    ChevronDown,
    ChevronRight,
    Plus,
    Trash2,
    Mail,
    MapPin,
    HelpCircle,
    Send,
    Users,
    FileText,
    Info,
    RefreshCw,
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";

interface ContactCard {
    label: string;
    value: string;
    detail: string;
}

interface Inbox {
    label: string;
    email: string;
    detail: string;
    personName: string;
    personInitial: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface ContactFormData {
    metaTitle: string;
    metaDescription: string;
    content: {
        heroSection: {
            badge: string;
            hours: string;
            contactCards: ContactCard[];
        };
        inboxesSection: {
            badge: string;
            description: string;
            inboxes: Inbox[];
        };
        headquartersSection: {
            badge: string;
            companyName: string;
            address: string;
            mapsUrl: string;
            phone: string;
            hours: string;
            lat: string;
            long: string;
            neighborhoodHeading: string;
            neighborhoodDescription: string;
            mapImgUrl: string;
        };
        faqSection: {
            badge: string;
            description: string;
            faqs: FAQ[];
        };
        newsletterSection: {
            badge: string;
            heading: string;
            description: string;
            email: string;
        };
    };
}

const defaultFormData: ContactFormData = {
    metaTitle: "Contact Us — Say hi. One of us reads it. · MagDee",
    metaDescription: "No support queue, no ticketing system, no chatbot. Three founders and a small team handle every email — usually within a working day.",
    content: {
        heroSection: {
            badge: "Get in touch",
            hours: "Mon-Fri · 09:00-19:00 IST",
            contactCards: [
                { label: "Email Us", value: "hello@magdee.in", detail: "One of us within 24 hrs" },
                { label: "Visit Us", value: "Coimbatore HQ", detail: "By appointment only" },
                { label: "Or in Tamil", value: "வணக்கம்", detail: "vanakkam@magdee.in" },
                { label: "Press Inbox", value: "press@magdee.in", detail: "Embargoed inquiries welcome" },
            ],
        },
        inboxesSection: {
            badge: "02 — Pick the right door",
            description: "We split mail by topic, not by tier — there's no 'premium' address. Whichever you write to, a real person responds within a working day.",
            inboxes: [
                { label: "Product", email: "product@magdee.in", detail: "VOChef, Mee Tory, Ellamly — feedback, bugs, feature requests", personName: "Arjun", personInitial: "A" },
                { label: "Press", email: "press@magdee.in", detail: "Interviews, embargoed news, press kit downloads", personName: "Saanvi", personInitial: "S" },
                { label: "Partnerships", email: "partners@magdee.in", detail: "Integrations, distribution, enterprise inquiries", personName: "Arjun", personInitial: "A" },
                { label: "Careers", email: "careers@magdee.in", detail: "Job applications, internships, contract work", personName: "Vikram", personInitial: "V" },
                { label: "Support", email: "support@magdee.in", detail: "Help with the apps, billing questions, account issues", personName: "Saanvi", personInitial: "S" },
                { label: "Just Hello", email: "hello@magdee.in", detail: "Anything else — in Tamil, English, or Hindi", personName: "Arjun", personInitial: "A" },
            ],
        },
        headquartersSection: {
            badge: "03 — Headquarters",
            companyName: "MagDee Technologies Pvt. Ltd.",
            address: "Floor 2, No. 47, Race Course Road\nRS Puram, Coimbatore — 641 002\nTamil Nadu, India",
            mapsUrl: "https://maps.google.com/?q=11.0168,76.9558",
            phone: "+91 422 4567 890",
            hours: "Mon-Fri · 9-7 IST",
            lat: "11.0168° N",
            long: "76.9558° E",
            neighborhoodHeading: "Above the *filter coffee* shop.",
            neighborhoodDescription: "Race Course Road is one of the older streets in town — wide, tree-lined, never in a hurry. We're on the second floor, behind a heavy teak door, two doors down from a 40-year-old filter coffee shop. You'll smell us before you see us.",
            mapImgUrl: "",
        },
        faqSection: {
            badge: "04 — Before You Write",
            description: "Most questions we get are these five. If yours isn't, write anyway — we'd genuinely rather hear from you.",
            faqs: [
                { question: "How fast do you actually reply?", answer: "Within one working day, usually faster. We don't use auto-responders, ticketing systems, or 'Your call is important to us' anything. A real person reads every email, and the same person writes back." },
                { question: "Do you offer enterprise pricing?", answer: "Yes — for teams above 25 seats. Write to partners@magdee.in with a rough headcount and use case. We'll send a quote within a working day, no demo gauntlet required." },
                { question: "Can I visit the Coimbatore office?", answer: "Absolutely — we love visitors. Mail hello@magdee.in with a date, and we'll either confirm or suggest one that works. Filter coffee on us." },
                { question: "Are you hiring?", answer: "Quietly, always. If you're a builder who values craft over churn, send a note and a portfolio (or a project, or a thing you wrote) to careers@magdee.in. We read every one." },
                { question: "Will you ship to my country / language?", answer: "Today: India + iOS + Tamil/English/Hindi. On the roadmap: more languages first, more platforms second. Tell us where you are — we keep a quiet list and write to people in the order they asked." },
            ],
        },
        newsletterSection: {
            badge: "Stay quietly informed",
            heading: "We email about once a quarter.",
            description: "No drip campaigns, no 'thought leadership', no marketing automation. Just a short note when something genuine has shipped or changed.",
            email: "hello@magdee.in",
        },
    },
};

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    isOpen: boolean;
    count?: number;
}

function SectionHeader({ icon, title, isOpen, count }: SectionHeaderProps) {
    return (
        <div className="flex items-center gap-3 text-left">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                {icon}
            </span>
            <span className="text-[15px] font-semibold text-slate-200">{title}</span>
            {count !== undefined && (
                <span className="ml-1 rounded-full bg-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                    {count}
                </span>
            )}
            <span className="ml-auto shrink-0 text-slate-500">
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
        </div>
    );
}

export default function ContactDashboardPage() {
    const [formData, setFormData] = useState<ContactFormData>(defaultFormData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        meta: true,
        hero: false,
        inboxes: false,
        hq: false,
        faq: false,
        newsletter: false,
    });

    useEffect(() => {
        fetch("/api/contact")
            .then((r) => r.json())
            .then((res) => {
                if (res.success && res.data) {
                    setFormData({
                        metaTitle: res.data.metaTitle || defaultFormData.metaTitle,
                        metaDescription: res.data.metaDescription || defaultFormData.metaDescription,
                        content: {
                            heroSection: { ...defaultFormData.content.heroSection, ...(res.data.content?.heroSection || {}) },
                            inboxesSection: { ...defaultFormData.content.inboxesSection, ...(res.data.content?.inboxesSection || {}) },
                            headquartersSection: { ...defaultFormData.content.headquartersSection, ...(res.data.content?.headquartersSection || {}) },
                            faqSection: { ...defaultFormData.content.faqSection, ...(res.data.content?.faqSection || {}) },
                            newsletterSection: { ...defaultFormData.content.newsletterSection, ...(res.data.content?.newsletterSection || {}) },
                        },
                    });
                    setIsNew(false);
                } else {
                    setIsNew(true);
                }
            })
            .catch(() => toast.error("Failed to load contact page data"))
            .finally(() => setLoading(false));
    }, []);

    function toggleSection(key: string) {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    function setMeta(field: "metaTitle" | "metaDescription", value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    function setHero(field: keyof ContactFormData["content"]["heroSection"], value: any) {
        setFormData((prev) => ({
            ...prev,
            content: { ...prev.content, heroSection: { ...prev.content.heroSection, [field]: value } },
        }));
    }

    function updateContactCard(index: number, field: keyof ContactCard, value: string) {
        setFormData((prev) => {
            const cards = [...prev.content.heroSection.contactCards];
            cards[index] = { ...cards[index], [field]: value };
            return { ...prev, content: { ...prev.content, heroSection: { ...prev.content.heroSection, contactCards: cards } } };
        });
    }

    function addContactCard() {
        setFormData((prev) => ({
            ...prev,
            content: {
                ...prev.content,
                heroSection: {
                    ...prev.content.heroSection,
                    contactCards: [...prev.content.heroSection.contactCards, { label: "", value: "", detail: "" }],
                },
            },
        }));
    }

    function removeContactCard(index: number) {
        setFormData((prev) => {
            const cards = prev.content.heroSection.contactCards.filter((_, i) => i !== index);
            return { ...prev, content: { ...prev.content, heroSection: { ...prev.content.heroSection, contactCards: cards } } };
        });
    }

    function setInboxes(field: keyof ContactFormData["content"]["inboxesSection"], value: any) {
        setFormData((prev) => ({
            ...prev,
            content: { ...prev.content, inboxesSection: { ...prev.content.inboxesSection, [field]: value } },
        }));
    }

    function updateInbox(index: number, field: keyof Inbox, value: string) {
        setFormData((prev) => {
            const inboxes = [...prev.content.inboxesSection.inboxes];
            inboxes[index] = { ...inboxes[index], [field]: value };
            return { ...prev, content: { ...prev.content, inboxesSection: { ...prev.content.inboxesSection, inboxes } } };
        });
    }

    function addInbox() {
        setFormData((prev) => ({
            ...prev,
            content: {
                ...prev.content,
                inboxesSection: {
                    ...prev.content.inboxesSection,
                    inboxes: [...prev.content.inboxesSection.inboxes, { label: "", email: "", detail: "", personName: "", personInitial: "" }],
                },
            },
        }));
    }

    function removeInbox(index: number) {
        setFormData((prev) => {
            const inboxes = prev.content.inboxesSection.inboxes.filter((_, i) => i !== index);
            return { ...prev, content: { ...prev.content, inboxesSection: { ...prev.content.inboxesSection, inboxes } } };
        });
    }

    function setHQ(field: keyof ContactFormData["content"]["headquartersSection"], value: string) {
        setFormData((prev) => ({
            ...prev,
            content: { ...prev.content, headquartersSection: { ...prev.content.headquartersSection, [field]: value } },
        }));
    }

    function setFAQ(field: keyof Omit<ContactFormData["content"]["faqSection"], "faqs">, value: string) {
        setFormData((prev) => ({
            ...prev,
            content: { ...prev.content, faqSection: { ...prev.content.faqSection, [field]: value } },
        }));
    }

    function updateFAQ(index: number, field: keyof FAQ, value: string) {
        setFormData((prev) => {
            const faqs = [...prev.content.faqSection.faqs];
            faqs[index] = { ...faqs[index], [field]: value };
            return { ...prev, content: { ...prev.content, faqSection: { ...prev.content.faqSection, faqs } } };
        });
    }

    function addFAQ() {
        setFormData((prev) => ({
            ...prev,
            content: {
                ...prev.content,
                faqSection: {
                    ...prev.content.faqSection,
                    faqs: [...prev.content.faqSection.faqs, { question: "", answer: "" }],
                },
            },
        }));
    }

    function removeFAQ(index: number) {
        setFormData((prev) => {
            const faqs = prev.content.faqSection.faqs.filter((_, i) => i !== index);
            return { ...prev, content: { ...prev.content, faqSection: { ...prev.content.faqSection, faqs } } };
        });
    }

    function setNewsletter(field: keyof ContactFormData["content"]["newsletterSection"], value: string) {
        setFormData((prev) => ({
            ...prev,
            content: { ...prev.content, newsletterSection: { ...prev.content.newsletterSection, [field]: value } },
        }));
    }

    async function handleRevalidate() {
        const toastId = toast.loading("Revalidating cache...");
        try {
            const res = await fetch("/api/revalidate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tags: ["contact-page"] }),
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
    }

    async function handleSave() {
        setSaving(true);
        try {
            const method = isNew ? "POST" : "PATCH";
            const res = await fetch("/api/contact", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(isNew ? "Contact page created!" : "Contact page updated!");
                setIsNew(false);
            } else {
                toast.error(data.message || "Failed to save");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
        );
    }

    const inputCls = "bg-slate-800/80 border-slate-600 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-colors";
    const labelCls = "block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5";
    const textareaCls = "w-full rounded-md border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors";
    const cardCls = "rounded-lg border border-slate-700/60 bg-slate-800/60 p-4";

    return (
        <div className="min-h-screen bg-slate-900 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">

                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Contact Page</h1>
                        <p className="mt-1 text-sm text-slate-400">
                            {isNew ? "No data yet — fill in all sections and click Create Page." : "Edit and save to update the live contact page."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {!isNew && (
                            <Button
                                variant="outline"
                                onClick={handleRevalidate}
                                title="Clear frontend cache for Contact page"
                                className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Revalidate Cache
                            </Button>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60 cursor-pointer"
                        >
                            {saving ? "Saving…" : isNew ? "Create Page" : "Save Changes"}
                        </Button>
                    </div>
                </div>

                {/* *word* syntax notice */}
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3.5">
                    <Info size={16} className="mt-0.5 shrink-0 text-amber-400" />
                    <div className="text-[13px] leading-[1.6] text-amber-200/80">
                        <span className="font-semibold text-amber-300">Formatting tip:</span>{" "}
                        In heading fields, wrap a word with <code className="rounded bg-amber-500/20 px-1 py-0.5 font-mono text-[12px] text-amber-300">*asterisks*</code> to render it in the brand accent color and italic style on the live site.{" "}
                        Example: <code className="rounded bg-amber-500/20 px-1 py-0.5 font-mono text-[12px] text-amber-300">Above the *filter coffee* shop.</code>
                    </div>
                </div>

                <div className="space-y-3">

                    {/* Meta */}
                    <Collapsible.Root open={openSections.meta} onOpenChange={() => toggleSection("meta")}>
                        <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800/40 backdrop-blur-sm">
                            <Collapsible.Trigger className="w-full cursor-pointer px-5 py-4 hover:bg-slate-800/60 transition-colors">
                                <SectionHeader icon={<FileText size={15} />} title="SEO / Meta" isOpen={openSections.meta} />
                            </Collapsible.Trigger>
                            <Collapsible.Content>
                                <div className="border-t border-slate-700/60 px-5 pb-6 pt-5 space-y-4">
                                    <div>
                                        <label className={labelCls}>Meta Title</label>
                                        <Input className={inputCls} value={formData.metaTitle} onChange={(e) => setMeta("metaTitle", e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Meta Description</label>
                                        <textarea className={textareaCls} rows={2} value={formData.metaDescription} onChange={(e) => setMeta("metaDescription", e.target.value)} />
                                    </div>
                                </div>
                            </Collapsible.Content>
                        </div>
                    </Collapsible.Root>

                    {/* Hero Section */}
                    <Collapsible.Root open={openSections.hero} onOpenChange={() => toggleSection("hero")}>
                        <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800/40 backdrop-blur-sm">
                            <Collapsible.Trigger className="w-full cursor-pointer px-5 py-4 hover:bg-slate-800/60 transition-colors">
                                <SectionHeader icon={<Mail size={15} />} title="01 — Hero Section" isOpen={openSections.hero} count={formData.content.heroSection.contactCards.length} />
                            </Collapsible.Trigger>
                            <Collapsible.Content>
                                <div className="border-t border-slate-700/60 px-5 pb-6 pt-5 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Badge Text</label>
                                            <Input className={inputCls} value={formData.content.heroSection.badge} onChange={(e) => setHero("badge", e.target.value)} placeholder="Get in touch" />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Hours Text</label>
                                            <Input className={inputCls} value={formData.content.heroSection.hours} onChange={(e) => setHero("hours", e.target.value)} placeholder="Mon-Fri · 09:00-19:00 IST" />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className={labelCls + " mb-0"}>Contact Cards</label>
                                            <button onClick={addContactCard} className="flex cursor-pointer items-center gap-1.5 rounded-md bg-indigo-500/15 px-2.5 py-1 text-[12px] font-medium text-indigo-400 hover:bg-indigo-500/25 transition-colors">
                                                <Plus size={11} /> Add Card
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.content.heroSection.contactCards.map((card, i) => (
                                                <div key={i} className={cardCls}>
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <span className="text-[11px] font-mono font-medium text-slate-500">Card {i + 1}</span>
                                                        <button onClick={() => removeContactCard(i)} className="cursor-pointer rounded p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div>
                                                            <label className={labelCls}>Label</label>
                                                            <Input className={inputCls} value={card.label} onChange={(e) => updateContactCard(i, "label", e.target.value)} placeholder="Email Us" />
                                                        </div>
                                                        <div>
                                                            <label className={labelCls}>Value</label>
                                                            <Input className={inputCls} value={card.value} onChange={(e) => updateContactCard(i, "value", e.target.value)} placeholder="hello@magdee.in" />
                                                        </div>
                                                        <div>
                                                            <label className={labelCls}>Detail</label>
                                                            <Input className={inputCls} value={card.detail} onChange={(e) => updateContactCard(i, "detail", e.target.value)} placeholder="One of us within 24 hrs" />
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

                    {/* Inboxes Section */}
                    <Collapsible.Root open={openSections.inboxes} onOpenChange={() => toggleSection("inboxes")}>
                        <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800/40 backdrop-blur-sm">
                            <Collapsible.Trigger className="w-full cursor-pointer px-5 py-4 hover:bg-slate-800/60 transition-colors">
                                <SectionHeader icon={<Users size={15} />} title="02 — Inboxes Section" isOpen={openSections.inboxes} count={formData.content.inboxesSection.inboxes.length} />
                            </Collapsible.Trigger>
                            <Collapsible.Content>
                                <div className="border-t border-slate-700/60 px-5 pb-6 pt-5 space-y-5">
                                    <div>
                                        <label className={labelCls}>Badge Text</label>
                                        <Input className={inputCls} value={formData.content.inboxesSection.badge} onChange={(e) => setInboxes("badge", e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Description</label>
                                        <textarea className={textareaCls} rows={2} value={formData.content.inboxesSection.description} onChange={(e) => setInboxes("description", e.target.value)} />
                                    </div>

                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className={labelCls + " mb-0"}>Inboxes</label>
                                            <button onClick={addInbox} className="flex cursor-pointer items-center gap-1.5 rounded-md bg-indigo-500/15 px-2.5 py-1 text-[12px] font-medium text-indigo-400 hover:bg-indigo-500/25 transition-colors">
                                                <Plus size={11} /> Add Inbox
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.content.inboxesSection.inboxes.map((inbox, i) => (
                                                <div key={i} className={cardCls}>
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <span className="text-[11px] font-mono font-medium text-slate-500">Inbox {i + 1}</span>
                                                        <button onClick={() => removeInbox(i)} className="cursor-pointer rounded p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className={labelCls}>Label</label>
                                                            <Input className={inputCls} value={inbox.label} onChange={(e) => updateInbox(i, "label", e.target.value)} placeholder="Product" />
                                                        </div>
                                                        <div>
                                                            <label className={labelCls}>Email</label>
                                                            <Input className={inputCls} value={inbox.email} onChange={(e) => updateInbox(i, "email", e.target.value)} placeholder="product@magdee.in" />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className={labelCls}>Detail</label>
                                                            <Input className={inputCls} value={inbox.detail} onChange={(e) => updateInbox(i, "detail", e.target.value)} placeholder="VOChef, Mee Tory — feedback, bugs" />
                                                        </div>
                                                        <div>
                                                            <label className={labelCls}>Person Name</label>
                                                            <Input className={inputCls} value={inbox.personName} onChange={(e) => updateInbox(i, "personName", e.target.value)} placeholder="Arjun" />
                                                        </div>
                                                        <div>
                                                            <label className={labelCls}>Person Initial</label>
                                                            <Input className={inputCls} value={inbox.personInitial} onChange={(e) => updateInbox(i, "personInitial", e.target.value)} placeholder="A" maxLength={1} />
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

                    {/* Headquarters Section */}
                    <Collapsible.Root open={openSections.hq} onOpenChange={() => toggleSection("hq")}>
                        <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800/40 backdrop-blur-sm">
                            <Collapsible.Trigger className="w-full cursor-pointer px-5 py-4 hover:bg-slate-800/60 transition-colors">
                                <SectionHeader icon={<MapPin size={15} />} title="03 — Headquarters Section" isOpen={openSections.hq} />
                            </Collapsible.Trigger>
                            <Collapsible.Content>
                                <div className="border-t border-slate-700/60 px-5 pb-6 pt-5 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Badge Text</label>
                                            <Input className={inputCls} value={formData.content.headquartersSection.badge} onChange={(e) => setHQ("badge", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Company Name</label>
                                            <Input className={inputCls} value={formData.content.headquartersSection.companyName} onChange={(e) => setHQ("companyName", e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Address (each line = new line on site)</label>
                                        <textarea className={textareaCls} rows={3} value={formData.content.headquartersSection.address} onChange={(e) => setHQ("address", e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Phone</label>
                                            <Input className={inputCls} value={formData.content.headquartersSection.phone} onChange={(e) => setHQ("phone", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Office Hours</label>
                                            <Input className={inputCls} value={formData.content.headquartersSection.hours} onChange={(e) => setHQ("hours", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Latitude</label>
                                            <Input className={inputCls} value={formData.content.headquartersSection.lat} onChange={(e) => setHQ("lat", e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Longitude</label>
                                            <Input className={inputCls} value={formData.content.headquartersSection.long} onChange={(e) => setHQ("long", e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Google Maps URL</label>
                                        <Input className={inputCls} value={formData.content.headquartersSection.mapsUrl} onChange={(e) => setHQ("mapsUrl", e.target.value)} />
                                    </div>

                                    <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4">
                                        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Neighborhood Side</p>
                                        <div className="space-y-4">
                                            <div>
                                                <label className={labelCls}>Heading <span className="normal-case tracking-normal text-amber-400/70">— use *word* for accent color</span></label>
                                                <Input className={inputCls} value={formData.content.headquartersSection.neighborhoodHeading} onChange={(e) => setHQ("neighborhoodHeading", e.target.value)} placeholder="Above the *filter coffee* shop." />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Description</label>
                                                <textarea className={textareaCls} rows={3} value={formData.content.headquartersSection.neighborhoodDescription} onChange={(e) => setHQ("neighborhoodDescription", e.target.value)} />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Map Image URL <span className="normal-case tracking-normal text-slate-600">— optional</span></label>
                                                <Input className={inputCls} value={formData.content.headquartersSection.mapImgUrl} onChange={(e) => setHQ("mapImgUrl", e.target.value)} placeholder="https://..." />
                                                {formData.content.headquartersSection.mapImgUrl && (
                                                    <img src={formData.content.headquartersSection.mapImgUrl} alt="Map preview" className="mt-3 max-h-40 w-full rounded-lg border border-slate-600 object-cover" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Collapsible.Content>
                        </div>
                    </Collapsible.Root>

                    {/* FAQ Section */}
                    <Collapsible.Root open={openSections.faq} onOpenChange={() => toggleSection("faq")}>
                        <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800/40 backdrop-blur-sm">
                            <Collapsible.Trigger className="w-full cursor-pointer px-5 py-4 hover:bg-slate-800/60 transition-colors">
                                <SectionHeader icon={<HelpCircle size={15} />} title="04 — FAQ Section" isOpen={openSections.faq} count={formData.content.faqSection.faqs.length} />
                            </Collapsible.Trigger>
                            <Collapsible.Content>
                                <div className="border-t border-slate-700/60 px-5 pb-6 pt-5 space-y-5">
                                    <div>
                                        <label className={labelCls}>Badge Text</label>
                                        <Input className={inputCls} value={formData.content.faqSection.badge} onChange={(e) => setFAQ("badge", e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Description</label>
                                        <textarea className={textareaCls} rows={2} value={formData.content.faqSection.description} onChange={(e) => setFAQ("description", e.target.value)} />
                                    </div>

                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className={labelCls + " mb-0"}>FAQ Items</label>
                                            <button onClick={addFAQ} className="flex cursor-pointer items-center gap-1.5 rounded-md bg-indigo-500/15 px-2.5 py-1 text-[12px] font-medium text-indigo-400 hover:bg-indigo-500/25 transition-colors">
                                                <Plus size={11} /> Add FAQ
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.content.faqSection.faqs.map((faq, i) => (
                                                <div key={i} className={cardCls}>
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <span className="text-[11px] font-mono font-medium text-slate-500">FAQ {i + 1}</span>
                                                        <button onClick={() => removeFAQ(i)} className="cursor-pointer rounded p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className={labelCls}>Question</label>
                                                            <Input className={inputCls} value={faq.question} onChange={(e) => updateFAQ(i, "question", e.target.value)} />
                                                        </div>
                                                        <div>
                                                            <label className={labelCls}>Answer</label>
                                                            <textarea className={textareaCls} rows={3} value={faq.answer} onChange={(e) => updateFAQ(i, "answer", e.target.value)} />
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

                    {/* Newsletter Section */}
                    <Collapsible.Root open={openSections.newsletter} onOpenChange={() => toggleSection("newsletter")}>
                        <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800/40 backdrop-blur-sm">
                            <Collapsible.Trigger className="w-full cursor-pointer px-5 py-4 hover:bg-slate-800/60 transition-colors">
                                <SectionHeader icon={<Send size={15} />} title="05 — Newsletter Section" isOpen={openSections.newsletter} />
                            </Collapsible.Trigger>
                            <Collapsible.Content>
                                <div className="border-t border-slate-700/60 px-5 pb-6 pt-5 space-y-4">
                                    <div>
                                        <label className={labelCls}>Badge Text</label>
                                        <Input className={inputCls} value={formData.content.newsletterSection.badge} onChange={(e) => setNewsletter("badge", e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Heading</label>
                                        <Input className={inputCls} value={formData.content.newsletterSection.heading} onChange={(e) => setNewsletter("heading", e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Description</label>
                                        <textarea className={textareaCls} rows={2} value={formData.content.newsletterSection.description} onChange={(e) => setNewsletter("description", e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Newsletter Email <span className="normal-case tracking-normal text-slate-500">— mailto target</span></label>
                                        <Input className={inputCls} value={formData.content.newsletterSection.email} onChange={(e) => setNewsletter("email", e.target.value)} placeholder="hello@magdee.in" />
                                    </div>
                                </div>
                            </Collapsible.Content>
                        </div>
                    </Collapsible.Root>

                </div>

            </div>
        </div>
    );
}
