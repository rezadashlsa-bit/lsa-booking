import { Html, Head, Body, Container, Heading, Text, Section, Hr, Button } from "@react-email/components";

export function MissedSessionNoticeEmail({
  studentName,
  dateTimeLabel,
  noticeGiven,
  makeupUrl,
}: {
  studentName: string;
  dateTimeLabel: string;
  noticeGiven: boolean;
  makeupUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#faf9f6" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px" }}>
          <Heading style={{ color: "#485539", fontSize: "20px" }}>Session update</Heading>
          <Text>
            {studentName}&apos;s session on {dateTimeLabel} (Jakarta time) was recorded as{" "}
            {noticeGiven ? "an excused absence" : "missed without prior notice"}.
          </Text>
          {noticeGiven ? (
            <Section style={{ backgroundColor: "#e8dbca", padding: "16px", borderRadius: "6px" }}>
              <Text style={{ margin: "0 0 12px 0" }}>
                A makeup session is now available to book at your convenience.
              </Text>
              <Button
                href={makeupUrl}
                style={{
                  backgroundColor: "#485539",
                  color: "#ffffff",
                  padding: "10px 18px",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                Book your makeup session
              </Button>
            </Section>
          ) : (
            <Text style={{ fontSize: "13px", color: "#666" }}>
              Per LSA policy, sessions missed without advance notice do not generate a makeup
              session, and the family is still billed for it (billing is handled separately from
              this booking system).
            </Text>
          )}
          <Hr />
        </Container>
      </Body>
    </Html>
  );
}
