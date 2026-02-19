import { z } from 'zod';

// ============================================================
// Project Schema
// ============================================================
export const projectSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .transform((val) => val.trim()),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .transform((val) => val.trim()),
  status: z.enum([
    'ONGOING',
    'COMPLETED',
    'CANCELLED',
    'ON_HOLD',
    'PLANNED',
    'APPROVED_PROPOSAL',
  ]),
  category: z.enum([
    'INSTITUTIONAL',
    'TRANSPORTATION',
    'HEALTH',
    'WATER',
    'EDUCATION',
    'SOCIAL',
    'INFRASTRUCTURE',
    'SPORTS_AND_RECREATION',
    'ECONOMIC',
  ]),
  cost: z
    .string()
    .min(1, 'Budget is required')
    .refine((val) => parseFloat(val) > 0, {
      message: 'Please provide a valid budget amount greater than 0',
    }),
  startDate: z.string().min(1, 'Start date is required to track project timeline'),
  dueDate: z.string().min(1, 'Due date is required for project scheduling'),
  implementingAgency: z
    .string()
    .max(200, 'Implementing agency must be less than 200 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => val?.trim()),
  contractor: z
    .string()
    .max(200, 'Contractor must be less than 200 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => val?.trim()),
  barangayIds: z.array(z.string()).min(1, 'Please select at least one barangay'),
});

export type ProjectSchema = z.infer<typeof projectSchema>;

// ============================================================
// Announcement Schema
// ============================================================
export const announcementSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .transform((val) => val.trim()),
  excerpt: z
    .string()
    .max(200, 'Excerpt must be less than 200 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => val?.trim()),
  content: z
    .string()
    .min(1, 'Content is required')
    .min(10, 'Content must be at least 10 characters')
    .max(10000, 'Content must be less than 10000 characters')
    .refine((val) => {
      // Check if content is not just HTML tags
      const textContent = val.replace(/<[^>]*>/g, '').trim();
      return textContent.length > 0;
    }, 'Content cannot be empty')
    .transform((val) => val.trim()),
  category: z.enum(['EVENT', 'SAFETY', 'POLICY', 'INFRASTRUCTURE']),
  isUrgent: z.boolean().default(false),
  location: z
    .string()
    .max(200, 'Location must be less than 200 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => val?.trim()),
  image: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || val === '' || /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(val), {
      message: 'Please enter a valid URL',
    }),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

// ============================================================
// Contact Schema
// ============================================================
export const contactSchema = z.object({
  title: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be less than 200 characters')
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => val?.trim()),
  type: z.enum(
    [
      'EMERGENCY',
      'GOVERNMENT',
      'HEALTH',
      'EDUCATION',
      'ENVIRONMENT',
      'BUSINESS',
      'WATER',
      'ELECTRICITY',
    ],
    {
      message: 'Please select a contact type',
    }
  ),
  isEmergency: z.boolean().default(false),
  phoneNumbers: z.array(z.string()).default([]),
  emails: z
    .array(
      z.string().email('Invalid email address')
    )
    .default([]),
  schedule: z
    .string()
    .max(200, 'Schedule must be less than 200 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => val?.trim()),
  location: z
    .string()
    .max(300, 'Location must be less than 300 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => val?.trim()),
});

export type ContactSchema = z.infer<typeof contactSchema>;

// ============================================================
// Update Schema
// ============================================================
export const updateSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => val?.trim()),
  date: z.string().optional().or(z.literal('')),
});

export type UpdateSchema = z.infer<typeof updateSchema>;

// ============================================================
// User Edit Schema
// ============================================================
export const userEditSchema = z.object({
  role: z.enum(
    ['ADMIN', 'ASSISTANT_ADMIN', 'BARANGAY', 'CITIZEN'],
    {
      message: 'Please select a valid role',
    }
  ),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'], {
    message: 'Please select a valid status',
  }),
  barangayId: z.string().optional().or(z.literal('')),
});

export type UserEditSchema = z.infer<typeof userEditSchema>;

// ============================================================
// Comment Edit Schema
// ============================================================
export const commentEditSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .min(2, 'Content must be at least 2 characters')
    .max(2000, 'Content must be less than 2000 characters')
    .transform((val) => val.trim()),
  isOfficial: z.boolean().default(false),
});

export type CommentEditSchema = z.infer<typeof commentEditSchema>;

// ============================================================
// Helper Functions
// ============================================================

/**
 * Validates form data against a schema and returns errors if any
 */
export function validateForm<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, errors };
}

/**
 * Gets the first error message for a field
 */
export function getFieldError(
  errors: Record<string, string>,
  field: string
): string | undefined {
  return errors[field];
}
