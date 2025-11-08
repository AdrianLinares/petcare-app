import { z } from 'zod';

export const userFormSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Full name can only contain letters, spaces, periods, apostrophes, and hyphens'),
  
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .max(20, 'Phone number must not exceed 20 characters'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must not exceed 128 characters'),
  
  userType: z.enum(['pet_owner', 'veterinarian', 'administrator'], {
    required_error: 'Please select a user type'
  }),
  
  address: z.string()
    .max(500, 'Address must not exceed 500 characters')
    .optional(),
  
  specialization: z.string()
    .max(100, 'Specialization must not exceed 100 characters')
    .optional(),
  
  licenseNumber: z.string()
    .max(50, 'License number must not exceed 50 characters')
    .optional(),
  
  accessLevel: z.string()
    .max(50, 'Access level must not exceed 50 characters')
    .optional()
});

export const editUserFormSchema = userFormSchema.partial().extend({
  id: z.string().min(1, 'User ID is required')
});

export type UserFormData = z.infer<typeof userFormSchema>;
export type EditUserFormData = z.infer<typeof editUserFormSchema>;
