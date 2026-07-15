"use client";

import { useEffect, useState } from "react";
import { Trash2, Search, ChevronLeft, ChevronRight, Home, MessageSquare, BookOpen, Globe, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Registration {
  _id: string;
  email: string;
  pageSource: "home" | "contact" | "blog" | "about";
  pageUrl: string;
  metadata?: { selectedProducts?: string[] };
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const SOURCE_CONFIG = {
  home:    { label: "Home",    color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",  icon: Home },
  contact: { label: "Contact", color: "bg-blue-500/20 text-blue-400 border-blue-500/30",        icon: MessageSquare },
  blog:    { label: "Blog",    color: "bg-green-500/20 text-green-400 border-green-500/30",     icon: BookOpen },
  about:   { label: "About",   color: "bg-purple-500/20 text-purple-400 border-purple-500/30",  icon: Info },
};

const ALL_SOURCES = ["home", "contact", "blog", "about"] as const;
type SourceKey = keyof typeof SOURCE_CONFIG;

function SourceBadge({ source }: { source: string }) {
  const cfg = SOURCE_CONFIG[source as keyof typeof SOURCE_CONFIG] ?? {
    label: source,
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    icon: Globe,
  };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1, totalPages: 1, totalCount: 0,
    limit: 20, hasNextPage: false, hasPrevPage: false,
  });
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({
    all: 0, home: 0, contact: 0, blog: 0, about: 0,
  });

  const fetchSourceCounts = async () => {
    try {
      const results = await Promise.all([
        fetch("/api/registrations?page=1&limit=1"),
        ...ALL_SOURCES.map((s) => fetch(`/api/registrations?page=1&limit=1&source=${s}`)),
      ]);
      const jsons = await Promise.all(results.map((r) => r.json()));
      const [allData, ...perSource] = jsons;
      const counts: Record<string, number> = { all: allData.pagination?.totalCount ?? 0 };
      ALL_SOURCES.forEach((s, i) => {
        counts[s] = perSource[i].pagination?.totalCount ?? 0;
      });
      setSourceCounts(counts);
    } catch {
      // ignore — counts stay at 0
    }
  };

  const fetchRegistrations = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (source !== "all") params.append("source", source);

      const res = await fetch(`/api/registrations?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setRegistrations(data.registrations ?? []);
        if (data.pagination) setPagination(data.pagination);
      } else {
        toast.error(data.message || "Failed to fetch registrations");
      }
    } catch {
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSourceCounts(); }, []);
  useEffect(() => { fetchRegistrations(1); }, [source]);

  const handleDelete = async (id: string) => {
    toast.warning("Delete this registration?", {
      description: "This cannot be undone.",
      duration: 5000,
      closeButton: true,
      action: {
        label: "Delete",
        onClick: async () => {
          const toastId = toast.loading("Deleting...");
          try {
            const res = await fetch(`/api/registrations/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
              toast.success("Deleted", { id: toastId });
              fetchRegistrations(pagination.currentPage);
            } else {
              toast.error(data.message || "Failed to delete", { id: toastId });
            }
          } catch {
            toast.error("Failed to delete", { id: toastId });
          }
        },
      },
    });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const filtered = search.trim()
    ? registrations.filter(
        (r) =>
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          r.pageUrl.toLowerCase().includes(search.toLowerCase())
      )
    : registrations;

  return (
    <div className="min-h-screen w-full p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Registrations</h1>
          <p className="text-slate-400">Email interests captured from the website</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(["all", ...ALL_SOURCES] as const).map((s) => {
            const isActive = source === s;
            const label = s === "all" ? "Total" : SOURCE_CONFIG[s as SourceKey].label;
            const accentColor = s === "all"
              ? "border-indigo-500/60 bg-indigo-500/10"
              : s === "home"    ? "border-indigo-400/50 bg-indigo-500/8"
              : s === "contact" ? "border-blue-400/50 bg-blue-500/8"
              : s === "blog"    ? "border-green-400/50 bg-green-500/8"
              :                   "border-purple-400/50 bg-purple-500/8";
            return (
              <div
                key={s}
                onClick={() => setSource(s)}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 ${
                  isActive
                    ? `${accentColor} ring-2 ring-indigo-500/70 shadow-lg shadow-indigo-500/10`
                    : "border-white/8 bg-white/4 hover:bg-white/8"
                }`}
              >
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className={`mt-1.5 text-3xl font-bold ${isActive ? "text-white" : "text-slate-200"}`}>
                  {sourceCounts[s] ?? 0}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by email or URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900/60 text-white border-slate-600 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
            />
          </div>
          <Select value={source} onValueChange={(v) => setSource(v)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-900/60 text-white border-slate-600 cursor-pointer hover:border-slate-500 transition-colors">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 text-white border-slate-700">
              <SelectItem value="all"     className="text-white focus:bg-slate-700 cursor-pointer">All Sources</SelectItem>
              <SelectItem value="home"    className="text-white focus:bg-slate-700 cursor-pointer">Home</SelectItem>
              <SelectItem value="contact" className="text-white focus:bg-slate-700 cursor-pointer">Contact</SelectItem>
              <SelectItem value="blog"    className="text-white focus:bg-slate-700 cursor-pointer">Blog</SelectItem>
              <SelectItem value="about"   className="text-white focus:bg-slate-700 cursor-pointer">About</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => { fetchSourceCounts(); fetchRegistrations(1); }}
            className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white cursor-pointer font-semibold tracking-wide transition-all duration-150 shadow-md shadow-indigo-500/20"
          >
            Refresh
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/8 bg-white/4 hover:bg-transparent">
                <TableHead className="text-slate-300 font-semibold text-xs uppercase tracking-wider py-4">Email</TableHead>
                <TableHead className="text-slate-300 font-semibold text-xs uppercase tracking-wider">Source</TableHead>
                <TableHead className="text-slate-300 font-semibold text-xs uppercase tracking-wider">Page URL</TableHead>
                <TableHead className="text-slate-300 font-semibold text-xs uppercase tracking-wider">Products</TableHead>
                <TableHead className="text-slate-300 font-semibold text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-slate-300 font-semibold text-xs uppercase tracking-wider text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j} className="py-4">
                        <div className="h-4 bg-slate-700/60 rounded-md animate-pulse" style={{ width: `${60 + j * 10}px` }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((r) => (
                  <TableRow key={r._id} className="border-white/5 hover:bg-white/5 transition-colors duration-150 group">
                    <TableCell className="text-slate-100 font-medium text-sm py-4">{r.email}</TableCell>
                    <TableCell><SourceBadge source={r.pageSource} /></TableCell>
                    <TableCell className="text-slate-400 text-sm font-mono max-w-[200px] truncate" title={r.pageUrl}>
                      {r.pageUrl}
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">
                      {r.metadata?.selectedProducts?.length
                        ? r.metadata.selectedProducts.join(", ")
                        : <span className="text-slate-600">—</span>}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm whitespace-nowrap">{formatDate(r.createdAt)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(r._id)}
                        className="h-8 w-8 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/15 cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-150"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-white/5">
                  <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                    {search ? `No results for "${search}"` : "No registrations yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/8 bg-white/3">
              <p className="text-sm text-slate-400">
                Showing <span className="text-slate-200 font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}–{Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}</span> of <span className="text-slate-200 font-medium">{pagination.totalCount}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost" size="sm"
                  onClick={() => fetchRegistrations(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="h-9 px-3 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border border-white/10 rounded-lg gap-1 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let p: number;
                  if (pagination.totalPages <= 5) p = i + 1;
                  else if (pagination.currentPage <= 3) p = i + 1;
                  else if (pagination.currentPage >= pagination.totalPages - 2) p = pagination.totalPages - 4 + i;
                  else p = pagination.currentPage - 2 + i;
                  const isCurrentPage = pagination.currentPage === p;
                  return (
                    <Button
                      key={p}
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchRegistrations(p)}
                      className={`h-9 w-9 p-0 rounded-lg font-medium cursor-pointer transition-all border ${
                        isCurrentPage
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/25"
                          : "text-slate-400 hover:text-white hover:bg-white/10 border-white/8"
                      }`}
                    >
                      {p}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost" size="sm"
                  onClick={() => fetchRegistrations(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="h-9 px-3 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border border-white/10 rounded-lg gap-1 transition-all"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {!loading && (
            <p className="px-6 py-3 text-xs text-slate-600 border-t border-white/5">
              {search
                ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`
                : `${pagination.totalCount} total registration${pagination.totalCount !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
