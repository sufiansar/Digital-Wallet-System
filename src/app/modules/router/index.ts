import { Router } from "express";
import { UserRoutes } from "../user/user.route";
import { AuthRoutes } from "../auth/auth.route";
import { walletRoutes } from "../wallet/wallet.route";

export const router = Router();
export const modulerRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/wallet",
    route: walletRoutes,
  },
];

modulerRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
