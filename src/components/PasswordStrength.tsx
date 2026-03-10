import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = (password: string): { score: number; label: string } => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak' };
    if (score <= 2) return { score: 2, label: 'Fair' };
    if (score <= 3) return { score: 3, label: 'Good' };
    if (score <= 4) return { score: 4, label: 'Strong' };
    return { score: 5, label: 'Very Strong' };
  };

  const { score, label } = getStrength(password);

  const getColor = () => {
    switch (score) {
      case 1: return 'bg-destructive';
      case 2: return 'bg-[hsl(var(--battery-medium))]';
      case 3: return 'bg-[hsl(var(--battery-medium))]';
      case 4: return 'bg-primary';
      case 5: return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              level <= score ? getColor() : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className={cn(
        'text-xs',
        score <= 2 ? 'text-destructive' : score <= 3 ? 'text-[hsl(var(--battery-medium))]' : 'text-primary'
      )}>
        Password strength: {label}
      </p>
    </div>
  );
}
