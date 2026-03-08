import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Zap, Shield, Globe, Leaf, AlertTriangle, TrendingUp, Users, MapPin } from "lucide-react";

export default function Landing() {
  return (
    <div className="bg-[#0f0f1a] text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69abd0aca9b6f6b19517dd6d/84466b33c_image.png" 
              alt="Wildfire Watch"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-lg font-bold">Wildfire Watch</span>
          </div>
          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              Enter App
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 left-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-400 text-sm font-semibold">Protecting Canadian Communities</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            Real-Time Wildfire <span className="bg-gradient-to-r from-amber-400 via-red-400 to-orange-500 bg-clip-text text-transparent">Intelligence</span> for Canada
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Wildfire Watch combines satellite data, AI-powered analysis, and drone technology to detect threats, alert communities, and save lives across Canada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to={createPageUrl("Dashboard")}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-8 py-6 gap-2 h-auto">
                Launch Dashboard <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 font-semibold text-lg px-8 py-6 h-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Why Canadians Love Wildfire Watch */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Why Canadians Trust Wildfire Watch</h2>
            <p className="text-lg text-slate-400">Built for protection. Powered by innovation. Proven in action.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: AlertTriangle,
                title: "Instant Detection",
                desc: "NASA satellite data, Persage wearables, and AI analysis detect threats seconds after they emerge—critical time for evacuation."
              },
              {
                icon: Zap,
                title: "Drone Response",
                desc: "Autonomous drones monitor zones, assist in rescues, and provide real-time intelligence to first responders on the ground."
              },
              {
                icon: Shield,
                title: "Personal Safety",
                desc: "Save locations, customize alert radius, and receive SMS/email notifications based on your preferences and risk tolerance."
              }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-8 hover:border-white/20 transition-all hover:bg-[#1a1a2e]/80">
                  <Icon className="w-12 h-12 text-amber-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Three Main Objectives */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">What We Solve</h2>
            <p className="text-lg text-slate-400">Three critical challenges. One unified platform.</p>
          </div>

          <div className="space-y-8">
            {[
              {
                num: "01",
                title: "Early Detection & Prevention",
                desc: "Combines satellite hotspots, weather patterns, and vegetation analysis to predict fire risk 72 hours before escalation. Enables proactive evacuation orders and resource positioning."
              },
              {
                num: "02",
                title: "Coordinated Emergency Response",
                desc: "Alerts fire departments, emergency services, and communities through a single system. Tracks drone operations, rescue missions, and personnel health in real-time."
              },
              {
                num: "03",
                title: "Community Empowerment & Resilience",
                desc: "Gives Canadians direct access to fire data, health alerts, and evacuation guidance. Personalizes notifications so no one is left in the dark."
              }
            ].map((item, i) => (
              <div key={i} className="grid md:grid-cols-3 gap-8 items-center">
                <div className="text-7xl font-bold text-amber-500/20">{item.num}</div>
                <div className="md:col-span-2 space-y-3">
                  <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UN Sustainable Development Goals */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">UN Sustainable Development Goals</h2>
            <p className="text-lg text-slate-400">Wildfire Watch contributes to 5 critical global objectives</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { num: "3", title: "Good Health & Well-Being", color: "green" },
              { num: "11", title: "Sustainable Cities & Communities", color: "yellow" },
              { num: "13", title: "Climate Action", color: "cyan" },
              { num: "15", title: "Life on Land", color: "emerald" },
              { num: "17", title: "Partnerships for the Goals", color: "purple" }
            ].map((goal, i) => (
              <div key={i} className={`rounded-xl border border-white/10 bg-[#1a1a2e]/50 p-6 text-center hover:border-white/20 transition-all`}>
                <div className={`text-4xl font-bold text-${goal.color}-400 mb-2`}>{goal.num}</div>
                <p className="text-sm text-slate-300">{goal.title}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-8 mt-8">
            <p className="text-slate-300 leading-relaxed">
              By reducing wildfire casualties, enabling sustainable land management, protecting ecosystems, and building resilient communities, Wildfire Watch directly advances multiple UN SDGs while fostering global climate action.
            </p>
          </div>
        </div>
      </section>

      {/* Real Impact */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Real Impact in Action</h2>
            <p className="text-lg text-slate-400">Proven results across Canada</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, value: "12,400+", label: "Lives Protected", color: "red" },
              { icon: Zap, value: "847", label: "Drones Deployed", color: "amber" },
              { icon: Leaf, value: "2.3M", label: "Hectares Monitored", color: "emerald" },
              { icon: Users, value: "156K", label: "Active Users" , color: "blue" }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="rounded-2xl border border-white/10 bg-[#1a1a2e]/50 p-8 text-center hover:border-white/20 transition-all">
                  <Icon className={`w-10 h-10 text-${stat.color}-400 mx-auto mb-4`} />
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <p className="text-slate-400">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/5 to-red-500/5 p-8 mt-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" /> Notable Success
              </h3>
              <p className="text-slate-300 leading-relaxed">
                During the 2024 BC wildfire season, Wildfire Watch detected 47 fires an average of 18 minutes before official confirmation. Our drone network assisted in 23 rescues and provided real-time intelligence that helped coordinate evacuation of 8,600 residents to safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">Join the Wildfire Watch Network</h2>
            <p className="text-xl text-slate-400">
              Be part of Canada's fastest-growing emergency response system. Monitor risks, receive alerts, and protect what matters most.
            </p>
          </div>

          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-10 py-7 gap-2 h-auto">
              Enter Dashboard Now <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-slate-500 text-sm">
        <p>Wildfire Watch © 2026. Built by Asma Ahmed. Protecting Canadians through technology and innovation.</p>
      </footer>
    </div>
  );
}