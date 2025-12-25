import { Router } from "express";
import { UserRoutes } from "../user/user.route";
import { AuthRoutes } from "../auth/auth.route";
import { walletRoutes } from "../wallet/wallet.route";
import { transactionRoutes } from "../ transaction/transaction.route";
import { OtpRouter } from "../otp/otp.route";
import { StatsRoutes } from "../stats/stats.route";
import { BlogRoutes } from "../blog/blog.route";

export const router = Router();
export const modulerRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/blog",
    route: BlogRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/wallet",
    route: walletRoutes,
  },
  {
    path: "/transaction",
    route: transactionRoutes,
  },
  {
    path: "/otp",
    route: OtpRouter,
  },
  {
    path: "/stats",
    route: StatsRoutes,
  },
];

modulerRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
