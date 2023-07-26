import {
  SchedulerClient,
  CreateScheduleCommand,
} from "@aws-sdk/client-scheduler";

export const scheduler = new SchedulerClient({});

const region = process.env.REGION;
const accountId = process.env.ACCOUNT_ID;

export interface INewSchedule {
  time: string;
  email: string;
  id: string;
}

export class NewScheduleCommand {
  FlexibleTimeWindow = {
    Mode: "OFF",
  };
  GroupName = "deleteLink";
  ScheduleExpression: string;
  Name: string;
  Target: Record<"Arn" | "RoleArn" | "Input", string>;
  constructor({ time, email, id }: INewSchedule) {
    this.Name = `expired_link_id-${id}`;
    this.ScheduleExpression = `at(${time})`;
    this.Target = {
      Arn: `arn:aws:lambda:${region}:${accountId}:function:short-linker-dev-deleteExpiredLinks`,
      RoleArn: `arn:aws:iam::${accountId}:role/MainRole`,
      Input: JSON.stringify({ id, email }),
    };
  }
}
