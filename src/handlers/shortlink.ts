import {
  APIGatewayEvent,
  APIGatewayProxyStructuredResultV2,
  ProxyResult,
} from "aws-lambda";
import eventBodyParser from "../utils/eventBodyPorser";
import { validateReq } from "../validators/reqValidator";
import { createLinkSchema } from "../validators/schemas/createLinkSchema";
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

const generateShortUrl = (event: APIGatewayEvent, shortId: string): string => {
  const proto = "https://";
  const host = event.headers.Host;
  const path = event.requestContext.path || "/";
  return proto + host + path + shortId;
};

export const createShortLink = async (
  event: APIGatewayEvent
): Promise<ProxyResult> => {
  const parseEvent = eventBodyParser(event);
  const isValid = await validateReq(createLinkSchema, parseEvent);

  if (isValid?.error) {
    return new SlsResponse(400, { error: isValid.error });
  }

  const linkId = await generateShortId();

  if (!linkId) {
    return new SlsResponse(409, {
      error: "Can't create a short link, try again",
    });
  }

  const { originalLink, ttl: ttlParam } = parseEvent.body;
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

  const newShortURL = generateShortUrl(event, linkId);
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

  return {
    statusCode: 200,
  };
};
