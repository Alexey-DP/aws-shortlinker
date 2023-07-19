export interface IUserItem {
  email: string;
  password: string;
}

export type UserEmailType = Pick<IUserItem, "email">;

class UserTable {
  TableName = "users";
}

export class PutUserParams extends UserTable {
  Item: IUserItem;
  constructor(user: IUserItem) {
    super();
    this.Item = user;
  }
}

export class GetUserParams extends UserTable {
  Key: UserEmailType;
  constructor(email: UserEmailType) {
    super();
    this.Key = email;
  }
}
