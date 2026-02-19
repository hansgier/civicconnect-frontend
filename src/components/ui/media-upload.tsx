"use client"

import * as React from "react"
import { Video, X, Plus } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface MediaFile {
  id: string
  file?: File
  url?: string
  type: 'IMAGE' | 'VIDEO'
  isExisting?: boolean
}

interface MediaUploadProps {
  existingMedia?: Array<{ id: string; url: string; type: string }>
  onChange?: (files: File[], deletedIds: string[]) => void
  maxFiles?: number
  className?: string
}

export function MediaUpload({
  existingMedia = [],
  onChange,
  maxFiles = 10,
  className
}: MediaUploadProps) {
  // Memoize initial media to avoid unnecessary effect runs
  const initialMedia = React.useMemo(() => {
    return existingMedia.map(m => ({
      id: m.id,
      url: m.url,
      type: m.type as 'IMAGE' | 'VIDEO',
      isExisting: true
    }))
  }, [existingMedia])

  const [media, setMedia] = React.useState<MediaFile[]>(initialMedia)
  const [deletedIds, setDeletedIds] = React.useState<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Sync state when initialMedia changes
  React.useEffect(() => {
    setMedia(initialMedia)
    setDeletedIds([]) // Reset deleted tracking when existing media changes (e.g. project swap)
  }, [initialMedia])

  const notifyChange = (currentMedia: MediaFile[], currentDeleted: string[]) => {
    if (onChange) {
      const newFiles = currentMedia
        .filter(m => !m.isExisting && m.file)
        .map(m => m.file!)
      onChange(newFiles, currentDeleted)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remainingSlots = maxFiles - media.length
    const filesToAdd = files.slice(0, remainingSlots)

    const newMedia: MediaFile[] = filesToAdd.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
      isExisting: false
    }))

    const updatedMedia = [...media, ...newMedia]
    setMedia(updatedMedia)
    notifyChange(updatedMedia, deletedIds)
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeMedia = (id: string) => {
    const itemToRemove = media.find(m => m.id === id)
    if (!itemToRemove) return

    if (itemToRemove.isExisting) {
      const newDeletedIds = [...deletedIds, itemToRemove.id]
      setDeletedIds(newDeletedIds)
      const updatedMedia = media.filter(m => m.id !== id)
      setMedia(updatedMedia)
      notifyChange(updatedMedia, newDeletedIds)
    } else {
      if (itemToRemove.url) URL.revokeObjectURL(itemToRemove.url)
      const updatedMedia = media.filter(m => m.id !== id)
      setMedia(updatedMedia)
      notifyChange(updatedMedia, deletedIds)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence mode="popLayout">
          {media.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-border/40 bg-muted/20 group"
            >
              {item.type === 'IMAGE' ? (
                <img 
                  src={item.url} 
                  alt="Preview" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-center line-clamp-1 px-2">
                    {item.file?.name || 'Video Content'}
                  </span>
                </div>
              )}
              
              {/* Overlay for actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-lg scale-90 hover:scale-100 transition-transform"
                  onClick={() => removeMedia(item.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {item.isExisting && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[8px] font-bold text-white uppercase tracking-widest border border-white/10">
                  Existing
                </div>
              )}
            </motion.div>
          ))}

          {media.length < maxFiles && (
            <motion.button
              layout
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-square rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group overflow-hidden"
            >
              <div className="p-3 bg-muted/50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                Add Media
              </span>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
              />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {media.length > 0 && (
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-1">
          {media.length} of {maxFiles} files selected — supports images and videos up to 50MB
        </p>
      )}
    </div>
  )
}
