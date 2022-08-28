import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ethers } from "ethers";
import {baseUrl} from "../../constanse/appBase";
import axios from 'axios';


const initialState = {
  showModalwallet: "",
  user: {
    isLogedIn: "",
    getNonce:{
      Status:"",
      error:"",
      nonce:""
    },
    login: {
      Status: "",
      error: "",
      token: "",
      email: ""
    },
    getMyFiles:{
      Status: "",
      data:"",
      error: "",
    },
    createFile:{
      Status: "",
      error: "",
    },
    shareFile:{
      Status: "",
      error: "",
    },
    editFile:{
      Status: "",
      error: "",
    },
    getFile:{
      Status: "",
      error: "",
      doc:{}
    },
    wallet:{
      Status:"",
      error:"",
      account:"",
      hasMetamask:"",
      signMetamask:{
        Status:"",
        error:"",
        signature:"",
        message:"",
        address:""
      }
    }
  }
  
}; 

export const signMetamask = createAsyncThunk(
  'sign/Metamask',
  async (message) => {
    await window.ethereum.send("eth_requestAccounts");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signature = await signer.signMessage(message);
    const address = await signer.getAddress();
    const response = {message:message,signature:signature,address:address}
    return response;
  }
);
export const requestAccounts = createAsyncThunk(
  'account/Metamask',
  async () => {
    const response = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return response;
  }
);
export const getNonce = createAsyncThunk(
  'user/getNonce',
  async (body) => {
    const response = await axios.post(baseUrl + "/user/getNonce",
      body
    )
    return response.data;
  }
);
export const loginWithPublicKey = createAsyncThunk(
  'login/byWallet',
  async (body) => {
    const response = await axios.post(baseUrl + "/user/loginWithPublicKey",
      body
    )
    return response.data;
  }
);
export const getMyFiles = createAsyncThunk(
  'user/getMyFiles',
    async (token) => {
      const response = await axios.get(baseUrl + "/user/getMyFiles",
        {
          headers: {
            'authtoken': token
          }
        }
      )
      return response.data;
    }
  );
  export const createFile = createAsyncThunk(
    'user/createFile',
    async (props) => {
      const response = await axios.post(baseUrl + "/user/createFile",
      props.body,
      {
        headers: {
          'authtoken': props.token
        }
      }
      )
      return response.data;
    }
  );
  export const editFile = createAsyncThunk(
    'user/editFile',
    async (props) => {
      const response = await axios.post(baseUrl + "/user/editFile",
      props.body,
      {
        headers: {
          'authtoken': props.token
        }
      }
      )
      return response.data;
    }
  );
  export const shareFile = createAsyncThunk(
    'user/shareFile',
    async (props) => {
      const response = await axios.post(baseUrl + "/user/shareFile",
      props.body,
      {
        headers: {
          'authtoken': props.token
        }
      }
      )
      return response.data;
    }
  );
  export const getFile = createAsyncThunk(
    'user/getFile',
    async (props) => {
      const response = await axios.get(baseUrl + "/user/getFile/"+props.fileId,
      {
        headers: {
          'authtoken': props.token
        }
      }
      )
      return response.data;
    }
  );

export const PrivateSlice = createSlice({
  name: 'Private',
  initialState,
  reducers: {
    modalChekWallet: (state) => {
      state.showModalwallet = !state.showModalwallet
    },
    checkMetamask: (state) => {
      if (window.ethereum) {
        state.user.wallet.hasMetamask = true;
      }
      else { state.user.wallet.hasMetamask = false; }
    },
    isLogedIn: (state,action) => {
      state.user.isLogedIn = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestAccounts.pending, (state) => {
        state.user.wallet.Status = 'loading';
        state.user.wallet.error = "";
        state.user.wallet.conect = null;
      })
      .addCase(requestAccounts.fulfilled, (state, action) => {
        state.user.wallet.Status = 'idle';
        state.user.wallet.account = action.payload;
        localStorage.setItem("address",action.payload);
        state.user.wallet.conect = true;
        state.user.wallet.error = "";
      })
      .addCase(requestAccounts.rejected, (state, action) => {
        state.user.wallet.Status = 'rejected';
        state.user.wallet.conect = false;
        state.user.wallet.error = "conect to wallet has error:" + action.error.message;
      });
      builder
      .addCase(signMetamask.pending, (state) => {
        state.user.wallet.signMetamask.Status = 'loading';
        state.user.wallet.signMetamask.error = '';
        state.user.wallet.signMetamask.message = '';
        state.user.wallet.signMetamask.signature = '';
        state.user.wallet.signMetamask.address = '';
      })
      .addCase(signMetamask.fulfilled, (state, action) => {
          state.user.wallet.signMetamask.Status = 'idle';
          state.user.wallet.signMetamask.message = action.payload.message;
          state.user.wallet.signMetamask.signature = action.payload.signature;
          state.user.wallet.signMetamask.address = action.payload.address;
      })
      .addCase(signMetamask.rejected, (state, action) => {
        state.user.wallet.signMetamask.Status = 'rejected';
        state.user.wallet.signMetamask.error = action.payload;
      });
      builder
      .addCase(getNonce.pending, (state) => {
        state.user.getNonce.Status = 'loading';
        state.user.getNonce.error = '';
        state.user.getNonce.nonce = "";
      })
      .addCase(getNonce.fulfilled, (state, action) => {
        if (action.payload.hasError) {
          state.user.getNonce.Status = 'rejected';
          state.user.getNonce.error = action.payload.error;
        } else {
          state.user.getNonce.Status = 'idle';
          state.user.getNonce.nonce = action.payload.data.nonce;
        }
      })
      .addCase(getNonce.rejected, (state, action) => {
        state.user.getNonce.Status = 'rejected';
        state.user.getNonce.error = action.payload;
      });
      builder
      .addCase(loginWithPublicKey.pending, (state) => {
        state.user.login.Status = 'loading';
        state.user.login.error = '';
        state.user.login.message = '';
      })
      .addCase(loginWithPublicKey.fulfilled, (state, action) => {
        if (action.payload.hasError) {
          state.user.login.Status = 'rejected';
          state.user.login.error = action.payload.error.message;
          localStorage.clear();
        } else {
          state.user.login.Status = 'idle';
          state.user.login.token = action.payload.data.token;
          state.user.login.email = action.payload.data.email;
          localStorage.setItem("token", action.payload.data.token);
          localStorage.setItem("email", action.payload.data.email);
          state.user.isLogedIn = true;
        }
      })
      .addCase(loginWithPublicKey.rejected, (state, action) => {
        state.user.login.Status = 'rejected';
        state.user.login.error = action.payload;
        localStorage.clear();
      });
      builder
      .addCase(getMyFiles.pending, (state) => {
        state.user.getMyFiles.Status = 'loading';
        state.user.getMyFiles.error = '';
      })
      .addCase(getMyFiles.fulfilled, (state, action) => {
        if (action.payload.hasError) {
          state.user.getMyFiles.Status = 'rejected';
          state.user.getMyFiles.error = action.payload.error.message;
          // state.user.isLogedIn = false;
        } else {
          state.user.getMyFiles.Status = 'idle';
          state.user.getMyFiles.data = action.payload.data;
          state.user.isLogedIn = true;
        }
      })
      .addCase(getMyFiles.rejected, (state, action) => {
        state.user.getMyFiles.Status = 'rejected';
        state.user.getMyFiles.error = action.error.code;
        if (action.error.code === "ERR_BAD_REQUEST") {
          state.user.isLogedIn = false;
        }
      });
      builder
      .addCase(createFile.pending, (state) => {
        state.user.createFile.Status = 'loading';
        state.user.createFile.error = '';
      })
      .addCase(createFile.fulfilled, (state, action) => {
        if (action.payload.hasError) {
          state.user.createFile.Status = 'rejected';
          state.user.createFile.error = action.payload.error.message;
        } else {
          state.user.createFile.Status = 'idle';
          // state.user.createFile.data = action.payload.data.data;
        }
      })
      .addCase(createFile.rejected, (state, action) => {
        state.user.createFile.Status = 'rejected';
        state.user.createFile.error = action.error.code;
        if (action.error.code === "ERR_BAD_REQUEST") {
          state.user.isLogedIn = false;
        }
      });
      builder
      .addCase(editFile.pending, (state) => {
        state.user.editFile.Status = 'loading';
        state.user.editFile.error = '';
      })
      .addCase(editFile.fulfilled, (state, action) => {
        if (action.payload.hasError) {
          state.user.editFile.Status = 'rejected';
          state.user.editFile.error = action.payload.error.message;
        } else {
          state.user.editFile.Status = 'idle';
          // state.user.createFile.data = action.payload.data.data;
        }
      })
      .addCase(editFile.rejected, (state, action) => {
        state.user.editFile.Status = 'rejected';
        state.user.editFile.error = action.error.code;
        if (action.error.code === "ERR_BAD_REQUEST") {
          state.user.isLogedIn = false;
        }
      });
      builder
      .addCase(shareFile.pending, (state) => {
        state.user.shareFile.Status = 'loading';
        state.user.shareFile.error = '';
      })
      .addCase(shareFile.fulfilled, (state, action) => {
        if (action.payload.hasError) {
          state.user.shareFile.Status = 'rejected';
          state.user.shareFile.error = action.payload.error.message;
        } else {
          state.user.shareFile.Status = 'idle';
          // state.user.createFile.data = action.payload.data.data;
        }
      })
      .addCase(shareFile.rejected, (state, action) => {
        state.user.shareFile.Status = 'rejected';
        state.user.shareFile.error = action.error.code;
        if (action.error.code === "ERR_BAD_REQUEST") {
          state.user.isLogedIn = false;
        }
      });
      builder
      .addCase(getFile.pending, (state) => {
        state.user.getFile.Status = 'loading';
        state.user.getFile.error = '';
      })
      .addCase(getFile.fulfilled, (state, action) => {
        if (action.payload.hasError) {
          state.user.getFile.Status = 'rejected';
          state.user.getFile.error = action.payload.error;
        } else {
          state.user.getFile.Status = 'idle';
          // var docId = action.payload.data.fileId;
          state.user.getFile.doc=action.payload.data;
        }
      })
      .addCase(getFile.rejected, (state, action) => {
        state.user.getFile.Status = 'rejected';
        state.user.getFile.error = action.error.code;
        if (action.error.code === "ERR_BAD_REQUEST") {
          state.user.isLogedIn = false;
        }
      });
  },
});

export const { isLogedIn, modalChekWallet, checkMetamask } = PrivateSlice.actions;

export const selectCount = (state) => state.Private.value;
export const selectshowModalwallet = (state) => state.Private.showModalwallet;
export const selectWallet = (state) => state.Private.user.wallet;
export const selectUser = (state) => state.Private.user;



export const incrementIfOdd = (amount) => (dispatch, getState) => {
  const currentValue = selectCount(getState());
  if (currentValue % 2 === 1) {
  }
};
export const conectWallet = () => async (dispatch, getState) => {
  await dispatch(modalChekWallet())
  await dispatch(checkMetamask());
  const hasMetamask = selectWallet(getState()).hasMetamask;
  hasMetamask === true && await dispatch(requestAccounts());
  var account = selectWallet(getState()).account[0];
  var body = {
    ethereumAddress:account.toLowerCase(),
  }
  await dispatch(getNonce(body));
  var nonceStatus = selectUser(getState()).getNonce.Status;
  var nonce = selectUser(getState()).getNonce.nonce
  if (nonceStatus === "idle"){
    await dispatch(signMetamask(nonce));
    var signStatus = selectUser(getState()).wallet.signMetamask.Status;
    var address = selectUser(getState()).wallet.signMetamask.address;
    var signature = selectUser(getState()).wallet.signMetamask.signature;
    if (signStatus === "idle"){
      await dispatch(loginWithPublicKey({ethereumAddress:address.toLowerCase(),signature:signature}));
    }
  }
}
export const handelEdit = (props) => async (dispatch, getState) => {
  await dispatch(editFile(props));
  var StatusEdit  = selectUser(getState()).editFile.Status;
  if (StatusEdit === "idle"){
    dispatch(getMyFiles(props.token));
  }
}
export const handelCreate = (props) => async (dispatch, getState) => {
  await dispatch(createFile(props));
  var StatusCreate  = selectUser(getState()).createFile.Status;
  if (StatusCreate === "idle"){
    dispatch(getMyFiles(props.token));
  }
}
export const handelShare = (props) => async (dispatch, getState) => {
  await dispatch(shareFile(props));
  var StatusShare  = selectUser(getState()).shareFile.Status;
  if (StatusShare === "idle"){
    dispatch(getMyFiles(props.token));
  }
}
export default PrivateSlice.reducer;
