export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function addMonths(date: string, months: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

export function isExpired(date: string): boolean {
  return new Date(date) < new Date();
}

export function getPlanValue(dataEntrada: string): number {
  const cutoff = new Date('2026-05-26');
  const entrada = new Date(dataEntrada);
  return entrada >= cutoff ? 90 : 50;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pago': return 'text-emerald-600 bg-emerald-50';
    case 'pendente': return 'text-amber-600 bg-amber-50';
    case 'atrasado': return 'text-red-600 bg-red-50';
    default: return 'text-slate-600 bg-slate-50';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pago': return 'Pago';
    case 'pendente': return 'Pendente';
    case 'atrasado': return 'Atrasado';
    default: return status;
  }
}

export function getEscolaridadeLabel(value: string): string {
  switch (value) {
    case 'ensino_fundamental': return 'Ensino Fundamental Completo';
    case 'ensino_medio': return 'Ensino Médio Completo';
    case 'ensino_superior': return 'Ensino Superior Completo';
    default: return value;
  }
}

export function getConcorrenciaLabel(value: string): string {
  switch (value) {
    case 'ampla': return 'Ampla Concorrência';
    case 'negros_pardos': return 'Pessoa Negra/Pardos';
    case 'pcd': return 'PcD';
    case 'indigena': return 'Indígena';
    case 'quilombola': return 'Quilombola';
    case 'outro': return 'Outro';
    default: return value;
  }
}

export function getPagamentoLabel(value: string): string {
  switch (value) {
    case 'cartao': return 'Cartão de Crédito';
    case 'cartao_pix': return 'Cartão + Pix';
    case 'pix_vista': return 'Pix à Vista';
    default: return value;
  }
}

export function getTurnoLabel(value: string): string {
  switch (value) {
    case 'manha': return 'Manhã';
    case 'tarde': return 'Tarde';
    case 'noite': return 'Noite';
    default: return value;
  }
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function getRemainingTime(prazoValidade: string): string {
  const now = new Date();
  const end = new Date(prazoValidade);
  if (end <= now) return 'Expirado';
  let months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
  const dayDiff = end.getDate() - now.getDate();
  if (dayDiff < 0) {
    months -= 1;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    const daysInPrevMonth = prevMonth.getDate();
    const adjustedDays = daysInPrevMonth + dayDiff;
    if (months <= 0) return `${adjustedDays} dia(s)`;
    return `${months} mês(es) e ${adjustedDays} dia(s)`;
  }
  if (months <= 0 && dayDiff >= 0) return `${dayDiff} dia(s)`;
  return `${months} mês(es) e ${dayDiff} dia(s)`;
}
