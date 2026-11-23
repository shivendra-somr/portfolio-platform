const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2024-01" -> "Jan 2024", "2023" -> "2023", null -> "Present" */
export function formatMonth(value: string | null | undefined): string {
  if (!value) return 'Present'
  const [year, month] = value.split('-')
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year
}

export function formatRange(start: string, end: string | null): string {
  return `${formatMonth(start)} – ${formatMonth(end)}`
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
