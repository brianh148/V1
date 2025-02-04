import { CalculationFactors, Property } from '../types';

export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 12 / 100;
  const numberOfPayments = years * 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
};

export const calculateFinancingCosts = (
  property: Property,
  factors: CalculationFactors
): number => {
  if (factors.purchaseModel === 'cash') return 0;

  const loanAmount = property.price * (1 - factors.downPaymentPercentage / 100);
  const monthlyPayment = calculateMonthlyPayment(loanAmount, factors.interestRate, 30);
  const financingCosts = monthlyPayment * factors.holdingPeriod;

  // Add renovation financing costs if applicable
  const rehabFinancingCosts =
    (property.renovationCost * factors.interestRate * factors.holdingPeriod) / (12 * 100);

  return financingCosts + rehabFinancingCosts;
};

export const calculateNetProfit = (
  property: Property,
  factors: CalculationFactors
): number => {
  const { price, estimatedARV, renovationCost } = property;
  const { miscCostsPercentage } = factors;

  // Calculate financing costs
  const financingCosts = calculateFinancingCosts(property, factors);

  // Calculate miscellaneous costs
  const miscCosts = renovationCost * (miscCostsPercentage / 100);

  // Calculate total costs
  const totalCosts = price + renovationCost + financingCosts + miscCosts;

  return estimatedARV - totalCosts;
};