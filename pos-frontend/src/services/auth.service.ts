import axios from "axios";
import { api } from "./api";
import type { LoginDto, RefreshTokenDto } from "../types/dto/auth-dto";
import type { ApiResponse } from "../types/api";
import type { LoginPayload, RefreshPayload, MeResponse } from "../types/auth";

const baseURL = import.meta.env.VITE_API_URL;

const ensureSuccess = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    const error = response.error?.message ?? "Request failed";
    throw new Error(error);
  }
  console.log("Login response", response.data);
  return response.data;
};

export const authService = {
  async login(data: LoginDto): Promise<LoginPayload> {
    const response = await api.post<ApiResponse<LoginPayload>>(
      "/auth/login",
      data
    );
    return ensureSuccess(response.data);
  },

  async refresh(data: RefreshTokenDto): Promise<RefreshPayload["tokens"]> {
    const response = await axios.post<ApiResponse<RefreshPayload>>(
      `${baseURL}/auth/refresh`,
      data
    );
    const payload = ensureSuccess(response.data);
    return payload.tokens;
  },

  async logout(): Promise<void> {
    await api.post<ApiResponse<null>>("/auth/logout");
  },

  async me(): Promise<MeResponse["user"]> {
    const response = await api.get<ApiResponse<MeResponse>>("/auth/me");
    const payload = ensureSuccess(response.data);
    return payload.user;
  },
};
