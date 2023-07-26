import { APIGatewayEvent, ProxyResult } from "aws-lambda";
import SlsResponse from "../utils/generateResponse";
import {
  SchedulerClient,
  CreateScheduleCommand,
  DeleteScheduleCommand,
} from "@aws-sdk/client-scheduler";
import { NewScheduleCommand } from "../utils/scheduler";

const scheduler = new SchedulerClient({});

export const testFn = async (event: APIGatewayEvent): Promise<ProxyResult> => {
  const now = new Date().getTime();
  const expiredAt = new Date(now + 2 * 60 * 1000);
  const time = expiredAt.toISOString().split(".")[0];

  await scheduler.send(
    new CreateScheduleCommand(
      new NewScheduleCommand({
        time,
        email: "alexeyvkedah@gmail.com",
        id: "0",
      })
    )
  );

  return new SlsResponse(200, time);
};
