import * as functions from 'firebase-functions';
import axios from 'axios';

export interface EmailJsConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export function getEmailJsConfig(
  templateKey:
    | 'template_id'
    | 'invitation_template_id'
    | 'rsvp_notification_template_id' = 'template_id'
): EmailJsConfig | null {
  const config = functions.config();
  const serviceId = config.emailjs?.service_id;
  const publicKey = config.emailjs?.public_key;
  const templateId =
    config.emailjs?.[templateKey] || config.emailjs?.template_id;

  if (!serviceId || !templateId || !publicKey) {
    return null;
  }

  return { serviceId, templateId, publicKey };
}

export async function sendEmailJs(
  emailjsConfig: EmailJsConfig,
  templateParams: Record<string, string | number>
): Promise<void> {
  const response = await axios.post(
    'https://api.emailjs.com/api/v1.0/email/send',
    {
      service_id: emailjsConfig.serviceId,
      template_id: emailjsConfig.templateId,
      user_id: emailjsConfig.publicKey,
      template_params: templateParams,
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (response.status !== 200) {
    throw new Error(`EmailJS zwrócił status ${response.status}`);
  }
}

export function getAppBaseUrl(): string {
  const config = functions.config();
  return (
    config.app?.base_url ||
    process.env.APP_BASE_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}
