import { Badge } from "@/components/ui/badge";
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
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { RentalRequestStatus } from "../backend.d";
import type { RentalRequest } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetBooks,
  useGetRentalRequests,
  useIsCallerAdmin,
  useUpdateRequestStatus,
} from "../hooks/useQueries";

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function statusBadgeClass(status: RentalRequestStatus) {
  switch (status) {
    case RentalRequestStatus.approved:
      return "bg-green-50 text-green-700 border-green-200";
    case RentalRequestStatus.rejected:
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function ShareLinkCard() {
  const customerUrl = `${window.location.origin}/books`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = customerUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-8 p-5 rounded-xl border border-accent/30 bg-accent/5 flex flex-col sm:flex-row sm:items-center gap-4"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
          <Users className="w-4 h-4 text-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground mb-0.5">
            Share with Customers
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Send this link to customers so they can browse and request books.
          </p>
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground font-mono truncate select-all">
              {customerUrl}
            </span>
          </div>
        </div>
      </div>
      <Button
        type="button"
        data-ocid="admin.share_link.button"
        onClick={handleCopy}
        variant="outline"
        size="sm"
        className={`shrink-0 rounded-full gap-2 transition-all duration-200 ${
          copied
            ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-50"
            : "border-accent/40 text-accent hover:bg-accent/10 hover:border-accent"
        }`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" /> Copied!
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" /> Copy Link
          </>
        )}
      </Button>
    </motion.div>
  );
}

function RequestRow({
  request,
  bookTitle,
  rowIndex,
}: {
  request: RentalRequest;
  bookTitle: string;
  rowIndex: number;
}) {
  const { mutate: updateStatus, isPending } = useUpdateRequestStatus();

  const handleStatusChange = (newStatus: string) => {
    updateStatus({
      requestId: request.id,
      newStatus: newStatus as RentalRequestStatus,
    });
  };

  return (
    <TableRow data-ocid={`admin.requests.row.${rowIndex}`}>
      <TableCell className="font-medium">{request.borrowerName}</TableCell>
      <TableCell className="text-muted-foreground">
        {request.borrowerEmail}
      </TableCell>
      <TableCell className="max-w-[160px] truncate" title={bookTitle}>
        {bookTitle}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(request.submittedAt)}
      </TableCell>
      <TableCell>
        <Badge
          className={`text-xs border ${statusBadgeClass(request.status)} capitalize`}
        >
          {request.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Select
            defaultValue={request.status}
            onValueChange={handleStatusChange}
            disabled={isPending}
          >
            <SelectTrigger
              data-ocid={`admin.requests.select.${rowIndex}`}
              className="h-8 w-32 text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RentalRequestStatus.pending}>
                Pending
              </SelectItem>
              <SelectItem value={RentalRequestStatus.approved}>
                Approved
              </SelectItem>
              <SelectItem value={RentalRequestStatus.rejected}>
                Rejected
              </SelectItem>
            </SelectContent>
          </Select>
          {isPending && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminPage() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const {
    data: requests,
    isLoading: requestsLoading,
    isError: requestsError,
    refetch,
  } = useGetRentalRequests();
  const { data: books } = useGetBooks();

  const bookMap = new Map((books ?? []).map((b) => [b.id.toString(), b.title]));

  const handleLogin = async () => {
    try {
      await login();
    } catch (err: any) {
      if (err?.message === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div
        data-ocid="admin.page"
        className="container mx-auto px-4 sm:px-6 py-20 flex flex-col items-center text-center gap-6"
      >
        <div className="w-20 h-20 rounded-full bg-primary/8 flex items-center justify-center">
          <Shield className="w-9 h-9 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-foreground mb-2">
            Admin Access
          </h1>
          <p className="text-muted-foreground max-w-xs">
            This page is restricted to administrators. Please log in to
            continue.
          </p>
        </div>
        <Button
          data-ocid="admin.login_button"
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 gap-2"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" /> Login to Admin
            </>
          )}
        </Button>
      </div>
    );
  }

  // Loading admin check
  if (isAdminLoading) {
    return (
      <div
        data-ocid="admin.page"
        className="container mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-4"
      >
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div
        data-ocid="admin.page"
        className="container mx-auto px-4 sm:px-6 py-20 flex flex-col items-center text-center gap-6"
      >
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-9 h-9 text-destructive" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground max-w-xs">
            Your account does not have admin privileges.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="rounded-full px-6 gap-2"
        >
          <LogOut className="w-4 h-4" /> Log out
        </Button>
      </div>
    );
  }

  // Admin view
  return (
    <div
      data-ocid="admin.page"
      className="container mx-auto px-4 sm:px-6 py-12"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-accent" />
            <span className="text-xs font-medium text-accent uppercase tracking-widest">
              Admin Panel
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-foreground">
            My Responses
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all book borrow requests from your community.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-full gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="rounded-full gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Log out
          </Button>
        </div>
      </motion.div>

      {/* Share with Customers card */}
      <ShareLinkCard />

      {/* Loading */}
      {requestsLoading && (
        <div
          data-ocid="admin.requests.loading_state"
          className="flex items-center justify-center py-16 gap-3"
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading requests...</span>
        </div>
      )}

      {/* Error */}
      {requestsError && (
        <div
          data-ocid="admin.requests.error_state"
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="font-medium text-foreground">Failed to load requests</p>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="rounded-full gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      )}

      {/* Empty */}
      {!requestsLoading && !requestsError && (requests ?? []).length === 0 && (
        <div
          data-ocid="admin.requests.empty_state"
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <Shield className="w-12 h-12 text-muted-foreground/30" />
          <p className="font-medium text-foreground">No rental requests yet</p>
          <p className="text-sm text-muted-foreground">
            When customers submit borrow requests, they'll appear here.
          </p>
        </div>
      )}

      {/* Table */}
      {!requestsLoading && !requestsError && (requests ?? []).length > 0 && (
        <div
          data-ocid="admin.requests.table"
          className="rounded-xl border border-border overflow-hidden shadow-card"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Book</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">
                  Submitted
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(requests ?? []).map((req, i) => (
                <RequestRow
                  key={req.id.toString()}
                  request={req}
                  bookTitle={
                    bookMap.get(req.bookId.toString()) ?? `Book #${req.bookId}`
                  }
                  rowIndex={i + 1}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
