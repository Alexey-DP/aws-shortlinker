import { AnyZodObject, ZodError } from "zod";
import { APIGatewayEvent, ProxyResult } from "aws-lambda";
import { HandlerLambda, MiddlewareObject, NextFunction } from "middy";
import SlsResponse from "../utils/generateResponse";

const validateReq = async (schema: AnyZodObject, event: APIGatewayEvent) => {
  try {
    await schema.parseAsync({
      body: event.body,
      params: event.pathParameters,
      query: event.queryStringParameters,
    });
    return { error: false };
  } catch (error) {
    if (error instanceof ZodError) {
      const validateMessage = error.issues.reduce(
        (prev: string[], curr) => [...prev, curr.message],
        []
      );
      return { error: validateMessage };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
};

export const middyZodValidator = (
  schema: AnyZodObject
): MiddlewareObject<APIGatewayEvent, ProxyResult> => {
  return {
    before: async (
      handler: HandlerLambda<APIGatewayEvent, ProxyResult>,
      next: NextFunction
    ): Promise<void | ProxyResult> => {
      const { event } = handler;
      const isValid = await validateReq(schema, event);

      if (isValid?.error) {
        throw new Error(JSON.stringify(isValid.error));
      }

      next();
    },
    onError: (
      handler: HandlerLambda<APIGatewayEvent, ProxyResult>,
      next: NextFunction
    ) => {
      handler.response = new SlsResponse(400, {
        error: JSON.parse(handler.error.message),
      });
      return next();
    },
  };
};
