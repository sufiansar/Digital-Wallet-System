import { Router } from "express";
import { UserRoutes } from "../user/user.route";
import { AuthRoutes } from "../auth/auth.route";

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
];

modulerRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
