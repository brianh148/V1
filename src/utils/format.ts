export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export const calculateROI = (arv: number, purchasePrice: number, renovationCost: number): number => {
  const profit = arv - (purchasePrice + renovationCost);
  const totalInvestment = purchasePrice + renovationCost;
  return (profit / totalInvestment) * 100;
};