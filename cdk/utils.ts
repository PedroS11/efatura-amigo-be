export const isMain = (): boolean => !process.env.DEPLOY_ENV;

export const getBranchName = (): string | undefined => process.env.DEPLOY_ENV;
