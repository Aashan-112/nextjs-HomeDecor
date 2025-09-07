# Pakistani Payment Gateway Integration Guide

This document outlines the implementation of local Pakistani payment methods including JazzCash, EasyPaisa, and other payment options specifically designed for the Pakistani market.

## 🔧 Supported Payment Methods

### 1. JazzCash Mobile Wallet
- **Provider**: Mobilink Jazz
- **Fee**: 2% + PKR 20 minimum
- **Processing**: Instant
- **Limits**: Up to PKR 500,000 per transaction
- **Requirements**: Active Jazz mobile account

### 2. EasyPaisa Mobile Wallet
- **Provider**: Telenor Pakistan
- **Fee**: 2% + PKR 20 minimum
- **Processing**: Instant
- **Limits**: Up to PKR 300,000 per transaction
- **Requirements**: Active EasyPaisa account

### 3. Credit/Debit Cards (Stripe)
- **Provider**: Stripe
- **Fee**: 2.9% + PKR 30
- **Processing**: Instant
- **Cards**: Visa, MasterCard, American Express
- **Limits**: Up to PKR 1,000,000 per transaction

### 4. Cash on Delivery (COD)
- **Fee**: PKR 100 flat fee
- **Processing**: On delivery
- **Limits**: Up to PKR 50,000 per order
- **Availability**: Major cities only

### 5. Bank Transfer
- **Fee**: PKR 25
- **Processing**: 1-2 business days for verification
- **Limits**: Up to PKR 10,000,000 per transaction
- **Requirements**: Manual verification required

## 📁 File Structure

```
lib/payments/
├── payment-service.ts          # Main payment service
├── pakistan-payment-utils.ts   # Pakistani-specific utilities
app/api/payments/
├── jazzcash/
│   └── callback/
│       └── route.ts            # JazzCash callback handler
├── easypaisa/
│   ├── callback/
│   │   └── route.ts            # EasyPaisa callback handler
│   └── webhook/
│       └── route.ts            # EasyPaisa webhook handler
components/payments/
└── PaymentMethodSelector.tsx   # Payment selection UI
```

## 🚀 Getting Started

### 1. Environment Setup

Copy `.env.local.example` to `.env.local` and configure your payment gateway credentials:

```bash
# JazzCash Configuration
JAZZCASH_MERCHANT_ID=your-merchant-id
JAZZCASH_PASSWORD=your-password
JAZZCASH_SECRET_KEY=your-secret-key
JAZZCASH_SANDBOX=true

# EasyPaisa Configuration
EASYPAISA_MERCHANT_ID=your-merchant-id
EASYPAISA_PASSWORD=your-password
EASYPAISA_SECRET_KEY=your-secret-key
EASYPAISA_SANDBOX=true
```

### 2. Database Schema

Add these tables to your Supabase database:

```sql
-- Payment transactions log
CREATE TABLE payment_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id),
  payment_method text NOT NULL,
  transaction_id text UNIQUE,
  amount numeric NOT NULL,
  status text NOT NULL,
  gateway_response jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Webhook logs for audit trail
CREATE TABLE webhook_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL,
  webhook_type text,
  order_id text,
  transaction_id text,
  payload jsonb,
  processed_at timestamp with time zone DEFAULT now()
);
```

### 3. Integration Steps

#### Step 1: Initialize Payment Service
```typescript
import { PaymentService } from '@/lib/payments/payment-service'

const paymentMethods = PaymentService.getAvailablePaymentMethods(orderAmount)
```

#### Step 2: Process Payment
```typescript
const paymentRequest = {
  amount: totalAmount,
  currency: 'PKR',
  orderId: order.id,
  orderNumber: order.order_number,
  customerEmail: customer.email,
  customerPhone: customer.phone,
  shippingAddress: {
    name: shipping.name,
    address: shipping.address,
    city: shipping.city,
    province: shipping.province,
    postalCode: shipping.postalCode
  },
  items: cartItems
}

const result = await PaymentService.processPayment(methodId, paymentRequest)
```

#### Step 3: Handle Callbacks
Payment callbacks are automatically handled by the API routes:
- JazzCash: `/api/payments/jazzcash/callback`
- EasyPaisa: `/api/payments/easypaisa/callback`

## 🔐 Security Considerations

### Hash Verification
All payment callbacks include secure hash verification:

```typescript
// JazzCash hash verification
const hashString = `${amount}&${billReference}&${description}&...`
const computedHash = crypto.createHmac('sha256', secretKey)
  .update(hashString)
  .digest('hex')
  .toUpperCase()
```

### Environment Variables
Never commit sensitive credentials to version control:
- Use `.env.local` for local development
- Set environment variables in production
- Use different credentials for sandbox/production

### Webhook Security
- Verify webhook signatures
- Use HTTPS endpoints only
- Log all webhook attempts
- Implement replay attack protection

## 🧪 Testing

### Sandbox Credentials

#### JazzCash Sandbox
```
Merchant ID: MC12345
Password: password123
Secret Key: your-test-secret
Test URL: https://sandbox.jazzcash.com.pk
```

#### EasyPaisa Sandbox
```
Merchant ID: EP12345
Password: password123
Secret Key: your-test-secret
Test URL: https://easypaisa.com.pk/test
```

### Test Card Numbers (Stripe)
```
Visa: 4242 4242 4242 4242
MasterCard: 5555 5555 5555 4444
Declined: 4000 0000 0000 0002
```

### Testing Checklist
- [ ] Payment method selection
- [ ] Fee calculation
- [ ] Amount validation
- [ ] Mobile number validation
- [ ] Payment processing
- [ ] Callback handling
- [ ] Order status update
- [ ] Error handling
- [ ] Webhook processing

## 📱 Mobile Number Format

Pakistani mobile numbers must follow these formats:
- With country code: `+923001234567`
- Without country code: `03001234567`

Network prefixes:
- Jazz/Warid: 030, 031, 032, 033, 034, 035, 036, 037
- Telenor: 034, 035, 055
- Zong: 031, 032, 033
- Ufone: 033, 334

## 💸 Fee Structure

| Payment Method | Fee Structure | Example (PKR 10,000) |
|---------------|---------------|---------------------|
| JazzCash | 2% + PKR 20 minimum | PKR 220 |
| EasyPaisa | 2% + PKR 20 minimum | PKR 220 |
| Stripe | 2.9% + PKR 30 | PKR 320 |
| COD | Flat PKR 100 | PKR 100 |
| Bank Transfer | Flat PKR 25 | PKR 25 |

## 🎯 Response Codes

### JazzCash Response Codes
- `000`: Transaction Successful
- `001`: Transaction Failed
- `124`: Transaction Pending
- `201`: Invalid Mobile Number
- `202`: Insufficient Balance

### EasyPaisa Response Codes
- `0000`: Success
- `0001`: Transaction Pending
- `0002`: Transaction Failed
- `2001`: Insufficient Balance
- `3001`: Network Error

## 🔧 Troubleshooting

### Common Issues

1. **Hash Verification Failed**
   - Check secret key configuration
   - Verify field order in hash calculation
   - Ensure proper encoding (UTF-8)

2. **Payment Not Completing**
   - Check callback URL configuration
   - Verify webhook endpoint accessibility
   - Review gateway sandbox/production settings

3. **Mobile Number Issues**
   - Validate Pakistani mobile format
   - Remove spaces and special characters
   - Convert international format correctly

4. **Amount Limits**
   - Check payment method limits
   - Validate minimum amounts
   - Consider currency conversion

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG_PAYMENTS=true
LOG_LEVEL=debug
```

## 📞 Support Contacts

### JazzCash Support
- Email: merchant.support@jazzcash.com.pk
- Phone: +92-321-3008000
- Documentation: https://developer.jazzcash.com.pk

### EasyPaisa Support
- Email: merchant@easypaisa.com.pk
- Phone: +92-345-4444000
- Documentation: https://easypay.easypaisa.com.pk

## 🚀 Production Deployment

### Pre-deployment Checklist
- [ ] Update environment variables
- [ ] Test all payment methods
- [ ] Verify webhook URLs
- [ ] Configure SSL certificates
- [ ] Set up monitoring
- [ ] Test callback handling
- [ ] Validate security measures

### Monitoring
- Track payment success rates
- Monitor webhook delivery
- Log payment errors
- Set up alerts for failures
- Regular security audits

### Compliance
- PCI DSS compliance for card payments
- Data protection regulations
- Local banking regulations
- Consumer protection laws

## 📚 Additional Resources

- [JazzCash Developer Portal](https://developer.jazzcash.com.pk)
- [EasyPaisa Integration Guide](https://easypay.easypaisa.com.pk/docs)
- [Stripe Pakistan Guide](https://stripe.com/docs/payments/payment-methods/overview#pakistan)
- [State Bank of Pakistan Regulations](https://www.sbp.org.pk)

---

For technical support or questions about this implementation, please contact the development team or refer to the individual payment provider documentation.
