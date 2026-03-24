import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import {
  Bell,
  FileText,
  Loader2,
  LogOut,
  Menu,
  Plus,
  ShieldPlus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAssignRole,
  useCallerProfile,
  useCreateNotice,
  useDeleteNotice,
  useNotices,
} from "../hooks/useQueries";

type Section = "notices" | "admins";

export function DashboardPage() {
  const { clear, identity } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const { data: notices = [], isLoading: noticesLoading } = useNotices();
  const createNotice = useCreateNotice();
  const deleteNotice = useDeleteNotice();
  const assignRole = useAssignRole();

  const [section, setSection] = useState<Section>("notices");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");
  const [noticeDialogOpen, setNoticeDialogOpen] = useState(false);

  const [adminPrincipal, setAdminPrincipal] = useState("");
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState("");

  const principal = identity?.getPrincipal().toString() ?? "";

  async function handleAddNotice() {
    if (!noticeTitle.trim() || !noticeBody.trim()) {
      toast.error("Please fill in both title and body");
      return;
    }
    try {
      await createNotice.mutateAsync({
        title: noticeTitle.trim(),
        body: noticeBody.trim(),
      });
      toast.success("Notice published!");
      setNoticeTitle("");
      setNoticeBody("");
      setNoticeDialogOpen(false);
    } catch {
      toast.error("Failed to publish notice");
    }
  }

  async function handleDeleteNotice(title: string) {
    try {
      await deleteNotice.mutateAsync(title);
      toast.success("Notice deleted");
    } catch {
      toast.error("Failed to delete notice");
    }
  }

  async function handleGrantAdmin() {
    if (!adminPrincipal.trim()) {
      toast.error("Please enter a Principal ID");
      return;
    }
    try {
      const p = Principal.fromText(adminPrincipal.trim());
      await assignRole.mutateAsync({ principal: p, role: UserRole.admin });
      toast.success("Admin role granted!");
      setAdminPrincipal("");
      setAdminDialogOpen(false);
    } catch {
      toast.error("Invalid Principal ID or failed to assign role");
    }
  }

  async function handleRevokeAdmin(principalText: string) {
    try {
      const p = Principal.fromText(principalText);
      await assignRole.mutateAsync({ principal: p, role: UserRole.user });
      toast.success("Admin role revoked");
      setRevokeTarget("");
    } catch {
      toast.error("Failed to revoke admin role");
    }
  }

  function handleLogout() {
    clear();
    toast.success("Logged out successfully");
  }

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    {
      id: "notices",
      label: "Temple Notices",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: "admins",
      label: "Manage Admins",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🕉️</span>
            <h2 className="font-display text-xl font-bold text-sidebar-foreground">
              Hosamma Temple
            </h2>
          </div>
          <p className="text-xs text-sidebar-foreground/60">Admin Dashboard</p>
          <div
            className="h-0.5 w-full mt-3"
            style={{ background: "oklch(0.78 0.14 68)" }}
          />
        </div>

        <nav className="flex-1 px-3">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`dashboard.${item.id}.tab`}
              onClick={() => {
                setSection(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-left transition-all font-medium ${
                section === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {item.icon}
              {item.label}
              {section === item.id && (
                <Badge className="ml-auto text-xs py-0" variant="secondary">
                  Active
                </Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="mb-3 px-2">
            <p className="text-xs text-sidebar-foreground/50 uppercase tracking-wider">
              Logged in as
            </p>
            <p className="text-sm text-sidebar-foreground font-medium truncate">
              {profile?.name ?? "Admin"}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">
              {principal.slice(0, 24)}...
            </p>
          </div>
          <Button
            data-ocid="dashboard.logout.button"
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 w-full h-full cursor-default"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <aside className="relative flex flex-col w-72 bg-sidebar border-r border-sidebar-border">
            <Button
              variant="ghost"
              className="absolute top-3 right-3 text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
              size="icon"
            >
              <X className="w-5 h-5" />
            </Button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card shadow-xs">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-bold text-saffron-600">
              {section === "notices" ? "Temple Notices" : "Manage Admins"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {section === "notices"
                ? "Publish and manage temple announcements"
                : "Grant and revoke admin access"}
            </p>
          </div>
          <div className="ml-auto">
            {section === "notices" ? (
              <Dialog
                open={noticeDialogOpen}
                onOpenChange={setNoticeDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    data-ocid="notices.open_modal_button"
                    className="temple-gradient text-white hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" /> New Notice
                  </Button>
                </DialogTrigger>
                <DialogContent data-ocid="notices.dialog">
                  <DialogHeader>
                    <DialogTitle className="font-display text-saffron-600">
                      Publish New Notice
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        data-ocid="notices.input"
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        placeholder="Notice title..."
                        className="border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Body</Label>
                      <Textarea
                        data-ocid="notices.textarea"
                        value={noticeBody}
                        onChange={(e) => setNoticeBody(e.target.value)}
                        placeholder="Write the notice content..."
                        rows={4}
                        className="border-border resize-none"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      data-ocid="notices.cancel_button"
                      variant="outline"
                      onClick={() => setNoticeDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      data-ocid="notices.submit_button"
                      onClick={handleAddNotice}
                      disabled={createNotice.isPending}
                      className="temple-gradient text-white hover:opacity-90"
                    >
                      {createNotice.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Publishing...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" /> Publish
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    data-ocid="admins.open_modal_button"
                    className="temple-gradient text-white hover:opacity-90"
                  >
                    <ShieldPlus className="w-4 h-4 mr-2" /> Grant Admin
                  </Button>
                </DialogTrigger>
                <DialogContent data-ocid="admins.dialog">
                  <DialogHeader>
                    <DialogTitle className="font-display text-saffron-600">
                      Grant Admin Role
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Principal ID</Label>
                      <Input
                        data-ocid="admins.input"
                        value={adminPrincipal}
                        onChange={(e) => setAdminPrincipal(e.target.value)}
                        placeholder="Enter Principal ID (e.g. aaaaa-aa)"
                        className="font-mono text-sm border-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        The user must be connected to Internet Identity first.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      data-ocid="admins.cancel_button"
                      variant="outline"
                      onClick={() => setAdminDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      data-ocid="admins.submit_button"
                      onClick={handleGrantAdmin}
                      disabled={assignRole.isPending}
                      className="temple-gradient text-white hover:opacity-90"
                    >
                      {assignRole.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Granting...
                        </>
                      ) : (
                        <>
                          <ShieldPlus className="mr-2 h-4 w-4" /> Grant Admin
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </header>

        <ScrollArea className="flex-1 p-6">
          {section === "notices" && (
            <motion.div
              key="notices"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {noticesLoading ? (
                <div
                  data-ocid="notices.loading_state"
                  className="flex justify-center py-16"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-saffron-600" />
                </div>
              ) : notices.length === 0 ? (
                <div
                  data-ocid="notices.empty_state"
                  className="text-center py-16"
                >
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-display text-xl text-muted-foreground">
                    No notices yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Publish your first temple notice
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {notices.map((notice, i) => (
                    <motion.div
                      key={notice.title}
                      data-ocid={`notices.item.${i + 1}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="border-border shadow-xs hover:shadow-temple transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="font-display text-base text-saffron-600 leading-snug">
                              {notice.title}
                            </CardTitle>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  data-ocid={`notices.delete_button.${i + 1}`}
                                  variant="ghost"
                                  size="icon"
                                  className="shrink-0 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Notice?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete "{notice.title}
                                    ".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-ocid="notices.cancel_button">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    data-ocid="notices.confirm_button"
                                    onClick={() =>
                                      handleDeleteNotice(notice.title)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
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
            </motion.div>
          )}

          {section === "admins" && (
            <motion.div
              key="admins"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="font-display text-saffron-600 text-lg">
                    Admin Principals
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage admin access by granting or revoking roles via
                    Principal IDs.
                  </p>
                </CardHeader>
                <CardContent>
                  <div data-ocid="admins.panel" className="text-center py-10">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-display text-lg text-muted-foreground">
                      Your Principal
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 font-mono break-all">
                      {principal}
                    </p>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        To revoke admin from a principal, enter their ID below:
                      </p>
                      <div className="flex gap-2 max-w-lg mx-auto">
                        <Input
                          data-ocid="admins.input"
                          value={revokeTarget}
                          onChange={(e) => setRevokeTarget(e.target.value)}
                          placeholder="Enter Principal ID to revoke"
                          className="font-mono text-sm border-border"
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              data-ocid="admins.delete_button.1"
                              variant="destructive"
                              disabled={!revokeTarget.trim()}
                            >
                              Revoke
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Admin?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove admin role from this principal.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="admins.cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                data-ocid="admins.confirm_button"
                                onClick={() => handleRevokeAdmin(revokeTarget)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Revoke
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
