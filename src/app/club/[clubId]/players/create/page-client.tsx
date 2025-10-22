"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  create_parent_account: z.boolean(),
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

export default function CreatePlayerPageClient({ clubId }: { clubId: string }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<{
    playerName: string;
    parentEmail: string;
    parentPassword: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    watch,
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      create_parent_account: true,
    },
    mode: "onBlur",
  });

  const createParentAccount = watch("create_parent_account");

  const validateStep = async (step: number): Promise<boolean> => {
    let fields: (keyof PlayerFormData)[] = [];

    switch (step) {
      case 1:
        fields = ["first_name", "last_name", "date_of_birth", "gender", "photo_url"];
        break;
      case 2:
        fields = ["position", "dominant_foot", "jersey_number", "notes"];
        break;
      case 3:
        fields = ["blood_type", "allergies", "medical_conditions"];
        break;
      case 4:
        fields = ["emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship"];
        break;
      case 5:
        fields = ["parent_email", "parent_full_name", "parent_relationship", "create_parent_account"];
        break;
    }

    return await trigger(fields);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const onSubmit = async (data: PlayerFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/club/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          club_id: clubId,
          jersey_number: data.jersey_number ? parseInt(data.jersey_number) : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create player");
      }

      // Show success modal with parent credentials
      if (result.parent_password) {
        setSuccessModal({
          playerName: `${data.first_name} ${data.last_name}`,
          parentEmail: data.parent_email,
          parentPassword: result.parent_password,
        });
      } else {
        router.push(`/club/${clubId}/players`);
      }
    } catch (err) {
      console.error("Error creating player:", err);
      setError((err as Error).message || "Failed to create player");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/club/${clubId}/players`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Player
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep} of 5: {steps[currentStep - 1].title}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div key={step.number} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? "border-green-600 bg-green-600 dark:border-green-500 dark:bg-green-500"
                      : isCurrent
                        ? "border-green-600 bg-white dark:border-green-500 dark:bg-gray-800"
                        : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <Icon
                      className={`h-5 w-5 ${
                        isCurrent
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-400"
                      }`}
                    />
                  )}
                </div>
                <p
                  className={`mt-2 text-xs font-medium ${
                    isCurrent
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    isCompleted
                      ? "bg-green-600 dark:bg-green-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-6 p-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      First Name *
                    </label>
                    <input
                      {...register("first_name")}
                      type="text"
                      id="first_name"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    />
                    {errors.first_name && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Last Name *
                    </label>
                    <input
                      {...register("last_name")}
                      type="text"
                      id="last_name"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    />
                    {errors.last_name && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="date_of_birth"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Date of Birth *
                    </label>
                    <input
                      {...register("date_of_birth")}
                      type="date"
                      id="date_of_birth"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                    {errors.date_of_birth && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {errors.date_of_birth.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Gender *
                    </label>
                    <select
                      {...register("gender")}
                      id="gender"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="photo_url"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Photo URL
                  </label>
                  <input
                    {...register("photo_url")}
                    type="url"
                    id="photo_url"
                    placeholder="https://example.com/photo.jpg"
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                  />
                  {errors.photo_url && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                      {errors.photo_url.message}
                    </p>
                  )}
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                    Optional: Enter a URL to the player&apos;s photo
                  </p>
                </div>
              </>
            )}

            {/* Step 2: Football Info */}
            {currentStep === 2 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="position"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Position
                    </label>
                    <select
                      {...register("position")}
                      id="position"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">Select position</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Defender">Defender</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Forward">Forward</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="dominant_foot"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Dominant Foot
                    </label>
                    <select
                      {...register("dominant_foot")}
                      id="dominant_foot"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">Select foot</option>
                      <option value="Left">Left</option>
                      <option value="Right">Right</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="jersey_number"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Jersey Number
                  </label>
                  <input
                    {...register("jersey_number")}
                    type="number"
                    id="jersey_number"
                    min="1"
                    max="99"
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Notes
                  </label>
                  <textarea
                    {...register("notes")}
                    id="notes"
                    rows={4}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    placeholder="Any additional notes about the player..."
                  />
                </div>
              </>
            )}

            {/* Step 3: Medical Info */}
            {currentStep === 3 && (
              <>
                <div>
                  <label
                    htmlFor="blood_type"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Blood Type
                  </label>
                  <select
                    {...register("blood_type")}
                    id="blood_type"
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="allergies"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Allergies
                  </label>
                  <textarea
                    {...register("allergies")}
                    id="allergies"
                    rows={3}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    placeholder="List any known allergies..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="medical_conditions"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Medical Conditions
                  </label>
                  <textarea
                    {...register("medical_conditions")}
                    id="medical_conditions"
                    rows={3}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    placeholder="List any medical conditions, medications, etc..."
                  />
                </div>
              </>
            )}

            {/* Step 4: Emergency Contact */}
            {currentStep === 4 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="emergency_contact_name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Emergency Contact Name *
                    </label>
                    <input
                      {...register("emergency_contact_name")}
                      type="text"
                      id="emergency_contact_name"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    />
                    {errors.emergency_contact_name && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {errors.emergency_contact_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="emergency_contact_phone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Emergency Contact Phone *
                    </label>
                    <input
                      {...register("emergency_contact_phone")}
                      type="tel"
                      id="emergency_contact_phone"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    />
                    {errors.emergency_contact_phone && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {errors.emergency_contact_phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="emergency_contact_relationship"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Relationship *
                  </label>
                  <input
                    {...register("emergency_contact_relationship")}
                    type="text"
                    id="emergency_contact_relationship"
                    placeholder="e.g., Mother, Father, Guardian"
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                  />
                  {errors.emergency_contact_relationship && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                      {errors.emergency_contact_relationship.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Step 5: Parent/Guardian */}
            {currentStep === 5 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="parent_email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Parent Email *
                    </label>
                    <input
                      {...register("parent_email")}
                      type="email"
                      id="parent_email"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    />
                    {errors.parent_email && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {errors.parent_email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="parent_full_name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Parent Full Name *
                    </label>
                    <input
                      {...register("parent_full_name")}
                      type="text"
                      id="parent_full_name"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    />
                    {errors.parent_full_name && (
                      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {errors.parent_full_name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="parent_relationship"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Relationship to Player *
                  </label>
                  <select
                    {...register("parent_relationship")}
                    id="parent_relationship"
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">Select relationship</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.parent_relationship && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                      {errors.parent_relationship.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    {...register("create_parent_account")}
                    type="checkbox"
                    id="create_parent_account"
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900"
                  />
                  <label
                    htmlFor="create_parent_account"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Create parent account with access to the portal
                  </label>
                </div>

                {createParentAccount && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      A parent account will be created with a temporary password. The
                      parent will receive an email with login instructions.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                href={`/club/${clubId}/players`}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </Link>
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Player
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Player Created Successfully!
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {successModal.playerName} has been added to your club.
            </p>
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Parent Login Credentials
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Email:</span>{" "}
                  {successModal.parentEmail}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Password:</span>{" "}
                  {successModal.parentPassword}
                </p>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Please save these credentials. An email has been sent to the parent.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => router.push(`/club/${clubId}/players`)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
