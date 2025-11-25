/**
 * Webhook do Stripe para atualizar subscrições
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { UserSubscription } from '@/lib/subscriptions';
import { saveSubscriptionToIndexedDB } from '@/lib/subscription-db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error('No userId in session metadata');
          break;
        }

        const userSubscription: UserSubscription = {
          userId,
          planId: session.metadata?.planId || 'underground-annual',
          status: subscription.status === 'active' ? 'active' : 'expired',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await saveSubscriptionToIndexedDB(userSubscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          // Buscar userId do customer
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          // Assumir que temos userId em metadata do customer
          break;
        }

        const existing = await loadSubscriptionFromIndexedDB(userId);
        if (existing) {
          const updated: UserSubscription = {
            ...existing,
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: new Date(),
          };
          await saveSubscriptionToIndexedDB(updated);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        // Marcar como cancelado
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function mapStripeStatus(status: Stripe.Subscription.Status): UserSubscription['status'] {
  switch (status) {
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'cancelled';
    default:
      return 'expired';
  }
}

async function loadSubscriptionFromIndexedDB(userId: string) {
  const { loadSubscriptionFromIndexedDB } = await import('@/lib/subscription-db');
  return loadSubscriptionFromIndexedDB(userId);
}

