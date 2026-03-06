import { Resend } from 'resend';
import { logger } from '../utils/logger';

if (!process.env.RESEND_API_KEY) {
  logger.warn('RESEND_API_KEY not set - email service will not work');
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@mail.immigrationai.co.za';

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(process.env.RESEND_API_KEY);
}
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Multilingual Email Strings ───────────────────────────────────────────────
// Used for the two key client-facing transactional emails.
// Professional dashboard emails remain in English.
type EmailLang = 'en' | 'fr' | 'pt' | 'ar' | 'es' | 'zh';

const emailStrings: Record<string, Record<EmailLang, string>> = {
  // sendApplicantConfirmationEmail
  'confirm.header':   { en: 'Request Received', fr: 'Demande reçue', pt: 'Pedido recebido', ar: 'تم استلام الطلب', es: 'Solicitud recibida', zh: '申请已收到' },
  'confirm.greeting': { en: 'Thank you, {name}!', fr: 'Merci, {name} !', pt: 'Obrigado, {name}!', ar: 'شكراً، {name}!', es: '¡Gracias, {name}!', zh: '谢谢，{name}！' },
  'confirm.body1':    { en: "We've received your request for <strong>{service}</strong>. A specialist will review your request and contact you within 24–48 hours.", fr: 'Nous avons reçu votre demande pour <strong>{service}</strong>. Un spécialiste examinera votre demande et vous contactera dans les 24 à 48 heures.', pt: 'Recebemos seu pedido de <strong>{service}</strong>. Um especialista analisará seu pedido e entrará em contato em 24 a 48 horas.', ar: 'لقد استلمنا طلبك بخصوص <strong>{service}</strong>. سيراجع متخصص طلبك ويتواصل معك خلال 24 إلى 48 ساعة.', es: 'Hemos recibido su solicitud de <strong>{service}</strong>. Un especialista revisará su solicitud y se comunicará con usted en 24 a 48 horas.', zh: '我们已收到您关于<strong>{service}</strong>的申请。专家将审查您的申请并在24至48小时内与您联系。' },
  'confirm.body2':    { en: "You'll receive another email when a specialist is assigned to your case.", fr: "Vous recevrez un autre e-mail lorsqu'un spécialiste sera assigné à votre dossier.", pt: 'Você receberá outro e-mail quando um especialista for atribuído ao seu caso.', ar: 'ستتلقى بريداً إلكترونياً آخراً عند تعيين متخصص لقضيتك.', es: 'Recibirá otro correo cuando se asigne un especialista a su caso.', zh: '当专家被分配给您时，您将收到另一封电子邮件。' },
  'confirm.refLabel': { en: 'Your Reference Number', fr: 'Votre numéro de référence', pt: 'Seu número de referência', ar: 'رقم مرجعك', es: 'Su número de referencia', zh: '您的参考号码' },
  'confirm.save':     { en: 'Save this number to track your request', fr: 'Enregistrez ce numéro pour suivre votre demande', pt: 'Salve este número para acompanhar seu pedido', ar: 'احفظ هذا الرقم لمتابعة طلبك', es: 'Guarde este número para hacer seguimiento a su solicitud', zh: '保存此号码以跟踪您的申请' },
  'confirm.nextTitle':{ en: 'What happens next:', fr: 'Que se passe-t-il ensuite :', pt: 'O que acontece a seguir:', ar: 'ماذا يحدث بعد ذلك:', es: '¿Qué pasa después?', zh: '接下来会发生什么：' },
  'confirm.step1':    { en: 'We match you with a verified specialist who specialises in your exact situation', fr: 'Nous vous mettons en relation avec un spécialiste vérifié qui se spécialise dans votre situation', pt: 'Nós o conectamos com um especialista verificado que se especializa em sua situação específica', ar: 'نربطك بمتخصص موثق يتخصص في وضعك بالضبط', es: 'Lo conectamos con un especialista verificado que se especializa en su situación exacta', zh: '我们将您与专门处理您具体情况的认证专家匹配' },
  'confirm.step2':    { en: 'Your specialist reviews your request and contacts you within 24–48 hours', fr: 'Votre spécialiste examine votre demande et vous contacte dans les 24 à 48 heures', pt: 'Seu especialista analisa seu pedido e entra em contato em 24 a 48 horas', ar: 'يراجع متخصصك طلبك ويتواصل معك خلال 24 إلى 48 ساعة', es: 'Su especialista revisa su solicitud y se comunica con usted en 24 a 48 horas', zh: '您的专家审查您的申请并在24至48小时内与您联系' },
  'confirm.step3':    { en: 'You discuss your case directly with your specialist', fr: 'Vous discutez de votre dossier directement avec votre spécialiste', pt: 'Você discute seu caso diretamente com seu especialista', ar: 'تناقش قضيتك مباشرة مع متخصصك', es: 'Discute su caso directamente con su especialista', zh: '您直接与您的专家讨论您的案例' },
  'confirm.step4':    { en: 'You work together to complete your immigration application', fr: 'Vous travaillez ensemble pour compléter votre dossier d\'immigration', pt: 'Vocês trabalham juntos para concluir seu pedido de imigração', ar: 'تعملون معاً لإتمام طلب الهجرة', es: 'Trabajan juntos para completar su solicitud de inmigración', zh: '共同完成您的移民申请' },
  'confirm.cta':      { en: 'Check My Status', fr: 'Vérifier mon statut', pt: 'Verificar meu status', ar: 'تحقق من حالتي', es: 'Verificar mi estado', zh: '查看我的状态' },
  'confirm.subject':  { en: 'Request Received — {ref}', fr: 'Demande reçue — {ref}', pt: 'Pedido recebido — {ref}', ar: 'تم استلام الطلب — {ref}', es: 'Solicitud recibida — {ref}', zh: '申请已收到 — {ref}' },

  // sendProfessionalContactEmail
  'assigned.header':  { en: 'Specialist Assigned!', fr: 'Spécialiste assigné !', pt: 'Especialista atribuído!', ar: 'تم تعيين المتخصص!', es: '¡Especialista asignado!', zh: '已分配专家！' },
  'assigned.greeting':{ en: 'Great news, {name}!', fr: 'Bonne nouvelle, {name} !', pt: 'Ótimas notícias, {name}!', ar: 'أخبار رائعة، {name}!', es: '¡Buenas noticias, {name}!', zh: '好消息，{name}！' },
  'assigned.body1':   { en: 'Your immigration specialist has been assigned and is ready to help with your <strong>{service}</strong> case.', fr: 'Votre spécialiste en immigration a été assigné et est prêt à vous aider pour votre dossier <strong>{service}</strong>.', pt: 'Seu especialista em imigração foi atribuído e está pronto para ajudar com seu caso de <strong>{service}</strong>.', ar: 'تم تعيين متخصص الهجرة الخاص بك وهو مستعد لمساعدتك في قضية <strong>{service}</strong>.', es: 'Su especialista en inmigración ha sido asignado y está listo para ayudarle con su caso de <strong>{service}</strong>.', zh: '您的移民专家已分配，准备帮助您处理<strong>{service}</strong>案例。' },
  'assigned.caseRef': { en: 'Case Reference', fr: 'Référence du dossier', pt: 'Referência do caso', ar: 'مرجع القضية', es: 'Referencia del caso', zh: '案例参考' },
  'assigned.contact': { en: 'Your specialist will contact you within <strong>24 hours</strong> to discuss your case and next steps.', fr: 'Votre spécialiste vous contactera dans les <strong>24 heures</strong> pour discuter de votre dossier.', pt: 'Seu especialista entrará em contato em <strong>24 horas</strong> para discutir seu caso.', ar: 'سيتواصل معك متخصصك خلال <strong>24 ساعة</strong> لمناقشة قضيتك.', es: 'Su especialista se comunicará dentro de <strong>24 horas</strong> para discutir su caso.', zh: '您的专家将在<strong>24小时</strong>内联系您讨论您的案例。' },
  'assigned.subject': { en: 'Your Immigration Specialist Has Been Assigned', fr: 'Votre spécialiste en immigration a été assigné', pt: 'Seu especialista em imigração foi atribuído', ar: 'تم تعيين متخصص الهجرة الخاص بك', es: 'Su especialista en inmigración ha sido asignado', zh: '您的移民专家已分配' },
};

function et(key: string, lang: EmailLang, vars?: Record<string, string>): string {
  const entry = emailStrings[key];
  let text = entry?.[lang] ?? entry?.['en'] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
  }
  return text;
}

function toEmailLang(lang?: string | null): EmailLang {
  const supported: EmailLang[] = ['en', 'fr', 'pt', 'ar', 'es', 'zh'];
  const code = (lang || 'en').toLowerCase().split('-')[0] as EmailLang;
  return supported.includes(code) ? code : 'en';
}

/**
 * Send invitation email
 */
export async function sendInvitationEmail({
  toEmail,
  toName,
  inviterName,
  organizationName,
  inviteUrl,
  role,
}: {
  toEmail: string;
  toName?: string;
  inviterName: string;
  organizationName: string;
  inviteUrl: string;
  role: string;
}): Promise<void> {
  try {
    const roleLabel =
      role === 'org_admin'
        ? 'Organization owner'
        : role === 'professional'
        ? 'Professional'
        : 'Applicant';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been invited</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0F2557; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Immigration AI</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-top: 0;">You've been invited!</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                ${inviterName} has invited you to join <strong>${organizationName}</strong> on Immigration AI.
              </p>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                You'll have the role of <strong>${roleLabel}</strong>.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; background-color: #F59E0B; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Accept Invitation</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999999; font-size: 14px; line-height: 1.6;">
                This invitation link expires in 48 hours. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                Immigration AI<br>
                123 Business Street, City, Country<br>
                <a href="${FRONTEND_URL}/unsubscribe" style="color: #999999;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `You've been invited to join ${organizationName} on Immigration AI`,
      html,
    });

    logger.info('Invitation email sent', { toEmail, organizationName });
  } catch (error: any) {
    logger.error('Failed to send invitation email', { error: error.message, toEmail });
    // Don't throw - email failures shouldn't break the flow
  }
}

/**
 * Send case update email — multilingual
 */
export async function sendCaseUpdateEmail({
  toEmail,
  toName,
  caseReference,
  caseTitle,
  updateType,
  updateMessage,
  caseUrl,
  preferredLanguage,
}: {
  toEmail: string;
  toName?: string;
  caseReference: string;
  caseTitle: string;
  updateType: string;
  updateMessage: string;
  caseUrl: string;
  preferredLanguage?: string | null;
}): Promise<void> {
  const lang = toEmailLang(preferredLanguage);

  // Multilingual strings for case update email
  const updateStrings: Record<string, Record<EmailLang, string>> = {
    header:    { en: 'Case Update', fr: 'Mise à jour du dossier', pt: 'Atualização do caso', ar: 'تحديث القضية', es: 'Actualización del caso', zh: '案例更新' },
    intro:     { en: "There's an update on your immigration case:", fr: 'Il y a une mise à jour sur votre dossier d\'immigration :', pt: 'Há uma atualização no seu caso de imigração:', ar: 'هناك تحديث على قضية الهجرة الخاصة بك:', es: 'Hay una actualización en su caso de inmigración:', zh: '您的移民案例有更新：' },
    caseLabel: { en: 'Case', fr: 'Dossier', pt: 'Caso', ar: 'القضية', es: 'Caso', zh: '案例' },
    refLabel:  { en: 'Reference', fr: 'Référence', pt: 'Referência', ar: 'المرجع', es: 'Referencia', zh: '参考' },
    updLabel:  { en: 'Update', fr: 'Mise à jour', pt: 'Atualização', ar: 'التحديث', es: 'Actualización', zh: '更新' },
    cta:       { en: 'View Your Case', fr: 'Voir votre dossier', pt: 'Ver seu caso', ar: 'عرض قضيتك', es: 'Ver su caso', zh: '查看您的案例' },
    subject:   { en: 'Update on your case {ref}', fr: 'Mise à jour de votre dossier {ref}', pt: 'Atualização do seu caso {ref}', ar: 'تحديث على قضيتك {ref}', es: 'Actualización de su caso {ref}', zh: '您的案例更新 {ref}' },
  };

  function u(key: string): string {
    return (updateStrings[key]?.[lang] ?? updateStrings[key]?.['en'] ?? key);
  }

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  try {
    const html = `
<!DOCTYPE html>
<html dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background-color: #0F2557; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${u('header')}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;" dir="${dir}">
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                ${u('intro')}
              </p>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 8px; color: #333333;"><strong>${u('caseLabel')}:</strong> ${caseTitle}</p>
                <p style="margin: 0 0 8px; color: #333333;"><strong>${u('refLabel')}:</strong> ${caseReference}</p>
                <p style="margin: 0; color: #333333;"><strong>${u('updLabel')}:</strong> ${updateType}</p>
              </div>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                ${updateMessage}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${caseUrl}" style="display: inline-block; padding: 14px 32px; background-color: #F59E0B; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">${u('cta')}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">ImmigrationAI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const subject = u('subject').replace('{ref}', caseReference);

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject,
      html,
    });

    logger.info('Case update email sent', { toEmail, caseReference, lang });
  } catch (error: any) {
    logger.error('Failed to send case update email', { error: error.message, toEmail });
  }
}

/**
 * Send document request email
 */
export async function sendDocumentRequestEmail({
  toEmail,
  toName,
  caseReference,
  documentName,
  requestedBy,
  portalUrl,
}: {
  toEmail: string;
  toName?: string;
  caseReference: string;
  documentName: string;
  requestedBy: string;
  portalUrl: string;
}): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background-color: #0F2557; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Document Request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-top: 0;">Document needed for case ${caseReference}</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                ${requestedBy} has requested the following document:
              </p>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #333333; font-size: 18px; font-weight: bold;">${documentName}</p>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" style="display: inline-block; padding: 14px 32px; background-color: #F59E0B; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Upload Document</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">Immigration AI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Document requested for case ${caseReference}`,
      html,
    });

    logger.info('Document request email sent', { toEmail, caseReference, documentName });
  } catch (error: any) {
    logger.error('Failed to send document request email', { error: error.message, toEmail });
  }
}

/**
 * Send trial expiry email
 */
export async function sendTrialExpiryEmail({
  toEmail,
  toName,
  organizationName,
  daysRemaining,
  upgradeUrl,
}: {
  toEmail: string;
  toName?: string;
  organizationName: string;
  daysRemaining: number;
  upgradeUrl: string;
}): Promise<void> {
  try {
    const isUrgent = daysRemaining <= 1;
    const headerColor = isUrgent ? '#DC2626' : '#0F2557';
    const message = daysRemaining === 0
      ? 'Your trial has ended. Upgrade now to continue using Immigration AI.'
      : daysRemaining === 1
      ? 'Your trial ends tomorrow! Upgrade now to avoid service interruption.'
      : `Your trial ends in ${daysRemaining} days. Upgrade now to continue enjoying all features.`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background-color: ${headerColor}; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Trial ${daysRemaining === 0 ? 'Expired' : 'Reminder'}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-top: 0;">${daysRemaining === 0 ? 'Your trial has ended' : `Your trial ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`}</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                ${message}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${upgradeUrl}" style="display: inline-block; padding: 14px 32px; background-color: #F59E0B; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Upgrade Now</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">Immigration AI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: daysRemaining === 0
        ? `Your ${organizationName} trial has ended`
        : `Your trial ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
      html,
    });

    logger.info('Trial expiry email sent', { toEmail, organizationName, daysRemaining });
  } catch (error: any) {
    logger.error('Failed to send trial expiry email', { error: error.message, toEmail });
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail({
  toEmail,
  firstName,
  organizationName,
  dashboardUrl,
}: {
  toEmail: string;
  firstName: string;
  organizationName: string;
  dashboardUrl: string;
}): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background-color: #0F2557; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to Immigration AI</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-top: 0;">Hi ${firstName}! 👋</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                Your workspace for <strong>${organizationName}</strong> is ready! Here's how to get started:
              </p>
              
              <div style="margin: 30px 0;">
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #333333; margin: 0 0 10px 0;">1. Create your first case</h3>
                  <p style="color: #666666; font-size: 14px; margin: 0;">Start managing immigration cases right away.</p>
                </div>
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #333333; margin: 0 0 10px 0;">2. Invite your team</h3>
                  <p style="color: #666666; font-size: 14px; margin: 0;">Collaborate with colleagues and professionals.</p>
                </div>
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #333333; margin: 0 0 10px 0;">3. Set up your client portal</h3>
                  <p style="color: #666666; font-size: 14px; margin: 0;">Enable clients to upload documents and track progress.</p>
                </div>
              </div>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #F59E0B; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">Immigration AI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Welcome to Immigration AI — your workspace is ready`,
      html,
    });

    logger.info('Welcome email sent', { toEmail, organizationName });
  } catch (error: any) {
    logger.error('Failed to send welcome email', { error: error.message, toEmail });
  }
}

/**
 * Send lead notification email to professional
 */
export async function sendLeadNotificationEmail({
  toEmail,
  professionalName,
  serviceName,
  applicantCountry,
  destinationCountry,
  urgencyLevel,
  descriptionPreview,
  dashboardUrl,
}: {
  toEmail: string;
  professionalName: string;
  serviceName: string;
  applicantCountry: string;
  destinationCountry: string;
  urgencyLevel: string;
  descriptionPreview: string;
  dashboardUrl: string;
}): Promise<void> {
  try {
    const urgencyLabel =
      urgencyLevel === 'emergency'
        ? '🔴 Emergency'
        : urgencyLevel === 'urgent'
        ? '⚡ Urgent'
        : urgencyLevel === 'soon'
        ? 'Soon'
        : 'Standard';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background-color: #0F2557; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Lead Assigned</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-top: 0;">Hi ${professionalName}!</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                A new client request has been matched to you.
              </p>
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 14px;"><strong>Service:</strong> ${serviceName}</p>
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 14px;"><strong>Route:</strong> ${applicantCountry} → ${destinationCountry}</p>
                <p style="margin: 0; color: #333333; font-size: 14px;"><strong>Priority:</strong> ${urgencyLabel}</p>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                <strong>Description:</strong><br>
                ${descriptionPreview}${descriptionPreview.length >= 200 ? '...' : ''}
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #F59E0B; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">View Lead in Dashboard</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999999; font-size: 14px; line-height: 1.6; margin-top: 20px;">
                <strong>Note:</strong> You have 48 hours to accept or decline this lead.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">Immigration AI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `New Lead: ${serviceName} — ${urgencyLevel} priority`,
      html,
    });

    logger.info('Lead notification email sent', { toEmail, serviceName });
  } catch (error: any) {
    logger.error('Failed to send lead notification email', { error: error.message, toEmail });
  }
}

/**
 * Send email to professional when client sends a new message
 */
export async function sendNewMessageFromClientEmail({
  toEmail,
  professionalName,
  clientName,
  caseReference,
  messagePreview,
  caseUrl,
}: {
  toEmail: string;
  professionalName: string;
  clientName: string;
  caseReference: string;
  messagePreview: string;
  caseUrl: string;
}): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr><td style="background-color:#0F2557;padding:24px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:22px;">New Message from Client</h1>
        </td></tr>
        <tr><td style="padding:32px 30px;">
          <p style="color:#333;font-size:16px;margin:0 0 16px;">Hi ${professionalName},</p>
          <p style="color:#666;font-size:15px;line-height:1.6;margin:0 0 20px;">
            <strong>${clientName}</strong> sent you a new message for case <strong>${caseReference}</strong>.
          </p>
          <div style="background:#f9f9f9;padding:16px;border-radius:6px;margin:20px 0;border-left:4px solid #0F2557;">
            <p style="color:#666;font-size:14px;margin:0;line-height:1.5;">${messagePreview}</p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td align="center">
              <a href="${caseUrl}" style="display:inline-block;padding:12px 28px;background-color:#F59E0B;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">View Message</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:16px 30px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">Immigration AI</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `New message from ${clientName} — ${caseReference}`,
      html,
    });
    logger.info('New message from client email sent', { toEmail, caseReference });
  } catch (error: any) {
    logger.error('Failed to send new message email', { error: error.message, toEmail });
  }
}

/**
 * Send email to professional when client uploads a document
 */
export async function sendNewDocumentFromClientEmail({
  toEmail,
  professionalName,
  clientName,
  caseReference,
  documentName,
  caseUrl,
}: {
  toEmail: string;
  professionalName: string;
  clientName: string;
  caseReference: string;
  documentName: string;
  caseUrl: string;
}): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr><td style="background-color:#0F2557;padding:24px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:22px;">New Document Uploaded</h1>
        </td></tr>
        <tr><td style="padding:32px 30px;">
          <p style="color:#333;font-size:16px;margin:0 0 16px;">Hi ${professionalName},</p>
          <p style="color:#666;font-size:15px;line-height:1.6;margin:0 0 20px;">
            <strong>${clientName}</strong> uploaded a new document for case <strong>${caseReference}</strong>.
          </p>
          <p style="color:#333;font-size:14px;margin:0 0 24px;"><strong>Document:</strong> ${documentName}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td align="center">
              <a href="${caseUrl}" style="display:inline-block;padding:12px 28px;background-color:#F59E0B;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">View in Dashboard</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:16px 30px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">Immigration AI</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `New document from ${clientName} — ${caseReference}`,
      html,
    });
    logger.info('New document from client email sent', { toEmail, caseReference });
  } catch (error: any) {
    logger.error('Failed to send new document email', { error: error.message, toEmail });
  }
}

/**
 * Send applicant confirmation email
 */
export async function sendApplicantConfirmationEmail({
  toEmail,
  applicantName,
  referenceNumber,
  serviceName,
  statusUrl,
  preferredLanguage,
}: {
  toEmail: string;
  applicantName: string;
  referenceNumber: string;
  serviceName: string;
  statusUrl: string;
  preferredLanguage?: string | null;
}): Promise<void> {
  try {
    const lang = toEmailLang(preferredLanguage);
    const dir  = lang === 'ar' ? 'rtl' : 'ltr';

    const html = `
<!DOCTYPE html>
<html dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background-color: #0F2557; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${et('confirm.header', lang)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-top: 0;">${et('confirm.greeting', lang, { name: applicantName })}</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                ${et('confirm.body1', lang, { service: serviceName })}
              </p>
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 12px;">
                ${et('confirm.body2', lang)}
              </p>
              
              <div style="background-color: #f0f4ff; padding: 20px; border-radius: 6px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">${et('confirm.refLabel', lang)}</p>
                <p style="margin: 0; color: #0F2557; font-size: 28px; font-weight: bold; font-family: monospace;">${referenceNumber}</p>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; text-align: center; margin: 20px 0;">
                <strong>${et('confirm.save', lang)}</strong>
              </p>
              
              <div style="margin: 30px 0;">
                <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 16px;">${et('confirm.nextTitle', lang)}</h3>
                <ol style="color: #666666; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
                  <li style="margin-bottom: 10px;">${et('confirm.step1', lang)}</li>
                  <li style="margin-bottom: 10px;">${et('confirm.step2', lang)}</li>
                  <li style="margin-bottom: 10px;">${et('confirm.step3', lang)}</li>
                  <li>${et('confirm.step4', lang)}</li>
                </ol>
              </div>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${statusUrl}" style="display: inline-block; padding: 14px 32px; background-color: #F59E0B; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">${et('confirm.cta', lang)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">Immigration AI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: et('confirm.subject', lang, { ref: referenceNumber }),
      html,
    });

    logger.info('Applicant confirmation email sent', { toEmail, referenceNumber, lang });
  } catch (error: any) {
    logger.error('Failed to send applicant confirmation email', { error: error.message, toEmail });
  }
}

/**
 * Send professional contact email to applicant
 */
export async function sendProfessionalContactEmail({
  toEmail,
  applicantName,
  professionalName,
  professionalTitle,
  professionalEmail,
  professionalPhone,
  serviceName,
  caseReference,
  preferredLanguage,
}: {
  toEmail: string;
  applicantName: string;
  professionalName: string;
  professionalTitle?: string;
  professionalEmail: string;
  professionalPhone?: string;
  serviceName: string;
  caseReference: string;
  preferredLanguage?: string | null;
}): Promise<void> {
  try {
    const lang = toEmailLang(preferredLanguage);
    const dir  = lang === 'ar' ? 'rtl' : 'ltr';

    const html = `
<!DOCTYPE html>
<html dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background-color: #0F2557; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${et('assigned.header', lang)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-top: 0;">${et('assigned.greeting', lang, { name: applicantName })}</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                ${et('assigned.body1', lang, { service: serviceName })}
              </p>
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">${professionalName}${professionalTitle ? ` — ${professionalTitle}` : ''}</h3>
                <p style="margin: 5px 0; color: #666666; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${professionalEmail}" style="color: #0F2557;">${professionalEmail}</a></p>
                ${professionalPhone ? `<p style="margin: 5px 0; color: #666666; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${professionalPhone}" style="color: #0F2557;">${professionalPhone}</a></p>` : ''}
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                <strong>${et('assigned.caseRef', lang)}:</strong> ${caseReference}
              </p>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 30px 0;">
                ${et('assigned.contact', lang)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">Immigration AI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: et('assigned.subject', lang),
      html,
    });

    logger.info('Professional contact email sent', { toEmail, professionalEmail, caseReference, lang });
  } catch (error: any) {
    logger.error('Failed to send professional contact email', { error: error.message, toEmail });
  }
}

/**
 * Send verification approved email
 */
export async function sendVerificationApprovedEmail({
  toEmail,
  professionalName,
}: {
  toEmail: string;
  professionalName: string;
}): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background-color: #10B981; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">✓</h1>
              <h2 style="color: #ffffff; margin: 10px 0 0 0; font-size: 24px;">Profile Verified</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-top: 0;">Congratulations, ${professionalName}!</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                Your profile has been verified! You will now appear as a verified specialist and receive priority in lead matching.
              </p>
              
              <div style="background-color: #D1FAE5; border: 1px solid #10B981; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <p style="margin: 0; color: #065F46; font-size: 14px; line-height: 1.6;">
                  <strong>✓ Verified Professional Badge:</strong> Your profile now displays a verified badge, increasing trust and lead volume.
                </p>
              </div>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${FRONTEND_URL}/dashboard/immigration/profile" style="display: inline-block; padding: 14px 32px; background-color: #0F2557; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">View Your Profile</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">Immigration AI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'Your profile has been verified ✓',
      html,
    });

    logger.info('Verification approval email sent', { toEmail });
  } catch (error: any) {
    logger.error('Failed to send verification approval email', { error: error.message, toEmail });
  }
}

/**
 * Send verification rejected email
 */
export async function sendVerificationRejectedEmail({
  toEmail,
  professionalName,
  rejectionReason,
}: {
  toEmail: string;
  professionalName: string;
  rejectionReason: string;
}): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background-color: #0F2557; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Verification Update Required</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-top: 0;">Hi ${professionalName},</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                We were unable to verify your credentials at this time.
              </p>
              
              <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: #92400E; font-size: 14px; font-weight: bold;">Reason:</p>
                <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.6;">${rejectionReason}</p>
              </div>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                Please upload a clearer or correct document and resubmit your verification request.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${FRONTEND_URL}/dashboard/immigration/profile" style="display: inline-block; padding: 14px 32px; background-color: #0F2557; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Update Your Profile</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">Immigration AI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'Verification update required',
      html,
    });

    logger.info('Verification rejection email sent', { toEmail });
  } catch (error: any) {
    logger.error('Failed to send verification rejection email', { error: error.message, toEmail });
  }
}

/**
 * Send portal welcome email to a brand-new client when their first case is opened.
 * Includes a 48-hour link to set up their password.
 */
export async function sendClientPortalWelcomeEmail({
  toEmail,
  clientName,
  caseReference,
  setupToken,
  professionalName,
  preferredLanguage,
}: {
  toEmail: string;
  clientName: string;
  caseReference: string;
  setupToken: string;
  professionalName: string;
  preferredLanguage?: string | null;
}): Promise<void> {
  const lang = toEmailLang(preferredLanguage);
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  const setupUrl = `${FRONTEND_URL}/auth/reset-password?token=${setupToken}&setup=1`;

  // Multilingual strings
  const strings: Record<string, Record<EmailLang, string>> = {
    subject:  { en: 'Your immigration portal is ready — {ref}', fr: 'Votre portail d\'immigration est prêt — {ref}', pt: 'Seu portal de imigração está pronto — {ref}', ar: 'بوابة الهجرة الخاصة بك جاهزة — {ref}', es: 'Su portal de inmigración está listo — {ref}', zh: '您的移民门户已就绪 — {ref}' },
    header:   { en: 'Your Case Is Open!', fr: 'Votre dossier est ouvert !', pt: 'Seu caso está aberto!', ar: 'قضيتك مفتوحة!', es: '¡Su caso está abierto!', zh: '您的案例已开启！' },
    greeting: { en: 'Hi {name},', fr: 'Bonjour {name},', pt: 'Olá {name},', ar: 'مرحباً {name}،', es: 'Hola {name},', zh: '您好 {name}，' },
    body1:    { en: '{professional} has accepted your immigration case and it\'s now active in your personal portal.', fr: '{professional} a accepté votre dossier d\'immigration et il est désormais actif dans votre portail personnel.', pt: '{professional} aceitou seu caso de imigração e ele está ativo no seu portal pessoal.', ar: 'قبل {professional} قضية الهجرة الخاصة بك وهي الآن نشطة في بوابتك الشخصية.', es: '{professional} ha aceptado su caso de inmigración y ahora está activo en su portal personal.', zh: '{professional} 已接受您的移民案例，现在可在您的个人门户中查看。' },
    body2:    { en: 'Your portal lets you:', fr: 'Votre portail vous permet de :', pt: 'Seu portal permite que você:', ar: 'يتيح لك بوابتك:', es: 'Su portal le permite:', zh: '您的门户允许您：' },
    feat1:    { en: '📁 View your case status in real time', fr: '📁 Suivre l\'état de votre dossier en temps réel', pt: '📁 Ver o status do seu caso em tempo real', ar: '📁 متابعة حالة قضيتك في الوقت الفعلي', es: '📁 Ver el estado de su caso en tiempo real', zh: '📁 实时查看案例状态' },
    feat2:    { en: '💬 Message your consultant directly inside the platform', fr: '💬 Envoyer des messages à votre consultant directement sur la plateforme', pt: '💬 Enviar mensagens para seu consultor diretamente na plataforma', ar: '💬 مراسلة مستشارك مباشرة داخل المنصة', es: '💬 Enviar mensajes a su consultor directamente en la plataforma', zh: '💬 在平台内直接与顾问沟通' },
    feat3:    { en: '📄 Upload and track all required documents', fr: '📄 Téléverser et suivre tous les documents requis', pt: '📄 Enviar e acompanhar todos os documentos necessários', ar: '📄 رفع ومتابعة جميع المستندات المطلوبة', es: '📄 Subir y rastrear todos los documentos requeridos', zh: '📄 上传和跟踪所有所需文件' },
    caseRef:  { en: 'Case Reference', fr: 'Référence du dossier', pt: 'Referência do caso', ar: 'مرجع القضية', es: 'Referencia del caso', zh: '案例参考' },
    ctaTitle: { en: 'Set up your password to access your portal', fr: 'Configurez votre mot de passe pour accéder à votre portail', pt: 'Configure sua senha para acessar seu portal', ar: 'قم بإعداد كلمة المرور للوصول إلى بوابتك', es: 'Configure su contraseña para acceder a su portal', zh: '设置密码以访问您的门户' },
    cta:      { en: 'Set Up My Password & Open Portal', fr: 'Configurer mon mot de passe et ouvrir le portail', pt: 'Configurar minha senha e abrir o portal', ar: 'إعداد كلمة المرور وفتح البوابة', es: 'Configurar mi contraseña y abrir el portal', zh: '设置密码并打开门户' },
    expiry:   { en: 'This link is valid for 48 hours.', fr: 'Ce lien est valable pendant 48 heures.', pt: 'Este link é válido por 48 horas.', ar: 'هذا الرابط صالح لمدة 48 ساعة.', es: 'Este enlace es válido por 48 horas.', zh: '此链接有效期为48小时。' },
    footer:   { en: 'Questions? Your consultant {professional} is here to help.', fr: 'Des questions ? Votre consultant {professional} est là pour vous aider.', pt: 'Dúvidas? Seu consultor {professional} está aqui para ajudar.', ar: 'هل لديك أسئلة؟ مستشارك {professional} هنا للمساعدة.', es: '¿Preguntas? Su consultor {professional} está aquí para ayudar.', zh: '有疑问？您的顾问 {professional} 随时为您提供帮助。' },
  };

  const s = (key: string, vars?: Record<string, string>) => {
    let text = strings[key]?.[lang] ?? strings[key]?.['en'] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      }
    }
    return text;
  };

  const isRtl = lang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  const html = `<!DOCTYPE html>
<html dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${s('subject', { ref: caseReference })}</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0F2557 0%,#1e3a8a 100%);padding:32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:-0.5px;">Immigration AI</h1>
          <p style="color:#93c5fd;margin:6px 0 0;font-size:14px;">${s('header')}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 36px;" dir="${dir}">
          <p style="font-size:18px;color:#111827;font-weight:600;margin:0 0 8px;">${s('greeting', { name: clientName })}</p>
          <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 20px;">${s('body1', { professional: professionalName })}</p>

          <!-- Case Reference Box -->
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
            <p style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">${s('caseRef')}</p>
            <p style="font-size:20px;font-weight:700;color:#0F2557;font-family:monospace;margin:0;">${caseReference}</p>
          </div>

          <!-- Features -->
          <p style="font-size:14px;color:#6b7280;font-weight:600;margin:0 0 12px;">${s('body2')}</p>
          <table style="width:100%;margin:0 0 28px;">
            <tr><td style="padding:8px 12px;background:#f8fafc;border-radius:6px;margin-bottom:8px;font-size:14px;color:#374151;">${s('feat1')}</td></tr>
            <tr><td style="height:6px;"></td></tr>
            <tr><td style="padding:8px 12px;background:#f8fafc;border-radius:6px;font-size:14px;color:#374151;">${s('feat2')}</td></tr>
            <tr><td style="height:6px;"></td></tr>
            <tr><td style="padding:8px 12px;background:#f8fafc;border-radius:6px;font-size:14px;color:#374151;">${s('feat3')}</td></tr>
          </table>

          <!-- CTA -->
          <p style="font-size:14px;color:#374151;font-weight:600;margin:0 0 12px;">${s('ctaTitle')}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
            <tr><td align="center">
              <a href="${setupUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">${s('cta')}</a>
            </td></tr>
          </table>

          <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0 0 24px;">${s('expiry')}</p>
          <p style="font-size:14px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:16px;margin:0;">${s('footer', { professional: professionalName })}</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:16px 36px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">Immigration AI · <a href="${FRONTEND_URL}" style="color:#6b7280;">immigrationai.co.za</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: s('subject', { ref: caseReference }),
      html,
    });
    logger.info('Client portal welcome email sent', { toEmail, caseReference });
  } catch (error: any) {
    logger.error('Failed to send client portal welcome email', { error: error.message, toEmail });
  }
}
