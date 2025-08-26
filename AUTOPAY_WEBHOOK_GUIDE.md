# Autopay Webhook Endpoint Implementation Guide

## Overview
This document describes how to implement the backend webhook endpoint that Autopay will call to notify about payment status changes.

## Webhook Endpoint Requirements

### URL
```
POST /api/autopay/notification
```

### Request Body Example
```json
{
  "transaction_id": "tx_1234567890",
  "status": "confirmed",
  "amount": 2900,
  "currency": "PLN",
  "merchant_data": "{\"planId\":\"pro\",\"billingCycle\":\"monthly\",\"userId\":\"user123\"}",
  "timestamp": "2024-01-15T10:30:00Z",
  "signature": "abc123def456..."
}
```

### Implementation Steps

#### 1. Verify Webhook Signature
```javascript
const crypto = require('crypto');

function verifyAutopaySignature(body, signature, secretKey) {
  const { signature: receivedSignature, ...payload } = body;
  
  const sortedKeys = Object.keys(payload).sort();
  const signatureString = sortedKeys
    .map(key => `${key}=${payload[key]}`)
    .join('&') + secretKey;
  
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(signatureString)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

#### 2. Process Payment Status
```javascript
app.post('/api/autopay/notification', async (req, res) => {
  try {
    // Verify signature
    const isValid = verifyAutopaySignature(
      req.body,
      req.body.signature,
      process.env.AUTOPAY_SECRET_KEY
    );
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const { transaction_id, status, merchant_data } = req.body;
    const userData = JSON.parse(merchant_data);
    
    // Update user subscription/payment status in database
    await updateUserPaymentStatus(userData.userId, {
      transactionId: transaction_id,
      status: status,
      planId: userData.planId,
      billingCycle: userData.billingCycle
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

#### 3. Database Updates
```javascript
async function updateUserPaymentStatus(userId, paymentData) {
  const { transactionId, status, planId, billingCycle } = paymentData;
  
  switch (status) {
    case 'confirmed':
      // Activate user's plan
      await db.collection('users').doc(userId).update({
        plan: planId,
        billingCycle: billingCycle,
        subscriptionStatus: 'active',
        lastPayment: {
          transactionId,
          date: new Date(),
          amount: getAmountForPlan(planId, billingCycle)
        }
      });
      break;
      
    case 'failed':
    case 'cancelled':
      // Handle failed payments
      await db.collection('users').doc(userId).update({
        subscriptionStatus: 'payment_failed',
        lastPaymentAttempt: {
          transactionId,
          date: new Date(),
          status
        }
      });
      break;
  }
}
```

## Testing the Webhook

### 1. Local Development
Use ngrok or similar to expose localhost:
```bash
ngrok http 3000
# Update REACT_APP_AUTOPAY_NOTIFICATION_URL to the ngrok URL
```

### 2. Test Webhook Call
```bash
curl -X POST http://localhost:3000/api/autopay/notification \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "test_123",
    "status": "confirmed",
    "amount": 2900,
    "currency": "PLN",
    "merchant_data": "{\"planId\":\"pro\",\"billingCycle\":\"monthly\",\"userId\":\"test_user\"}",
    "signature": "test_signature"
  }'
```

## Security Considerations

1. **Always verify signatures** - Never trust webhook data without signature validation
2. **Use HTTPS** - Webhooks should only be sent to HTTPS endpoints in production
3. **Idempotency** - Handle duplicate webhooks gracefully
4. **Rate limiting** - Implement rate limiting on webhook endpoints
5. **IP whitelisting** - Consider restricting webhook calls to Autopay's IP ranges

## Error Handling

- Return HTTP 200 for successfully processed webhooks
- Return HTTP 4xx for validation errors
- Return HTTP 5xx for server errors
- Implement retry logic for failed webhook processing

## Next Steps

1. Choose backend framework (Express.js, Next.js API routes, etc.)
2. Implement the webhook endpoint using the code above
3. Deploy to production with proper HTTPS
4. Update REACT_APP_AUTOPAY_NOTIFICATION_URL with production URL
5. Test with real Autopay sandbox credentials

This webhook implementation will complete the Autopay integration and enable real-time payment status updates.
