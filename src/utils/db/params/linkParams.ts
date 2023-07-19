export interface ILinkItem {
  id: string;
  originalLink: string;
  expIn: number;
  ownerEmail: string;
  visitCount: number;
}

export type LinkIdType = Pick<ILinkItem, "id">;

class LinkTable {
  TableName = "links";
}

export class PutLinkParams extends LinkTable {
  Item: ILinkItem;
  constructor(link: ILinkItem) {
    super();
    this.Item = link;
  }
}

export class LinkIdParams extends LinkTable {
  Key: LinkIdType;
  constructor(id: LinkIdType) {
    super();
    this.Key = id;
  }
}

export class GetLinksByOwnerEmailParams extends LinkTable {
  FilterExpression = "ownerEmail = :email";
  ExpressionAttributeValues: Record<":email", string>;
  ProjectionExpression = "id, originalLink, visitCount";
  constructor(email: string) {
    super();
    this.ExpressionAttributeValues = {
      ":email": email,
    };
  }
}

export class GerExpiredLinksParams extends LinkTable {
  FilterExpression = "expIn > :zero and expIn < :now";
  ExpressionAttributeValues: Record<":zero" | ":now", number>;
  constructor() {
    super();
    this.ExpressionAttributeValues = {
      ":now": new Date().getTime(),
      ":zero": 0,
    };
  }
}
