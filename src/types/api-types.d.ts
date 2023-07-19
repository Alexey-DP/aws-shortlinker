export interface User {
  email: string;
  password: string;
}

export interface Token {
  token: string;
}

export interface ErrorArr {
  error: string[];
}

export interface ErrorStr {
  error: string;
}

export interface CreateLink {
  originalLink: string;
  ttl: "once" | "1" | "3" | "7";
}

export interface Link {
  link: string;
}

export interface Links {
  links: string[];
}
