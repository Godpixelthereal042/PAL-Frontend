import { ActionType } from "../types.ts";
import type { ActionHandler, CreateInvoiceParams, ValidationResult } from "../types.ts";

export const createInvoiceHandler: ActionHandler<CreateInvoiceParams> = {
    type: ActionType.CREATE_INVOICE,

    validate(params: CreateInvoiceParams): ValidationResult {
        const errors: string[] = [];

        if (!params || typeof params !== "object") {
            return { valid: false, errors: ["Missing or invalid payload parameters"] };
        }

        if (!params.client || typeof params.client !== "string" || !params.client.trim()) {
            errors.push("Invoice client name is required");
        }

        if (params.amount === undefined || params.amount === null || isNaN(Number(params.amount)) || Number(params.amount) <= 0) {
            errors.push("Invoice amount must be a positive numeric value");
        }

        if (!params.service || typeof params.service !== "string" || !params.service.trim()) {
            errors.push("Invoice service description is required");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },

    async execute(params: CreateInvoiceParams, userId: string, db: any) {
        const nowMs = Date.now();
        const invoiceId = `inv_${nowMs}_${Math.random().toString(36).slice(2, 6)}`;
        const formattedDate = params.date || new Date(nowMs).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
        const amountStr = String(params.amount);
        const status = params.status || "pending";
        const ownerId = userId === "current_user" ? null : userId;

        await db.run(
            `INSERT INTO invoices (id, user_id, client, amount, service, date, status, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                invoiceId,
                ownerId,
                params.client.trim(),
                amountStr,
                params.service.trim(),
                formattedDate,
                status,
                "Just now",
            ]
        );

        const invoiceRecord = await db.get("SELECT * FROM invoices WHERE id = ?", [invoiceId]);

        return {
            invoice: invoiceRecord,
            receiptToken: `[INVOICE_RECEIPT:{"client":"${params.client.trim()}","amount":"${amountStr}","service":"${params.service.trim()}","id":"${invoiceId}","date":"${formattedDate}"}]`,
            message: `Invoice for ${params.client} ($${amountStr}) created successfully.`,
        };
    },
};
