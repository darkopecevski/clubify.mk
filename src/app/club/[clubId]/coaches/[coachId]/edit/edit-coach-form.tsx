"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Coach = {
  id: string;
  club_id: string;
  user_id: string;
  license_type: string | null;
  license_number: string | null;
  specialization: string | null;
  years_of_experience: number | null;
  bio: string | null;
  users: {
    full_name: string;
    phone: string | null;
  } | null;
  email: string;
};

type FormData = {
  full_name: string;
  phone: string;
  license_type: string;
  license_number: string;
  specialization: string;
  years_of_experience: string;
  bio: string;
};

export default function EditCoachForm({
  clubId,
  coach,
}: {
  clubId: string;
  coach: Coach;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    full_name: coach.users?.full_name || "",
    phone: coach.users?.phone || "",
    license_type: coach.license_type || "",
    license_number: coach.license_number || "",
    specialization: coach.specialization || "",
    years_of_experience: coach.years_of_experience?.toString() || "",
    bio: coach.bio || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (
      formData.years_of_experience &&
      (isNaN(Number(formData.years_of_experience)) ||
        Number(formData.years_of_experience) < 0)
    ) {
      newErrors.years_of_experience =
        "Years of experience must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/club/coaches/${coach.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone || null,
          license_type: formData.license_type || null,
          license_number: formData.license_number || null,
          specialization: formData.specialization || null,
          years_of_experience: formData.years_of_experience
            ? parseInt(formData.years_of_experience)
            : null,
          bio: formData.bio || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update coach");
      }

      router.push(`/club/${clubId}/coaches/${coach.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating coach:", error);
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to update coach",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border bg-card p-6 space-y-6">
        <h2 className="text-xl font-semibold">Basic Information</h2>

        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Email:</span>
            <span className="text-muted-foreground">{coach.email}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Email cannot be changed
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              className={errors.full_name ? "border-destructive" : ""}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="070123456"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g., Youth Development, Tactics"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-6">
        <h2 className="text-xl font-semibold">Coaching Credentials</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="license_type">License Type</Label>
            <Select
              value={formData.license_type}
              onValueChange={(value) =>
                handleSelectChange("license_type", value)
              }
            >
              <SelectTrigger id="license_type">
                <SelectValue placeholder="Select license type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UEFA Pro">UEFA Pro</SelectItem>
                <SelectItem value="UEFA A">UEFA A</SelectItem>
                <SelectItem value="UEFA B">UEFA B</SelectItem>
                <SelectItem value="UEFA C">UEFA C</SelectItem>
                <SelectItem value="Grassroots">Grassroots</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_number">License Number</Label>
            <Input
              id="license_number"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
              placeholder="e.g., UEFA-A-12345"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="years_of_experience">Years of Experience</Label>
            <Input
              id="years_of_experience"
              name="years_of_experience"
              type="number"
              min="0"
              value={formData.years_of_experience}
              onChange={handleChange}
              placeholder="5"
              className={errors.years_of_experience ? "border-destructive" : ""}
            />
            {errors.years_of_experience && (
              <p className="text-sm text-destructive">
                {errors.years_of_experience}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Brief biography and coaching philosophy..."
            rows={4}
          />
        </div>
      </div>

      {errors.submit && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href={`/club/${clubId}/coaches/${coach.id}`}>
          <Button type="button" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Coach"}
        </Button>
      </div>
    </form>
  );
}
