export interface IRecordBody {
  email: string;
  expiredLinkId: string;
}

export interface ISqsBatchEntrie {
  Id: string;
  MessageBody: string;
}

class SqsQueueUrl {
  private readonly accountId = process.env.ACCOUNT_ID;
  private readonly region = process.env.REGION;
  QueueUrl = `https://sqs.${this.region}.amazonaws.com/${this.accountId}/emailQueue`;
}

export class SqsEmailQueueMessage extends SqsQueueUrl {
  MessageBody: string;
  constructor(data: IRecordBody) {
    super();
    this.MessageBody = JSON.stringify(data);
  }
}

export class SqsEmailQueueBatch extends SqsQueueUrl {
  Entries: ISqsBatchEntrie[];
  constructor(data: ISqsBatchEntrie[]) {
    super();
    this.Entries = data;
  }
}
