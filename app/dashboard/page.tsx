"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Edit, Trash2, Save } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  ggpStatus: "Active" | "Pending" | "Inactive";
  phone?: string;
  phoneNumber?: string;
  isPartner?: boolean;
  churchChapter?: string;
}

// Mock data - replace with actual API call
const mockUsers: User[] = [
  {
    id: "USR001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    profileImage: "/placeholder.svg?height=40&width=40",
    ggpStatus: "Active",
  },
  {
    id: "USR002",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    profileImage: "/placeholder.svg?height=40&width=40",
    ggpStatus: "Pending",
  },
  {
    id: "USR003",
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@example.com",
    profileImage: "/placeholder.svg?height=40&width=40",
    ggpStatus: "Active",
  },
  {
    id: "USR004",
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.williams@example.com",
    profileImage: "/placeholder.svg?height=40&width=40",
    ggpStatus: "Inactive",
  },
  {
    id: "USR005",
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@example.com",
    profileImage: "/placeholder.svg?height=40&width=40",
    ggpStatus: "Active",
  },
];

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ggpStatus: "" as User["ggpStatus"] | "",
    profileImage: null as File | null,
  });

  useEffect(() => {
    // Fetch users from Supabase 'profiles' table
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://pytofmzgoenrkwhjmtni.supabase.co";
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dG9mbXpnb2Vucmt3aGptdG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTU2NjYsImV4cCI6MjA2ODI5MTY2Nn0.ACPdzGdpACTTEjj9YMTfdTVOM-3fZherlXe2J2gFqYc";
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const fetchUsers = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from("profiles").select();
      console.log("Supabase profiles data:", data, error);
      if (error || !data) {
        setUsers([]);
      } else {
        // Map columns from schema, including new fields
        const mapped = data.map((row: any) => ({
          id: row.id ?? null,
          firstName: row.first_name ?? null,
          lastName: row.last_name ?? null,
          email: row.email ?? null,
          phone: row.phone ?? "",
          phoneNumber: row.phone_number ?? "",
          isPartner: row.is_partner ?? false,
          churchChapter: row.church_chapter ?? "",
          profileImage: row.image ?? null,
          displayName: row["Display name"] ?? "",
          uuid: row.uuid ?? "",
          ggpStatus: null, // Not present in schema, always null
        }));
        setUsers(mapped);
      }
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      ggpStatus: user.ggpStatus,
      profileImage: null,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (editingUser) {
      // Simulate API call to update user
      const updatedUser = {
        ...editingUser,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        ggpStatus: formData.ggpStatus as User["ggpStatus"],
        profileImage: formData.profileImage
          ? URL.createObjectURL(formData.profileImage)
          : editingUser.profileImage,
      };

      setUsers(
        users.map((user) => (user.id === editingUser.id ? updatedUser : user))
      );
      setIsEditDialogOpen(false);
      setEditingUser(null);

      // Here you would make an actual API call to save to database
      console.log("Saving user to database:", updatedUser);
    }
  };

  // Supabase client instance for use in delete and fetch
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://pytofmzgoenrkwhjmtni.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dG9mbXpnb2Vucmt3aGptdG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTU2NjYsImV4cCI6MjA2ODI5MTY2Nn0.ACPdzGdpACTTEjj9YMTfdTVOM-3fZherlXe2J2gFqYc";
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("profiles").select();
    console.log("Supabase profiles data:", data, error);
    if (error || !data) {
      setUsers([]);
    } else {
      // Map columns from schema, including new fields
      const mapped = data.map((row: any) => ({
        id: row.id ?? null,
        firstName: row.first_name ?? null,
        lastName: row.last_name ?? null,
        email: row.email ?? null,
        phone: row.phone ?? "",
        phoneNumber: row.phone_number ?? "",
        isPartner: row.is_partner ?? false,
        churchChapter: row.church_chapter ?? "",
        profileImage: row.image ?? null,
        displayName: row["Display name"] ?? "",
        uuid: row.uuid ?? "",
        ggpStatus: null, // Not present in schema, always null
      }));
      setUsers(mapped);
    }
    setIsLoading(false);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      // Delete user from Supabase
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userToDelete.id);
      if (error) {
        console.error("Error deleting user from database:", error);
      } else {
        console.log("Deleted user from database:", userToDelete.id);
        // Re-fetch users to update table
        await fetchUsers();
      }
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Registered Users
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage and view all registered users in the Ark of Light app.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.ggpStatus === "Active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.ggpStatus === "Pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.ggpStatus === "Inactive").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            A list of all registered users and their current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>UUID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage
                        src={user.profileImage || "/placeholder.svg"}
                        alt={`${user.firstName || ""} ${user.lastName || ""}`}
                      />
                      <AvatarFallback>
                        {user.firstName?.[0] || ""} {user.lastName?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{user.firstName ?? ""}</TableCell>
                  <TableCell>{user.lastName ?? ""}</TableCell>
                  <TableCell>{user.email ?? ""}</TableCell>
                  <TableCell>{user.phone ?? ""}</TableCell>
                  <TableCell>{user.phoneNumber ?? ""}</TableCell>
                  <TableCell>{user.isPartner ? "Yes" : "No"}</TableCell>
                  <TableCell>{user.churchChapter ?? ""}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {user.uuid ?? ""}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Enter first name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ggpStatus">GGP Status</Label>
              <Select
                value={formData.ggpStatus}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    ggpStatus: value as User["ggpStatus"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profileImage">Profile Image</Label>
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profileImage: e.target.files?.[0] || null,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account for{" "}
              <strong>
                {userToDelete?.firstName} {userToDelete?.lastName}
              </strong>{" "}
              and remove all their data from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
