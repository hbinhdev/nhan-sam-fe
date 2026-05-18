"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onUploadImage?: (file: File) => Promise<string>;
};

type EditorCommand = "bold" | "italic" | "underline" | "insertUnorderedList" | "insertOrderedList";

function runCommand(command: EditorCommand) {
  document.execCommand(command, false);
}

export function RichTextEditor({ value, onChange, placeholder, onUploadImage }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  const handleInsertImageByUrl = () => {
    const url = window.prompt("Enter image URL");
    if (!url) return;
    if (!editorRef.current) return;

    editorRef.current.focus();
    document.execCommand("insertImage", false, url.trim());
    onChange(editorRef.current.innerHTML);
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !onUploadImage || !editorRef.current) return;

    try {
      const url = await onUploadImage(file);
      editorRef.current.focus();
      document.execCommand("insertImage", false, url);
      onChange(editorRef.current.innerHTML);
    } catch {
      // Keep editor usable even if image upload fails.
    }
  };

  return (
    <div className="rounded-lg border border-slate-300 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-2">
        <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={() => runCommand("bold")}>
          Bold
        </Button>
        <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={() => runCommand("italic")}>
          Italic
        </Button>
        <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={() => runCommand("underline")}>
          Underline
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 px-3 text-xs"
          onClick={() => runCommand("insertUnorderedList")}
        >
          Bullet List
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 px-3 text-xs"
          onClick={() => runCommand("insertOrderedList")}
        >
          Number List
        </Button>
        <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={handleInsertImageByUrl}>
          Insert Image URL
        </Button>
        <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={handlePickImage}>
          Upload Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleUploadImage}
        />
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[280px] w-full p-3 text-sm text-slate-900 outline-none"
        onInput={(event) => onChange((event.currentTarget as HTMLDivElement).innerHTML)}
        data-placeholder={placeholder ?? ""}
      />
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          display: block;
        }
      `}</style>
    </div>
  );
}
