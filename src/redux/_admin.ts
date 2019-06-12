import Web3 from "web3";
import {
  queryChainId,
  formatItemId,
  getCurrentPathname
} from "../helpers/utilities";
import { IProfile, ISettings, IMenuItem } from "../helpers/types";
import {
  openBusinessBox,
  setData,
  setMenu,
  defaultProfile,
  defaultSettings
} from "../helpers/business";
import { isNaN } from "../helpers/bignumber";
import { modalShow, modalHide } from "./_modal";
import { notificationShow } from "./_notification";
import {
  ADMIN_AUTHENTICATION_MODAL,
  INVENTORY_ITEM
} from "../constants/modals";
import { logRedux } from "../helpers/dev";
import { getAllOrders } from "../helpers/order";

// -- Constants ------------------------------------------------------------- //
const ADMIN_CONNECT_REQUEST = "admin/ADMIN_CONNECT_REQUEST";
const ADMIN_CONNECT_SUCCESS = "admin/ADMIN_CONNECT_SUCCESS";
const ADMIN_CONNECT_FAILURE = "admin/ADMIN_CONNECT_FAILURE";

const ADMIN_GET_ALL_ORDERS_REQUEST = "admin/ADMIN_GET_ALL_ORDERS_REQUEST";
const ADMIN_GET_ALL_ORDERS_SUCCESS = "admin/ADMIN_GET_ALL_ORDERS_SUCCESS";
const ADMIN_GET_ALL_ORDERS_FAILURE = "admin/ADMIN_GET_ALL_ORDERS_FAILURE";

const ADMIN_SUBMIT_SIGNUP_REQUEST = "admin/ADMIN_SUBMIT_SIGNUP_REQUEST";
const ADMIN_SUBMIT_SIGNUP_SUCCESS = "admin/ADMIN_SUBMIT_SIGNUP_SUCCESS";
const ADMIN_SUBMIT_SIGNUP_FAILURE = "admin/ADMIN_SUBMIT_SIGNUP_FAILURE";

const ADMIN_SAVE_DATA_REQUEST = "admin/ADMIN_SAVE_DATA_REQUEST";
const ADMIN_SAVE_DATA_SUCCESS = "admin/ADMIN_SAVE_DATA_SUCCESS";
const ADMIN_SAVE_DATA_FAILURE = "admin/ADMIN_SAVE_DATA_FAILURE";

const ADMIN_UPDATE_PROFILE = "admin/ADMIN_UPDATE_PROFILE";

const ADMIN_UPDATE_SETTINGS = "admin/ADMIN_UPDATE_SETTINGS";

const ADMIN_UPDATE_MENU = "admin/ADMIN_UPDATE_MENU";

const ADMIN_CLEAR_STATE = "admin/ADMIN_CLEAR_STATE";

// -- Actions --------------------------------------------------------------- //

export const adminRequestAuthentication = () => async (dispatch: any) =>
  dispatch(
    modalShow(
      ADMIN_AUTHENTICATION_MODAL,
      {
        onConnect: (provider: any) => {
          if (provider) {
            dispatch(modalHide());
            dispatch(adminConnectWallet(provider));
          }
        }
      },
      true
    )
  );

export const adminConnectWallet = (provider: any) => async (
  dispatch: any,
  getState: any
) => {
  dispatch({ type: ADMIN_CONNECT_REQUEST });
  try {
    const web3 = new Web3(provider);

    const address = (await web3.eth.getAccounts())[0];
    const chainId = await queryChainId(web3);
    const { data, menu } = await openBusinessBox(address, provider);
    const orders = await getAllOrders();

    if (data) {
      const { profile, settings } = data;
      dispatch({
        type: ADMIN_CONNECT_SUCCESS,
        payload: {
          web3,
          address,
          chainId,
          profile,
          settings,
          menu,
          orders
        }
      });
      const current = getCurrentPathname();
      if (["/", "/signup"].includes(current)) {
        window.browserHistory.push("/admin");
      }
    } else {
      const { menu, profile, settings } = getState().admin;
      dispatch({
        type: ADMIN_CONNECT_SUCCESS,
        payload: {
          web3,
          address,
          chainId,
          profile,
          settings,
          menu,
          orders
        }
      });
      window.browserHistory.push("/signup");
    }
  } catch (error) {
    console.error(error); // tslint:disable-line
    dispatch(notificationShow(error.message, true));
    dispatch({ type: ADMIN_CONNECT_FAILURE });
  }
};

export const adminGetAllOrders = () => async (dispatch: any, getState: any) => {
  const { address } = getState().admin;
  if (!address) {
    return;
  }
  dispatch({ type: ADMIN_GET_ALL_ORDERS_REQUEST });
  try {
    const orders = await getAllOrders();

    dispatch({ type: ADMIN_GET_ALL_ORDERS_SUCCESS, payload: orders });
  } catch (error) {
    console.error(error); // tslint:disable-line
    dispatch(notificationShow(error.message, true));
    dispatch({ type: ADMIN_GET_ALL_ORDERS_FAILURE });
  }
};

export const adminSubmitSignUp = () => async (dispatch: any, getState: any) => {
  dispatch({ type: ADMIN_SUBMIT_SIGNUP_REQUEST });
  try {
    const { address, profile } = getState().admin;
    const settings = { ...getState().admin.settings, paymentAddress: address };
    await setData({ profile, settings });

    // await apiSendEmailVerification(profile.email)

    dispatch({
      type: ADMIN_SUBMIT_SIGNUP_SUCCESS,
      payload: { profile, settings }
    });

    window.browserHistory.push("/admin");
  } catch (error) {
    console.error(error); // tslint:disable-line
    dispatch(notificationShow(error.message, true));
    dispatch({ type: ADMIN_SUBMIT_SIGNUP_FAILURE });
  }
};

export const adminSaveData = () => async (dispatch: any, getState: any) => {
  const { address, profile, settings } = getState().admin;
  if (!address) {
    return;
  }
  dispatch({ type: ADMIN_SAVE_DATA_REQUEST });
  try {
    await setData({
      profile,
      settings
    });

    dispatch({
      type: ADMIN_SAVE_DATA_SUCCESS,
      payload: { profile, settings }
    });
  } catch (error) {
    console.error(error); // tslint:disable-line
    dispatch(notificationShow(error.message, true));
    dispatch({ type: ADMIN_SAVE_DATA_FAILURE });
  }
};

export const adminSaveMenu = () => async (dispatch: any, getState: any) => {
  const { address, menu } = getState().admin;
  if (!address) {
    return;
  }
  await setMenu(menu);
};

export const adminUpdateProfile = (updatedProfile: Partial<IProfile>) => async (
  dispatch: any,
  getState: any
) => {
  let { profile } = getState().admin;
  profile = {
    ...profile,
    ...updatedProfile
  };
  profile.id = formatItemId(profile.name);
  dispatch({ type: ADMIN_UPDATE_PROFILE, payload: profile });
};

export const adminUpdateSettings = (
  updatedSettings: Partial<ISettings>
) => async (dispatch: any, getState: any) => {
  if (updatedSettings.taxRate && isNaN(updatedSettings.taxRate)) {
    return;
  }
  let { settings } = getState().admin;
  settings = {
    ...settings,
    ...updatedSettings
  };
  dispatch({ type: ADMIN_UPDATE_SETTINGS, payload: settings });
};

export const adminShowInventoryModal = (menuItem?: IMenuItem) => async (
  dispatch: any
) =>
  dispatch(
    modalShow(INVENTORY_ITEM, {
      menuItem,
      onAddItem: (menuItem: IMenuItem) => {
        if (menuItem) {
          dispatch(modalHide());
          dispatch(adminAddMenuItem(menuItem));
        }
      },
      onRemoveItem: (menuItem: IMenuItem) => {
        if (menuItem) {
          dispatch(modalHide());
          dispatch(adminRemoveMenuItem(menuItem));
        }
      }
    })
  );

export const adminAddMenuItem = (menuItem: IMenuItem) => async (
  dispatch: any,
  getState: any
) => {
  let { menu } = getState().admin;
  const matches = menu.filter((item: IMenuItem) => item.id === menuItem.id);
  if (matches && matches.length) {
    menuItem = {
      ...matches[0],
      ...menuItem
    };
    menu = menu.filter((item: IMenuItem) => item.id !== menuItem.id);
  }
  menu = [...menu, menuItem];
  dispatch({ type: ADMIN_UPDATE_MENU, payload: menu });
  dispatch(adminSaveMenu());
};

export const adminRemoveMenuItem = (menuItem: IMenuItem) => async (
  dispatch: any,
  getState: any
) => {
  let { menu } = getState().admin;
  menu = menu.filter((item: IMenuItem) => item.id !== menuItem.id);
  dispatch({ type: ADMIN_UPDATE_MENU, payload: menu });
  dispatch(adminSaveMenu());
};

export const adminClearState = () => ({ type: ADMIN_CLEAR_STATE });

// -- Reducer --------------------------------------------------------------- //
const INITIAL_STATE = {
  loading: false,
  web3: null,
  address: "",
  chainId: 1,
  menu: [],
  orders: [],
  profile: defaultProfile,
  settings: defaultSettings
};

export default (state = INITIAL_STATE, action: any) => {
  // TODO: DELETE THIS
  logRedux(action);
  switch (action.type) {
    case ADMIN_CONNECT_REQUEST:
      return { ...state, loading: true };
    case ADMIN_CONNECT_SUCCESS:
      return {
        ...state,
        loading: false,
        web3: action.payload.web3,
        address: action.payload.address,
        chainId: action.payload.chainId,
        menu: action.payload.menu || [],
        orders: action.payload.orders || [],
        profile: action.payload.profile || defaultProfile,
        settings: action.payload.settings || defaultSettings
      };
    case ADMIN_CONNECT_FAILURE:
      return { ...state, loading: false };
    case ADMIN_GET_ALL_ORDERS_REQUEST:
      return { ...state, loading: true };
    case ADMIN_GET_ALL_ORDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        orders: action.payload
      };
    case ADMIN_GET_ALL_ORDERS_FAILURE:
      return { ...state, loading: false };
    case ADMIN_SUBMIT_SIGNUP_REQUEST:
      return { ...state, loading: true };
    case ADMIN_SUBMIT_SIGNUP_SUCCESS:
      return {
        ...state,
        loading: false,
        profile: action.payload.profile,
        settings: action.payload.settings
      };
    case ADMIN_SUBMIT_SIGNUP_FAILURE:
      return { ...state, loading: false };
    case ADMIN_SAVE_DATA_SUCCESS:
      return {
        ...state,
        profile: action.payload.profile,
        settings: action.payload.settings
      };

    case ADMIN_UPDATE_PROFILE:
      return { ...state, profile: action.payload };
    case ADMIN_UPDATE_SETTINGS:
      return { ...state, settings: action.payload };
    case ADMIN_UPDATE_MENU:
      return { ...state, menu: action.payload };
    case ADMIN_CLEAR_STATE:
      return { ...state, ...INITIAL_STATE };
    default:
      return state;
  }
};
