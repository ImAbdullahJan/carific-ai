import { render } from "@react-email/components";
import EmailVerification from "@/lib/emails/auth/email-verification";
import { resend } from "@/lib/resend";

const FROM_EMAIL = `Carific AI <${process.env.EMAIL_FROM}>`;

export async function sendVerificationEmail(
  userName: string,
  email: string,
  verificationUrl: string
) {
  const emailHtml = await render(
    <EmailVerification verificationUrl={verificationUrl} userName={userName} />
  );

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [email],
    subject: "Verify your email - Carific AI",
    html: emailHtml,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}
