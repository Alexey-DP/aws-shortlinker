import { LinkTtl } from "../validators/schemas/createLinkSchema";

export const generateLinksTtl = (param: LinkTtl): number => {
  if (param === "once") {
    return 0;
  }
  return new Date().getTime() + Number(param) * 24 * 60 * 60 * 1000;
};
