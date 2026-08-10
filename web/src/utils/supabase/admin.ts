import { createClient } from '@supabase/supabase-js'

// CẢNH BÁO: Client này sẽ bypass toàn bộ RLS (Row Level Security).
// CHỈ ĐƯỢC DÙNG trong Server Actions hoặc Route Handlers cho các tác vụ Admin.
// TUYỆT ĐỐI KHÔNG export hoặc import file này ở Client Components!
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
