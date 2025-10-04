import supabase from '@/utils/supabase'

export async function uploadContractFile(contractId: string, file: File) {
  const safeName = file.name.replace(/[^\w\-.]+/g, '_')
  const ts = Date.now()
  const filePath = `${contractId}/${ts}_${safeName}`

  const { error } = await supabase.storage.from('pdf_storage').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from('pdf_storage').getPublicUrl(filePath)
  const file_url = data?.publicUrl ?? null
  return { file_path: filePath, file_url }
}
