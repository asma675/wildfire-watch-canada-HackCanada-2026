import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Building2, Phone, Mail, MapPin, Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";

const provinceTabs = [
  { code: "ALL", label: "All Provinces" },
  { code: "BC", label: "British Columbia" },
  { code: "AB", label: "Alberta" },
  { code: "ON", label: "Ontario" },
  { code: "QC", label: "Quebec" },
  { code: "SK", label: "Saskatchewan" },
  { code: "MB", label: "Manitoba" },
];

const typeColors = {
  Municipal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Provincial: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Federal: "bg-red-500/10 text-red-400 border-red-500/20",
  Volunteer: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function FireDepartments() {
  const [province, setProvince] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["fireDepartments"],
    queryFn: () => base44.entities.FireDepartment.list("province", 200),
  });

  const filtered = departments.filter((d) => {
    const matchProvince = province === "ALL" || d.province === province;
    const matchSearch = !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.city?.toLowerCase().includes(search.toLowerCase());
    return matchProvince && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Fire Departments</h1>
        <p className="text-sm text-slate-400 mt-1">Emergency contacts by province</p>
      </div>

      {/* Emergency Banner */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3">
        <Phone className="w-5 h-5 text-red-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-400">Emergency? Call 911</p>
          <p className="text-xs text-slate-400">For non-emergency inquiries, contact departments directly below.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments..."
            className="bg-white/5 border-white/10 text-white pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {provinceTabs.map((p) => (
            <button
              key={p.code}
              onClick={() => setProvince(p.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                province === p.code
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Departments Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No fire departments found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dept) => (
            <div key={dept.id} className="rounded-2xl border border-white/5 bg-[#1a1a2e]/80 p-4 hover:border-white/10 transition-all space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10 flex-shrink-0">
                    <Shield className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{dept.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-400">{dept.city ? `${dept.city}, ` : ""}{dept.province}</span>
                    </div>
                  </div>
                </div>
              </div>

              {dept.type && (
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[dept.type] || typeColors.Municipal}`}>
                  {dept.type}
                </span>
              )}

              <div className="space-y-1.5 pt-1">
                {dept.phone && (
                  <a href={`tel:${dept.phone}`} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
                    <Phone className="w-3 h-3" /> {dept.phone}
                  </a>
                )}
                {dept.email && (
                  <a href={`mailto:${dept.email}`} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
                    <Mail className="w-3 h-3" /> {dept.email}
                  </a>
                )}
                {dept.address && (
                  <p className="flex items-start gap-2 text-xs text-slate-500">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" /> {dept.address}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}