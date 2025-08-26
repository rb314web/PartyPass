# PartyPass - RSVP System Implementation

## Overview

The RSVP (Répondez s'il vous plaît) system allows event organizers to send invitations to guests and receive responses without requiring guests to create accounts. Guests receive unique links or QR codes that they can use to confirm their attendance and provide additional details.

## Features Implemented

### ✅ Core RSVP Functionality
- **Unique Token Generation**: Each guest receives a unique RSVP token
- **Public Response Page**: Guests can respond without logging in
- **Multiple Response Options**: Accept, Decline, Maybe
- **Plus-One Support**: Guests can bring additional people
- **Dietary Restrictions**: Capture special requirements
- **QR Code Generation**: For easy sharing and scanning

### ✅ Admin Interface
- **Invitation Manager**: Centralized interface for managing invitations
- **Multiple Delivery Methods**: Email, SMS links, and printable QR codes
- **Bulk Operations**: Send invitations to multiple guests at once
- **Real-time Preview**: See how invitations will look
- **Status Tracking**: Monitor response rates

### ✅ Email Integration
- **EmailJS Integration**: Professional email sending service
- **Customizable Templates**: Personalized invitation messages
- **Fallback Logging**: Development-friendly console output
- **Bulk Sending**: Rate-limited bulk email sending
- **Error Handling**: Robust error management

## File Structure

```
src/
├── services/
│   ├── firebase/
│   │   ├── rsvpService.ts          # Core RSVP logic
│   │   └── guestService.ts         # Updated with RSVP integration
│   └── emailService.ts             # Email sending service
├── components/
│   └── dashboard/
│       └── Events/
│           ├── InvitationManager/   # Admin invitation interface
│           └── EventDetails/        # Integration point
├── pages/
│   └── RSVP/                       # Public RSVP response page
├── types/
│   └── index.ts                    # Unified type definitions
└── App.tsx                         # Updated routing
```

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file and configure your services:

```bash
cp .env.example .env
```

Configure the following variables in your `.env` file:

#### Firebase (Required)
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

#### EmailJS (Optional - for email invitations)
```env
REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

#### Application Settings
```env
REACT_APP_BASE_URL=http://localhost:3000
```

### 2. EmailJS Setup (Optional)

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template with the following template variables:
   - `{{to_name}}` - Guest name
   - `{{event_title}}` - Event name
   - `{{event_date}}` - Event date and time
   - `{{event_location}}` - Event location
   - `{{rsvp_url}}` - RSVP response link
   - `{{custom_message}}` - Personalized message
   - `{{organizer_name}}` - Event organizer name

4. Get your Service ID, Template ID, and Public Key
5. Add them to your `.env` file

### 3. Firebase Collections

The system creates the following Firebase collections automatically:

#### `rsvpTokens`
```typescript
{
  guestId: string;
  eventId: string;
  token: string;
  isUsed: boolean;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  usedAt?: Timestamp;
}
```

#### `guests` (updated)
```typescript
{
  // ...existing fields
  rsvpToken?: string;  // Added for RSVP integration
}
```

## Usage Guide

### For Event Organizers

1. **Create an Event**: Use the standard event creation flow
2. **Add Guests**: Add guests to your event
3. **Send Invitations**:
   - Navigate to event details
   - Click "Zarządzaj zaproszeniami" (Manage Invitations)
   - Select guests and delivery method
   - Customize message and send

### For Guests

1. **Receive Invitation**: Via email, SMS, or QR code
2. **Click RSVP Link**: Opens public response page
3. **Submit Response**: Choose attendance status and provide details
4. **Confirmation**: Receive confirmation of response

### URL Structure

- **Public RSVP Page**: `/rsvp/{token}`
- **Admin Interface**: Accessible from event details page

## Testing the System

### 1. Development Testing

With EmailJS not configured:
- Invitations are logged to console
- All functionality works except actual email sending
- Perfect for development and testing

### 2. Production Testing

With EmailJS configured:
- Real emails are sent to guests
- Rate limiting prevents spam
- Error handling manages failures gracefully

### 3. QR Code Testing

1. Generate QR codes from invitation manager
2. Use any QR code scanner app
3. Verify links lead to correct RSVP pages

## Security Features

- **Token Expiration**: Tokens expire after 30 days
- **One-time Use**: Tokens are marked as used after response
- **Validation**: Multiple validation layers
- **No Authentication Required**: Guests don't need accounts

## Analytics Integration

The system tracks:
- Guest response rates
- Response methods (email link, QR code, etc.)
- Response times
- Plus-one statistics

## Error Handling

- **Network Failures**: Graceful degradation
- **Invalid Tokens**: Clear error messages
- **Email Failures**: Fallback logging
- **Rate Limiting**: Automatic retry logic

## Performance Considerations

- **Batch Operations**: Efficient bulk processing
- **Rate Limiting**: Prevents service overload
- **Caching**: Optimized data retrieval
- **Lazy Loading**: Components load as needed

## Development Notes

### Key Design Decisions

1. **Separate RSVP Service**: Isolated logic for maintainability
2. **Unified Type System**: Consistent interfaces across components
3. **Fallback Systems**: Graceful degradation when services unavailable
4. **Responsive Design**: Mobile-first RSVP pages

### Future Enhancements

- **SMS Integration**: Twilio or similar service
- **Advanced Analytics**: Detailed reporting dashboard
- **Custom Templates**: Visual template editor
- **Multi-language Support**: Internationalization
- **Calendar Integration**: Add to calendar buttons

## Troubleshooting

### Common Issues

1. **Email Not Sending**: Check EmailJS configuration
2. **Invalid Token**: Verify URL and token expiration
3. **Build Failures**: Increase Node.js memory limit
4. **CORS Issues**: Check Firebase security rules

### Debug Mode

Set `NODE_ENV=development` to enable:
- Detailed console logging
- Error stack traces
- Development-friendly error messages

## Contributing

When contributing to the RSVP system:

1. **Test Thoroughly**: Both with and without EmailJS
2. **Update Types**: Maintain type definitions
3. **Document Changes**: Update this README
4. **Follow Patterns**: Consistent code structure

## Support

For issues with the RSVP system:
1. Check console logs for detailed error messages
2. Verify environment configuration
3. Test with sample data
4. Review Firebase security rules
