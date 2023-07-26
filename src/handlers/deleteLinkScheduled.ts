import { scheduler } from "../utils/scheduler";
import { dynamoDb } from "../utils/db/dynamoDb";
import { LinkIdParams } from "../utils/db/params/linkParams";
import { SqsEmailQueueMessage } from "../utils/generateSqsMessage";
import sqs from "../utils/sqs";
import { DeleteScheduleCommand } from "@aws-sdk/client-scheduler";

export interface SchedulePayload {
  id: string;
  email: string;
}

export const scheduledDeleteExpiredLinks = async (
  payload: SchedulePayload
): Promise<void> => {
  try {
    const { id, email } = payload;

    await dynamoDb.delete(new LinkIdParams({ id }));

    await sqs.sendMessage(
      new SqsEmailQueueMessage({
        email,
        expiredLinkId: id,
      })
    );

    await scheduler.send(
      new DeleteScheduleCommand({
        Name: `expired_link_id-${id}`,
        GroupName: "deleteLink",
      })
    );
  } catch (error) {
    console.log((error as Error).message);
  }
};
