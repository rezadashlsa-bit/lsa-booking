import { Html, Head, Body, Container, Heading, Text, Section, Hr } from "@react-email/components";

const BOOKING_TYPE_LABEL: Record<string, string> = {
  makeup: "Makeup Session",
  additional: "Additional Session",
  open_hour: "Open Hour Session",
};

export function BookingConfirmationEmail({
  studentName,
  coachName,
  dateTimeLabel,
  bookingType,
  manageUrl,
}: {
  studentName: string;
  coachName: string;
  dateTimeLabel: string;
  bookingType: string;
  manageUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#faf9f6" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading style={{ color: "#485539", fontSize: "20px" }}>Booking confirmed</Heading>
          <Text>
            {studentName}&apos;s {BOOKING_TYPE_LABEL[bookingType] ?? "session"} with {coachName} is
            confirmed.
          </Text>
          <Section style={{ backgroundColor: "#e8dbca", padding: "16px", borderRadius: "6px" }}>
            <Text style={{ margin: 0, fontWeight: "bold" }}>{dateTimeLabel} (Jakarta time)</Text>
            <Text style={{ margin: 0 }}>Coach: {coachName}</Text>
          </Section>
          <Hr />
          <Text style={{ fontSize: "13px", color: "#666" }}>
            Manage this booking any time at{" "}
            <a href={manageUrl} style={{ color: "#485539" }}>
              {manageUrl}
            </a>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
