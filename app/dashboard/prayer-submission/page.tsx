"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, FileDown } from "lucide-react";

interface PrayerRequest {
  id: string;
  userName: string;
  userAvatar: string;
  request: string;
  submittedAt: string;
  sortOrder: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PrayerSubmissionPage() {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleExportPdf = () => {
    if (typeof window === "undefined") return;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write("<html><head><title>Prayer Requests</title>");
    printWindow.document.write(
      "<style>body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;padding:16px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;font-size:12px;} th{text-align:left;background:#f3f4f6;} img{display:none;}</style>",
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write("<h2>Prayer Requests</h2>");

    const headerHtml =
      "<table><thead><tr><th>User</th><th>Request</th><th>Submitted</th></tr></thead><tbody>";
    const rowsHtml = prayerRequests
      .map((req) => {
        const safeUser = req.userName || "";
        const safeRequest = req.request || "";
        const safeDate = formatDate(req.submittedAt);
        return `<tr><td>${safeUser}</td><td>${safeRequest}</td><td>${safeDate}</td></tr>`;
      })
      .join("");

    printWindow.document.write(headerHtml + rowsHtml + "</tbody></table>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);

      const baseSelect =
        "id, submitted_by, request, date_submitted, sort_order";

      let rows: any[] | null = null;

      const { data, error } = await supabase
        .from("g20_prayers")
        .select(`${baseSelect}, user_id, profiles ( images )`)
        .order("date_submitted", { ascending: false });

      if (error) {
        console.error("Failed to load g20_prayers with profiles join", error);
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("g20_prayers")
          .select(baseSelect)
          .order("date_submitted", { ascending: false });

        if (fallbackError) {
          console.error("Failed to load g20_prayers fallback", fallbackError);
          setPrayerRequests([]);
          setIsLoading(false);
          return;
        }
        rows = fallbackData ?? [];
      } else {
        rows = data ?? [];
      }

      const mapped: PrayerRequest[] = rows.map((row: any) => {
        const avatarFromProfile = row.profiles?.images as string | undefined;
        return {
          id: row.id?.toString() ?? "",
          userName: row.submitted_by ?? "Unknown",
          userAvatar:
            avatarFromProfile || "/placeholder.svg?height=40&width=40",
          request: row.request ?? "",
          submittedAt: row.date_submitted ?? new Date().toISOString(),
          sortOrder: row.sort_order ?? 0,
        };
      });

      setPrayerRequests(mapped);
      setIsLoading(false);
    };

    fetchRequests();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRequests = prayerRequests;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Prayer Submissions
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage prayer requests from users and send personalized responses with
          direct notifications.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prayerRequests.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Prayer Requests</CardTitle>
            <CardDescription>
              Review prayer requests submitted by G20 users
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-medium hover:bg-accent"
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </button>
        </CardHeader>
        <CardContent>
          <div id="prayer-requests-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={request.userAvatar || "/placeholder.svg"}
                          alt={request.userName}
                        />
                        <AvatarFallback>
                          {request.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{request.userName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[260px]">
                        <div
                          className="text-sm text-gray-600 truncate"
                          title={request.request}
                        >
                          {request.request.length > 30
                            ? `${request.request.slice(0, 30)}...`
                            : request.request}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(request.submittedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
