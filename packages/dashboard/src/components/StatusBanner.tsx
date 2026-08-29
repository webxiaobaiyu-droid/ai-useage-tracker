import { Alert } from '@heroui/react';
import type { ReactNode } from 'react';

export type BannerTone = 'info' | 'warn' | 'error' | 'success';

const statusByTone = {
  info: 'accent',
  warn: 'warning',
  error: 'danger',
  success: 'success',
} as const;

interface StatusBannerProps {
  tone?: BannerTone;
  title: string;
  description?: string;
  /** Optional action slot (e.g. a retry button) rendered on the right. */
  children?: ReactNode;
}

/** Shared feedback banner using HeroUI's semantic status colors. */
export function StatusBanner({
  tone = 'info',
  title,
  description,
  children,
}: StatusBannerProps) {
  return (
    <Alert status={statusByTone[tone]}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        {description && <Alert.Description>{description}</Alert.Description>}
      </Alert.Content>
      {children}
    </Alert>
  );
}
