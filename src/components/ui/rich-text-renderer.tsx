import DOMPurify from "dompurify"

import { cn } from "@/lib/utils"

interface RichTextRendererProps {
  content: string | null | undefined
  className?: string
}

function RichTextRenderer({ content, className }: RichTextRendererProps) {
  if (!content) return null

  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["p", "strong", "em", "u", "ul", "ol", "li", "h2", "h3", "br"],
    ALLOWED_ATTR: [], // No attributes allowed
  })

  return (
    <div
      data-slot="rich-text-renderer"
      className={cn("rich-text-content", className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

export { RichTextRenderer }
