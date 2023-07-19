import { AnyZodObject, ZodError } from "zod";
import { APIGatewayEvent } from "aws-lambda";

export const validateReq = async (
  schema: AnyZodObject,
  event: APIGatewayEvent
) => {
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
