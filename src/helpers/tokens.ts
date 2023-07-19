import { JWK, JWE, parse } from "node-jose";

const _privateKey = process.env.RSA_PRIVATE_KEY || "";
const _publicKey = process.env.RSA_PUBLIC_KEY || "";
const _tokenTtl = Number(process.env.TOKEN_TTL_MINUTES) || 120;

export interface ITokenData {
  email: string;
}

export interface IToken {
  token: string;
}

export interface ITokenPayload {
  data: ITokenData;
  exp: number;
}

export const generateToken = async (payload: ITokenData): Promise<IToken> => {
  try {
    const publicKey = await JWK.asKey(_publicKey, "pem");
    const exp = new Date().getTime() + _tokenTtl * 60 * 1000;
    const buffer = Buffer.from(JSON.stringify({ data: payload, exp }));
    const encrypted = await JWE.createEncrypt(
      {
        format: "compact",
        contentAlg: "A256GCM",
        fields: { alg: "RSA-OAEP" },
      },
      publicKey
    )
      .update(buffer)
      .final();
    return { token: encrypted };
  } catch (error) {
    console.log((error as Error).message);
    return { token: (error as Error).message };
  }
};

export const getEmailFromToken = async (
  token: string
): Promise<string | null> => {
  try {
    const keystore = JWK.createKeyStore();
    await keystore.add(await JWK.asKey(_privateKey, "pem"));
    const outPut = parse.compact(token);
    const decryptedVal = await outPut.perform(keystore);
    const claims = Buffer.from(decryptedVal.payload).toString();
    const payload: ITokenPayload = JSON.parse(claims);
    if (!payload || payload.exp < new Date().getTime()) {
      return null;
    }
    return payload.data.email;
  } catch (error) {
    return null;
  }
};
