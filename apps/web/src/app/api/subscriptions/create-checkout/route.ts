/**
 * API Route para criar checkout session do Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';

// Lazy initialization to avoid build-time errors
function getStripe(): Stripe | null {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }
  
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey === '') {
    return null;
  }
  try {
    const StripeLib = require('stripe');
    return new StripeLib(secretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
    }

    // Encontrar o plano
    const plan = require('@/lib/subscriptions').SUBSCRIPTION_PLANS.find(
      (p: any) => p.id === planId
    );

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Criar ou obter customer no Stripe
    let customerId: string;
    const customers = await stripe.customers.list({
      email: userId, // Usar userId como identificador temporário
      limit: 1,
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        metadata: {
          userId,
        },
      });
      customerId = customer.id;
    }

    // Criar checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: plan.stripePriceId || process.env.STRIPE_PRICE_ID_UNDERGROUND_ANNUAL,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/cancel`,
      metadata: {
        userId,
        planId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

