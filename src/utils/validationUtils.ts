export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 255;
};

export const validateAge = (age: number): boolean => {
  return age >= 13 && age <= 120;
};

export const validateHeight = (heightCm: number): boolean => {
  return heightCm > 50 && heightCm < 300;
};

export const validateWeight = (weightKg: number): boolean => {
  return weightKg > 20 && weightKg < 500;
};

export const validateQuantity = (quantity: number): boolean => {
  return quantity > 0 && quantity <= 10000;
};

export const validateCalories = (calories: number): boolean => {
  return calories >= 0 && calories <= 50000;
};

export const validateDuration = (minutes: number): boolean => {
  return minutes > 0 && minutes <= 1440; // Max 24 hours
};

export const validateWaterAmount = (ml: number): boolean => {
  return ml > 0 && ml <= 10000; // Max 10 liters per entry
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
