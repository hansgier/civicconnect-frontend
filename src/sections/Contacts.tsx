import { useState, useMemo } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  Filter,
  ArrowUpDown,
  Building2,
  Siren,
  Contact
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { Contact as ContactType, ContactSortOption } from '@/types';
import { useContacts } from '@/hooks/use-contacts';

const contactTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'government', label: 'Government' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'environment', label: 'Environment' },
  { value: 'business', label: 'Business' },
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity' },
];

interface ContactCardProps {
  contact: ContactType;
  isEmergency?: boolean;
}

function ContactCard({ contact, isEmergency = false }: ContactCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-lg',
        isEmergency
          ? 'bg-gradient-to-br from-red-600 via-red-700 to-rose-800 border-red-500/50 shadow-red-500/10'
          : 'bg-card hover:border-primary/20'
      )}
    >
      {/* Decorative element for emergency cards */}
      {isEmergency && (
        <>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
          <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] pointer-events-none" />
        </>
      )}

      <div className="p-5 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            {isEmergency && (
              <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
                <Siren className="h-3 w-3 text-white" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.15em]">
                  Live Hotline
                </span>
              </div>
            )}
            <h3 className={cn(
              "font-bold text-base leading-tight tracking-tight",
              isEmergency ? "text-white" : "text-foreground"
            )}>
              {contact.title}
            </h3>
          </div>
          <span className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex-shrink-0',
            isEmergency
              ? 'bg-black/20 text-red-100 backdrop-blur-sm border border-white/10'
              : 'bg-muted/70 text-muted-foreground'
          )}>
            {contact.type}
          </span>
        </div>

        {/* Description */}
        <p className={cn(
          "text-sm mb-4 line-clamp-2 leading-relaxed font-medium",
          isEmergency ? "text-red-50/80" : "text-muted-foreground"
        )}>
          {contact.description}
        </p>

        {/* Primary Phone - Prominent */}
        {contact.primaryPhone && (
          <a
            href={`tel:${contact.primaryPhone.replace(/\D/g, '')}`}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl mb-3 transition-all duration-300',
              isEmergency
                ? 'bg-white text-red-700 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:scale-[1.03]'
                : 'bg-primary/10 hover:bg-primary/20'
            )}
          >
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0',
              isEmergency ? 'bg-red-50' : 'bg-primary/20'
            )}>
              <Phone className={cn(
                'h-5 w-5',
                isEmergency ? 'text-red-600' : 'text-primary'
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-lg font-black truncate tracking-tight',
                isEmergency ? 'text-red-800' : 'text-primary'
              )}>
                {contact.primaryPhone}
              </p>
              <p className={cn(
                'text-[10px] font-bold uppercase tracking-widest opacity-70',
                isEmergency ? 'text-red-600' : 'text-primary/70'
              )}>
                Primary Contact
              </p>
            </div>
          </a>
        )}

        {/* Additional Phone Numbers */}
        {contact.phoneNumbers.length > 1 && (
          <div className="space-y-2 mb-4">
            <p className={cn(
              "text-[10px] uppercase tracking-[0.2em] font-black px-1",
              isEmergency ? "text-white/60" : "text-muted-foreground"
            )}>
              Alternative
            </p>
            <div className="flex flex-wrap gap-2">
              {contact.phoneNumbers
                .filter(phone => phone !== contact.primaryPhone)
                .map((phone, index) => (
                  <a
                    key={index}
                    href={`tel:${phone.replace(/\D/g, '')}`}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200',
                      isEmergency
                        ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                        : 'bg-muted/50 hover:bg-muted text-foreground'
                    )}
                  >
                    <Phone className="h-3 w-3 opacity-70" />
                    {phone}
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* Contact Details Grid */}
        <div className={cn(
          "grid gap-2.5 pt-4 border-t",
          isEmergency ? "border-white/10" : "border-border/50"
        )}>
          {contact.emails.length > 0 && (
            <div className="flex items-start gap-3 text-sm">
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0 mt-0.5',
                isEmergency ? 'bg-white/10 text-white border border-white/10' : 'bg-muted text-muted-foreground'
              )}>
                <Mail className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                {contact.emails.map((email, idx) => (
                  <a
                    key={idx}
                    href={`mailto:${email}`}
                    className={cn(
                      "transition-colors break-all font-medium",
                      isEmergency ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {email}
                  </a>
                ))}
              </div>
            </div>
          )}

          {contact.schedule && (
            <div className="flex items-center gap-3 text-sm">
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0',
                isEmergency ? 'bg-white/10 text-white border border-white/10' : 'bg-muted text-muted-foreground'
              )}>
                <Clock className="h-3.5 w-3.5" />
              </div>
              <span className={cn(
                "font-medium",
                isEmergency ? "text-white/80" : "text-muted-foreground"
              )}>{contact.schedule}</span>
            </div>
          )}

          {contact.location && (
            <div className="flex items-start gap-3 text-sm">
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0 mt-0.5',
                isEmergency ? 'bg-white/10 text-white border border-white/10' : 'bg-muted text-muted-foreground'
              )}>
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <span className={cn(
                "break-words flex-1 font-medium",
                isEmergency ? "text-white/80" : "text-muted-foreground"
              )}>{contact.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactsSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Placeholder */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-5 w-3/4 max-w-xl" />
      </div>

      {/* Emergency Section Placeholder */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t" />

      {/* Filters Placeholder */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Regular Contacts Grid Placeholder */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

interface ContactsProps {
  search?: string;
}

export function Contacts({ search }: ContactsProps) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<ContactSortOption>('name-asc');

  const { data: contacts = [], isLoading, isError } = useContacts({
    type: typeFilter,
    search: search,
    sort: sortBy,
  });

  // Separate emergency and regular contacts
  const emergencyContacts = useMemo(() =>
    contacts
      .filter(c => c.isEmergency)
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    [contacts]
  );

  const regularContacts = useMemo(() =>
    contacts.filter(c => !c.isEmergency),
    [contacts]
  );

  if (isLoading) return <ContactsSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Contact className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Contacts
            </h1>
          </div>
          <p className="text-muted-foreground max-w-xl">
            Find important contacts and emergency hotlines for city services, departments, and community resources
          </p>
        </div>
      </div>

      {isError && (
        <div className="bg-destructive/10 border border-destructive/20 p-5 rounded-xl text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Failed to load contacts. Please try again later.</p>
        </div>
      )}

      {/* Emergency Hotlines Section */}
      {emergencyContacts.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg  border border-red-200 dark:border-red-800">
              <Siren className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Emergency Hotlines</h2>
              <p className="text-xs text-muted-foreground">Immediate assistance available 24/7</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {emergencyContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} isEmergency />
            ))}
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="border-t" />

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {contactTypes.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as ContactSortOption)}>
            <SelectTrigger className="w-32 h-10">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">A-Z</SelectItem>
              <SelectItem value="name-desc">Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{regularContacts.length}</span> contact{regularContacts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Regular Contacts Grid */}
      {regularContacts.length === 0 ? (
        <div className="text-center py-16 px-4 border rounded-3xl border-dashed bg-muted/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Try adjusting your filters or search query to find what you're looking for
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regularContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  );
}
