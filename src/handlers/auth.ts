import { APIGatewayEvent, ProxyResult } from "aws-lambda";
import eventBodyParser from "../utils/eventBodyPorser";
import { validateReq } from "../validators/reqValidator";
import { authSchema } from "../validators/schemas/authSchema";
import { dynamoDb } from "../utils/db/dynamoDb";
import SlsResponse from "../utils/generateResponse";
import { checkPasswords, hashUsersPassword } from "../helpers/hashPassword";
import { GetUserParams, PutUserParams } from "../utils/db/params/userParams";
import { generateToken } from "../helpers/tokens";

export const register = async (
  event: APIGatewayEvent
): Promise<ProxyResult> => {
  try {
    const parseEvent = eventBodyParser(event);
    const isValid = await validateReq(authSchema, parseEvent);

    if (isValid?.error) {
      return new SlsResponse(400, { error: isValid.error });
    }

    const { email, password } = parseEvent.body;
    const { Item } = await dynamoDb.get(new GetUserParams({ email }));

    if (Item) {
      return new SlsResponse(409, { error: "Email already exists" });
    }

    const hashPassword = hashUsersPassword(password);
    const newUserParams = new PutUserParams({ email, password: hashPassword });
    await dynamoDb.put(newUserParams);

    const token = await generateToken({ email });

    return new SlsResponse(201, token);
  } catch (error) {
    return new SlsResponse(500, { error: (error as Error).message });
  }
};

export const login = async (event: APIGatewayEvent): Promise<ProxyResult> => {
  try {
    const parseEvent = eventBodyParser(event);
    const isValid = await validateReq(authSchema, parseEvent);

    if (isValid?.error) {
      return new SlsResponse(400, { error: isValid.error });
    }

    const { email, password } = parseEvent.body;
    const { Item: user } = await dynamoDb.get(new GetUserParams({ email }));

    if (!user) {
      return new SlsResponse(400, { error: ["Wrong email or password!"] });
    }

    const isPasswordEquals = checkPasswords(password, user.password);

    if (!isPasswordEquals) {
      return new SlsResponse(400, { error: ["Wrong email or password!"] });
    }

    const token = await generateToken({ email });

    return new SlsResponse(200, token);
  } catch (error) {
    return new SlsResponse(500, { error: (error as Error).message });
  }
};
