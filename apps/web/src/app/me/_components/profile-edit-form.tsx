"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ArtistAvatar } from "@/components/artist-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OwnedProfile } from "@/hooks/use-owned-profile";
import { useUpdateProfile } from "@/hooks/use-update-profile";
import { type AllValidKeys, FILE_UPLOAD, SOCIAL_KEYS } from "@/lib/constants";
import { getTextRecord, ipfsToHttp } from "@/lib/utils";

type ProfileEditFormProps = {
  profile: OwnedProfile;
};

/**
 * Profile edit form component
 *
 * Follows React best practices:
 * - State initialized once from props (on mount)
 * - Parent passes key prop to force remount on profile change
 * - useEffect only for side effects (blob URL cleanup)
 * - useMemo for expensive calculations (change detection)
 * - Validation in event handlers
 */
export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  // Get existing text records using constants
  const existingRecords = profile.textRecords || [];
  const avatarValue = getTextRecord(existingRecords, "avatar");
  const descriptionValue = getTextRecord(existingRecords, "description");
  const emailValue = getTextRecord(existingRecords, "email");
  const urlValue = getTextRecord(existingRecords, "url");

  // Form state
  const [description, setDescription] = useState(descriptionValue);
  const [email, setEmail] = useState(emailValue);
  const [url, setUrl] = useState(urlValue);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Social links state - initialize from existing records
  const [socials, setSocials] = useState<Record<string, string>>(() => {
    const socialObj: Record<string, string> = {};
    for (const key of SOCIAL_KEYS) {
      const value = getTextRecord(existingRecords, key);
      if (value) {
        socialObj[key] = value;
      }
    }
    return socialObj;
  });

  const updateProfile = useUpdateProfile();

  // Cleanup blob URL on unmount
  useEffect(
    () => () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    },
    [avatarPreview]
  );

  // Check if form has changes
  const hasChanges = useMemo(() => {
    if (description !== descriptionValue) {
      return true;
    }
    if (email !== emailValue) {
      return true;
    }
    if (url !== urlValue) {
      return true;
    }
    if (avatarFile) {
      return true;
    }

    // Check social links
    for (const key of SOCIAL_KEYS) {
      const existingValue = getTextRecord(existingRecords, key);
      const currentValue = socials[key] || "";
      if (existingValue !== currentValue) {
        return true;
      }
    }

    return false;
  }, [
    description,
    email,
    url,
    avatarFile,
    socials,
    existingRecords,
    descriptionValue,
    emailValue,
    urlValue,
  ]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (4MB)
    if (file.size > FILE_UPLOAD.MAX_AVATAR_SIZE_BYTES) {
      toast.error("Image must be less than 4MB");
      return;
    }

    setAvatarFile(file);

    // Create preview
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSocialChange = (key: string, value: string) => {
    setSocials((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <LIFE IS SHORT, CODE IS LONG>
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile.ensName) {
      toast.error("No ENS name found");
      return;
    }

    // Build text records array using constants (only include non-empty values)
    const textRecords: Array<{ key: AllValidKeys; value: string }> = [];

    if (description.trim()) {
      textRecords.push({
        key: "description" as AllValidKeys,
        value: description.trim(),
      });
    }
    if (email.trim()) {
      textRecords.push({ key: "email" as AllValidKeys, value: email.trim() });
    }
    if (url.trim()) {
      textRecords.push({ key: "url" as AllValidKeys, value: url.trim() });
    }

    // Add social links (only non-empty) - these are already validated as SOCIAL_KEYS
    for (const [key, value] of Object.entries(socials)) {
      if (value.trim()) {
        textRecords.push({ key: key as AllValidKeys, value: value.trim() });
      }
    }

    try {
      await updateProfile.mutateAsync({
        ensName: profile.ensName,
        avatar: avatarFile || undefined,
        textRecords,
      });

      // Reset form state after successful save
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (_error) {
      // Error toast is handled by the mutation
    }
  };

  const currentAvatarSrc =
    avatarPreview || (avatarValue ? ipfsToHttp(avatarValue) : null);

  return (
    <Card className="border-border bg-background/80 p-6 backdrop-blur">
      <div className="mb-6">
        <div className="mb-3 flex flex-row items-center gap-3">
          {profile.ensName && (
            <p className="font-bold text-muted-foreground text-xl">
              {profile.ensName}
            </p>
          )}
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Avatar */}
        <div>
          <Label className="text-foreground">Avatar</Label>
          <div className="mt-2 flex items-center gap-4">
            <ArtistAvatar
              avatarUrl={currentAvatarSrc}
              className="border-4 border-border"
              name={profile.subdomain?.name || profile.ensName || "Profile"}
              size="lg"
            />
            <div>
              <input
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                ref={fileInputRef}
                type="file"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                type="button"
                variant="outline"
              >
                {avatarFile ? "Change Image" : "Upload Image"}
              </Button>
              {avatarFile && (
                <p className="mt-1 text-md text-muted-foreground">
                  {avatarFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description/Bio */}
        <div>
          <Label className="text-foreground" htmlFor="description">
            Bio / Description
          </Label>
          <Input
            className="mt-2 border-border bg-background text-foreground"
            id="description"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about yourself..."
            value={description}
          />
        </div>

        {/* Email */}
        <div>
          <Label className="text-foreground" htmlFor="email">
            Email (Optional)
          </Label>
          <Input
            className="mt-2 border-border bg-background text-foreground"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            type="email"
            value={email}
          />
        </div>

        {/* Website URL */}
        <div>
          <Label className="text-foreground" htmlFor="url">
            Website (Optional)
          </Label>
          <Input
            className="mt-2 border-border bg-background text-foreground"
            id="url"
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-website.com"
            type="url"
            value={url}
          />
        </div>

        {/* Social Links */}
        <div>
          <Label className="mb-3 text-foreground">
            Social Links (Optional)
          </Label>
          <div className="space-y-3">
            {(
              [
                "com.twitter",
                "com.instagram",
                "com.youtube",
                "com.spotify",
                "com.soundcloud",
              ] as const
            ).map((key) => (
              <div key={key}>
                <Label className="text-md text-muted-foreground" htmlFor={key}>
                  {key.replace("com.", "").charAt(0).toUpperCase() +
                    key.replace("com.", "").slice(1)}
                </Label>
                <Input
                  className="mt-1 border-border bg-background text-foreground"
                  id={key}
                  onChange={(e) => handleSocialChange(key, e.target.value)}
                  placeholder={`https://${key.replace("com.", "")}.com/yourusername`}
                  type="url"
                  value={socials[key] || ""}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            disabled={!hasChanges || updateProfile.isPending}
            type="submit"
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
          {hasChanges && (
            <Button
              onClick={() => {
                setDescription(descriptionValue);
                setEmail(emailValue);
                setUrl(urlValue);
                setAvatarFile(null);
                setAvatarPreview(null);
                setSocials(() => {
                  const socialObj: Record<string, string> = {};
                  for (const key of SOCIAL_KEYS) {
                    const value = getTextRecord(existingRecords, key);
                    if (value) {
                      socialObj[key] = value;
                    }
                  }
                  return socialObj;
                });
              }}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
