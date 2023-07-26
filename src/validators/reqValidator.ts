import { AnyZodObject, ZodError } from "zod";
import { APIGatewayEvent, ProxyResult } from "aws-lambda";
import { HandlerLambda, MiddlewareObject, NextFunction } from "middy";

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
    ): Promise<void> => {
      const { event } = handler;
      const isValid = await validateReq(schema, event);

      if (isValid?.error) {
        (handler.event.body as any) = { error: isValid.error };
      }

      next();
    },
  };
};
