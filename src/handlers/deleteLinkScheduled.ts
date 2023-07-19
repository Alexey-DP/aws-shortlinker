import { nanoid } from "nanoid";
import { BatchWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "../utils/db/dynamoDb";
import {
  GerExpiredLinksParams,
  ILinkItem,
} from "../utils/db/params/linkParams";
import sqs from "../utils/sqs";
import {
  ISqsBatchEntrie,
  SqsEmailQueueBatch,
} from "../utils/generateSqsMessage";

export const scheduledDeleteExpiredLinks = async (): Promise<void> => {
  try {
    const result = await dynamoDb.scan(new GerExpiredLinksParams());
    const expiredLinks = result.Items as ILinkItem[];
    if (!expiredLinks || expiredLinks.length <= 0) {
      return;
    }
    const deleteInput: BatchWriteCommandInput = {
      RequestItems: {
        links: [],
      },
    };

    let sqsEntries: ISqsBatchEntrie[] = [];
    let countMessages = 0;

    for (let index in expiredLinks) {
      const { id, ownerEmail } = expiredLinks[index];
      const itemForDelete = {
        DeleteRequest: {
          Key: { id },
        },
      };
      deleteInput?.RequestItems?.links.push(itemForDelete);

      sqsEntries.push({
        Id: nanoid(7),
        MessageBody: JSON.stringify({
          email: ownerEmail,
          expiredLinkId: id,
        }),
      });
      countMessages++;

      if (countMessages === 10 || Number(index) === expiredLinks.length - 1) {
        const sqsInput = new SqsEmailQueueBatch(sqsEntries);
        await sqs.sendMessageBatch(sqsInput);
        sqsEntries = [];
        countMessages = 0;
      }
    }

    await dynamoDb.batchWrite(deleteInput);
  } catch (error) {
    console.log((error as Error).message);
  }
};
