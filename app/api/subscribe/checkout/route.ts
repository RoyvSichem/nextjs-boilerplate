import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request){
  const sb = await supabaseServer();
  const { data:{ user } } = await sb.auth.getUser();
  if(!user) return NextResponse.redirect(new URL('/login?next=/subscribe', req.url));

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID; // bv price_xxx voor €4,95/maand
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  if(!secret || !priceId){
    // geen stripe geconfigureerd, terug met melding
    return NextResponse.redirect(new URL('/subscribe?stripe=missing', req.url));
  }

  // dynamic import, geen type afhankelijkheden
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' as any });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${site}/profile?upgraded=1`,
    cancel_url: `${site}/subscribe?canceled=1`,
    customer_email: user.email ?? undefined,
    allow_promotion_codes: true
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
