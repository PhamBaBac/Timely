import axiosClient from "./axiosClients";

class AuthAPI {
  HandleAuthentication = async (
    url: string,
    data?: any,
    method?: 'get' | 'post' | 'put' | 'delete' | 'patch',
  ) => {
    return await axiosClient(`/auth${url}`, {
      method: method ?? 'get',
      data,
    });
  };
}

const authenticationAPI = new AuthAPI();
export default authenticationAPI;
