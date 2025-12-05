import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface EmailVerificationProps {
  verificationUrl: string;
  userName?: string;
}

export default function EmailVerification({
  verificationUrl,
  userName,
}: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for Carific.ai</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Verify your email</Heading>

          <Text style={paragraph}>{userName ? `Hi ${userName},` : "Hi,"}</Text>

          <Text style={paragraph}>
            Thanks for signing up for Carific.ai. Please verify your email
            address by clicking the button below.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              Verify Email
            </Button>
          </Section>

          <Text style={paragraph}>
            Or copy and paste this URL into your browser:
          </Text>

          <Text style={link}>{verificationUrl}</Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you didn&apos;t create an account with Carific.ai, you can safely
            ignore this email.
          </Text>

          <Text style={footer}>
            <Link href="https://carific.ai" style={footerLink}>
              Carific.ai
            </Link>{" "}
            - Career growth, powered by AI
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#484848",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#171717",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const link = {
  fontSize: "14px",
  color: "#6b7280",
  wordBreak: "break-all" as const,
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const footer = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0 0 8px",
};

const footerLink = {
  color: "#6b7280",
  textDecoration: "underline",
};
