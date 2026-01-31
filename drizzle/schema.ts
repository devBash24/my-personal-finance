import { pgTable, index, foreignKey, uuid, numeric, timestamp, unique, text, boolean, check, integer, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const savingsTransactions = pgTable("savings_transactions", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	accountId: uuid("account_id").notNull(),
	monthId: uuid("month_id").notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_savings_tx_account_month").using("btree", table.accountId.asc().nullsLast().op("uuid_ops"), table.monthId.asc().nullsLast().op("uuid_ops")),
	index("idx_savings_tx_user_month").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.monthId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "savings_transactions_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [savingsAccounts.id],
			name: "savings_transactions_account_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.monthId],
			foreignColumns: [months.id],
			name: "savings_transactions_month_id_fkey"
		}).onDelete("cascade"),
]);

export const income = pgTable("income", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	monthId: uuid("month_id").notNull(),
	grossIncome: numeric("gross_income", { precision: 12, scale:  2 }).notNull(),
	taxDeduction: numeric("tax_deduction", { precision: 12, scale:  2 }).default('0'),
	nisDeduction: numeric("nis_deduction", { precision: 12, scale:  2 }).default('0'),
	otherDeductions: numeric("other_deductions", { precision: 12, scale:  2 }).default('0'),
	netIncome: numeric("net_income", { precision: 12, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "income_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.monthId],
			foreignColumns: [months.id],
			name: "income_month_id_fkey"
		}).onDelete("cascade"),
	unique("uq_income_user_month").on(table.userId, table.monthId),
]);

export const expenses = pgTable("expenses", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	monthId: uuid("month_id").notNull(),
	categoryId: uuid("category_id").notNull(),
	name: text().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_expenses_category").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("idx_expenses_user_month").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.monthId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "expenses_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.monthId],
			foreignColumns: [months.id],
			name: "expenses_month_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [expenseCategories.id],
			name: "expenses_category_id_fkey"
		}).onDelete("cascade"),
]);

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
});

export const expenseCategories = pgTable("expense_categories", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	type: text().notNull(),
}, (table) => [
	index("idx_expense_categories_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "expense_categories_user_id_fkey"
		}).onDelete("cascade"),
]);

export const savingsAccounts = pgTable("savings_accounts", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	type: text().default('general').notNull(),
	currency: text().default('USD').notNull(),
	initialBalance: numeric("initial_balance", { precision: 12, scale:  2 }).default('0'),
	targetAmount: numeric("target_amount", { precision: 12, scale:  2 }),
	isArchived: boolean("is_archived").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_savings_accounts_active").using("btree", table.userId.asc().nullsLast().op("uuid_ops")).where(sql`(is_archived = false)`),
	index("idx_savings_accounts_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "savings_accounts_user_id_fkey"
		}).onDelete("cascade"),
]);

export const userSettings = pgTable("user_settings", {
	userId: uuid("user_id").primaryKey().notNull(),
	theme: text().default('default').notNull(),
	mode: text().default('system').notNull(),
	radius: numeric({ precision: 3, scale:  2 }).default('0.5'),
	accent: text().default('green'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "user_settings_user_id_fkey"
		}).onDelete("cascade"),
]);

export const months = pgTable("months", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	month: integer().notNull(),
	year: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_months_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "months_user_id_fkey"
		}).onDelete("cascade"),
	unique("uq_user_month_year").on(table.userId, table.month, table.year),
	check("months_month_check", sql`(month >= 1) AND (month <= 12)`),
]);

export const additionalIncome = pgTable("additional_income", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	monthId: uuid("month_id").notNull(),
	label: text().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_additional_income_user_month").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.monthId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "additional_income_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.monthId],
			foreignColumns: [months.id],
			name: "additional_income_month_id_fkey"
		}).onDelete("cascade"),
]);

export const aiInsights = pgTable("ai_insights", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	monthId: uuid("month_id"),
	prompt: text().notNull(),
	response: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_ai_insights_user_created").using("btree", table.userId.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "ai_insights_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.monthId],
			foreignColumns: [months.id],
			name: "ai_insights_month_id_fkey"
		}).onDelete("set null"),
]);

export const debts = pgTable("debts", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	principal: numeric({ precision: 12, scale:  2 }).notNull(),
	interestRate: numeric("interest_rate", { precision: 5, scale:  2 }),
	monthlyPayment: numeric("monthly_payment", { precision: 12, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_debts_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "debts_user_id_fkey"
		}).onDelete("cascade"),
]);

export const subscriptions = pgTable("subscriptions", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	billingDay: integer("billing_day"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_subscriptions_user_active").using("btree", table.userId.asc().nullsLast().op("uuid_ops")).where(sql`(is_active = true)`),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "subscriptions_user_id_fkey"
		}).onDelete("cascade"),
	check("subscriptions_billing_day_check", sql`(billing_day >= 1) AND (billing_day <= 31)`),
]);

export const goals = pgTable("goals", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	targetAmount: numeric("target_amount", { precision: 12, scale:  2 }).notNull(),
	targetDate: timestamp("target_date", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_goals_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "goals_user_id_fkey"
		}).onDelete("cascade"),
]);

export const goalAccounts = pgTable("goal_accounts", {
	goalId: uuid("goal_id").notNull(),
	accountId: uuid("account_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.goalId],
			foreignColumns: [goals.id],
			name: "goal_accounts_goal_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [savingsAccounts.id],
			name: "goal_accounts_account_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.goalId, table.accountId], name: "goal_accounts_pkey"}),
]);
