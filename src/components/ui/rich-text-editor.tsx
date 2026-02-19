import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered 
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minHeight?: string
}

function RichTextEditor({
  content,
  onChange,
  placeholder = "Write something...",
  disabled = false,
  className,
  minHeight = "100px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editable: !disabled,
    immediatelyRender: false,
  })

  // Synchronize internal state with content prop if it changes externally
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Update editable state
  React.useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  if (!editor) {
    return null
  }

  return (
    <div
      data-slot="rich-text-editor"
      className={cn(
        "group relative flex w-full flex-col rounded-3xl border border-input bg-background/50 text-base shadow-sm transition-all duration-300 md:text-sm",
        "",
        "",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <div className="sticky top-2 z-10 mx-auto mt-2 w-max rounded-full border border-border/40 bg-background/80 px-3 py-1.5 shadow-sm backdrop-blur-md transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-focus-within:-translate-y-0.5">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
            className={cn(
              "h-8 w-8 rounded-full hover:bg-muted/80 active:scale-90 transition-all duration-200",
              editor.isActive("bold") && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            title="Bold"
          >
            <Bold className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
            className={cn(
              "h-8 w-8 rounded-full hover:bg-muted/80 active:scale-90 transition-all duration-200",
              editor.isActive("italic") && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            title="Italic"
          >
            <Italic className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={disabled}
            className={cn(
              "h-8 w-8 rounded-full hover:bg-muted/80 active:scale-90 transition-all duration-200",
              editor.isActive("underline") && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            title="Underline"
          >
            <UnderlineIcon className="size-4" />
          </Button>

          <div className="mx-1 h-4 w-px bg-border/50" />

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={disabled}
            className={cn(
              "h-8 w-8 rounded-full hover:bg-muted/80 active:scale-90 transition-all duration-200",
              editor.isActive("heading", { level: 2 }) && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            title="Heading 2"
          >
            <Heading2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            disabled={disabled}
            className={cn(
              "h-8 w-8 rounded-full hover:bg-muted/80 active:scale-90 transition-all duration-200",
              editor.isActive("heading", { level: 3 }) && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            title="Heading 3"
          >
            <Heading3 className="size-4" />
          </Button>

          <div className="mx-1 h-4 w-[1px] bg-border/50" />

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
            className={cn(
              "h-8 w-8 rounded-full hover:bg-muted/80 active:scale-90 transition-all duration-200",
              editor.isActive("bulletList") && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            title="Bullet List"
          >
            <List className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
            className={cn(
              "h-8 w-8 rounded-full hover:bg-muted/80 active:scale-90 transition-all duration-200",
              editor.isActive("orderedList") && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            title="Ordered List"
          >
            <ListOrdered className="size-4" />
          </Button>
        </div>
      </div>

      <div 
        className="tiptap-container flex-1 overflow-y-auto px-6 py-4"
        style={{ minHeight }}
      >
        <EditorContent 
          editor={editor} 
          className="tiptap prose prose-zinc dark:prose-invert max-w-none outline-none prose-headings:font-semibold prose-p:leading-relaxed"
        />
      </div>
    </div>
  )
}

export { RichTextEditor }
