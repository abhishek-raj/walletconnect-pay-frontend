import axios, { AxiosInstance } from "axios";
import { IGasPrices, IAssetData } from "./types";
import { payloadId } from "@walletconnect/utils";
import SUPPORTED_ASSETS from "src/constants/supportedAssets";
import ASSET_PRICES from "src/constants/assetPrices";
import {
  convertStringToNumber,
  convertAmountFromRawNumber,
  multiply,
  add
} from "./bignumber";

const api: AxiosInstance = axios.create({
  baseURL: "https://ethereum-api.xyz",
  timeout: 30000, // 30 secs
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

export const apiGetAccountNonce = async (address: string): Promise<number> => {
  const chainId = 1;
  const response = await api.get(
    `/account-nonce?address=${address}&chainId=${chainId}`
  );
  const { result } = response.data;
  return result;
};

export const apiGetGasPrices = async (): Promise<IGasPrices> => {
  const response = await api.get(`/gas-prices`);
  const { result } = response.data;
  return result;
};

export const apiGetGasLimit = async (
  contractAddress: string,
  data: string,
  chainId: number
): Promise<number> => {
  const response = await api.get(
    `/gas-limit?contractAddress=${contractAddress}&data=${data}&chainId=${chainId}`
  );
  const { result } = response.data;
  return result;
};

export const apiGetTransactionByHash = async (
  txHash: string,
  chainId: number
): Promise<any> => {
  const response = await api.post(`/custom-request?chainId=${chainId}`, {
    id: payloadId(),
    jsonrpc: "2.0",
    method: "eth_getTransactionByHash",
    params: [txHash]
  });
  const { result } = response.data;
  return result;
};

export const apiGetTransactionReceipt = async (
  txHash: string,
  chainId: number
): Promise<any> => {
  const response = await api.post(`/custom-request?chainId=${chainId}`, {
    id: payloadId(),
    jsonrpc: "2.0",
    method: "eth_getTransactionReceipt",
    params: [txHash]
  });
  const { result } = response.data;
  return result;
};

export const apiGetAccountBalance = async (
  address: string,
  chainId: number
): Promise<IAssetData> => {
  const response = await api.get(
    `/account-balance?address=${address}&chainId=${chainId}`
  );
  const { result } = response.data;
  return result;
};

export const apiGetTokenBalance = async (
  address: string,
  chainId: number,
  contractAddress: string
): Promise<IAssetData> => {
  const response = await api.get(
    `/token-balance?address=${address}&chainId=${chainId}&contractAddress=${contractAddress}`
  );
  const { result } = response.data;
  return result;
};

export const apiGetAvailableBalance = async (
  address: string,
  nativeCurrency: string
): Promise<number> => {
  const assetPrices = ASSET_PRICES[nativeCurrency];
  const balances = await Promise.all(
    Object.keys(SUPPORTED_ASSETS).map(async (key: string) => {
      const chainId = convertStringToNumber(key);
      const assets = SUPPORTED_ASSETS[chainId];
      const _balances = await Promise.all(
        Object.keys(assets).map(async (assetSymbol: string) => {
          const asset = assets[assetSymbol];
          let result: IAssetData;
          if (asset.contractAddress) {
            result = await apiGetTokenBalance(
              address,
              chainId,
              asset.contractAddress
            );
          } else {
            result = await apiGetAccountBalance(address, chainId);
          }
          let assetBalance = "0";
          if (result.balance) {
            assetBalance = multiply(
              convertAmountFromRawNumber(result.balance, result.decimals),
              assetPrices[assetSymbol]
            );
          }
          return assetBalance;
        })
      );
      return _balances;
    })
  );
  const availabeBalance = convertStringToNumber(
    balances.flat(2).reduce((prev: string, curr: string) => add(prev, curr))
  );
  return availabeBalance;
};

export const apiGetAssetPrice = async (symbol: string) => {
  const response = await axios.get(
    `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`,
    {
      headers: {
        "X-CMC_PRO_API_KEY": "c9e6675f-3d01-4b7e-bf86-809c5eead93c"
      }
    }
  );
  // TODO: Get Live Asset Prices
  console.log("apiGetAssetPrice response.data", response.data); // tslint:disable-line
};

export const apiPinFile = async (
  formData: FormData
): Promise<string | null> => {
  const response = await axios.post(
    `https://api.pinata.cloud/pinning/pinFileToIPFS`,
    formData,
    {
      maxContentLength: Infinity,
      headers: {
        "Content-Type": `multipart/form-data;`,
        pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
        pinata_secret_api_key: process.env.REACT_APP_PINATA_API_SECRET
      }
    }
  );

  let result = null;

  if (response.data.IpfsHash) {
    result = response.data.IpfsHash;
  }

  return result;
};

export const apiFetchFile = async (fileHash: string): Promise<any> => {
  const response = await axios.get(
    `https://gateway.pinata.cloud/ipfs/${fileHash}`,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }
  );

  let data = null;

  if (response && response.data) {
    data = response.data;
  }

  return data;
};
