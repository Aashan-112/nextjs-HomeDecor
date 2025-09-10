# Stripe Payment Setup

This guide will help you configure Stripe payments for your e-commerce application.

## Environment Variables Required

To fix the build error "Neither apiKey nor config.authenticator provided", you need to set the following environment variables:

### Stripe Configuration

1. **STRIPE_SECRET_KEY** - Your Stripe secret key (server-side)
   - Get this from: https://dashboard.stripe.com/apikeys
   - Format: `sk_test_...` (for testing) or `sk_live_...` (for production)

2. **STRIPE_PUBLISHABLE_KEY** - Your Stripe publishable key (client-side)
   - Get this from: https://dashboard.stripe.com/apikeys  
   - Format: `pk_test_...` (for testing) or `pk_live_...` (for production)

3. **STRIPE_WEBHOOK_SECRET** - Your webhook endpoint secret
   - Get this from: https://dashboard.stripe.com/webhooks
   - Format: `whsec_...`

## Setting Environment Variables

### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

```
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key  
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
```

### For Local Development:

1. Copy `.env.example` to `.env.local`
2. Update the Stripe values with your actual keys:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and update:
```
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
```

## Getting Your Stripe Keys

1. Sign up for a Stripe account at https://stripe.com
2. Go to https://dashboard.stripe.com/apikeys
3. Copy your "Publishable key" and "Secret key"
4. For webhooks:
   - Go to https://dashboard.stripe.com/webhooks
   - Create a new webhook endpoint pointing to: `https://your-domain.vercel.app/api/payments/stripe/webhook`
   - Select events: `payment_intent.succeeded` and `payment_intent.payment_failed`
   - Copy the "Signing secret"

## Testing

Use Stripe's test card numbers:
- Success: `4242424242424242`
- Decline: `4000000000000002`

More test cards: https://stripe.com/docs/testing

## Troubleshooting

If you still get the "Neither apiKey nor config.authenticator provided" error:

1. Verify all environment variables are set correctly in Vercel
2. Redeploy your application after setting environment variables
3. Check the Vercel deployment logs for any other missing variables
4. Ensure you're using the correct variable names as shown above
