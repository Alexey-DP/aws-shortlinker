import {
  SESClient,
  VerifyEmailIdentityCommand,
  GetIdentityVerificationAttributesCommand,
} from "@aws-sdk/client-ses";

const client = new SESClient({ region: "eu-north-1" });

const email = process.env.EMAIL_FROM || "my email";

const verifyEmail = async () => {
  try {
    const response = await client.send(
      new GetIdentityVerificationAttributesCommand({
        Identities: [email],
      })
    );
    if (response.VerificationAttributes[email]) {
      return console.log(`${email} already verified`);
    }
    await client.send(
      new VerifyEmailIdentityCommand({
        EmailAddress: email,
      })
    );
    console.log(`${email} successfully verified`);
    console.log("Check your email!");
  } catch (error) {
    console.log(error.message);
  }
};

verifyEmail();
