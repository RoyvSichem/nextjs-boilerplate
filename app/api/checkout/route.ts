// app/api/checkout/route.ts
import Stripe from 'stripe';
import { supabaseServer } from '../../../lib/supabase'; // 3 niveaus omhoog

export async function POST(){
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion:'2024-06-20' });
  const sb = supabaseServer();
  const { data:{ user } } = await sb.auth.getUser();
  if(!user) return new Response('Unauthorized',{status:401});
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?ok=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe?canceled=1`,
    customer_email: user.email!,
    subscription_data: { metadata: { user_id: user.id } }
  });
  return Response.json({ url: session.url });
}
