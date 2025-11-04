import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

function getExtra(): any {
  const fromExpoConfig = (Constants as any)?.expoConfig?.extra;
  const fromManifest = (Constants as any)?.manifest?.extra;
  const fromEnv = {
    API_URL: process.env.EXPO_PUBLIC_API_URL,
    API_KEY: process.env.EXPO_PUBLIC_API_KEY,
    API_VERSION: process.env.EXPO_PUBLIC_API_VERSION,
  };
  return { ...(fromEnv || {}), ...(fromManifest || {}), ...(fromExpoConfig || {}) };
}

const extra = getExtra();
const BASE_URL: string = extra.API_URL || "http://74.249.100.243/api";
const STATIC_API_KEY: string = extra.API_KEY || "super-secret-key";
const API_VERSION: string = extra.API_VERSION || "2.0";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

let bearer: string | null = null;

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = (config.headers ?? {}) as AxiosHeaders | Record<string, string>;
  const set = (k: string, v: string) => {
    if (typeof (headers as AxiosHeaders).set === "function") {
      (headers as AxiosHeaders).set(k, v);
    } else {
      (headers as Record<string, string>)[k] = v;
    }
  };
  if (STATIC_API_KEY) {
    set("X-API-KEY", STATIC_API_KEY);
    set("x-api-key", STATIC_API_KEY);
  }
  if (API_VERSION) {
    set("X-API-Version", API_VERSION);
    set("x-api-version", API_VERSION);
  }
  if (bearer) set("Authorization", `Bearer ${bearer}`);
  config.headers = headers as any;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    console.log("API ERROR:", {
      method: error?.config?.method,
      url: error?.config?.url,
      baseURL: error?.config?.baseURL,
      sentHeaders: error?.config?.headers,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
      code: error?.code,
    });
    return Promise.reject(error);
  }
);

export async function bootAuth() {
  bearer = (await AsyncStorage.getItem("@token")) || null;
}

export async function setBearer(token: string | null) {
  bearer = token;
  if (token) await AsyncStorage.setItem("@token", token);
  else await AsyncStorage.removeItem("@token");
}

export default api;
