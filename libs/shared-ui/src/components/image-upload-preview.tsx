"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button, Card, CardBody, CardHeader, Divider, Input } from "@heroui/react";

export type ImageSource =
  | { type: "file"; file: File; previewUrl: string }
  | { type: "url"; url: string; previewUrl: string };

export interface ImageUploadPreviewProps {
  label?: string;
  placeholderUrl?: string;
  initialUrl?: string;
  onChange?: (src: ImageSource | null) => void;
  className?: string;
}

export const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  label = "Image",
  placeholderUrl = "https://placehold.co/80x120",
  initialUrl,
  onChange,
  className,
}) => {
  const [url, setUrl] = useState<string>(initialUrl ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const preview = useMemo(() => {
    if (filePreview) return filePreview;
    if (url && /^https?:\/\//i.test(url)) return url;
    return placeholderUrl;
  }, [filePreview, url, placeholderUrl]);

  const urlValid = useMemo(() => /^https?:\/\//i.test(url), [url]);

  const handleFilePick = (f: File | undefined) => {
    if (!f) {
      setFile(null);
      setFilePreview(null);
      onChange?.(url && /^https?:\/\//i.test(url) ? { type: "url", url, previewUrl: url } : null);
      return;
    }
    const objectUrl = URL.createObjectURL(f);
    setFile(f);
    setFilePreview(objectUrl);
    onChange?.({ type: "file", file: f, previewUrl: objectUrl });
  };

  const handleUrlApply = () => {
    // Clear any picked file when switching to URL
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
      setFile(null);
    }
    if (url && /^https?:\/\//i.test(url)) {
      onChange?.({ type: "url", url, previewUrl: url });
    } else {
      onChange?.(null);
    }
  };

  return (
    <Card shadow="sm" radius="lg" className={className}>
      <CardHeader className="flex flex-col items-start gap-1">
        <div className="text-base font-medium">{label}</div>
        <div className="text-xs text-foreground-500">Provide a URL or choose a file</div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-2 text-sm font-medium text-foreground-600">From URL</div>
              <div className="flex items-end gap-2">
                <Input
                  label={`${label} URL`}
                  placeholder={placeholderUrl}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  variant="underlined"
                  size="lg"
                  className="flex-1"
                />
                <Button color="primary" onPress={handleUrlApply} isDisabled={!urlValid}>
                  Apply
                </Button>
              </div>
              <div className="mt-1 text-xs text-foreground-500">Enter an http/https URL, then Apply</div>
            </div>

            <Divider />

            <div>
              <div className="mb-2 text-sm font-medium text-foreground-600">From File</div>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFilePick(e.target.files?.[0])}
                  className="hidden"
                />
                <Button onPress={() => inputRef.current?.click()}>Choose File…</Button>
                {file && (
                  <Button
                    variant="flat"
                    color="default"
                    onPress={() => handleFilePick(undefined)}
                  >
                    Clear File
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="mb-2 text-sm font-medium text-foreground-600">Preview</div>
            <div className="w-full aspect-video bg-content2 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ImageUploadPreview;
