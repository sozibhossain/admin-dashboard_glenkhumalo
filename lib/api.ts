"use client";

import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { APP_CONFIG } from "@/lib/constants";

export type Pagination = {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type UserRow = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  specialRole?: string;
  role: "admin" | "client" | "creative";
  accountStatus: "pending" | "approved" | "rejected" | "suspended";
  profileImage?: { url?: string };
  createdAt: string;
};

export type PaymentRow = {
  _id: string;
  transactionId: string;
  amount: number;
  platformFee: number;
  creativeAmount: number;
  adminApproved: boolean;
  status: string;
  createdAt: string;
  client?: { _id: string; name: string; email: string };
  creative?: { _id: string; name: string; email: string };
  order?: { _id: string; orderId: string; title: string; status: string };
};

export type VerificationRow = {
  _id: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  paymentAmount: number;
  description: string;
  createdAt: string;
  adminNotes?: string;
  rejectionReason?: string;
  creative?: {
    _id: string;
    name: string;
    email: string;
    profileImage?: { url?: string };
  };
};

export type DashboardOverview = {
  users: { total: number; clients: number; creatives: number };
  gigs: number;
  jobPosts: number;
  orders: { total: number; active: number; completed: number };
  revenue: {
    totalRevenue: number;
    platformRevenue: number;
    creativeRevenue: number;
  };
  pendingPayments: number;
};

export type WebsiteContent = {
  _id: string;
  hero: {
    title: string;
    bodyText: string;
    image?: { public_id?: string; url?: string };
  };
  about: {
    title: string;
    bodyText: string;
    image?: { public_id?: string; url?: string };
  };
  creative: {
    title: string;
    bodyText: string;
    heroImage?: { public_id?: string; url?: string };
    images?: Array<{ public_id?: string; url?: string }>;
  };
  client: {
    title: string;
    bodyText: string;
    image?: { public_id?: string; url?: string };
  };
  contact: {
    address: string;
    phoneNumber: string;
    email: string;
  };
};

export type RevenueResponse = {
  transactions: PaymentRow[];
  summary: {
    totalAmount: number;
    totalPlatformFee: number;
    totalCreativeAmount: number;
    count: number;
  };
  byType: Array<{ _id: string; totalAmount: number; count: number }>;
};

export type ProfileUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
  role: "admin" | "client" | "creative";
  profileImage?: { url?: string };
};

export type SubscriptionBillingCycle = "monthly" | "yearly";

export type SubscriptionRow = {
  _id: string;
  name: string;
  price: number;
  billingCycle: SubscriptionBillingCycle;
  title?: string;
  includes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SupportTicketRow = {
  _id: string;
  ticketId: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  status: "open" | "in_progress" | "waiting_for_user" | "resolved" | "closed";
  resolution?: string;
  attachments?: Array<{
    public_id?: string;
    url?: string;
    fileType?: string;
    fileName?: string;
  }>;
  user?: {
    _id: string;
    name: string;
    email: string;
    profileImage?: { url?: string };
  };
  createdAt: string;
  updatedAt: string;
};

function isNotFoundError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { response?: { status?: number } };
  return maybe.response?.status === 404;
}

const api = axios.create({
  baseURL: APP_CONFIG.baseUrl,
});

const authHttp = axios.create({
  baseURL: APP_CONFIG.baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const ACCESS_TOKEN_KEY = "admin_access_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";
let accessTokenCache: string | null = null;
let refreshTokenCache: string | null = null;

export function setApiAccessToken(token?: string | null) {
  accessTokenCache = token || null;

  if (typeof window !== "undefined") {
    if (token) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }
}

export function setApiRefreshToken(token?: string | null) {
  refreshTokenCache = token || null;

  if (typeof window !== "undefined") {
    if (token) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
}

function getCachedAccessToken() {
  if (accessTokenCache) return accessTokenCache;
  if (typeof window === "undefined") return null;

  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) accessTokenCache = token;
  return token;
}

function getCachedRefreshToken() {
  if (refreshTokenCache) return refreshTokenCache;
  if (typeof window === "undefined") return null;

  const token = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  if (token) refreshTokenCache = token;
  return token;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function resolveSessionAccessTokenWithRetry() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const session = await getSession();
    const token = session?.accessToken || null;
    if (token) return token;
    await wait(120);
  }
  return null;
}

async function resolveSessionRefreshTokenWithRetry() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const session = await getSession();
    const token = session?.refreshToken || null;
    if (token) return token;
    await wait(120);
  }
  return null;
}

export async function refreshToken(refreshTokenValue: string): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await authHttp.post<ApiResponse<{ accessToken: string; refreshToken: string }>>("/auth/refresh-token", {
    refreshToken: refreshTokenValue,
  });
  return response.data.data;
}

api.interceptors.request.use(async (config) => {
  let token = getCachedAccessToken();
  let refresh = getCachedRefreshToken();

  if (!token) {
    token = await resolveSessionAccessTokenWithRetry();
    refresh = refresh || (await resolveSessionRefreshTokenWithRetry());
    if (token) {
      setApiAccessToken(token);
    }
    if (refresh) {
      setApiRefreshToken(refresh);
    }
  }

  // If access token is missing but refresh token exists, try to refresh before request.
  if (!token && refresh && !String(config.url || "").includes("/auth/refresh-token")) {
    try {
      const refreshed = await refreshToken(refresh);
      token = refreshed.accessToken;
      setApiAccessToken(refreshed.accessToken);
      setApiRefreshToken(refreshed.refreshToken);
    } catch {
      token = null;
    }
  }

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    const originalRequest = error?.config as (typeof error.config & { _retryAuth?: boolean }) | undefined;
    const shouldTryRefresh = status === 401 || (status === 404 && message === "Token not found");

    if (
      shouldTryRefresh &&
      originalRequest &&
      !originalRequest._retryAuth &&
      !String(originalRequest.url || "").includes("/auth/refresh-token")
    ) {
      originalRequest._retryAuth = true;

      let token = getCachedAccessToken() || (await resolveSessionAccessTokenWithRetry());
      if (!token) {
        const refresh = getCachedRefreshToken() || (await resolveSessionRefreshTokenWithRetry());
        if (refresh) {
          try {
            const refreshed = await refreshToken(refresh);
            token = refreshed.accessToken;
            setApiAccessToken(refreshed.accessToken);
            setApiRefreshToken(refreshed.refreshToken);
          } catch {
            token = null;
          }
        }
      }

      if (token) {
        setApiAccessToken(token);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }
    }

    if (status === 401 || (status === 404 && message === "Token not found")) {
      setApiAccessToken(null);
      setApiRefreshToken(null);
      await signOut({ callbackUrl: "/login" });
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  async forgotPassword(email: string) {
    const { data } = await api.post<ApiResponse<null>>("/auth/forgot-password", { email });
    return data;
  },
  async resetPassword(token: string, newPassword: string) {
    const { data } = await api.post<ApiResponse<null>>("/auth/reset-password", { token, newPassword });
    return data;
  },
  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    const { data } = await api.put<ApiResponse<null>>("/auth/change-password", payload);
    return data;
  },
};

export const adminApi = {
  async getDashboardOverview() {
    const { data } = await api.get<ApiResponse<DashboardOverview>>("/admin/dashboard");
    return data.data;
  },

  async getUsers(params: {
    page: number;
    limit: number;
    role?: string;
    search?: string;
    accountStatus?: string;
  }) {
    const { data } = await api.get<ApiResponse<{ users: UserRow[]; pagination: Pagination }>>("/admin/users", { params });
    return data.data;
  },

  async toggleUserStatus(userId: string, accountStatus: "approved" | "suspended" | "rejected") {
    const { data } = await api.patch<ApiResponse<null>>(`/admin/users/${userId}/toggle-status`, { accountStatus });
    return data;
  },

  async blockUser(targetUserId: string, reason = "Blocked by admin panel") {
    const { data } = await api.post<ApiResponse<null>>("/social/block", { targetUserId, reason });
    return data;
  },

  async unblockUser(targetUserId: string) {
    const { data } = await api.delete<ApiResponse<null>>(`/social/block/${targetUserId}`);
    return data;
  },

  async getSubscriptions(params: {
    page: number;
    limit: number;
    search?: string;
    billingCycle?: SubscriptionBillingCycle;
  }) {
    const { data } = await api.get<ApiResponse<{ subscriptions: SubscriptionRow[]; pagination: Pagination }>>(
      "/admin/subscriptions",
      { params },
    );
    return data.data;
  },

  async createSubscription(payload: {
    name: string;
    price: number;
    billingCycle: SubscriptionBillingCycle;
    title?: string;
    includes?: string;
    isActive?: boolean;
  }) {
    const { data } = await api.post<ApiResponse<SubscriptionRow>>("/admin/subscriptions", payload);
    return data;
  },

  async updateSubscription(
    subscriptionId: string,
    payload: {
      name?: string;
      price?: number;
      billingCycle?: SubscriptionBillingCycle;
      title?: string;
      includes?: string;
      isActive?: boolean;
    },
  ) {
    const { data } = await api.patch<ApiResponse<SubscriptionRow>>(`/admin/subscriptions/${subscriptionId}`, payload);
    return data;
  },

  async deleteSubscription(subscriptionId: string) {
    const { data } = await api.delete<ApiResponse<null>>(`/admin/subscriptions/${subscriptionId}`);
    return data;
  },

  async getSupportTickets(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    priority?: string;
  }) {
    const { data } = await api.get<ApiResponse<{ tickets: SupportTicketRow[]; pagination: Pagination }>>("/support/tickets", {
      params,
    });
    return data.data;
  },

  async getSupportTicketById(ticketId: string) {
    const { data } = await api.get<ApiResponse<SupportTicketRow>>(`/support/tickets/${ticketId}`);
    return data.data;
  },

  async updateSupportTicketStatus(
    ticketId: string,
    payload: {
      status: "open" | "in_progress" | "waiting_for_user" | "resolved" | "closed";
      resolution?: string;
    },
  ) {
    const { data } = await api.patch<ApiResponse<null>>(`/support/tickets/${ticketId}/status`, payload);
    return data;
  },

  async getRevenue(params?: { search?: string }) {
    const { data } = await api.get<ApiResponse<RevenueResponse>>("/admin/revenue", { params });
    return data.data;
  },

  async getPayments(params: { page: number; limit: number; status?: "pending" | "completed" }) {
    const { data } = await api.get<ApiResponse<{ payments: PaymentRow[]; pagination: Pagination }>>("/admin/payments", { params });
    return data.data;
  },

  async approvePayment(transactionId: string) {
    const { data } = await api.patch<ApiResponse<null>>(`/admin/payments/${transactionId}/approve`);
    return data;
  },

  async getPaymentDetail(transactionId: string) {
    const { data } = await api.get<ApiResponse<{ payments: PaymentRow[]; pagination: Pagination }>>("/admin/payments", {
      params: { page: 1, limit: 500 },
    });
    return data.data.payments.find((item) => item._id === transactionId || item.transactionId === transactionId) || null;
  },

  async getVerificationRequests(params: { page: number; limit: number; status?: string }) {
    const { data } = await api.get<ApiResponse<{ verifications: VerificationRow[]; pagination: Pagination }>>("/admin/verifications", {
      params,
    });
    return data.data;
  },

  async reviewVerification(
    verificationId: string,
    payload: { action: "approve" | "reject"; adminNotes?: string; rejectionReason?: string },
  ) {
    const { data } = await api.patch<ApiResponse<null>>(`/admin/verifications/${verificationId}`, payload);
    return data;
  },

  async getVerificationDetail(verificationId: string) {
    const data = await this.getVerificationRequests({ page: 1, limit: 500, status: "pending" });
    const all = [...data.verifications];
    if (!all.find((v) => v._id === verificationId)) {
      const approved = await this.getVerificationRequests({ page: 1, limit: 500, status: "approved" });
      const rejected = await this.getVerificationRequests({ page: 1, limit: 500, status: "rejected" });
      const underReview = await this.getVerificationRequests({ page: 1, limit: 500, status: "under_review" });
      all.push(...approved.verifications, ...rejected.verifications, ...underReview.verifications);
    }
    return all.find((item) => item._id === verificationId) || null;
  },
};

export const websiteApi = {
  async getWebsiteContent() {
    const { data } = await api.get<ApiResponse<WebsiteContent>>("/website");
    return data.data;
  },

  async getHeroSection() {
    const { data } = await api.get<ApiResponse<WebsiteContent["hero"]>>("/website/hero");
    return data.data;
  },

  async getAboutSection() {
    const { data } = await api.get<ApiResponse<WebsiteContent["about"]>>("/website/about");
    return data.data;
  },

  async getCreativeSection() {
    const { data } = await api.get<ApiResponse<WebsiteContent["creative"]>>("/website/creative");
    return data.data;
  },

  async getClientSection() {
    const { data } = await api.get<ApiResponse<WebsiteContent["client"]>>("/website/client");
    return data.data;
  },

  async getContactSection() {
    const { data } = await api.get<ApiResponse<WebsiteContent["contact"]>>("/website/contact");
    return data.data;
  },

  async createHero(formData: FormData) {
    const { data } = await api.post<ApiResponse<WebsiteContent["hero"]>>("/website/hero", formData);
    return data;
  },

  async updateHero(formData: FormData) {
    const { data } = await api.put<ApiResponse<WebsiteContent["hero"]>>("/website/hero", formData);
    return data;
  },

  async saveHero(formData: FormData) {
    try {
      return await this.updateHero(formData);
    } catch (error) {
      if (isNotFoundError(error)) return this.createHero(formData);
      throw error;
    }
  },

  async createAbout(formData: FormData) {
    const { data } = await api.post<ApiResponse<WebsiteContent["about"]>>("/website/about", formData);
    return data;
  },

  async updateAbout(formData: FormData) {
    const { data } = await api.put<ApiResponse<WebsiteContent["about"]>>("/website/about", formData);
    return data;
  },

  async saveAbout(formData: FormData) {
    try {
      return await this.updateAbout(formData);
    } catch (error) {
      if (isNotFoundError(error)) return this.createAbout(formData);
      throw error;
    }
  },

  async createCreative(formData: FormData) {
    const { data } = await api.post<ApiResponse<WebsiteContent["creative"]>>("/website/creative", formData);
    return data;
  },

  async updateCreative(formData: FormData) {
    const { data } = await api.put<ApiResponse<WebsiteContent["creative"]>>("/website/creative", formData);
    return data;
  },

  async saveCreative(formData: FormData) {
    try {
      return await this.updateCreative(formData);
    } catch (error) {
      if (isNotFoundError(error)) return this.createCreative(formData);
      throw error;
    }
  },

  async createClient(formData: FormData) {
    const { data } = await api.post<ApiResponse<WebsiteContent["client"]>>("/website/client", formData);
    return data;
  },

  async updateClient(formData: FormData) {
    const { data } = await api.put<ApiResponse<WebsiteContent["client"]>>("/website/client", formData);
    return data;
  },

  async saveClient(formData: FormData) {
    try {
      return await this.updateClient(formData);
    } catch (error) {
      if (isNotFoundError(error)) return this.createClient(formData);
      throw error;
    }
  },

  async createContact(payload: WebsiteContent["contact"]) {
    const { data } = await api.post<ApiResponse<WebsiteContent["contact"]>>("/website/contact", payload);
    return data;
  },

  async updateContact(payload: WebsiteContent["contact"]) {
    const { data } = await api.put<ApiResponse<WebsiteContent["contact"]>>("/website/contact", payload);
    return data;
  },

  async saveContact(payload: WebsiteContent["contact"]) {
    try {
      return await this.updateContact(payload);
    } catch (error) {
      if (isNotFoundError(error)) return this.createContact(payload);
      throw error;
    }
  },
};

export const userApi = {
  async getMyProfile() {
    const { data } = await api.get<ApiResponse<ProfileUser>>("/users/profile/me");
    return data.data;
  },

  async updateMyProfile(formData: FormData) {
    const { data } = await api.put<ApiResponse<ProfileUser>>("/users/profile", formData);
    return data;
  },
};

export { api };
