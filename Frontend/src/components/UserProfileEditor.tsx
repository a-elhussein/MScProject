import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

type UserProfile = {
  dateOfBirth: string;
  heightCm: number;
  weightKg: number;
  activityLevel: number;
  goal: number;
  timeZone: string;
  sex: number;
};

type AppResponse<T> = {
  data: T;
  errorExist: boolean;
  errorMessage: string | null;
};

export default function UserProfileEditor() {
  const qc = useQueryClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const userQuery = useQuery<UserProfile, Error>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await api.get<AppResponse<UserProfile>>("/api/UserProfile/Get");
      if (res.data.errorExist || !res.data.data) throw new Error("Failed to fetch profile");
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: UserProfile) => {
      const res = await api.post<AppResponse<UserProfile>>("/api/UserProfile/CreateOrUpdate", payload);
      if (res.data.errorExist) throw new Error(res.data.errorMessage ?? "Update failed");
      return res.data.data;
    },
    onSuccess: (updated) => {
      setProfile(updated);
      qc.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Profile updated, check your new macros!");
      const today = new Date().toISOString().split("T")[0];
      api.post("/api/MacroRecommendation/recommend", { day: today })
          .then(() => {
            qc.invalidateQueries({ queryKey: ["latestMacro"] });
          })
          .catch(() => {
            toast.error("Failed to update macro recommendation");
          });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred");
      }
    },
  });

  if (userQuery.isLoading) return <p>Loading...</p>;
  if (userQuery.isError) return <p>Error loading profile</p>;

  const data = userQuery.data!;

  const handleChange = (field: keyof UserProfile, value: string | number) => {
    setProfile({ ...(profile ?? data), [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) updateMutation.mutate(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">Edit Profile</h2>

      <div className="hidden">
        <label className="block text-sm font-medium">Date of Birth</label>
        <input
          type="date"
          value={profile?.dateOfBirth ?? data.dateOfBirth}
          disabled
          className="border p-2 w-full bg-gray-100 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Height (50-300 cm) </label>
        <input
          type="number"
          value={profile?.heightCm ?? data.heightCm}
          onChange={(e) => handleChange("heightCm", Number(e.target.value))}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Weight (20-300 kg) </label>
        <input
          type="number"
          value={profile?.weightKg ?? data.weightKg}
          onChange={(e) => handleChange("weightKg", Number(e.target.value))}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Activity Level</label>
        <select
          value={profile?.activityLevel ?? data.activityLevel}
          onChange={(e) => handleChange("activityLevel", Number(e.target.value))}
          className="border p-2 w-full"
        >
          <option value={0}>Sedentary: little or no exercise</option>
          <option value={1}>Light: exercise 1-3 times/week</option>
          <option value={2}>Moderate: exercise 4-5 times/week</option>
          <option value={3}>Active: daily exercise or intense exercise 3-4 times/week</option>
          <option value={4}>Athlete: intense exercise 6-7 times/week</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Goal</label>
        <select
          value={profile?.goal ?? data.goal}
          onChange={(e) => handleChange("goal", Number(e.target.value))}
          className="border p-2 w-full"
        >
          <option value={0}>Cut</option>
          <option value={1}>Maintain</option>
          <option value={2}>Bulk</option>
        </select>
      </div>

      <div className="hidden">
        <label className="block text-sm font-medium" >
          Sex
          <span
            className="ml-1 inline-block text-xs text-gray-500 cursor-help"
            title="Used only for formula accuracy. Refers to biological sex at birth, not gender identity."
          >
            (i)
          </span>
        </label>
        <select
          value={profile?.sex ?? data.sex}
          onChange={(e) => handleChange("sex", Number(e.target.value))}
          className="border p-2 w-full"
        >
          <option value={0}>Female</option>
          <option value={1}>Male</option>
        </select>
      </div>

      <button type="submit" className="bg-black text-white px-4 py-2 rounded">
        Save Changes
      </button>
    </form>
  );
}
