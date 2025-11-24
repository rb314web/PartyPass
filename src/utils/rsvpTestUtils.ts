// utils/rsvpTestUtils.ts
import RSVPService from '../services/firebase/rsvpService';
import EmailService from '../services/emailService';
import { GuestInvitation, Event, InvitationDelivery } from '../types';

/**
 * Utilities for testing the RSVP system
 */
export class RSVPTestUtils {
  /**
   * Test RSVP token generation and validation
   */
  static async testTokenGeneration(
    guestId: string,
    eventId: string
  ): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> {
    try {
      console.log('🧪 Testing RSVP token generation...');

      // Generate token
      const rsvpToken = await RSVPService.generateRSVPToken(guestId, eventId);
      console.log('✅ Token generated:', rsvpToken.token);

      // Validate token
      const validation = await RSVPService.validateRSVPToken(rsvpToken.token);
      if (!validation.valid) {
        throw new Error(`Token validation failed: ${validation.reason}`);
      }
      console.log('✅ Token validation passed');

      // Test URL generation
      const url = RSVPService.generateRSVPUrl(rsvpToken.token);
      console.log('✅ RSVP URL generated:', url);

      // Test QR code generation
      const qrCode = await RSVPService.generateQRCode(rsvpToken.token);
      console.log('✅ QR code generated (length):', qrCode.length);

      return { success: true, token: rsvpToken.token };
    } catch (error: any) {
      console.error('❌ Token generation test failed:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Test email service configuration
   */
  static testEmailConfiguration(): {
    configured: boolean;
    status: string;
    recommendations: string[];
  } {
    console.log('🧪 Testing email service configuration...');

    const emailStatus = EmailService.getConfigurationStatus();
    const recommendations: string[] = [];

    if (emailStatus.configured) {
      console.log('✅ EmailJS is properly configured');
      recommendations.push('You can send real email invitations');
    } else {
      console.log('⚠️ EmailJS is not configured:', emailStatus.message);
      recommendations.push(
        'Add EmailJS environment variables to enable email sending'
      );
      recommendations.push('For now, invitations will be logged to console');
      recommendations.push('See .env.example for configuration details');
    }

    return {
      configured: emailStatus.configured,
      status: emailStatus.message,
      recommendations,
    };
  }

  /**
   * Test email sending (mock)
   */
  static async testEmailSending(
    mockInvitation?: Partial<GuestInvitation>,
    mockEvent?: Partial<Event>
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('🧪 Testing email sending...');

      const invitation: GuestInvitation = {
        eventGuestId: 'test-event-guest-id',
        contactId: 'test-contact-id',
        guestId: 'test-guest-id',
        email: 'test@example.com',
        firstName: 'Jan',
        lastName: 'Testowy',
        rsvpToken: 'test-token-123',
        rsvpUrl: 'http://localhost:3000/rsvp/test-token-123',
        qrCode: 'data:image/png;base64,test',
        ...mockInvitation,
      };

      const event: Event = {
        id: 'test-event-id',
        title: 'Test Event',
        description: 'This is a test event',
        date: new Date(),
        location: 'Test Location',
        userId: 'test-user-id',
        maxGuests: 100,
        guests: [],
        status: 'active' as const,
        createdAt: new Date(),
        requireRSVP: true,
        allowPlusOne: true,
        dresscode: 'Casual',
        additionalInfo: 'Test additional info',
        guestCount: 0,
        acceptedCount: 0,
        declinedCount: 0,
        pendingCount: 0,
        maybeCount: 0,
        ...mockEvent,
      };

      const delivery: InvitationDelivery = {
        method: 'email',
        recipients: [invitation.email],
        subject: `Test Invitation - ${event.title}`,
        message: 'This is a test invitation message.',
        includeQR: true,
      };

      await EmailService.sendInvitationEmail(invitation, event, delivery);
      console.log('✅ Email sending test completed');

      return { success: true };
    } catch (error: any) {
      console.error('❌ Email sending test failed:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Run all RSVP tests
   */
  static async runAllTests(
    guestId?: string,
    eventId?: string
  ): Promise<{
    tokenTest: { success: boolean; token?: string; error?: string };
    emailConfigTest: {
      configured: boolean;
      status: string;
      recommendations: string[];
    };
    emailSendTest: { success: boolean; error?: string };
    summary: {
      passed: number;
      failed: number;
      total: number;
    };
  }> {
    console.log('🧪 Running RSVP System Tests...');
    console.log('='.repeat(50));

    let passed = 0;
    let failed = 0;

    // Test 1: Token generation (requires real IDs)
    let tokenTest: { success: boolean; token?: string; error?: string };
    if (guestId && eventId) {
      tokenTest = await this.testTokenGeneration(guestId, eventId);
      tokenTest.success ? passed++ : failed++;
    } else {
      console.log(
        '⏭️ Skipping token generation test (no guest/event IDs provided)'
      );
      tokenTest = { success: false, error: 'Skipped - no test IDs provided' };
    }

    // Test 2: Email configuration
    const emailConfigTest = this.testEmailConfiguration();
    emailConfigTest.configured ? passed++ : failed++;

    // Test 3: Email sending (mock)
    const emailSendTest = await this.testEmailSending();
    emailSendTest.success ? passed++ : failed++;

    const total = passed + failed;
    const summary = { passed, failed, total };

    console.log('='.repeat(50));
    console.log('🧪 Test Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${total}`);
    console.log(
      `🎯 Success Rate: ${total > 0 ? Math.round((passed / total) * 100) : 0}%`
    );

    return {
      tokenTest,
      emailConfigTest,
      emailSendTest,
      summary,
    };
  }

  /**
   * Generate sample RSVP data for testing
   */
  static generateSampleData() {
    return {
      guestId: `guest_${Date.now()}`,
      eventId: `event_${Date.now()}`,
      invitation: {
        guestId: `guest_${Date.now()}`,
        email: 'sample@example.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        rsvpToken: `token_${Date.now()}`,
        rsvpUrl: `http://localhost:3000/rsvp/token_${Date.now()}`,
        qrCode: 'data:image/png;base64,sample',
      },
      event: {
        id: `event_${Date.now()}`,
        title: 'Sample Event',
        description: 'This is a sample event for testing',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        location: 'Sample Location',
      },
    };
  }
}

export default RSVPTestUtils;
