import { useState } from 'react';
import { Share2, Link, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { cn, stripHtml } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ShareDialogProps {
  title: string;
  url?: string;
  description?: string;
}

const shareOptions = [
  { id: 'copy', label: 'Copy Link', icon: Link },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'twitter', label: 'Twitter', icon: Twitter },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'email', label: 'Email', icon: Mail },
];

export function ShareDialog({ title, url = window.location.href, description }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: string) => {
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description || '')}%0A%0A${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      handleCopyLink();
      return;
    }

    const shareUrl = shareUrls[platform];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full gap-2.5 h-11 rounded-xl border-input/50 bg-background/50 hover:bg-muted/80 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-sm"
        >
          <Share2 className="h-4 w-4" />
          <span className="font-semibold text-sm">Share Project</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-100 bg-popover/95 backdrop-blur-3xl p-6 gap-6 rounded-[1.5rem] border border-border/50 shadow-2xl text-foreground overflow-hidden">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold tracking-tight">Spread the Word</DialogTitle>
          <p className="text-xs text-muted-foreground font-medium">Help others stay informed about this project</p>
        </DialogHeader>

        {/* Preview Card - More compact and consistent */}
        <div className="relative group text-left">
          <div className="relative rounded-xl border border-primary/10 bg-primary/5 p-4 space-y-2 overflow-hidden">
            <div className="h-1 w-10 bg-primary/20 rounded-full" />
            <p className="font-bold text-sm leading-tight text-primary uppercase tracking-tight line-clamp-1">{title}</p>
            {description && (
              <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed italic font-medium">
                "{stripHtml(description)}"
              </p>
            )}
          </div>
        </div>

        {/* Copy Link Section */}
        <div className="space-y-2 text-left">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 pl-1">Project Link</label>
          <div 
            onClick={handleCopyLink}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-input/10 cursor-pointer hover:bg-muted/60 transition-all group/link"
          >
            <Link className="h-3.5 w-3.5 text-muted-foreground group-hover/link:text-primary transition-colors shrink-0" />
            <span className="text-[10px] font-semibold text-muted-foreground/80 truncate flex-1">{url}</span>
            {copied && (
              <span className="text-[10px] font-bold text-green-600 animate-in fade-in zoom-in-95 mr-1">Copied!</span>
            )}
          </div>
        </div>

        {/* Social Grid - Compact icons */}
        <div className="grid grid-cols-3 gap-4 pt-1">
          {shareOptions.filter(opt => opt.id !== 'copy' && opt.id !== 'email').map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleShare(option.id)}
                className="group flex flex-col items-center gap-2 outline-none"
              >
                <div className={cn(
                  'relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500 shadow-md group-hover:-translate-y-1 group-hover:shadow-lg active:scale-90',
                  option.id === 'facebook' && 'bg-[#1877F2] shadow-[#1877F2]/20',
                  option.id === 'twitter' && 'bg-black shadow-black/10',
                  option.id === 'linkedin' && 'bg-[#0A66C2] shadow-[#0A66C2]/20',
                )}>
                  <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Icon className="h-5 w-5 text-white relative z-10" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 group-hover:text-foreground transition-colors">{option.label}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
