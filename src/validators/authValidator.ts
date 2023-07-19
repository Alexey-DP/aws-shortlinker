import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
  PolicyDocument,
} from "aws-lambda";
import { getEmailFromToken } from "../helpers/tokens";

type EffectTypes = "Allow" | "Deny";

class VerifyResponse implements APIGatewayAuthorizerResult {
  principalId: string;
  policyDocument: PolicyDocument;
  constructor(email: string, effect: EffectTypes, method: string) {
    this.principalId = email;
    this.policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: method,
        },
      ],
    };
  }
}

export const verifyToken = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  try {
    const token = event.authorizationToken.split(" ")[1];
    const usersEmail = await getEmailFromToken(token);
    if (!usersEmail) {
      return new VerifyResponse("user", "Deny", event.methodArn);
    }

    return new VerifyResponse(usersEmail, "Allow", event.methodArn);
  } catch (error) {
    return new VerifyResponse("user", "Deny", event.methodArn);
  }
};
