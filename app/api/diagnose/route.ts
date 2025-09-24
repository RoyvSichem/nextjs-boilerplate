// app/api/diagnose/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET() {
  try {
    const sb = await supabaseServer();
    const { data: cats, error } = await sb
      .from('categories')
      .select('id', { count: 'exact', head: false })
      .limit(1);

    return NextResponse.json({
      ok: true,
      categoriesRowSample: cats?.[0] ?? null,
      note: error ? error.message : 'ok',
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
