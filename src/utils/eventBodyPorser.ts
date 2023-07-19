import { APIGatewayEvent } from "aws-lambda";

export default (event: APIGatewayEvent) => {
  return { ...event, body: JSON.parse(event.body as string) };
};
