import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ethers } from "ethers";
import { baseUrl } from "../../constanse/appBase";
import axios from 'axios';


const initialState = {
  showModalwallet: "",
  user: {
    isLogedIn: "",
    getNonce: {
      Status: "",
      error: "",
      nonce: ""
    },
    login: {
      Status: "",
      error: "",
      token: "",
      email: ""
    },
    getMyFiles: {
      Status: "",
      data: "",
      error: "",
    },
    createFile: {
      Status: "",
      error: "",
      fileId: "",
    },
    shareFile: {
      Status: "",
      error: "",
      result: []
    },
    editFile: {
      Status: "",
      error: "",
    },
    getFile: {
      Status: "",
      error: "",
      doc: {},
    },
    getSharedList: {
      Status: "",
      error: "",
      listAddress: []
    },
    removeShare: {
      Status: "",
      error: "",
      rows: []
    },
    deleteFile: {
      Status: "",
      error: "",
      deletedId: null
    },
    acceptDeclineChanges: {
      Status: "",
      error: "",
      data: '',
      arg: {}
    },
    wallet: {
      Status: "",
      error: "",
      account: '',
      hasMetamask: "",
      signMetamask: {
        Status: "",
        error: "",
        signature: "",
        message: "",
        address: ""
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
    const response = { message: message, signature: signature, address: address }
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
  async (props) => {
    const response = await axios.get(baseUrl + "/user/" + props.folder,
      {
        headers: {
          'authtoken': props.token
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
    const response = await axios.get(baseUrl + "/user/getFile/" + props.fileId,
      {
        headers: {
          'authtoken': props.token
        }
      }
    )
    return response.data;
  }
);
export const getSharedList = createAsyncThunk(
  'user/getSharedList',
  async (props) => {
    const response = await axios.get(baseUrl + "/user/getSharedList/" + props.fileId,

      {
        headers: {
          'authtoken': props.token
        }
      }
    )
    return response.data;
  }
);
export const removeShare = createAsyncThunk(
  '/user/removeShare',
  async (props) => {
    const response = await axios.post(baseUrl + "/user/removeShare",
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

export const acceptDeclineChanges = createAsyncThunk(
  '/user/acceptDecline',
  async (props) => {
    const response = await axios.post(baseUrl + "/user/review",
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
export const deleteFile = createAsyncThunk(
  '/user/deleteFile',
  async (fileId) => {
    console.log(fileId)
    const response = await axios.post(baseUrl + "/user/deleteFile",
      {fileId:fileId},
      {
        headers: {
          'authtoken': localStorage.getItem("token")
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
    isLogedIn: (state, action) => {
      state.user.isLogedIn = action.payload;
    },
    resetShareFileData: (state) => {
      state.user.shareFile.Status = "";
      state.user.shareFile.error = "";
      state.user.shareFile.result = [];
    },
    resetremoveShare: (state) => {
      state.user.removeShare.Status = "";
      state.user.removeShare.error = "";
      state.user.removeShare.rows = [];
    }
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
        localStorage.setItem("address", action.payload);
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
        state.user.createFile.fileId = '';
      })
      .addCase(createFile.fulfilled, (state, action) => {
        if (action.payload.hasError) {
          state.user.createFile.Status = 'rejected';
          state.user.createFile.error = action.payload.error.message;
        } else {
          state.user.createFile.Status = 'idle';
          state.user.createFile.fileId = action.payload.data.fileId;
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
        state.user.shareFile.result = [];
      })
      .addCase(shareFile.fulfilled, (state, action) => {
        if (action.payload.hasError) {
          state.user.shareFile.Status = 'rejected';
          state.user.shareFile.error = action.payload.error.message;
        } else {
          state.user.shareFile.Status = 'idle';
          state.user.shareFile.result = action.payload.data.result;
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
          var doc =JSON.parse(JSON.stringify(action.payload.data))
          var content = JSON.parse(doc.content);
          var text = ""
          for (let i = 0; i < content.length; i++) {
            var paragraph = content[i].data.find(item => item.status === 1);
            if (paragraph){ 
            text = text + content[i].data.find(item => item.status === 1).newValue + "\n"
            }
          }
          doc.docText = text;
          doc.content = content;
          state.user.getFile.doc = doc;
        }
      })
      .addCase(getFile.rejected, (state, action) => {
        state.user.getFile.Status = 'rejected';
        state.user.getFile.error = action.error.code;
        if (action.error.code === "ERR_BAD_REQUEST") {
          state.user.isLogedIn = false;
        }
      });
    builder
      .addCase(getSharedList.pending, (state) => {
        state.user.getSharedList.Status = 'loading';
        state.user.getSharedList.error = '';
        state.user.getSharedList.listAddress = '';
      })
      .addCase(getSharedList.fulfilled, (state, action) => {
        if (action.payload.hasError) {
          state.user.getSharedList.Status = 'rejected';
          state.user.getSharedList.error = action.payload.error;
        } else {
          state.user.getSharedList.Status = 'idle';
          // var docId = action.payload.data.fileId;
          state.user.getSharedList.listAddress = action.payload.data;
        }
      })
      .addCase(getSharedList.rejected, (state, action) => {
        state.user.getSharedList.Status = 'rejected';
        state.user.getSharedList.error = action.error.code;
        if (action.error.code === "ERR_BAD_REQUEST") {
          state.user.isLogedIn = false;
        }
      });
    builder
      .addCase(removeShare.pending, (state, action) => {
        state.user.removeShare.Status = 'loading';
        state.user.removeShare.error = '';
        var index = action.meta.arg.index;
        var rows = state.user.removeShare.rows;
        var finded = rows.findIndex((item) => item.index === index);
        if (finded < 0) {
          var obj = { index: index, Status: "loading" };
          state.user.removeShare.rows = [obj, ...rows]
        } else {
          rows[finded].Status = "loading"
        }
      })
      .addCase(removeShare.fulfilled, (state, action) => {
        var index = action.meta.arg.index;
        var rows = state.user.removeShare.rows;
        var finded = rows.findIndex((item) => item.index === index);
        if (action.payload.hasError) {
          state.user.removeShare.Status = 'rejected';
          state.user.removeShare.error = action.payload.error;
          if (finded < 0) {
            var obj1 = { index: index, Status: "rejected" };
            state.user.removeShare.rows = [obj1, ...rows]
          } else {
            rows[finded].Status = "rejected"
          }
        } else {
          state.user.removeShare.Status = 'idle';
          if (finded < 0) {
            var obj2 = { index: index, Status: "idle" };
            state.user.removeShare.rows = [obj2, ...rows]
          } else {
            rows[finded].Status = "idle"
          }
        }
      })
      .addCase(removeShare.rejected, (state, action) => {
        state.user.removeShare.Status = 'rejected';
        var index = action.meta.arg.index;
        var rows = state.user.removeShare.rows;
        var finded = rows.findIndex((item) => item.index === index);
        if (finded < 0) {
          var obj = { index: index, Status: "rejected" };
          state.user.removeShare.rows = [obj, ...rows]
        } else {
          rows[finded].Status = "rejected"
        }
        state.user.removeShare.error = action.error.code;
        if (action.error.code === "ERR_BAD_REQUEST") {
          state.user.isLogedIn = false;
        }
      });
    builder
      .addCase(acceptDeclineChanges.pending, (state, action) => {
        state.user.acceptDeclineChanges.Status = 'loading';
        state.user.acceptDeclineChanges.error = '';
        state.user.acceptDeclineChanges.data = '';
        state.user.acceptDeclineChanges.arg = {};
      })
      .addCase(acceptDeclineChanges.fulfilled, (state, action) => {
        if (action.payload.hasError) {
          state.user.acceptDeclineChanges.Status = 'rejected';
          state.user.acceptDeclineChanges.error = action.payload.error;
        } else {
          state.user.acceptDeclineChanges.Status = 'idle';
          state.user.acceptDeclineChanges.data = action.payload.data;
          state.user.acceptDeclineChanges.arg = action.meta.arg.arg;
        }
      })
      .addCase(acceptDeclineChanges.rejected, (state, action) => {
        state.user.acceptDeclineChanges.Status = 'rejected';
        state.user.removeShare.error = action.error.code;
        if (action.error.code === "ERR_BAD_REQUEST") {
          state.user.isLogedIn = false;
        }
      });
    builder
      .addCase(deleteFile.pending, (state, action) => {
        state.user.deleteFile.Status = 'loading';
        state.user.deleteFile.error = '';
        state.user.deleteFile.deletedId = action.meta.arg;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        if (action.payload.hasError) {
          state.user.deleteFile.Status = 'rejected';
          state.user.deleteFile.error = action.payload.error;
        } else {
          state.user.deleteFile.Status = 'idle';
        }
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.user.deleteFile.Status = 'rejected';
        state.user.removeShare.error = action.error.code;
        if (action.error.code === "ERR_BAD_REQUEST") {
          state.user.isLogedIn = false;
        }
      });
  },
});

export const { isLogedIn, modalChekWallet, checkMetamask, resetShareFileData, resetremoveShare } = PrivateSlice.actions;

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
    ethereumAddress: account.toLowerCase(),
  }
  await dispatch(getNonce(body));
  var nonceStatus = selectUser(getState()).getNonce.Status;
  var nonce = selectUser(getState()).getNonce.nonce
  if (nonceStatus === "idle") {
    await dispatch(signMetamask(nonce));
    var signStatus = selectUser(getState()).wallet.signMetamask.Status;
    var address = selectUser(getState()).wallet.signMetamask.address;
    var signature = selectUser(getState()).wallet.signMetamask.signature;
    if (signStatus === "idle") {
      await dispatch(loginWithPublicKey({ ethereumAddress: address.toLowerCase(), signature: signature }));
    }
  }
}
export const handelEdit = (props) => async (dispatch, getState) => {
  await dispatch(editFile(props));
  // var StatusEdit = selectUser(getState()).editFile.Status;
  // if (StatusEdit === "idle") {
  //   dispatch(getMyFiles({ folder: "getMyFiles", token: props.token }));
  // }
}
export const handelCreate = (props) => async (dispatch, getState) => {
  await dispatch(createFile(props));
  var StatusCreate = selectUser(getState()).createFile.Status;
  if (StatusCreate === "idle") {
    dispatch(getMyFiles({ folder: "getMyFiles", token: props.token }));
  }
}
export const handelShare = (props) => async (dispatch, getState) => {
  await dispatch(shareFile(props));
  var StatusShare = selectUser(getState()).shareFile.Status;
  if (StatusShare === "idle") {
    dispatch(getMyFiles({ folder: "getMyFiles", token: props.token }));
  }
}
export default PrivateSlice.reducer;
