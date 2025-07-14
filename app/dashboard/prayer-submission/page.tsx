"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, Clock, CheckCircle, Heart } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PrayerRequest {
  id: string
  userName: string
  userEmail: string
  userAvatar: string
  subject: string
  prayerRequest: string
  category: "Personal" | "Family" | "Health" | "Financial" | "Spiritual" | "Other"
  priority: "Low" | "Medium" | "High" | "Urgent"
  status: "Pending" | "In Progress" | "Responded" | "Closed"
  submittedAt: string
  respondedAt?: string
  adminResponse?: string
  adminName?: string
}

const mockPrayerRequests: PrayerRequest[] = [
  {
    id: "PR001",
    userName: "Sarah Johnson",
    userEmail: "sarah.johnson@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    subject: "Healing for my mother",
    prayerRequest:
      "Please pray for my mother who is undergoing surgery next week. We need God's healing touch and guidance for the medical team.",
    category: "Health",
    priority: "High",
    status: "Pending",
    submittedAt: "2024-01-20T14:30:00",
  },
  {
    id: "PR002",
    userName: "Michael Davis",
    userEmail: "michael.davis@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    subject: "Job opportunity",
    prayerRequest:
      "I've been unemployed for 3 months. Please pray that God opens doors for the right job opportunity for me and my family.",
    category: "Financial",
    priority: "Medium",
    status: "Responded",
    submittedAt: "2024-01-19T10:15:00",
    respondedAt: "2024-01-19T16:20:00",
    adminResponse:
      "We are praying for God's provision and guidance in your job search. Trust in His perfect timing and continue to seek His will. May He open the right doors for you.",
    adminName: "Pastor John",
  },
  {
    id: "PR003",
    userName: "Emily Wilson",
    userEmail: "emily.wilson@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    subject: "Marriage restoration",
    prayerRequest:
      "My husband and I are going through a difficult time. Please pray for restoration and healing in our marriage.",
    category: "Family",
    priority: "High",
    status: "In Progress",
    submittedAt: "2024-01-18T09:45:00",
  },
  {
    id: "PR004",
    userName: "David Brown",
    userEmail: "david.brown@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    subject: "Spiritual growth",
    prayerRequest:
      "I feel distant from God lately. Please pray for my spiritual growth and that I may draw closer to Him through prayer and study.",
    category: "Spiritual",
    priority: "Medium",
    status: "Pending",
    submittedAt: "2024-01-17T20:30:00",
  },
]

export default function PrayerSubmissionPage() {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null)
  const [responseForm, setResponseForm] = useState({
    response: "",
    adminName: "",
  })
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPrayerRequests(mockPrayerRequests)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleRespondToPrayer = (request: PrayerRequest) => {
    setSelectedRequest(request)
    setResponseForm({
      response: request.adminResponse || "",
      adminName: request.adminName || "",
    })
    setIsResponseDialogOpen(true)
  }

  const handleSendResponse = async () => {
    if (selectedRequest) {
      const updatedRequest = {
        ...selectedRequest,
        status: "Responded" as const,
        adminResponse: responseForm.response,
        adminName: responseForm.adminName,
        respondedAt: new Date().toISOString(),
      }

      setPrayerRequests(prayerRequests.map((request) => (request.id === selectedRequest.id ? updatedRequest : request)))

      // Here you would send a push notification to the user
      console.log("Sending notification to user:", selectedRequest.userEmail)
      console.log("Response:", responseForm.response)

      setIsResponseDialogOpen(false)
      setSelectedRequest(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Responded":
        return "bg-green-100 text-green-800"
      case "Closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-gray-100 text-gray-800"
      case "Medium":
        return "bg-blue-100 text-blue-800"
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Urgent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredRequests = prayerRequests.filter((request) => {
    const statusMatch = statusFilter === "all" || request.status === statusFilter
    const priorityMatch = priorityFilter === "all" || request.priority === priorityFilter
    return statusMatch && priorityMatch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Prayer Submissions</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage prayer requests from users and send personalized responses with direct notifications.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prayerRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prayerRequests.filter((r) => r.status === "Pending").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responded</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prayerRequests.filter((r) => r.status === "Responded").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prayerRequests.filter((r) => r.priority === "High" || r.priority === "Urgent").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prayer Requests</CardTitle>
          <CardDescription>Review and respond to prayer requests from app users</CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="status-filter">Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Responded">Responded</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="priority-filter">Priority:</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={request.userAvatar || "/placeholder.svg"} alt={request.userName} />
                      <AvatarFallback>
                        {request.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{request.userName}</div>
                      <div className="text-sm text-gray-600">{request.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <div className="font-medium">{request.subject}</div>
                      <div className="text-sm text-gray-600 truncate">{request.prayerRequest}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(request.submittedAt)}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleRespondToPrayer(request)}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {request.status === "Responded" ? "Edit" : "Respond"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Respond to Prayer Request</DialogTitle>
            <DialogDescription>Send a personalized response that will notify the user directly.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Prayer Request:</h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Subject:</strong> {selectedRequest.subject}
                </p>
                <p className="text-sm text-gray-700">{selectedRequest.prayerRequest}</p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="adminName">Your Name</Label>
                  <Input
                    id="adminName"
                    value={responseForm.adminName}
                    onChange={(e) => setResponseForm({ ...responseForm, adminName: e.target.value })}
                    placeholder="Enter your name (e.g., Pastor John)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="response">Response Message</Label>
                  <Textarea
                    id="response"
                    value={responseForm.response}
                    onChange={(e) => setResponseForm({ ...responseForm, response: e.target.value })}
                    placeholder="Write your prayer response and encouragement..."
                    rows={6}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendResponse}>
              <Send className="mr-2 h-4 w-4" />
              Send Response & Notify User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
