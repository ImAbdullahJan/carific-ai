import { Resend } from "resend";
import EmailVerification from "@/lib/emails/auth/email-verification";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = `Carific AI <${process.env.EMAIL_FROM}>`;

export async function sendVerificationEmail(
  userName: string,
  email: string,
  verificationUrl: string
) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [email],
    subject: "Verify your email - Carific AI",
    react: EmailVerification({
      verificationUrl,
      userName,
    }),
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}
