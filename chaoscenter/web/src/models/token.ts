export interface DecodedTokenType {
  exp: number;
  groups?: string[];
  role: string;
  uid: string;
  username: string;
}
