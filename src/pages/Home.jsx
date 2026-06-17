import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Radio, PlusCircle, Archive, Users, Mail, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Home = () => {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) return null;

  // Admins (like super admins) land on the campaign dashboard so they can start their
  // own campaigns; the admin panel remains reachable from the nav.

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#030712" }}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Scale outreach <span className="text-[#00f0ff]" style={{ textShadow: "0 0 30px rgba(0, 240, 255, 0.25)" }}>that converts</span>
          </h1>
          <p className="text-base text-white/50 max-w-xl mb-10">
            FocalReach AI researches your prospects and crafts hyper-personalized B2B campaigns that get replies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/login">
              <Button size="lg" className="rounded-full px-8 bg-[#00f0ff] text-zinc-950 hover:bg-[#26f3ff]">
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="rounded-full px-8 border-white/20 text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Launch Campaign", desc: "Start a new outreach mission", icon: PlusCircle, to: "/create", color: "text-accent" },
    { label: "Active Campaigns", desc: "Monitor running campaigns", icon: Radio, to: "/active", color: "text-emerald-600" },
    { label: "Inactive Campaigns", desc: "Review paused or completed", icon: Archive, to: "/inactive", color: "text-muted-foreground" },
  ];

  const stats = [
    { label: "Active Prospects", value: "—", icon: Users },
    { label: "Deliverability", value: "—", icon: Mail },
    { label: "Reply Rate", value: "—", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back{user?.full_name ? `, ${user.full_name}` : ""}. Manage your outreach operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((item) => (
          <Card key={item.label} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <CardTitle className="text-base">{item.label}</CardTitle>
              </div>
              <CardDescription>{item.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={item.to}>
                <Button variant="outline" size="sm">
                  Open <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
