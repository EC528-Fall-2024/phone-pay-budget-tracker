/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/confirm` | `/(auth)/login` | `/(auth)/signup` | `/(context)/UserContext` | `/(tabs)` | `/(tabs)/analyze` | `/(tabs)/home` | `/(tabs)/profile` | `/(tabs)/search` | `/UserContext` | `/_sitemap` | `/accounts` | `/analyze` | `/apiService` | `/bothScreen` | `/confirm` | `/contactUs` | `/expenseScreen` | `/faqs` | `/home` | `/huggingFaceService` | `/incomeScreen` | `/login` | `/privacyPolicy` | `/profile` | `/search` | `/secrets` | `/signup` | `/upgradePlan`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
