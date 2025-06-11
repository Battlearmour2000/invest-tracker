//formats  currencies into Tshs 1,000.00
export function currencyFormat(num: number) {
  if (typeof num !== "number") {
    num = Number(num);
  }
  return 'Tshs ' + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

//  Fuction to call percentages
//used in progress bar
export function percentageCalculation(part: number, total: number): string {
  if (total === 0) return '0%';
  const percentage = (part / total) * 100;
  return percentage.toFixed(2) + '%';
}

//monthly contribution calculation