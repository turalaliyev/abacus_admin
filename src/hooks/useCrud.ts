import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { supabase } from '../lib/supabase'

type CrudOptions = {
  table: string
  queryKey: string[]
  orderBy?: { column: string; ascending?: boolean }
}

export function useCrud<T extends { id: string | number }>({
  table,
  queryKey,
  orderBy = { column: 'sort_order', ascending: true },
}: CrudOptions) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order(orderBy.column, { ascending: orderBy.ascending ?? true })
      if (error) throw error
      return (data ?? []) as T[]
    },
  })

  const invalidate = () => qc.invalidateQueries({ queryKey })

  const create = useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const { error } = await supabase.from(table).insert(row)
      if (error) throw error
    },
    onSuccess: () => {
      message.success('Əlavə edildi')
      invalidate()
    },
    onError: (e: Error) => message.error(e.message),
  })

  const update = useMutation({
    mutationFn: async ({ id, ...row }: Record<string, unknown> & { id: string | number }) => {
      const { error } = await supabase.from(table).update(row).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      message.success('Yeniləndi')
      invalidate()
    },
    onError: (e: Error) => message.error(e.message),
  })

  const remove = useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      message.success('Silindi')
      invalidate()
    },
    onError: (e: Error) => message.error(e.message),
  })

  return { query, create, update, remove }
}
