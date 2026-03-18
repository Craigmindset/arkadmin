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
import { Edit, Save, Plus, ImageIcon, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HomeCard {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  buttonUrl: string;
  isActive: boolean;
  order: number;
}

interface SliderImage {
  id: number;
  title: string;
  imageUrl: string;
  buttonUrl: string;
  order: number;
}

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
    order: "",
  });
  // For per-slide editing
  const [editingSlide, setEditingSlide] = useState<SliderImage | null>(null);
  const [slideFormData, setSlideFormData] = useState({
    title: "",
    buttonUrl: "",
    imageFile: null as File | null,
    imageUrl: "",
    order: 1,
    id: 0,
  });
  const [isSlideDialogOpen, setIsSlideDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch home cards from Supabase 'home_slider2' table
    const fetchHomeCards = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("home_slider2")
        .select(
          "id, title, description, image_url, button_link, active, sort_order",
        );
      if (error) {
        setHomeCards([]);
      } else {
        const cards = (data || []).map((card, index) => ({
          id: card.id,
          title: card.title,
          description: card.description,
          imageUrl: card.image_url,
          buttonUrl: card.button_link,
          isActive: card.active ?? true,
          order: card.sort_order ?? index + 1,
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
        .order("sort_order", { ascending: true });
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

  useEffect(() => {
    const channel = supabase
      .channel("public:slider")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "slider" },
        async () => {
          const { data, error } = await supabase
            .from("slider")
            .select("id, title, image_url, button_link, sort_order")
            .order("sort_order", { ascending: true });
          if (!error) {
            const slides = (data || []).map((slide) => ({
              id: slide.id,
              title: slide.title,
              imageUrl: slide.image_url,
              buttonUrl: slide.button_link,
              order: slide.sort_order,
            }));
            setSliderImages(slides);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleEditCard = (card: HomeCard) => {
    setEditingCard(card);
    setCardFormData({
      title: card.title,
      description: card.description || "",
      imageUrl: card.imageUrl,
      buttonUrl: card.buttonUrl,
      imageFile: null,
      order: card.order?.toString() ?? "",
    });
    setIsCardDialogOpen(true);
  };

  // Add new card
  const handleAddCard = () => {
    setEditingCard(null);
    const usedOrders = homeCards
      .map((c) => c.order)
      .filter((o) => typeof o === "number");
    let nextOrder = 1;
    while (usedOrders.includes(nextOrder)) nextOrder++;
    setCardFormData({
      title: "",
      description: "",
      imageUrl: "",
      buttonUrl: "",
      imageFile: null,
      order: nextOrder.toString(),
    });
    setIsCardDialogOpen(true);
  };

  const handleSaveCard = async () => {
    setIsLoading(true);
    const title = cardFormData.title.trim();
    const description = cardFormData.description.trim();
    const orderNumber = Number(cardFormData.order);
    if (!title || title.length > 45) {
      alert("Title is required and must be 45 characters or less");
      setIsLoading(false);
      return;
    }
    if (!description || description.length > 70) {
      alert("Description is required and must be 70 characters or less");
      setIsLoading(false);
      return;
    }
    if (!cardFormData.order || Number.isNaN(orderNumber) || orderNumber <= 0) {
      alert("Banner position is required and must be a positive number");
      setIsLoading(false);
      return;
    }
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
          sort_order: orderNumber,
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
            sort_order: orderNumber,
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
      order: orderNumber,
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

  const handleDeleteCard = async (card: HomeCard) => {
    const confirmed = window.confirm(
      `Delete "${card.title}"? This action cannot be undone.`,
    );
    if (!confirmed) return;
    setIsLoading(true);
    const { error } = await supabase
      .from("home_slider2")
      .delete()
      .eq("id", card.id);
    if (error) {
      alert(`Failed to delete card: ${error.message}`);
      setIsLoading(false);
      return;
    }
    setHomeCards((prev) => prev.filter((c) => c.id !== card.id));
    setIsLoading(false);
    alert("Card deleted!");
  };

  const handleDeleteCurrentCard = async () => {
    if (!editingCard) return;
    await handleDeleteCard(editingCard);
    setIsCardDialogOpen(false);
    setEditingCard(null);
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

    const orderNumber = Number(slideFormData.order);
    if (!orderNumber || Number.isNaN(orderNumber) || orderNumber <= 0) {
      alert("Banner position is required and must be a positive number");
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
          sort_order: orderNumber,
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
            sort_order: orderNumber,
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
      id: dbData?.[0]?.id ?? slideFormData.id ?? 0,
      title: slideFormData.title,
      imageUrl,
      buttonUrl: slideFormData.buttonUrl,
      order: orderNumber,
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
      while (usedOrders.includes(nextOrder)) nextOrder++;
      setSlideFormData({
        title: "",
        buttonUrl: "",
        imageFile: null,
        imageUrl: "",
        order: nextOrder,
        id: 0,
      });
    }
    setIsSlideDialogOpen(true);
  };

  const handleDeleteSlide = async (slide: SliderImage) => {
    const confirmed = window.confirm(
      `Delete Slide ${slide.order}? This action cannot be undone.`,
    );
    if (!confirmed) return;
    setIsLoading(true);
    const { error } = await supabase.from("slider").delete().eq("id", slide.id);
    if (error) {
      alert(`Failed to delete slide: ${error.message}`);
      setIsLoading(false);
      return;
    }
    setSliderImages((prev) => prev.filter((s) => s.id !== slide.id));
    setIsLoading(false);
    alert("Slide deleted!");
  };

  const handleDeleteCurrentSlide = async () => {
    if (!slideFormData.id) return;
    const slide: SliderImage = {
      id: slideFormData.id,
      title: slideFormData.title,
      imageUrl: slideFormData.imageUrl,
      buttonUrl: slideFormData.buttonUrl,
      order: slideFormData.order,
    };
    await handleDeleteSlide(slide);
    setIsSlideDialogOpen(false);
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
                      {typeof slide.order === "number" && slide.order > 0 ? (
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary">
                            Banner {slide.order}
                          </Badge>
                        </div>
                      ) : null}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          size="icon"
                          variant="destructive"
                          className="shadow-md"
                          onClick={() => handleDeleteSlide(slide)}
                          title="Delete slide"
                          aria-label="Delete slide"
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openSlideDialog(slide)}
                          title="Edit slide"
                          aria-label="Edit slide"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
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
          {homeCards
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((card) => (
              <Card key={card.id} className="relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={card.isActive ? "default" : "secondary"}>
                        {card.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {typeof card.order === "number" && card.order > 0 ? (
                        <Badge variant="secondary">Banner {card.order}</Badge>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="shadow-md"
                        onClick={() => handleDeleteCard(card)}
                        title="Delete card"
                        aria-label="Delete card"
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditCard(card)}
                        aria-label="Edit card"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={card.imageUrl || "/placeholder.svg"}
                      alt={card.title}
                      className="object-cover w-full h-full"
                    />
                    {typeof card.order === "number" && card.order > 0 ? (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary">Banner {card.order}</Badge>
                      </div>
                    ) : null}
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
              <Label htmlFor="banner-position">Banner position</Label>
              <Input
                id="banner-position"
                type="number"
                min={1}
                value={cardFormData.order}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, "");
                  setCardFormData({ ...cardFormData, order: numericValue });
                }}
                placeholder="1"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={cardFormData.title}
                onChange={(e) =>
                  setCardFormData({ ...cardFormData, title: e.target.value })
                }
                placeholder="Enter card title"
                maxLength={45}
                required
              />
              <div className="text-xs text-muted-foreground text-right">
                {cardFormData.title.trim().length}/45
              </div>
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
                maxLength={70}
                required
              />
              <div className="text-xs text-muted-foreground text-right">
                {cardFormData.description.trim().length}/70
              </div>
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
            {editingCard ? (
              <Button variant="destructive" onClick={handleDeleteCurrentCard}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            ) : null}
            <Button
              variant="outline"
              onClick={() => setIsCardDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCard}
              disabled={
                !cardFormData.order ||
                Number.isNaN(Number(cardFormData.order)) ||
                Number(cardFormData.order) <= 0 ||
                !cardFormData.title.trim() ||
                cardFormData.title.trim().length > 45 ||
                !cardFormData.description.trim() ||
                cardFormData.description.trim().length > 70 ||
                !(cardFormData.imageUrl || cardFormData.imageFile)
              }
            >
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
              <Label htmlFor="slide-position">Banner position</Label>
              <Input
                id="slide-position"
                type="number"
                min={1}
                value={slideFormData.order}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, "");
                  setSlideFormData((prev) => ({
                    ...prev,
                    order: numericValue ? Number(numericValue) : 0,
                  }));
                }}
                placeholder="1"
                required
              />
            </div>
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
            {slideFormData.id ? (
              <Button variant="destructive" onClick={handleDeleteCurrentSlide}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            ) : null}
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
