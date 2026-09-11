import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

type Transaction = {
  id: string;
  type: string;
  category: string;
  description: string | null;
  amount: number | string;
  date: string;
};

type FinancialStats = {
  totalIncome: number;
  totalExpense: number;
  totalCommissions: number;
  monthlyData: { month: string; income: number; expense: number }[];
  recentTransactions: Transaction[];
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
};

const CATEGORY_LABELS: Record<string, string> = {
  sale: 'Vendas',
  rental: 'Locações',
  consulting: 'Consultoria',
  commission: 'Comissões',
  operational: 'Operacional',
  marketing: 'Marketing',
  tax: 'Impostos',
  other: 'Outros',
};

const TYPE_LABELS: Record<string, string> = {
  income: 'Entrada',
  expense: 'Saída',
};

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
}

// ─── PDF Export ───
export function exportFinanceiroPDF(stats: FinancialStats, period: string) {
  const doc = new jsPDF();
  const periodLabel = period === 'month' ? 'Este Mês' : period === 'quarter' ? 'Trimestre' : 'Ano';
  const now = new Date().toLocaleDateString('pt-BR');

  // Header
  doc.setFontSize(20);
  doc.setTextColor(34, 49, 82); // primary color
  doc.text('Estate.ia - Relatório Financeiro', 14, 22);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Período: ${periodLabel} | Gerado em: ${now}`, 14, 30);

  // Summary cards
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Resumo', 14, 42);

  const netProfit = stats.totalIncome - stats.totalExpense;
  const margin = stats.totalIncome > 0 ? ((netProfit / stats.totalIncome) * 100).toFixed(1) : '0';

  autoTable(doc, {
    startY: 46,
    head: [['Indicador', 'Valor']],
    body: [
      ['Receita Total', formatBRL(stats.totalIncome)],
      ['Despesas Totais', formatBRL(stats.totalExpense)],
      ['Lucro Líquido', formatBRL(netProfit)],
      ['Margem', `${margin}%`],
      ['Comissões', formatBRL(stats.totalCommissions)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [217, 105, 9], textColor: 255 },
    styles: { fontSize: 10 },
  });

  // Income by category
  const incomeY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(12);
  doc.text('Receitas por Categoria', 14, incomeY);

  const incomeRows = Object.entries(stats.incomeByCategory).map(([cat, val]) => [
    CATEGORY_LABELS[cat] || cat,
    formatBRL(val),
  ]);

  if (incomeRows.length > 0) {
    autoTable(doc, {
      startY: incomeY + 4,
      head: [['Categoria', 'Valor']],
      body: incomeRows,
      theme: 'striped',
      headStyles: { fillColor: [34, 49, 82] },
      styles: { fontSize: 10 },
    });
  }

  // Expense by category
  const expenseY = (doc as any).lastAutoTable?.finalY
    ? (doc as any).lastAutoTable.finalY + 12
    : incomeY + 20;
  doc.setFontSize(12);
  doc.text('Despesas por Categoria', 14, expenseY);

  const expenseRows = Object.entries(stats.expenseByCategory).map(([cat, val]) => [
    CATEGORY_LABELS[cat] || cat,
    formatBRL(val),
  ]);

  if (expenseRows.length > 0) {
    autoTable(doc, {
      startY: expenseY + 4,
      head: [['Categoria', 'Valor']],
      body: expenseRows,
      theme: 'striped',
      headStyles: { fillColor: [34, 49, 82] },
      styles: { fontSize: 10 },
    });
  }

  // Transactions table - new page
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(34, 49, 82);
  doc.text('Transações Recentes', 14, 22);

  const txRows = stats.recentTransactions.map((tx) => [
    tx.description || 'Sem descrição',
    formatDate(tx.date),
    TYPE_LABELS[tx.type] || tx.type,
    CATEGORY_LABELS[tx.category] || tx.category,
    `${tx.type === 'income' ? '+' : '-'} ${formatBRL(Number(tx.amount))}`,
  ]);

  autoTable(doc, {
    startY: 28,
    head: [['Descrição', 'Data', 'Tipo', 'Categoria', 'Valor']],
    body: txRows,
    theme: 'grid',
    headStyles: { fillColor: [217, 105, 9], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 60 },
      4: { halign: 'right' },
    },
  });

  // Monthly data - new page
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Fluxo de Caixa Mensal', 14, 22);

  const monthlyRows = stats.monthlyData.map((m) => [
    m.month,
    formatBRL(m.income),
    formatBRL(m.expense),
    formatBRL(m.income - m.expense),
  ]);

  autoTable(doc, {
    startY: 28,
    head: [['Mês', 'Entradas', 'Saídas', 'Saldo']],
    body: monthlyRows,
    theme: 'grid',
    headStyles: { fillColor: [34, 49, 82] },
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Estate.ia - Relatório Financeiro | Página ${i} de ${pageCount}`, 14, 290);
  }

  doc.save(`relatorio-financeiro-${period}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Excel Export ───
export function exportFinanceiroExcel(stats: FinancialStats, period: string) {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Estate.ia - Relatório Financeiro'],
    ['Período', period === 'month' ? 'Este Mês' : period === 'quarter' ? 'Trimestre' : 'Ano'],
    ['Data', new Date().toLocaleDateString('pt-BR')],
    [],
    ['Indicador', 'Valor'],
    ['Receita Total', stats.totalIncome],
    ['Despesas Totais', stats.totalExpense],
    ['Lucro Líquido', stats.totalIncome - stats.totalExpense],
    ['Comissões', stats.totalCommissions],
    ['Margem', stats.totalIncome > 0 ? `${(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100).toFixed(1)}%` : '0%'],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

  // Transactions sheet
  const txData = [
    ['Descrição', 'Data', 'Tipo', 'Categoria', 'Valor'],
    ...stats.recentTransactions.map((tx) => [
      tx.description || 'Sem descrição',
      tx.date,
      TYPE_LABELS[tx.type] || tx.type,
      CATEGORY_LABELS[tx.category] || tx.category,
      Number(tx.amount) * (tx.type === 'expense' ? -1 : 1),
    ]),
  ];
  const wsTx = XLSX.utils.aoa_to_sheet(txData);
  wsTx['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsTx, 'Transações');

  // Monthly flow sheet
  const monthlySheetData = [
    ['Mês', 'Entradas', 'Saídas', 'Saldo'],
    ...stats.monthlyData.map((m) => [m.month, m.income, m.expense, m.income - m.expense]),
  ];
  const wsMonthly = XLSX.utils.aoa_to_sheet(monthlySheetData);
  wsMonthly['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsMonthly, 'Fluxo Mensal');

  // Income categories sheet
  const incomeSheetData = [
    ['Categoria', 'Valor'],
    ...Object.entries(stats.incomeByCategory).map(([cat, val]) => [CATEGORY_LABELS[cat] || cat, val]),
  ];
  const wsIncome = XLSX.utils.aoa_to_sheet(incomeSheetData);
  XLSX.utils.book_append_sheet(wb, wsIncome, 'Receitas');

  // Expense categories sheet
  const expenseSheetData = [
    ['Categoria', 'Valor'],
    ...Object.entries(stats.expenseByCategory).map(([cat, val]) => [CATEGORY_LABELS[cat] || cat, val]),
  ];
  const wsExpense = XLSX.utils.aoa_to_sheet(expenseSheetData);
  XLSX.utils.book_append_sheet(wb, wsExpense, 'Despesas');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `relatorio-financeiro-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ─── Generic CSV Export ───
export function exportToCSV<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; label: string }[],
  filename: string
) {
  const csvContent = [
    columns.map(c => c.label).join(';'),
    ...rows.map(row =>
      columns.map(c => {
        const val = row[c.key];
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(';') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`;
        return str;
      }).join(';')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
}

// ─── Generic PDF Export ───
export function exportToPDF<T extends Record<string, unknown>>(
  title: string,
  rows: T[],
  columns: { key: keyof T; label: string; format?: (val: unknown) => string }[],
  filename: string
) {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString('pt-BR');
  const primaryColor = [34, 49, 82]; // #223152
  const accentColor = [200, 89, 10]; // #c8590a

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('Estate.ia', 14, 18);
  doc.setFontSize(10);
  doc.text(title, 14, 25);

  // Subheader
  doc.setTextColor(100);
  doc.setFontSize(9);
  doc.text(`Gerado em: ${now} | Total de registros: ${rows.length}`, 14, 36);

  // Table
  const tableRows = rows.map(row =>
    columns.map(c => {
      const val = row[c.key];
      if (c.format) return c.format(val);
      if (val === null || val === undefined) return '-';
      return String(val);
    })
  );

  autoTable(doc, {
    startY: 42,
    head: [columns.map(c => c.label)],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: accentColor as [number, number, number],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250] as [number, number, number],
    },
    margin: { top: 42, bottom: 20 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 287, 210, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Estate.ia - ${title} | Página ${i} de ${pageCount}`, 14, 293);
  }

  doc.save(`${filename}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
