import { useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

function sanitizeTitleForPath(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export default function Media() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string>("");

  const isAllowedFile = (candidate: File | null) => {
    if (!candidate) return false;
    const mimeType = candidate.type;
    const fileName = candidate.name.toLowerCase();
    const allowedExtensions = [
      ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff", ".svg",
      ".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv", ".m4v",
    ];
    const hasAllowedMime = mimeType.startsWith("image/") || mimeType.startsWith("video/");
    const hasAllowedExt = allowedExtensions.some((ext) => fileName.endsWith(ext));
    return hasAllowedMime || hasAllowedExt;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({ title: "No file selected", description: "Choose an image or video to upload." });
      return;
    }

    if (!isAllowedFile(file)) {
      toast({ title: "File format not supported", description: "Please upload an image or video file." });
      return;
    }

    if (!title.trim()) {
      toast({ title: "Missing title", description: "Please provide a title for this media." });
      return;
    }

    const safeTitle = sanitizeTitleForPath(title);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const extension = file.name.includes(".") ? file.name.split(".").pop() : undefined;
    const userPrefix = user?.id ?? "anonymous";
    const objectPath = extension
      ? `${timestamp}_${safeTitle}.${extension}`
      : `${timestamp}_${safeTitle}`;

    try {
      setIsUploading(true);

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(objectPath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(objectPath);

      if (!publicUrlData.publicUrl) {
        toast({
          title: "Upload succeeded but URL unavailable",
          description: "Could not generate a public URL.",
        });
        return;
      }

      const mediaType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "unknown";

      // Insert into public.media and return the row
      const { data: inserted, error: dbError } = await supabase
        .from("media")
        .insert({
          title: title.trim(),
          type: mediaType,
          url: publicUrlData.publicUrl,
        })
        .select("*")
        .single();

      if (dbError) {
        toast({ title: "Saved file but DB insert failed", description: dbError.message });
        return;
      }

      // Reset form state
      setTitle("");
      setFile(null);
      setPublicUrl(publicUrlData.publicUrl);

      toast({
        title: "File uploaded",
        description: `Media saved with ID: ${inserted.id}`,
      });

      // Copy URL to clipboard
      if (navigator?.clipboard) {
        try {
          await navigator.clipboard.writeText(publicUrlData.publicUrl);
          toast({ title: "URL copied", description: "Public URL copied to clipboard." });
        } catch {
          // Ignore errors
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload file";
      toast({ title: "Upload failed", description: message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl p-4">
      <h1 className="mb-6 text-2xl font-semibold">Upload Media</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            placeholder="e.g. Front display banner"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">File</Label>
          <Input
            id="file"
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null;
              if (next && !isAllowedFile(next)) {
                e.currentTarget.value = "";
                setFile(null);
                toast({ title: "File format not supported", description: "Please choose an image or video." });
                return;
              }
              setFile(next);
            }}
            disabled={isUploading}
            required
          />
        </div>
        <div className="pt-2">
          <Button type="submit" disabled={isUploading || !title.trim() || !file || !isAllowedFile(file)}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
        {publicUrl ? (
          <div className="space-y-2">
            <Label htmlFor="publicUrl">Public URL</Label>
            <div className="flex gap-2">
              <Input id="publicUrl" type="url" value={publicUrl} readOnly className="flex-1" />
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(publicUrl);
                    toast({ title: "URL copied", description: "Public URL copied to clipboard." });
                  } catch {
                    toast({ title: "Copy failed", description: "Unable to copy URL." });
                  }
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}
