import { api } from "./api";
import type { ApiResponse } from "../types/api";

export interface LicenseStatus {
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED';
  trialExpiresAt: string;
  isReadOnly: boolean;
}

export const licenseService = {
  async getStatus(): Promise<LicenseStatus> {
    const response = await api.get<ApiResponse<LicenseStatus>>("/license/status");
    console.log("License Status", response);
    if (!response.data.success) throw new Error("Failed to fetch license status");
    return response.data.data;
  },

  async unlock(code: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(
      "/license/unlock",
      { code }
    );
    if (!response.data.success) {
      throw new Error("Unlock failed");
    }
    return response.data.data;
  }
};
