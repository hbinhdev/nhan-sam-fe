"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type EditorCommand = "bold" | "italic" | "underline" | "insertUnorderedList" | "insertOrderedList";

function runCommand(command: EditorCommand) {
  document.execCommand(command, false);
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

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
