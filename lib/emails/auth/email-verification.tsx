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
  Tailwind,
  Text,
  pixelBasedPreset,
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
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: "#171717",
              },
            },
          },
        }}
      >
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="mx-auto max-w-[560px] rounded-lg bg-white px-5 py-10">
            <Heading className="m-0 mb-6 text-center text-2xl font-semibold text-[#1a1a1a]">
              Verify your email
            </Heading>

            <Text className="m-0 mb-4 text-base leading-relaxed text-[#484848]">
              {userName ? `Hi ${userName},` : "Hi,"}
            </Text>

            <Text className="m-0 mb-4 text-base leading-relaxed text-[#484848]">
              Thanks for signing up for Carific.ai. Please verify your email
              address by clicking the button below.
            </Text>

            <Section className="my-8 text-center">
              <Button
                href={verificationUrl}
                className="inline-block rounded-md bg-brand px-6 py-3 text-base font-semibold text-white no-underline"
              >
                Verify Email
              </Button>
            </Section>

            <Text className="m-0 mb-4 text-base leading-relaxed text-[#484848]">
              Or copy and paste this URL into your browser:
            </Text>

            <Text className="break-all text-sm text-[#6b7280]">
              {verificationUrl}
            </Text>

            <Hr className="my-8 border-[#e5e7eb]" />

            <Text className="m-0 mb-2 text-xs text-[#9ca3af]">
              If you didn&apos;t create an account with Carific.ai, you can
              safely ignore this email.
            </Text>

            <Text className="m-0 mb-2 text-xs text-[#9ca3af]">
              <Link
                href="https://carific.ai"
                className="text-[#6b7280] underline"
              >
                Carific.ai
              </Link>{" "}
              - Career growth, powered by AI
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
