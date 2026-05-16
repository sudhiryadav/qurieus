"use client";

import { useState } from 'react';
import { getIdentityContext } from '@/utils/visitorId';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

interface VisitorInfoFormProps {
  onSubmit: (visitorInfo: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  }) => void;
  onCancel?: () => void;
}

export function VisitorInfoForm({ onSubmit, onCancel }: VisitorInfoFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const identityContext = getIdentityContext();
      
      await axiosInstance.post('/api/visitors/info', {
        visitorId: identityContext.visitorId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        company: formData.company.trim() || undefined,
        source: 'chat_widget'
      });

      onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        company: formData.company.trim() || undefined,
      });

    } catch {
      setErrors({ submit: 'Failed to save information. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white dark:bg-dark-2 rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Welcome! Let&apos;s get started
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please provide your information to begin chatting
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Name" htmlFor="name" required error={errors.name}>
          <Input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : undefined}
            placeholder="Enter your full name"
            disabled={isSubmitting}
          />
        </FormField>

        <FormField label="Email" htmlFor="email" required error={errors.email}>
          <Input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? 'border-red-500' : undefined}
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
        </FormField>

        <FormField label="Phone Number" htmlFor="phone">
          <Input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter your phone number (optional)"
            disabled={isSubmitting}
          />
        </FormField>

        <FormField label="Company" htmlFor="company">
          <Input
            type="text"
            id="company"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            placeholder="Enter your company name (optional)"
            disabled={isSubmitting}
          />
        </FormField>

        {errors.submit && (
          <p className="text-red-500 text-sm text-center" role="alert">{errors.submit}</p>
        )}

        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" className="flex-1" loading={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Start Chat'}
          </Button>
        </div>
      </form>
    </div>
  );
}
