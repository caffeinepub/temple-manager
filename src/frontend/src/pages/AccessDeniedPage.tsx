import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Home, ShieldX } from "lucide-react";
import { motion } from "motion/react";

export function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="font-display text-4xl font-bold text-destructive mb-3">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-8">
          You do not have admin privileges to access this page. Please contact
          the temple administrator.
        </p>
        <Link to="/">
          <Button
            data-ocid="access_denied.primary_button"
            className="temple-gradient text-white hover:opacity-90"
          >
            <Home className="w-4 h-4 mr-2" /> Go to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
