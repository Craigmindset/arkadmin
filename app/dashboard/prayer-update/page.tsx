"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Edit, Save, Heart, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PrayerSlide {
  id: string
  title: string
  imageUrl: string
  eventTime: string
  frequency: "Daily" | "Weekly" | "Sunday" | "Mid Week" | "End of Month"
  isActive: boolean
  order: number
}

const mockPrayerSlides: PrayerSlide[] = [
  {
    id: "PRAYER001",
    title: "Morning Prayer",
    imageUrl: "/placeholder.svg?height=300&width=600",
    eventTime: "06:00",
    frequency: "Daily",
    isActive: true,
    order: 1,
  },
  {
    id: "PRAYER002",
    title: "Sunday Worship Prayer",
    imageUrl: "/placeholder.svg?height=300&width=600",
    eventTime: "09:30",
    frequency: "Sunday",
    isActive: true,
    order: 2,
  },
  {
    id: "PRAYER003",
    title: "Midweek Prayer Meeting",
    imageUrl: "/placeholder.svg?height=300&width=600",
    eventTime: "19:00",
    frequency: "Mid Week",
    isActive: true,
    order: 3,
  },
  {
    id: "PRAYER004",
    title: "Monthly Intercession",
    imageUrl: "/placeholder.svg?height=300&width=600",
    eventTime: "18:00",
    frequency: "End of Month",
    isActive: false,
    order: 4,
  },
]

export default function PrayerUpdatePage() {
  const [prayerSlides, setPrayerSlides] = useState<PrayerSlide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<PrayerSlide | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    eventTime: "",
    frequency: "" as PrayerSlide["frequency"] | "",
    imageFile: null as File | null,
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPrayerSlides(mockPrayerSlides)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleEditSlide = (slide: PrayerSlide) => {
    setEditingSlide(slide)
    setFormData({
      title: slide.title,
      eventTime: slide.eventTime,
      frequency: slide.frequency,
      imageFile: null,
    })
    setIsDialogOpen(true)
  }

  const handleSaveSlide = async () => {
    if (editingSlide) {
      // Update existing slide
      const updatedSlide = {
        ...editingSlide,
        title: formData.title,
        eventTime: formData.eventTime,
        frequency: formData.frequency as PrayerSlide["frequency"],
        imageUrl: formData.imageFile ? URL.createObjectURL(formData.imageFile) : editingSlide.imageUrl,
      }

      setPrayerSlides(prayerSlides.map((slide) => (slide.id === editingSlide.id ? updatedSlide : slide)))
      setIsDialogOpen(false)
      setEditingSlide(null)

      // Here you would make an actual API call to save to database
      console.log("Saving prayer slide to database:", updatedSlide)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, imageFile: file })
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "Daily":
        return "bg-blue-100 text-blue-800"
      case "Weekly":
        return "bg-green-100 text-green-800"
      case "Sunday":
        return "bg-purple-100 text-purple-800"
      case "Mid Week":
        return "bg-orange-100 text-orange-800"
      case "End of Month":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Prayer Update</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage prayer room slider images and prayer schedule information displayed to users.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prayer Slides</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prayerSlides.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Slides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prayerSlides.filter((s) => s.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Prayers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prayerSlides.filter((s) => s.frequency === "Daily").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Prayers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prayerSlides.filter((s) => ["Weekly", "Sunday", "Mid Week"].includes(s.frequency)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prayer Room Slider</CardTitle>
          <CardDescription>Manage the prayer room slider images and schedule information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {prayerSlides.map((slide, index) => (
              <Card key={slide.id} className="relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Slide {index + 1}</Badge>
                      <Badge className={getFrequencyColor(slide.frequency)}>{slide.frequency}</Badge>
                      <Badge variant={slide.isActive ? "default" : "secondary"}>
                        {slide.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditSlide(slide)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={slide.imageUrl || "/placeholder.svg"}
                      alt={slide.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-2">{slide.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(slide.eventTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{slide.frequency}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Prayer Slide Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Prayer Slide</DialogTitle>
            <DialogDescription>Update the prayer slide content and schedule information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter prayer title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Update Image</Label>
              <div className="space-y-2">
                <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} />
                {(formData.imageFile || (editingSlide && !formData.imageFile)) && (
                  <div className="aspect-video w-full max-w-xs relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={
                        formData.imageFile
                          ? URL.createObjectURL(formData.imageFile)
                          : editingSlide?.imageUrl || "/placeholder.svg"
                      }
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="eventTime">Event Time</Label>
              <Input
                id="eventTime"
                type="time"
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value as PrayerSlide["frequency"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Sunday">Sunday</SelectItem>
                  <SelectItem value="Mid Week">Mid Week</SelectItem>
                  <SelectItem value="End of Month">End of Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSlide}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
