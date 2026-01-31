import { getAccountInfo, GetAccountInfoParams, GetAccountInfoResult } from './getAccountInfo';

export const RpcMethods: Record<string, (params: any) => Promise<any>> = {
  getAccountInfo: (params: GetAccountInfoParams) => getAccountInfo(params)
};