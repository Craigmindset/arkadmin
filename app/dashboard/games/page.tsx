"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@supabase/supabase-js";

interface GameQuestion {
  id: number;
  question: string;
  options: string[];
  correct_option: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function GamesPage() {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<GameQuestion | null>(
    null,
  );
  const [questionToDelete, setQuestionToDelete] = useState<GameQuestion | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctOption: "0",
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("game_sword")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setFormData({
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctOption: "0",
    });
    setIsDialogOpen(true);
  };

  const handleEditQuestion = (question: GameQuestion) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      option1: question.options[0] || "",
      option2: question.options[1] || "",
      option3: question.options[2] || "",
      option4: question.options[3] || "",
      correctOption: question.correct_option.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!formData.question.trim()) {
      alert("Please enter a question");
      return;
    }

    const options = [
      formData.option1,
      formData.option2,
      formData.option3,
      formData.option4,
    ].filter((opt) => opt.trim());

    if (options.length < 2) {
      alert("Please enter at least 2 options");
      return;
    }

    const correctIdx = parseInt(formData.correctOption);
    if (correctIdx < 0 || correctIdx >= options.length) {
      alert("Please select a valid correct option");
      return;
    }

    setIsSaving(true);

    try {
      if (editingQuestion) {
        const { error } = await supabase
          .from("game_sword")
          .update({
            question: formData.question,
            options: options,
            correct_option: correctIdx,
          })
          .eq("id", editingQuestion.id);

        if (error) throw error;

        setQuestions(
          questions.map((q) =>
            q.id === editingQuestion.id
              ? {
                  ...q,
                  question: formData.question,
                  options: options,
                  correct_option: correctIdx,
                }
              : q,
          ),
        );
      } else {
        const { data, error } = await supabase
          .from("game_sword")
          .insert([
            {
              question: formData.question,
              options: options,
              correct_option: correctIdx,
            },
          ])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          setQuestions([data[0], ...questions]);
        }
      }

      setIsDialogOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error saving question:", error);
      alert("Failed to save question");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = (question: GameQuestion) => {
    setQuestionToDelete(question);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    if (questionToDelete) {
      try {
        const { error } = await supabase
          .from("game_sword")
          .delete()
          .eq("id", questionToDelete.id);

        if (error) throw error;

        setQuestions(questions.filter((q) => q.id !== questionToDelete.id));
      } catch (error) {
        console.error("Error deleting question:", error);
        alert("Failed to delete question");
      } finally {
        setIsDeleteDialogOpen(false);
        setQuestionToDelete(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-screen overflow-y-auto pr-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Games
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage game questions and answers for the Sword Quest game.
          </p>
        </div>
        <Button onClick={handleAddQuestion}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {questions.map((question, index) => (
          <Card key={question.id} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Q{index + 1}</Badge>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditQuestion(question)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteQuestion(question)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold mb-3">{question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-2 rounded-lg text-sm ${
                        optIndex === question.correct_option
                          ? "bg-green-100 text-green-800 font-semibold"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option}
                      {optIndex === question.correct_option && " ✓"}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {questions.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No questions yet. Create one to get started!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Question Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion
                ? "Update the question and options below."
                : "Fill in the question and options below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Enter the question"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="option1">Option A</Label>
              <Input
                id="option1"
                value={formData.option1}
                onChange={(e) =>
                  setFormData({ ...formData, option1: e.target.value })
                }
                placeholder="Enter option A"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="option2">Option B</Label>
              <Input
                id="option2"
                value={formData.option2}
                onChange={(e) =>
                  setFormData({ ...formData, option2: e.target.value })
                }
                placeholder="Enter option B"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="option3">Option C</Label>
              <Input
                id="option3"
                value={formData.option3}
                onChange={(e) =>
                  setFormData({ ...formData, option3: e.target.value })
                }
                placeholder="Enter option C"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="option4">Option D</Label>
              <Input
                id="option4"
                value={formData.option4}
                onChange={(e) =>
                  setFormData({ ...formData, option4: e.target.value })
                }
                placeholder="Enter option D"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="correctOption">Correct Answer</Label>
              <select
                id="correctOption"
                value={formData.correctOption}
                onChange={(e) =>
                  setFormData({ ...formData, correctOption: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select correct option</option>
                {[0, 1, 2, 3].map((idx) => {
                  const option = [
                    formData.option1,
                    formData.option2,
                    formData.option3,
                    formData.option4,
                  ][idx];
                  if (!option.trim()) return null;
                  return (
                    <option key={idx} value={idx}>
                      {String.fromCharCode(65 + idx)}. {option}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingQuestion ? "Save Changes" : "Create Question"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Question Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              question{" "}
              <strong>
                "{questionToDelete?.question.substring(0, 50)}..."
              </strong>{" "}
              and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteQuestion}>
              Delete Question
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
