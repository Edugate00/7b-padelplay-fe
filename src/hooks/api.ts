import apiClient, { clearAuthToken } from "#/lib/axios";
import type { LoginPayload, LoginResponse } from "#/types/auth";
import type { MenuItemRaw, MenuResponse } from "#/types/menu";


export const authApi = {

  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login",
      payload,
    );
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      clearAuthToken();
    }
  },

  me: async (): Promise<unknown> => {
    const { data } = await apiClient.get("/auth/login/refresh-credentials");
    return data;
  },
};


export const menuApi = {
  getMenu: async (): Promise<MenuItemRaw[]> => {
    const { data } = await apiClient.get<MenuResponse>('/resto/menu')
    return data.data.listMenu ?? []
  },
}