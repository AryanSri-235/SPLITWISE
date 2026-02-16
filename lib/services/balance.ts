export function simplifyDebts(members: any[]) {
  const creditors = members
    .filter((m) => m.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  const debtors = members
    .filter((m) => m.balance < 0)
    .sort((a, b) => a.balance - b.balance);

  const result: any[] = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(
      -debtor.balance,
      creditor.balance
    );

    result.push({
      from: debtor.name,
      to: creditor.name,
      amount,
    });

    debtor.balance += amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) i++;
    if (creditor.balance === 0) j++;
  }

  return result;
}
