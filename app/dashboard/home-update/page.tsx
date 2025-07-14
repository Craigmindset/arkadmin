"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Edit, Save, Plus, ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface HomeCard {
  id: string
  title: string
  imageUrl: string
  buttonUrl: string
  isActive: boolean
}

interface SliderImage {
  id: string
  title: string
  imageUrl: string
  buttonUrl: string
  order: number
}

const mockHomeCards: HomeCard[] = [
  {
    id: "CARD001",
    title: "Welcome to Ark of Light",
    imageUrl: "/placeholder.svg?height=200&width=300",
    buttonUrl: "https://arkoflight.com/welcome",
    isActive: true,
  },
  {
    id: "CARD002",
    title: "Sunday Service Live",
    imageUrl: "/placeholder.svg?height=200&width=300",
    buttonUrl: "https://arkoflight.com/live",
    isActive: true,
  },
  {
    id: "CARD003",
    title: "Prayer Requests",
    imageUrl: "/placeholder.svg?height=200&width=300",
    buttonUrl: "https://arkoflight.com/prayer",
    isActive: false,
  },
  {
    id: "CARD004",
    title: "Community Events",
    imageUrl: "/placeholder.svg?height=200&width=300",
    buttonUrl: "https://arkoflight.com/events",
    isActive: true,
  },
]

const mockSliderImages: SliderImage[] = [
  {
    id: "SLIDE001",
    title: "Welcome to Our Church",
    imageUrl: "/placeholder.svg?height=300&width=600",
    buttonUrl: "https://arkoflight.com/about",
    order: 1,
  },
  {
    id: "SLIDE002",
    title: "Join Us for Worship",
    imageUrl: "/placeholder.svg?height=300&width=600",
    buttonUrl: "https://arkoflight.com/worship",
    order: 2,
  },
  {
    id: "SLIDE003",
    title: "Community Outreach",
    imageUrl: "/placeholder.svg?height=300&width=600",
    buttonUrl: "https://arkoflight.com/outreach",
    order: 3,
  },
  {
    id: "SLIDE004",
    title: "Youth Ministry",
    imageUrl: "/placeholder.svg?height=300&width=600",
    buttonUrl: "https://arkoflight.com/youth",
    order: 4,
  },
]

export default function HomeUpdatePage() {
  const [homeCards, setHomeCards] = useState<HomeCard[]>([])
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false)
  const [isSliderDialogOpen, setIsSliderDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<HomeCard | null>(null)
  const [cardFormData, setCardFormData] = useState({
    title: "",
    imageUrl: "",
    buttonUrl: "",
    imageFile: null as File | null,
  })
  const [sliderFormData, setSliderFormData] = useState({
    slides: [
      { title: "", buttonUrl: "", imageFile: null as File | null },
      { title: "", buttonUrl: "", imageFile: null as File | null },
      { title: "", buttonUrl: "", imageFile: null as File | null },
      { title: "", buttonUrl: "", imageFile: null as File | null },
    ],
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setHomeCards(mockHomeCards)
      setSliderImages(mockSliderImages)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleEditCard = (card: HomeCard) => {
    setEditingCard(card)
    setCardFormData({
      title: card.title,
      imageUrl: card.imageUrl,
      buttonUrl: card.buttonUrl,
      imageFile: null,
    })
    setIsCardDialogOpen(true)
  }

  const handleSaveCard = async () => {
    if (editingCard) {
      // Update existing card
      const updatedCard = {
        ...editingCard,
        title: cardFormData.title,
        imageUrl: cardFormData.imageFile ? URL.createObjectURL(cardFormData.imageFile) : cardFormData.imageUrl,
        buttonUrl: cardFormData.buttonUrl,
      }

      setHomeCards(homeCards.map((card) => (card.id === editingCard.id ? updatedCard : card)))
      setIsCardDialogOpen(false)
      setEditingCard(null)

      // Here you would make an actual API call to save to database
      console.log("Saving card to database:", updatedCard)
    }
  }

  const handleCardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCardFormData({ ...cardFormData, imageFile: file })
    }
  }

  const handleSliderImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const newSlides = [...sliderFormData.slides]
      newSlides[index] = { ...newSlides[index], imageFile: file }
      setSliderFormData({ ...sliderFormData, slides: newSlides })
    }
  }

  const handleSliderInputChange = (index: number, field: "title" | "buttonUrl", value: string) => {
    const newSlides = [...sliderFormData.slides]
    newSlides[index] = { ...newSlides[index], [field]: value }
    setSliderFormData({ ...sliderFormData, slides: newSlides })
  }

  const handleSaveSlider = async () => {
    // Create new slider images from form data
    const newSliderImages = sliderFormData.slides.map((slide, index) => ({
      id: `SLIDE${String(index + 1).padStart(3, "0")}`,
      title: slide.title,
      imageUrl: slide.imageFile ? URL.createObjectURL(slide.imageFile) : `/placeholder.svg?height=300&width=600`,
      buttonUrl: slide.buttonUrl,
      order: index + 1,
    }))

    setSliderImages(newSliderImages)
    setIsSliderDialogOpen(false)

    // Here you would make an actual API call to save to database
    console.log("Saving slider images to database:", newSliderImages)
  }

  const openSliderDialog = () => {
    // Pre-populate form with existing slider data
    const formSlides = sliderImages.map((slide) => ({
      title: slide.title,
      buttonUrl: slide.buttonUrl,
      imageFile: null as File | null,
    }))

    // Fill remaining slots with empty data
    while (formSlides.length < 4) {
      formSlides.push({ title: "", buttonUrl: "", imageFile: null })
    }

    setSliderFormData({ slides: formSlides })
    setIsSliderDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Home Update</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage home screen content and announcements displayed to users.
        </p>
      </div>

      {/* Image Slider Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Image Slider</h2>
            <p className="text-sm text-muted-foreground">
              Manage the main image slider displayed on the app home screen
            </p>
          </div>
          <Button onClick={openSliderDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Update Slider
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Slider Images</CardTitle>
            <CardDescription>These images are currently displayed in the app's main slider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sliderImages.map((slide, index) => (
                <div key={slide.id} className="space-y-2">
                  <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={slide.imageUrl || "/placeholder.svg"}
                      alt={slide.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary">Slide {index + 1}</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{slide.title}</h4>
                    <p className="text-xs text-gray-600 break-all">{slide.buttonUrl}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Home Cards Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Home Cards</h2>
          <p className="text-sm text-muted-foreground">Manage individual content cards displayed on the home screen</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {homeCards.map((card) => (
            <Card key={card.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={card.isActive ? "default" : "secondary"}>
                    {card.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditCard(card)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={card.imageUrl || "/placeholder.svg"}
                    alt={card.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <CardTitle className="text-lg mb-2">{card.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 break-all">URL: {card.buttonUrl}</CardDescription>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Card Dialog */}
      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Home Card</DialogTitle>
            <DialogDescription>Update the card content that will be displayed on the home screen.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={cardFormData.title}
                onChange={(e) => setCardFormData({ ...cardFormData, title: e.target.value })}
                placeholder="Enter card title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Update Image</Label>
              <div className="space-y-2">
                <Input id="image" type="file" accept="image/*" onChange={handleCardImageUpload} />
                {(cardFormData.imageFile || cardFormData.imageUrl) && (
                  <div className="aspect-video w-full max-w-xs relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={cardFormData.imageFile ? URL.createObjectURL(cardFormData.imageFile) : cardFormData.imageUrl}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="buttonUrl">Button URL</Label>
              <Input
                id="buttonUrl"
                value={cardFormData.buttonUrl}
                onChange={(e) => setCardFormData({ ...cardFormData, buttonUrl: e.target.value })}
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCardDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCard}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Slider Dialog */}
      <Dialog open={isSliderDialogOpen} onOpenChange={setIsSliderDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Image Slider</DialogTitle>
            <DialogDescription>Upload four images for the main slider with titles and button URLs.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {sliderFormData.slides.map((slide, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Slide {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`slide-image-${index}`}>Image</Label>
                    <Input
                      id={`slide-image-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSliderImageUpload(index, e)}
                    />
                    {slide.imageFile && (
                      <div className="aspect-video w-full max-w-xs relative overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={URL.createObjectURL(slide.imageFile) || "/placeholder.svg"}
                          alt={`Slide ${index + 1} preview`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`slide-title-${index}`}>Title</Label>
                    <Input
                      id={`slide-title-${index}`}
                      value={slide.title}
                      onChange={(e) => handleSliderInputChange(index, "title", e.target.value)}
                      placeholder="Enter slide title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`slide-url-${index}`}>Button URL</Label>
                    <Input
                      id={`slide-url-${index}`}
                      value={slide.buttonUrl}
                      onChange={(e) => handleSliderInputChange(index, "buttonUrl", e.target.value)}
                      placeholder="https://example.com"
                      type="url"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSliderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSlider}>
              <Save className="mr-2 h-4 w-4" />
              Save Slider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
