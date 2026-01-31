import { relations } from "drizzle-orm/relations";
import { profiles, savingsTransactions, savingsAccounts, months, income, expenses, expenseCategories, userSettings, additionalIncome, aiInsights, debts, subscriptions, goals, goalAccounts } from "./schema";

export const savingsTransactionsRelations = relations(savingsTransactions, ({one}) => ({
	profile: one(profiles, {
		fields: [savingsTransactions.userId],
		references: [profiles.id]
	}),
	savingsAccount: one(savingsAccounts, {
		fields: [savingsTransactions.accountId],
		references: [savingsAccounts.id]
	}),
	month: one(months, {
		fields: [savingsTransactions.monthId],
		references: [months.id]
	}),
}));

export const profilesRelations = relations(profiles, ({many}) => ({
	savingsTransactions: many(savingsTransactions),
	incomes: many(income),
	expenses: many(expenses),
	expenseCategories: many(expenseCategories),
	savingsAccounts: many(savingsAccounts),
	userSettings: many(userSettings),
	months: many(months),
	additionalIncomes: many(additionalIncome),
	aiInsights: many(aiInsights),
	debts: many(debts),
	subscriptions: many(subscriptions),
	goals: many(goals),
}));

export const savingsAccountsRelations = relations(savingsAccounts, ({one, many}) => ({
	savingsTransactions: many(savingsTransactions),
	profile: one(profiles, {
		fields: [savingsAccounts.userId],
		references: [profiles.id]
	}),
	goalAccounts: many(goalAccounts),
}));

export const monthsRelations = relations(months, ({one, many}) => ({
	savingsTransactions: many(savingsTransactions),
	incomes: many(income),
	expenses: many(expenses),
	profile: one(profiles, {
		fields: [months.userId],
		references: [profiles.id]
	}),
	additionalIncomes: many(additionalIncome),
	aiInsights: many(aiInsights),
}));

export const incomeRelations = relations(income, ({one}) => ({
	profile: one(profiles, {
		fields: [income.userId],
		references: [profiles.id]
	}),
	month: one(months, {
		fields: [income.monthId],
		references: [months.id]
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	profile: one(profiles, {
		fields: [expenses.userId],
		references: [profiles.id]
	}),
	month: one(months, {
		fields: [expenses.monthId],
		references: [months.id]
	}),
	expenseCategory: one(expenseCategories, {
		fields: [expenses.categoryId],
		references: [expenseCategories.id]
	}),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({one, many}) => ({
	expenses: many(expenses),
	profile: one(profiles, {
		fields: [expenseCategories.userId],
		references: [profiles.id]
	}),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	profile: one(profiles, {
		fields: [userSettings.userId],
		references: [profiles.id]
	}),
}));

export const additionalIncomeRelations = relations(additionalIncome, ({one}) => ({
	profile: one(profiles, {
		fields: [additionalIncome.userId],
		references: [profiles.id]
	}),
	month: one(months, {
		fields: [additionalIncome.monthId],
		references: [months.id]
	}),
}));

export const aiInsightsRelations = relations(aiInsights, ({one}) => ({
	profile: one(profiles, {
		fields: [aiInsights.userId],
		references: [profiles.id]
	}),
	month: one(months, {
		fields: [aiInsights.monthId],
		references: [months.id]
	}),
}));

export const debtsRelations = relations(debts, ({one}) => ({
	profile: one(profiles, {
		fields: [debts.userId],
		references: [profiles.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	profile: one(profiles, {
		fields: [subscriptions.userId],
		references: [profiles.id]
	}),
}));

export const goalsRelations = relations(goals, ({one, many}) => ({
	profile: one(profiles, {
		fields: [goals.userId],
		references: [profiles.id]
	}),
	goalAccounts: many(goalAccounts),
}));

export const goalAccountsRelations = relations(goalAccounts, ({one}) => ({
	goal: one(goals, {
		fields: [goalAccounts.goalId],
		references: [goals.id]
	}),
	savingsAccount: one(savingsAccounts, {
		fields: [goalAccounts.accountId],
		references: [savingsAccounts.id]
	}),
}));