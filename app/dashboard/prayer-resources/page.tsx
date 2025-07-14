"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Save, Plus, Trash2, FileText, BookOpen, Heart, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PrayerResource {
  id: string
  title: string
  description: string
  author?: string
  pdfUrl: string
  fileName: string
  fileSize: string
  uploadDate: string
  downloadCount: number
  isActive: boolean
  category: "Prayer Guide" | "Prayer Point" | "Books"
}

const mockPrayerResources: PrayerResource[] = [
  {
    id: "PG001",
    title: "Daily Prayer Guide",
    description: "A comprehensive guide for daily prayer practices and spiritual growth.",
    author: "Pastor John Smith",
    pdfUrl: "/placeholder-pdf.pdf",
    fileName: "daily-prayer-guide.pdf",
    fileSize: "2.5 MB",
    uploadDate: "2024-01-15T10:00:00",
    downloadCount: 245,
    isActive: true,
    category: "Prayer Guide",
  },
  {
    id: "PP001",
    title: "30 Days of Prayer Points",
    description: "Powerful prayer points for breakthrough and spiritual warfare.",
    author: "Minister Sarah Johnson",
    pdfUrl: "/placeholder-pdf.pdf",
    fileName: "30-days-prayer-points.pdf",
    fileSize: "1.8 MB",
    uploadDate: "2024-01-12T14:30:00",
    downloadCount: 189,
    isActive: true,
    category: "Prayer Point",
  },
  {
    id: "BK001",
    title: "The Power of Prayer",
    description: "An inspiring book about the transformative power of prayer in our lives.",
    author: "Dr. Michael Davis",
    pdfUrl: "/placeholder-pdf.pdf",
    fileName: "power-of-prayer.pdf",
    fileSize: "4.2 MB",
    uploadDate: "2024-01-10T16:20:00",
    downloadCount: 156,
    isActive: true,
    category: "Books",
  },
  {
    id: "PG002",
    title: "Fasting and Prayer Manual",
    description: "A complete manual for combining fasting with prayer for spiritual breakthrough.",
    author: "Pastor David Wilson",
    pdfUrl: "/placeholder-pdf.pdf",
    fileName: "fasting-prayer-manual.pdf",
    fileSize: "3.1 MB",
    uploadDate: "2024-01-08T11:45:00",
    downloadCount: 98,
    isActive: false,
    category: "Prayer Guide",
  },
]

export default function PrayerResourcesPage() {
  const [prayerResources, setPrayerResources] = useState<PrayerResource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<PrayerResource | null>(null)
  const [resourceToDelete, setResourceToDelete] = useState<PrayerResource | null>(null)
  const [activeTab, setActiveTab] = useState("Prayer Guide")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
    category: "Prayer Guide" as PrayerResource["category"],
    pdfFile: null as File | null,
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPrayerResources(mockPrayerResources)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleAddResource = (category: PrayerResource["category"]) => {
    setEditingResource(null)
    setFormData({
      title: "",
      description: "",
      author: "",
      category: category,
      pdfFile: null,
    })
    setIsDialogOpen(true)
  }

  const handleEditResource = (resource: PrayerResource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description,
      author: resource.author || "",
      category: resource.category,
      pdfFile: null,
    })
    setIsDialogOpen(true)
  }

  const handleSaveResource = async () => {
    if (editingResource) {
      // Update existing resource
      const updatedResource = {
        ...editingResource,
        title: formData.title,
        description: formData.description,
        author: formData.author,
        category: formData.category,
        pdfUrl: formData.pdfFile ? URL.createObjectURL(formData.pdfFile) : editingResource.pdfUrl,
        fileName: formData.pdfFile ? formData.pdfFile.name : editingResource.fileName,
        fileSize: formData.pdfFile
          ? `${(formData.pdfFile.size / (1024 * 1024)).toFixed(1)} MB`
          : editingResource.fileSize,
      }

      setPrayerResources(
        prayerResources.map((resource) => (resource.id === editingResource.id ? updatedResource : resource)),
      )
      console.log("Updating prayer resource in database:", updatedResource)
    } else {
      // Add new resource
      const newResource: PrayerResource = {
        id: `${formData.category.replace(" ", "").substring(0, 2).toUpperCase()}${String(prayerResources.filter((r) => r.category === formData.category).length + 1).padStart(3, "0")}`,
        title: formData.title,
        description: formData.description,
        author: formData.author,
        category: formData.category,
        pdfUrl: formData.pdfFile ? URL.createObjectURL(formData.pdfFile) : "/placeholder-pdf.pdf",
        fileName: formData.pdfFile ? formData.pdfFile.name : "document.pdf",
        fileSize: formData.pdfFile ? `${(formData.pdfFile.size / (1024 * 1024)).toFixed(1)} MB` : "0 MB",
        uploadDate: new Date().toISOString(),
        downloadCount: 0,
        isActive: true,
      }

      setPrayerResources([...prayerResources, newResource])
      console.log("Saving new prayer resource to database:", newResource)
    }

    setIsDialogOpen(false)
    setEditingResource(null)
  }

  const handleDeleteResource = (resource: PrayerResource) => {
    setResourceToDelete(resource)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteResource = async () => {
    if (resourceToDelete) {
      setPrayerResources(prayerResources.filter((resource) => resource.id !== resourceToDelete.id))
      setIsDeleteDialogOpen(false)
      setResourceToDelete(null)
      console.log("Deleting prayer resource from database:", resourceToDelete.id)
    }
  }

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setFormData({ ...formData, pdfFile: file })
    } else {
      alert("Please select a valid PDF file")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getResourcesByCategory = (category: PrayerResource["category"]) => {
    return prayerResources.filter((resource) => resource.category === category)
  }

  const getCategoryIcon = (category: PrayerResource["category"]) => {
    switch (category) {
      case "Prayer Guide":
        return Heart
      case "Prayer Point":
        return FileText
      case "Books":
        return BookOpen
      default:
        return FileText
    }
  }

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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Prayer Resources</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage prayer guides, prayer points, and books. Upload PDF documents for users to access through the app.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prayer Guides</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getResourcesByCategory("Prayer Guide").length}</div>
            <p className="text-xs text-muted-foreground">
              {getResourcesByCategory("Prayer Guide").filter((r) => r.isActive).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prayer Points</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getResourcesByCategory("Prayer Point").length}</div>
            <p className="text-xs text-muted-foreground">
              {getResourcesByCategory("Prayer Point").filter((r) => r.isActive).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getResourcesByCategory("Books").length}</div>
            <p className="text-xs text-muted-foreground">
              {getResourcesByCategory("Books").filter((r) => r.isActive).length} active
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="Prayer Guide">Prayer Guide</TabsTrigger>
          <TabsTrigger value="Prayer Point">Prayer Point</TabsTrigger>
          <TabsTrigger value="Books">Books</TabsTrigger>
        </TabsList>

        {(["Prayer Guide", "Prayer Point", "Books"] as const).map((category) => {
          const Icon = getCategoryIcon(category)
          const categoryResources = getResourcesByCategory(category)

          return (
            <TabsContent key={category} value={category} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {category}
                      </CardTitle>
                      <CardDescription>
                        Manage {category.toLowerCase()} documents for users to download and access.
                      </CardDescription>
                    </div>
                    <Button onClick={() => handleAddResource(category)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add {category}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryResources.map((resource) => (
                      <Card key={resource.id} className="relative group">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge variant={resource.isActive ? "default" : "secondary"}>
                              {resource.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" onClick={() => handleEditResource(resource)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteResource(resource)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-center h-24 bg-gray-100 rounded-lg">
                            <FileText className="h-12 w-12 text-gray-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
                            <CardDescription className="text-sm mb-3 line-clamp-2">
                              {resource.description}
                            </CardDescription>
                            {resource.author && (
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Author:</strong> {resource.author}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>{resource.fileSize}</span>
                              <div className="flex items-center space-x-1">
                                <Download className="h-3 w-3" />
                                <span>{resource.downloadCount}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Uploaded: {formatDate(resource.uploadDate)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {categoryResources.length === 0 && (
                    <div className="text-center py-8">
                      <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No {category.toLowerCase()} documents uploaded yet.</p>
                      <Button className="mt-4" onClick={() => handleAddResource(category)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First {category}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Add/Edit Resource Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingResource ? `Edit ${formData.category}` : `Add New ${formData.category}`}</DialogTitle>
            <DialogDescription>
              {editingResource
                ? `Update the ${formData.category.toLowerCase()} details below.`
                : `Upload a new ${formData.category.toLowerCase()} document for users to access.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={`Enter ${formData.category.toLowerCase()} title`}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="author">Author (Optional)</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Enter author name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={`Enter ${formData.category.toLowerCase()} description`}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pdf">PDF Document</Label>
              <div className="space-y-2">
                <Input id="pdf" type="file" accept=".pdf" onChange={handlePdfUpload} />
                {formData.pdfFile && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <FileText className="h-4 w-4" />
                    <span>{formData.pdfFile.name}</span>
                    <span>({(formData.pdfFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                  </div>
                )}
                {editingResource && !formData.pdfFile && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <FileText className="h-4 w-4" />
                    <span>Current: {editingResource.fileName}</span>
                    <span>({editingResource.fileSize})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveResource}>
              <Save className="mr-2 h-4 w-4" />
              {editingResource ? "Save Changes" : "Upload Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Resource Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document{" "}
              <strong>"{resourceToDelete?.title}"</strong> and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteResource}>Delete Document</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
