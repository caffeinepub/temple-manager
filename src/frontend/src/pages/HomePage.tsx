import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile, useIsAdmin, useNotices } from "../hooks/useQueries";

export function HomePage() {
  const { identity, clear } = useInternetIdentity();
  const { data: notices = [], isLoading } = useNotices();
  const { data: isAdmin } = useIsAdmin();
  const { data: profile } = useCallerProfile();

  function handleLogout() {
    clear();
    toast.success("Logged out successfully");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div
        className="relative w-full bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/assets/generated/temple-hero.dim_1200x400.jpg')",
          minHeight: 320,
        }}
      >
        <div className="absolute inset-0 bg-saffron-900/50" />
        <div className="relative flex flex-col items-center justify-center py-16 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-5xl mb-3">🕉️</div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
              Hosamma Temple
            </h1>
            <p className="text-white/80 text-lg">Management Portal</p>
            <div className="flex justify-center mt-4">
              <div className="h-0.5 w-32 gold-shimmer rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Nav bar */}
      <nav className="bg-card border-b border-border shadow-xs px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🕉️</span>
          <span className="font-display font-bold text-saffron-600">
            Hosamma Temple
          </span>
        </div>
        <div className="flex items-center gap-2">
          {identity ? (
            <>
              {isAdmin && (
                <Link to="/dashboard">
                  <Button
                    data-ocid="home.dashboard.button"
                    variant="outline"
                    className="border-saffron-600 text-saffron-600 hover:bg-saffron-50"
                    size="sm"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                  </Button>
                </Link>
              )}
              <Button
                data-ocid="home.logout.button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button
                  data-ocid="home.login.button"
                  className="temple-gradient text-white hover:opacity-90"
                  size="sm"
                >
                  <LogIn className="w-4 h-4 mr-1" /> Sign In
                </Button>
              </Link>
              <Link to="/admin-login">
                <Button
                  data-ocid="home.admin_login.button"
                  variant="outline"
                  className="border-saffron-800 text-saffron-800 hover:bg-saffron-950/10 font-semibold"
                  size="sm"
                >
                  <ShieldCheck className="w-4 h-4 mr-1" /> Admin Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        {identity && profile && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Badge className="temple-gradient text-white px-4 py-1.5 text-sm">
              <Heart className="w-3 h-3 mr-1" /> Welcome back, {profile.name}!
            </Badge>
          </motion.div>
        )}

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-saffron-600" />
            <h2 className="font-display text-2xl font-semibold text-saffron-600">
              Temple Notices
            </h2>
          </div>

          {isLoading ? (
            <div
              data-ocid="home.loading_state"
              className="flex justify-center py-12"
            >
              <Loader2 className="w-8 h-8 animate-spin text-saffron-600" />
            </div>
          ) : notices.length === 0 ? (
            <div
              data-ocid="home.empty_state"
              className="text-center py-12 bg-card rounded-xl border border-border"
            >
              <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-display text-lg text-muted-foreground">
                No notices at this time
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back later for temple announcements
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {notices.map((notice, i) => (
                <motion.div
                  key={notice.title}
                  data-ocid={`home.item.${i + 1}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="border-border hover:shadow-temple transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-base text-saffron-600">
                        {notice.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {notice.body}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Temple info */}
        <section className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🙏",
              title: "Daily Aarti",
              desc: "Morning aarti at 6:00 AM and evening aarti at 7:00 PM",
            },
            {
              icon: "📅",
              title: "Festival Calendar",
              desc: "Ram Navami, Hanuman Jayanti, Diwali and all major festivals celebrated",
            },
            {
              icon: "❤️",
              title: "Community Service",
              desc: "Free meals (prasad) distributed every Sunday to all devotees",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              data-ocid={`home.card.${i + 1}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Card className="border-border text-center p-6 hover:shadow-temple transition-shadow">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-display text-lg font-semibold text-saffron-600 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Admin portal CTA */}
        {!identity && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10"
          >
            <div className="flex items-center justify-center gap-4 p-6 bg-saffron-950/5 border border-saffron-800/20 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-saffron-700 shrink-0" />
              <div>
                <p className="font-display text-base font-semibold text-saffron-700">
                  Temple Administrator?
                </p>
                <p className="text-sm text-muted-foreground">
                  Access the admin dashboard to manage temple operations
                </p>
              </div>
              <Link to="/admin-login">
                <Button
                  data-ocid="home.admin_login.secondary_button"
                  className="admin-gradient text-white hover:opacity-90 font-semibold shrink-0"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" /> Admin Login
                </Button>
              </Link>
            </div>
          </motion.section>
        )}
      </main>

      <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} Hosamma Temple. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-saffron-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
