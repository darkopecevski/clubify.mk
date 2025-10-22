"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  User,
  Shield,
  Heart,
  Phone,
  Users,
  Check,
} from "lucide-react";

// Zod schemas for each step
const step1Schema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  photo_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const step2Schema = z.object({
  position: z.string().optional(),
  dominant_foot: z.string().optional(),
  jersey_number: z.string().optional(),
  notes: z.string().optional(),
});

const step3Schema = z.object({
  blood_type: z.string().optional(),
  allergies: z.string().optional(),
  medical_conditions: z.string().optional(),
});

const step4Schema = z.object({
  emergency_contact_name: z.string().min(2, "Emergency contact name is required"),
  emergency_contact_phone: z.string().min(5, "Emergency contact phone is required"),
  emergency_contact_relationship: z.string().min(1, "Relationship is required"),
});

const step5Schema = z.object({
  parent_email: z.string().email("Invalid email address"),
  parent_full_name: z.string().min(2, "Parent full name is required"),
  parent_relationship: z.string().min(1, "Relationship is required"),
});

// Combined schema
const playerSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

type PlayerFormData = z.infer<typeof playerSchema>;

const steps = [
  { number: 1, title: "Personal Info", icon: User },
  { number: 2, title: "Football Info", icon: Shield },
  { number: 3, title: "Medical Info", icon: Heart },
  { number: 4, title: "Emergency Contact", icon: Phone },
  { number: 5, title: "Parent/Guardian", icon: Users },
];

export default function EditPlayerPage({
  clubId,
  playerId,
}: {
  clubId: string;
  playerId: string;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    setValue,
    reset,
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    mode: "onBlur",
  });

  const fetchPlayerData = useCallback(async () => {
    const supabase = createClient();

    // Fetch player data
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (playerError || !playerData) {
      console.error("Error fetching player:", playerError);
      setError("Failed to load player data");
      setFetchingData(false);
      return;
    }

    // Fetch parent data
    const { data: parentData } = await supabase
      .from("player_parents")
      .select(`
        relationship,
        users!player_parents_parent_user_id_fkey (
          id,
          full_name
        )
      `)
      .eq("player_id", playerId)
      .single();

    // Get parent email from auth.users via RPC
    let parentEmail = "";
    if (parentData?.users) {
      const { data: usersWithEmail } = await supabase.rpc("get_users_with_email");
      const parentUser = usersWithEmail?.find(
        (u: { id: string; email: string }) => u.id === parentData.users?.id
      );
      parentEmail = parentUser?.email || "";
    }

    // Pre-populate form with existing data
    reset({
      first_name: playerData.first_name,
      last_name: playerData.last_name,
      date_of_birth: playerData.date_of_birth,
      gender: playerData.gender,
      photo_url: playerData.photo_url || "",
      position: playerData.position || "",
      dominant_foot: playerData.dominant_foot || "",
      jersey_number: playerData.jersey_number?.toString() || "",
      notes: playerData.notes || "",
      blood_type: playerData.blood_type || "",
      allergies: playerData.allergies || "",
      medical_conditions: playerData.medical_conditions || "",
      emergency_contact_name: playerData.emergency_contact_name,
      emergency_contact_phone: playerData.emergency_contact_phone,
      emergency_contact_relationship: playerData.emergency_contact_relationship,
      parent_email: parentEmail,
      parent_full_name: parentData?.users?.full_name || "",
      parent_relationship: parentData?.relationship || "",
    });

    setFetchingData(false);
  }, [playerId, reset]);

  useEffect(() => {
    fetchPlayerData();
  }, [fetchPlayerData]);

  const validateStep = async (step: number): Promise<boolean> => {
    let fields: (keyof PlayerFormData)[] = [];

    switch (step) {
      case 1:
        fields = ["first_name", "last_name", "date_of_birth", "gender"];
        break;
      case 2:
        fields = ["position", "dominant_foot", "jersey_number", "notes"];
        break;
      case 3:
        fields = ["blood_type", "allergies", "medical_conditions"];
        break;
      case 4:
        fields = [
          "emergency_contact_name",
          "emergency_contact_phone",
          "emergency_contact_relationship",
        ];
        break;
      case 5:
        fields = ["parent_email", "parent_full_name", "parent_relationship"];
        break;
    }

    return await trigger(fields);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: PlayerFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/club/players/${playerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          club_id: clubId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || "Failed to update player");
      }

      // Redirect to player profile
      router.push(`/club/${clubId}/players/${playerId}`);
    } catch (err) {
      console.error("Error updating player:", err);
      setError(err instanceof Error ? err.message : "Failed to update player");
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error && fetchingData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Link
            href={`/club/${clubId}/players`}
            className="mt-4 inline-block text-green-600 hover:text-green-700"
          >
            Back to Players
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Player
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update player information
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-1 items-center">
            <div className="relative flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  currentStep >= step.number
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className="mt-2 hidden text-xs font-medium text-gray-600 dark:text-gray-400 sm:block">
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${
                  currentStep > step.number
                    ? "bg-green-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name *
                  </label>
                  <input
                    {...register("first_name")}
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name *
                  </label>
                  <input
                    {...register("last_name")}
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date of Birth *
                  </label>
                  <input
                    {...register("date_of_birth")}
                    type="date"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.date_of_birth && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.date_of_birth.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gender *
                  </label>
                  <select
                    {...register("gender")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Photo URL (optional)
                </label>
                <input
                  {...register("photo_url")}
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.photo_url && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.photo_url.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Football Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Football Information
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Position
                  </label>
                  <select
                    {...register("position")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select position</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                    <option value="Defender">Defender</option>
                    <option value="Midfielder">Midfielder</option>
                    <option value="Forward">Forward</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dominant Foot
                  </label>
                  <select
                    {...register("dominant_foot")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select foot</option>
                    <option value="Left">Left</option>
                    <option value="Right">Right</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Jersey Number
                  </label>
                  <input
                    {...register("jersey_number")}
                    type="number"
                    min="1"
                    max="99"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Any additional notes about the player..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Medical Info */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Medical Information
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Blood Type
                  </label>
                  <select
                    {...register("blood_type")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allergies
                </label>
                <textarea
                  {...register("allergies")}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="List any known allergies..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Medical Conditions
                </label>
                <textarea
                  {...register("medical_conditions")}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="List any medical conditions..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Emergency Contact */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Emergency Contact
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Name *
                  </label>
                  <input
                    {...register("emergency_contact_name")}
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.emergency_contact_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergency_contact_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Phone *
                  </label>
                  <input
                    {...register("emergency_contact_phone")}
                    type="tel"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.emergency_contact_phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergency_contact_phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Relationship *
                  </label>
                  <select
                    {...register("emergency_contact_relationship")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select relationship</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.emergency_contact_relationship && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergency_contact_relationship.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Parent/Guardian */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Parent / Guardian Information
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Note: Changing parent email will not create a new account. Contact support to change parent associations.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Parent Email *
                  </label>
                  <input
                    {...register("parent_email")}
                    type="email"
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400"
                  />
                  {errors.parent_email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.parent_email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Parent Full Name *
                  </label>
                  <input
                    {...register("parent_full_name")}
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.parent_full_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.parent_full_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Relationship *
                  </label>
                  <select
                    {...register("parent_relationship")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select relationship</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.parent_relationship && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.parent_relationship.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <Link
                href={`/club/${clubId}/players/${playerId}`}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </Link>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Update Player
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
