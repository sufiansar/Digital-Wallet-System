import { Router } from "express";
import { BlogController } from "./blog.controller";

import { checkAuth } from "../../middleware/checkAuths";
import { Role } from "../user/user.interface";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.get("/", BlogController.getAllBlogs);
router.get("/:id", BlogController.getBlogById);
router.post(
  "/",
  checkAuth(...Object.values(Role)),
  multerUpload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  BlogController.createBlog
);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.USER, Role.AGENT),
  multerUpload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  BlogController.updateBlog
);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.USER, Role.AGENT),
  BlogController.deleteBlog
);
export const BlogRoutes = router;
