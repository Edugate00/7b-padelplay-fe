import { createFileRoute } from '@tanstack/react-router'

import { PosTerminal } from '@/components/pos/PosTerminal'

export const Route = createFileRoute('/_app/')({
  head: () => ({ meta: [{ title: 'Cashier Catalog · 7B Coffee POS' }] }),
  component: PosTerminal,
})
