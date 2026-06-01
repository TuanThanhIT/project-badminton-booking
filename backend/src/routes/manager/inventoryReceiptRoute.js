import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";
import inventoryReceiptService from "../../services/manager/inventoryReceipt.js";

const inventoryReceiptRoute = express.Router();

const initInventoryReceiptRoute = (app) => {
  inventoryReceiptRoute.get(
    "/export",
    auth,
    authorize("MANAGER"),
    asyncHandler(async (req, res) => {
      const result = await inventoryReceiptService.exportInventoryReceiptsService(
        req.user.id,
        req.query,
      );

      res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`,
      );

      return res.status(200).send(result.content);
    }),
  );

  inventoryReceiptRoute.get(
    "/",
    auth,
    authorize("MANAGER"),
    asyncHandler(async (req, res) => {
      const result = await inventoryReceiptService.getInventoryReceiptsService(
        req.user.id,
        req.query,
      );

      return res
        .status(200)
        .json(new SuccessResponse("Get inventory receipts successfully", result));
    }),
  );

  app.use("/manager/inventory-receipts", inventoryReceiptRoute);
};

export default initInventoryReceiptRoute;
