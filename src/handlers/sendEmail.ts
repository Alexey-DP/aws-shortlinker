import { SQSEvent } from "aws-lambda";
import ses from "../utils/ses";
import { IRecordBody } from "../utils/generateSqsMessage";

interface IItemIdentifier {
  itemIdentifier: string;
}

const emailFrom = process.env.EMAIL_FROM as string;

export const sendEmail = async (event: SQSEvent) => {
  const batchItemFailures: IItemIdentifier[] = [];

  for (let record of event.Records) {
    const { email, expiredLinkId } = JSON.parse(record.body) as IRecordBody;
    try {
      const EmailInput = {
        Source: emailFrom,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Charset: "UTF-8",
            Data: `Link with ID ${expiredLinkId} expired!`,
          },
          Body: {
            Text: {
              Charset: "UTF-8",
              Data: `Your short link with Id ${expiredLinkId} expired`,
            },
          },
        },
      };
      await ses.sendEmail(EmailInput);
    } catch (error) {
      console.log({ error: (error as Error).message });
      console.log(`Error in processing SQS email: ${email}`);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
