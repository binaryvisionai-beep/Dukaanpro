export const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);

export const formatCurrency = (value: number) => `₹${formatINR(value)}`;

export const getTodayLabel = () =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
