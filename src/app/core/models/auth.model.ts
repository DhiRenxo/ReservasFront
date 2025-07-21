export interface GoogleLoginRequest {
  google_token: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
