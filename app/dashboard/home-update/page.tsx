"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Save, Plus, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HomeCard {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  buttonUrl: string;
  isActive: boolean;
}

interface SliderImage {
  id: string;
  title: string;
  imageUrl: string;
  buttonUrl: string;
  order: number;
}

const mockHomeCards: HomeCard[] = [
  {
    id: 1,
    title: "Welcome to Ark of Light",
    imageUrl: "/placeholder.svg?height=200&width=300",
    buttonUrl: "https://arkoflight.com/welcome",
    isActive: true,
  },
  {
    id: 2,
    title: "Sunday Service Live",
    imageUrl: "/placeholder.svg?height=200&width=300",
    buttonUrl: "https://arkoflight.com/live",
    isActive: true,
  },
  {
    id: 3,
    title: "Prayer Requests",
    imageUrl: "/placeholder.svg?height=200&width=300",
    buttonUrl: "https://arkoflight.com/prayer",
    isActive: false,
  },
  {
    id: 4,
    title: "Community Events",
    imageUrl: "/placeholder.svg?height=200&width=300",
    buttonUrl: "https://arkoflight.com/events",
    isActive: true,
  },
];

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mockSliderImages: SliderImage[] = [];

export default function HomeUpdatePage() {
  const [homeCards, setHomeCards] = useState<HomeCard[]>([]);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [isSliderDialogOpen, setIsSliderDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<HomeCard | null>(null);
  const [cardFormData, setCardFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    buttonUrl: "",
    imageFile: null as File | null,
  });
  // For per-slide editing
  const [editingSlide, setEditingSlide] = useState<SliderImage | null>(null);
  const [slideFormData, setSlideFormData] = useState({
    title: "",
    buttonUrl: "",
    imageFile: null as File | null,
    imageUrl: "",
    order: 1,
    id: "",
  });
  const [isSlideDialogOpen, setIsSlideDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch home cards from Supabase 'home_slider2' table
    const fetchHomeCards = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("home_slider2")
        .select("id, title, description, image_url, button_link, active");
      if (error) {
        setHomeCards([]);
      } else {
        const cards = (data || []).map((card) => ({
          id: card.id,
          title: card.title,
          description: card.description,
          imageUrl: card.image_url,
          buttonUrl: card.button_link,
          isActive: card.active ?? true,
        }));
        setHomeCards(cards);
      }
      setIsLoading(false);
    };

    // Fetch slides with id 1, 2, 3, 4 from Supabase
    const fetchSlides = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("slider")
        .select("id, title, image_url, button_link, sort_order")
        .in("id", [1, 2, 3, 4]);
      if (error) {
        setSliderImages([]);
      } else {
        const slides = (data || []).map((slide) => ({
          id: slide.id,
          title: slide.title,
          imageUrl: slide.image_url,
          buttonUrl: slide.button_link,
          order: slide.sort_order,
        }));
        setSliderImages(slides);
      }
      setIsLoading(false);
    };

    fetchHomeCards();
    fetchSlides();
  }, []);

  const handleEditCard = (card: HomeCard) => {
    setEditingCard(card);
    setCardFormData({
      title: card.title,
      description: card.description || "",
      imageUrl: card.imageUrl,
      buttonUrl: card.buttonUrl,
      imageFile: null,
    });
    setIsCardDialogOpen(true);
  };

  // Add new card
  const handleAddCard = () => {
    setEditingCard(null);
    setCardFormData({
      title: "",
      description: "",
      imageUrl: "",
      buttonUrl: "",
      imageFile: null,
    });
    setIsCardDialogOpen(true);
  };

  const handleSaveCard = async () => {
    setIsLoading(true);
    let imageUrl = cardFormData.imageUrl;

    // imageUrl is already set from Cloudinary upload, no need for additional upload
    if (!imageUrl) {
      alert("Please upload an image");
      setIsLoading(false);
      return;
    }

    let dbResult;
    if (editingCard) {
      // Update existing card
      dbResult = await supabase
        .from("home_slider2")
        .update({
          image_url: imageUrl,
          title: cardFormData.title,
          description: cardFormData.description,
          button_link: cardFormData.buttonUrl,
          active: editingCard.isActive,
        })
        .eq("id", editingCard.id)
        .select();
    } else {
      // Insert new card
      dbResult = await supabase
        .from("home_slider2")
        .insert([
          {
            image_url: imageUrl,
            title: cardFormData.title,
            description: cardFormData.description,
            button_link: cardFormData.buttonUrl,
            active: true,
          },
        ])
        .select();
    }
    const { data: dbData, error: dbError } = dbResult;
    if (dbError) {
      alert(`Failed to save card: ${dbError.message}`);
      setIsLoading(false);
      return;
    }
    // Update local state
    let updatedCards = [...homeCards];
    const newCard = {
      id: dbData?.[0]?.id || (editingCard ? editingCard.id : undefined),
      title: cardFormData.title,
      description: cardFormData.description,
      imageUrl,
      buttonUrl: cardFormData.buttonUrl,
      isActive: editingCard ? editingCard.isActive : true,
    };
    if (editingCard) {
      const idx = updatedCards.findIndex((c) => c.id === editingCard.id);
      if (idx !== -1) {
        updatedCards[idx] = newCard;
      } else {
        updatedCards.push(newCard);
      }
    } else {
      updatedCards.push(newCard);
    }
    setHomeCards(updatedCards);
    setIsCardDialogOpen(false);
    setEditingCard(null);
    setIsLoading(false);
    alert(editingCard ? "Card updated!" : "Card added!");
  };

  const handleCardImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert(
          `Image file is too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        );
        return;
      }
      // Upload to Cloudinary
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("fileType", "image");

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });
        const data = await response.json();
        if (response.ok) {
          setCardFormData({
            ...cardFormData,
            imageUrl: data.secure_url,
            imageFile: file,
          });
        } else {
          alert(`Failed to upload image: ${data.error}`);
        }
      } catch (error) {
        alert("Failed to upload image");
      }
    }
  };

  const handleSlideImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert(
          `Image file is too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        );
        return;
      }
      // Upload to Cloudinary
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("fileType", "image");

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });
        const data = await response.json();
        if (response.ok) {
          setSlideFormData((prev) => ({
            ...prev,
            imageUrl: data.secure_url,
            imageFile: file,
          }));
        } else {
          alert(`Failed to upload image: ${data.error}`);
        }
      } catch (error) {
        alert("Failed to upload image");
      }
    }
  };

  const handleSlideInputChange = (
    field: "title" | "buttonUrl",
    value: string,
  ) => {
    setSlideFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Save or update a single slide
  const handleSaveSlide = async () => {
    setIsLoading(true);
    let imageUrl = slideFormData.imageUrl;

    // imageUrl is already set from Cloudinary upload, no need for additional upload
    if (!imageUrl) {
      alert("Please upload an image");
      setIsLoading(false);
      return;
    }

    // If slide has an id, update; else insert
    let dbResult;
    if (slideFormData.id) {
      dbResult = await supabase
        .from("slider")
        .update({
          image_url: imageUrl,
          title: slideFormData.title,
          button_link: slideFormData.buttonUrl,
          active: true,
          sort_order: slideFormData.order,
        })
        .eq("id", slideFormData.id)
        .select();
    } else {
      dbResult = await supabase
        .from("slider")
        .insert([
          {
            image_url: imageUrl,
            title: slideFormData.title,
            button_link: slideFormData.buttonUrl,
            active: true,
            sort_order: slideFormData.order,
          },
        ])
        .select();
    }
    const { data: dbData, error: dbError } = dbResult;
    if (dbError) {
      alert(`Failed to save slide: ${dbError.message}`);
      setIsLoading(false);
      return;
    }
    // Update local state
    let updatedSlides = [...sliderImages];
    const updatedSlide = {
      id: dbData?.[0]?.id || slideFormData.id || `SLIDE${slideFormData.order}`,
      title: slideFormData.title,
      imageUrl,
      buttonUrl: slideFormData.buttonUrl,
      order: slideFormData.order,
    };
    const idx = updatedSlides.findIndex((s) => s.order === slideFormData.order);
    if (idx !== -1) {
      updatedSlides[idx] = updatedSlide;
    } else {
      updatedSlides.push(updatedSlide);
    }
    setSliderImages(updatedSlides);
    setIsSlideDialogOpen(false);
    setIsLoading(false);
    alert("Slide updated!");
  };

  // Open dialog for editing a single slide
  const openSlideDialog = (slide?: SliderImage) => {
    if (slide) {
      setSlideFormData({
        title: slide.title,
        buttonUrl: slide.buttonUrl,
        imageFile: null,
        imageUrl: slide.imageUrl,
        order: slide.order,
        id: slide.id,
      });
    } else {
      // New slide (find next available order)
      const usedOrders = sliderImages.map((s) => s.order);
      let nextOrder = 1;
      while (usedOrders.includes(nextOrder) && nextOrder <= 4) nextOrder++;
      setSlideFormData({
        title: "",
        buttonUrl: "",
        imageFile: null,
        imageUrl: "",
        order: nextOrder,
        id: "",
      });
    }
    setIsSlideDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Home Update
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage home screen content and announcements displayed to users.
        </p>
      </div>

      {/* Image Slider Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-semibold">Image Slider</h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Manage the main image slider displayed on the app home screen
            </p>
          </div>
          <Button onClick={() => openSlideDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Slide
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg text-yellow-200">
              Current Slider Images
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              These images are currently displayed in the app's main slider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sliderImages
                .sort((a, b) => a.order - b.order)
                .map((slide, index) => (
                  <div key={slide.id} className="space-y-2">
                    <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={slide.imageUrl || "/placeholder.svg"}
                        alt={slide.title}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary">Slide {slide.order}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => openSlideDialog(slide)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{slide.title}</h4>
                      <p className="text-xs text-gray-600 break-all">
                        {slide.buttonUrl}
                      </p>
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Home Cards</h2>
            <p className="text-sm text-muted-foreground">
              Manage individual content cards displayed on the home screen
            </p>
          </div>
          <Button onClick={handleAddCard}>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
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
                  <CardDescription className="text-sm text-gray-600 break-all">
                    URL: {card.buttonUrl}
                  </CardDescription>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditCard(card)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
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
            <DialogDescription>
              Update the card content that will be displayed on the home screen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={cardFormData.title}
                onChange={(e) =>
                  setCardFormData({ ...cardFormData, title: e.target.value })
                }
                placeholder="Enter card title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={cardFormData.description}
                onChange={(e) =>
                  setCardFormData({
                    ...cardFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Enter card description"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Update Image</Label>
              <p className="text-xs text-muted-foreground">
                Max file size: 5MB
              </p>
              <div className="space-y-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleCardImageUpload}
                />
                {(cardFormData.imageFile || cardFormData.imageUrl) && (
                  <div className="aspect-video w-full max-w-xs relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={
                        cardFormData.imageFile
                          ? URL.createObjectURL(cardFormData.imageFile)
                          : cardFormData.imageUrl
                      }
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
                onChange={(e) =>
                  setCardFormData({
                    ...cardFormData,
                    buttonUrl: e.target.value,
                  })
                }
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCardDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCard}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Add Slide Dialog */}
      <Dialog open={isSlideDialogOpen} onOpenChange={setIsSlideDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {slideFormData.id ? "Edit Slide" : "Add Slide"}
            </DialogTitle>
            <DialogDescription>
              {slideFormData.id
                ? `Update the content for Slide ${slideFormData.order}.`
                : `Add a new slide to the main slider.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="grid gap-2">
              <Label htmlFor="slide-title">Title</Label>
              <Input
                id="slide-title"
                value={slideFormData.title}
                onChange={(e) =>
                  handleSlideInputChange("title", e.target.value)
                }
                placeholder="Enter slide title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slide-image">Image</Label>
              <p className="text-xs text-muted-foreground">
                Max file size: 5MB
              </p>
              <Input
                id="slide-image"
                type="file"
                accept="image/*"
                onChange={handleSlideImageUpload}
              />
              {(slideFormData.imageFile || slideFormData.imageUrl) && (
                <div className="aspect-video w-full max-w-xs relative overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={
                      slideFormData.imageFile
                        ? URL.createObjectURL(slideFormData.imageFile)
                        : slideFormData.imageUrl || "/placeholder.svg"
                    }
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slide-url">Button URL</Label>
              <Input
                id="slide-url"
                value={slideFormData.buttonUrl}
                onChange={(e) =>
                  handleSlideInputChange("buttonUrl", e.target.value)
                }
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSlideDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSlide}>
              <Save className="mr-2 h-4 w-4" />
              Save Slide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
