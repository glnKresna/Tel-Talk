type CloudinaryUploadResult = {
  secure_url: string
  resource_type: string
  original_filename?: string
  format?: string
}

function getCloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary belum dikonfigurasi. Set VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET.',
    )
  }

  return { cloudName, uploadPreset }
}

export async function uploadFileToCloudinary(options: {
  file: File
  folder?: string
  maxBytes?: number
}): Promise<{ url: string; resourceType: string }> {
  const { cloudName, uploadPreset } = getCloudinaryConfig()

  const { file, folder, maxBytes = 10 * 1024 * 1024 } = options

  if (!file) throw new Error('File kosong.')
  if (file.size > maxBytes) throw new Error('Ukuran file maksimal 10 MB.')

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', uploadPreset)
  if (folder) form.append('folder', folder)

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
  const res = await fetch(endpoint, { method: 'POST', body: form })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Upload gagal (HTTP ${res.status}).`)
  }

  const json = (await res.json()) as CloudinaryUploadResult
  if (!json?.secure_url) throw new Error('Upload gagal: URL kosong.')

  return { url: json.secure_url, resourceType: json.resource_type || 'auto' }
}

