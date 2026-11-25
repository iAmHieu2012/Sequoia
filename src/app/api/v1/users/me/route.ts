import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { supabaseService } from '@/utils/supabase/service';

/** The signed-in user, from their Firebase token. */
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json({ data: auth });
}

/**
 * Creates or refreshes the user's profile row from their Firebase token, and creates an empty
 * progress row the first time. AuthContext calls this whenever the user signs in.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    const { error: userError } = await supabaseService.from('users').upsert({
      id: auth.uid,
      email: auth.email,
      display_name: auth.name,
      photo_url: auth.picture,
    });
    if (userError) throw userError;

    // ignoreDuplicates: never overwrite existing progress.
    const { error: progressError } = await supabaseService
      .from('user_progress')
      .upsert({ id: auth.uid }, { onConflict: 'id', ignoreDuplicates: true });
    if (progressError) throw progressError;

    return NextResponse.json({ data: { id: auth.uid } });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
