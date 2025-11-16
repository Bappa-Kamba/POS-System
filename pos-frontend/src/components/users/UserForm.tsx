import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Copy, RefreshCw, Check } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { User } from '../../services/user.service';
import { userService } from '../../services/user.service';

// Strong password validation: min 8 chars, uppercase, lowercase, number, special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const createUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain uppercase, lowercase, number, and special character',
    ),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['ADMIN', 'CASHIER']),
  branchId: z.string().min(1, 'Branch is required'),
  isActive: z.boolean().optional(),
});

const updateUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain uppercase, lowercase, number, and special character',
    )
    .optional()
    .or(z.literal('')),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['ADMIN', 'CASHIER']),
  branchId: z.string().min(1, 'Branch is required'),
  isActive: z.boolean().optional(),
});

// Generate a random strong password
const generatePassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@$!%*?&';
  const all = uppercase + lowercase + numbers + special;

  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

// Generate username from first and last name
const generateUsername = (firstName?: string, lastName?: string): string => {
  const first = firstName?.toLowerCase().trim() || '';
  const last = lastName?.toLowerCase().trim() || '';

  if (!first && !last) {
    return '';
  }

  if (first && last) {
    return `${first}${last}`;
  }

  return first || last;
};

// Generate random username
const generateRandomUsername = (): string => {
  const adjectives = ['swift', 'bright', 'calm', 'bold', 'keen', 'wise', 'cool', 'sharp'];
  const nouns = ['tiger', 'eagle', 'wolf', 'bear', 'hawk', 'lion', 'fox', 'deer'];
  const numbers = Math.floor(Math.random() * 9999);
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adj}${noun}${numbers}`;
};

interface UserFormProps {
  user?: User;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  branchId?: string;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
  branchId,
}) => {
  const isEditMode = !!user;
  const schema = isEditMode ? updateUserSchema : createUserSchema;
  const [copied, setCopied] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [suggestedUsername, setSuggestedUsername] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: user
      ? {
          username: user.username,
          email: user.email || undefined,
          password: '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: user.role,
          branchId: user.branchId,
          isActive: user.isActive,
        }
      : {
          role: 'CASHIER',
          isActive: true,
          branchId: branchId || '',
          password: '',
        },
  });

  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const password = watch('password');

  // Check username uniqueness and return available username with number suffix if needed
  const checkUsernameAvailability = useCallback(
    async (baseUsername: string): Promise<string> => {
      if (!baseUsername) return '';

      setIsCheckingUsername(true);
      try {
        let testUsername = baseUsername;
        let counter = 1;

        // Check if username exists
        const checkExists = async (test: string): Promise<boolean> => {
          try {
            const result = await userService.getAll({
              search: test,
              limit: 1,
            });
            return (
              result.data?.some((u) => u.username.toLowerCase() === test.toLowerCase()) || false
            );
          } catch {
            return false;
          }
        };

        // Keep checking and incrementing until we find a unique username
        while (await checkExists(testUsername)) {
          testUsername = `${baseUsername}${counter}`;
          counter++;
        }

        return testUsername;
      } catch (error) {
        console.error('Error checking username:', error);
        return baseUsername;
      } finally {
        setIsCheckingUsername(false);
      }
    },
    [],
  );

  // Update suggested username when first/last name changes (only in create mode)
  useEffect(() => {
    if (!isEditMode && (firstName || lastName)) {
      const baseUsername = generateUsername(firstName, lastName);
      if (baseUsername) {
        setSuggestedUsername(baseUsername);
      } else {
        setSuggestedUsername('');
      }
    } else if (!isEditMode && !firstName && !lastName) {
      setSuggestedUsername('');
    }
  }, [firstName, lastName, isEditMode]);

  // Handle username field blur - check availability
  const handleUsernameBlur = useCallback(async () => {
    const currentUsername = getValues('username');
    if (currentUsername && !isEditMode) {
      const availableUsername = await checkUsernameAvailability(currentUsername);
      if (availableUsername && availableUsername !== currentUsername) {
        setSuggestedUsername(availableUsername);
      }
    }
  }, [getValues, isEditMode, checkUsernameAvailability]);

  // Use suggested username (from first/last name)
  const handleUseSuggestedUsername = useCallback(async () => {
    if (suggestedUsername) {
      const availableUsername = await checkUsernameAvailability(suggestedUsername);
      setValue('username', availableUsername);
    }
  }, [suggestedUsername, checkUsernameAvailability, setValue]);

  // Generate and use random username
  const handleGenerateRandomUsername = useCallback(async () => {
    const randomUsername = generateRandomUsername();
    const availableUsername = await checkUsernameAvailability(randomUsername);
    setValue('username', availableUsername);
    setSuggestedUsername('');
  }, [checkUsernameAvailability, setValue]);

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setValue('password', newPassword);
    setCopied(false);
  };

  const handleCopyPassword = async () => {
    if (password) {
      try {
        await navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy password:', error);
      }
    }
  };

  // Handle form submission - remove empty email
  const handleFormSubmit = (data: any) => {
    const submitData = { ...data };
    // Remove email if it's empty or undefined
    if (!submitData.email || submitData.email.trim() === '') {
      delete submitData.email;
    }
    // Remove password if it's empty (for update mode)
    if (isEditMode && (!submitData.password || submitData.password.trim() === '')) {
      delete submitData.password;
    }
    onSubmit(submitData);
  };


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...register('firstName')}
              error={errors.firstName?.message}
              placeholder="John"
            />

            <Input
              label="Last Name"
              {...register('lastName')}
              error={errors.lastName?.message}
              placeholder="Doe"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Username *
              </label>
              {!isEditMode && (
                <div className="flex items-center gap-1">
                  {suggestedUsername && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleUseSuggestedUsername}
                      className="px-2 py-1 text-xs"
                    >
                      Use "{suggestedUsername}"
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleGenerateRandomUsername}
                    className="px-2 py-1 text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Random
                  </Button>
                </div>
              )}
            </div>
            <Input
              {...register('username')}
              error={errors.username?.message}
              placeholder="e.g., johndoe"
              disabled={isEditMode || isCheckingUsername}
              onBlur={handleUsernameBlur}
            />
            {isCheckingUsername && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Checking availability...
              </p>
            )}
            {!isEditMode && suggestedUsername && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Suggested: <span className="font-medium">{suggestedUsername}</span>
              </p>
            )}
          </div>

          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="e.g., john@example.com"
          />
        </div>
      </div>

      {/* Security & Access */}
      <div>
        <h3 className="text-lg font-medium mb-4">Security & Access</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {isEditMode ? 'New Password (leave blank to keep current)' : 'Password *'}
              </label>
              {!isEditMode && (
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleGeneratePassword}
                    className="px-2 py-1 text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Generate
                  </Button>
                  {password && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyPassword}
                      className="px-2 py-1 text-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
            <Input
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder={
                isEditMode
                  ? 'Enter new password (min 8 chars, uppercase, lowercase, number, special char)'
                  : 'Enter password (min 8 chars, uppercase, lowercase, number, special char)'
              }
              autoComplete="new-password"
            />
            {!isEditMode && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Password must be at least 8 characters with uppercase, lowercase, number, and special
                character
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Role *
            </label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            >
              <option value="CASHIER">Cashier</option>
              <option value="ADMIN">Administrator</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Branch *
            </label>
            <input
              type="text"
              {...register('branchId')}
              value={branchId || watch('branchId')}
              disabled
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Users are assigned to the current branch
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Active (User can login)
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

