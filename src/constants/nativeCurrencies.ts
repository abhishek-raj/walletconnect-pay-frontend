import { INativeCurrency } from "../helpers/types";

interface INativeCurrencies {
  [symbol: string]: INativeCurrency;
}

const NATIVE_CURRENCIES: INativeCurrencies = {
  USD: {
    symbol: "$",
    currency: "USD",
    decimals: 2,
    alignment: "left",
    assetLimit: 1
  },
  GBP: {
    symbol: "£",
    currency: "GBP",
    decimals: 2,
    alignment: "left",
    assetLimit: 1
  },
  EUR: {
    symbol: "€",
    currency: "EUR",
    decimals: 2,
    alignment: "left",
    assetLimit: 1
  },
  BTC: {
    symbol: "₿",
    currency: "BTC",
    decimals: 8,
    alignment: "right",
    assetLimit: 0.0001
  },
  ETH: {
    symbol: "Ξ",
    currency: "ETH",
    decimals: 8,
    alignment: "right",
    assetLimit: 0.001
  }
};

export default NATIVE_CURRENCIES;
