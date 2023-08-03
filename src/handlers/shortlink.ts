import {
  APIGatewayEvent,
  APIGatewayProxyStructuredResultV2,
  ProxyResult,
} from "aws-lambda";
import middy from "middy";
import { jsonBodyParser } from "middy/middlewares";
import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
} from "@aws-sdk/client-scheduler";
import { middyZodValidator } from "../validators/reqValidator";
import {
  LinkType,
  createLinkSchema,
} from "../validators/schemas/createLinkSchema";
import SlsResponse from "../utils/generateResponse";
import { nanoid } from "nanoid";
import { dynamoDb } from "../utils/db/dynamoDb";
import {
  LinkIdParams,
  ILinkItem,
  PutLinkParams,
  GetLinksByOwnerEmailParams,
} from "../utils/db/params/linkParams";
import { generateLinksTtl } from "../helpers/generateLinksTtl";
import { SqsEmailQueueMessage } from "../utils/generateSqsMessage";
import sqs from "../utils/sqs";
import { NewScheduleCommand, scheduler } from "../utils/scheduler";

const generateShortId = async (idLength = 1): Promise<string | null> => {
  if (idLength > 6) {
    return null;
  }
  const id = nanoid(idLength);
  const { Item } = await dynamoDb.get(new LinkIdParams({ id }));
  if (Item) {
    return await generateShortId(++idLength);
  }
  return id;
};

const createShortLinkFn = async (
  event: APIGatewayEvent & LinkType
): Promise<ProxyResult> => {
  const linkId = await generateShortId();

  if (!linkId) {
    return new SlsResponse(409, {
      error: "Can't create a short link, try again",
    });
  }

  const { originalLink, ttl: ttlParam } = event.body;
  const ownerEmail = event.requestContext.authorizer?.principalId as string;
  const ttl = generateLinksTtl(ttlParam);
  const newShortLinkParams = new PutLinkParams({
    id: linkId,
    ownerEmail,
    originalLink,
    expIn: ttl,
    visitCount: 0,
  });
  await dynamoDb.put(newShortLinkParams);

  try {
    if (ttlParam !== "once") {
      const now = new Date().getTime();
      const expiredAt = new Date(now + Number(ttlParam) * 24 * 60 * 60 * 1000);
      const time = expiredAt.toISOString().split(".")[0];

      await scheduler.send(
        new CreateScheduleCommand(
          new NewScheduleCommand({ time, email: ownerEmail, id: linkId })
        )
      );
    }
  } catch (error) {
    console.log((error as Error).message);
  }

  const newShortURL = `${process.env.BASE_URL}${linkId}`;
  return new SlsResponse(201, { link: newShortURL });
};

export const goToOriginalLink = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyStructuredResultV2> => {
  const shortId = event?.pathParameters?.id || "";
  const result = await dynamoDb.get(new LinkIdParams({ id: shortId }));
  const shortLinkObj = result.Item as ILinkItem;

  if (!shortLinkObj) {
    return new SlsResponse(404, { error: "Not found" });
  }

  if (shortLinkObj.expIn === 0) {
    await dynamoDb.delete(new LinkIdParams({ id: shortId }));
    const sqsMessqge = new SqsEmailQueueMessage({
      email: shortLinkObj.ownerEmail,
      expiredLinkId: shortId,
    });
    await sqs.sendMessage(sqsMessqge);
  }

  if (shortLinkObj.expIn !== 0 && shortLinkObj.expIn < new Date().getTime()) {
    return new SlsResponse(400, { error: "Link expired" });
  }

  if (shortLinkObj.expIn !== 0) {
    shortLinkObj.visitCount++;
    await dynamoDb.put(new PutLinkParams(shortLinkObj));
  }

  return {
    statusCode: 301,
    headers: { Location: shortLinkObj.originalLink },
  };
};

export const getUsersLinks = async (
  event: APIGatewayEvent
): Promise<ProxyResult> => {
  const usersEmail = event.requestContext.authorizer?.principalId as string;
  const getLinksParams = new GetLinksByOwnerEmailParams(usersEmail);
  const { Items } = await dynamoDb.scan(getLinksParams);
  return new SlsResponse(200, { links: Items });
};

export const deleteLink = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyStructuredResultV2> => {
  const ownerEmail = event.requestContext.authorizer?.principalId as string;
  const shortId = event?.pathParameters?.id || "";
  const result = await dynamoDb.get(new LinkIdParams({ id: shortId }));
  const shortLinkObj = result.Item as ILinkItem;

  if (!shortLinkObj) {
    return new SlsResponse(404, { error: "Not found" });
  }

  if (ownerEmail !== shortLinkObj.ownerEmail) {
    return new SlsResponse(403, { error: "You aren't owner" });
  }

  await dynamoDb.delete(new LinkIdParams({ id: shortId }));

  try {
    if (shortLinkObj.expIn > 0) {
      await scheduler.send(
        new DeleteScheduleCommand({
          Name: `expired_link_id-${shortId}`,
          GroupName: "deleteLink",
        })
      );
    }
  } catch (error) {}

  return {
    statusCode: 200,
  };
};

export const createShortLink = middy(createShortLinkFn)
  .use(jsonBodyParser())
  .use(middyZodValidator(createLinkSchema));
