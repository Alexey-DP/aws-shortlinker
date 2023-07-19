export default class SlsResponse {
  statusCode: number;
  body: string;
  constructor(statusCode: number, data?: any) {
    this.statusCode = statusCode;
    this.body = JSON.stringify(data);
  }
}
