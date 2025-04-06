import axios from "axios";
import { getStorage } from "../store/mainStorage";

export const apiCall = async (method, url, body) => {
  const mainUrl = "";
  const token = await getStorage("token");
  try {
    let response;
    let config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    const fullUrl = mainUrl + url;
    console.log(fullUrl);

    if (method === "get") {
      response = await axios.get(fullUrl, config);
    } else if (method === "post") {
      response = await axios.post(fullUrl, body, config);
    }

    const { data } = response;
    return { success: true, data: data };
  } catch (error) {
    return { success: false, data: error.response.data };
  }
};
