import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginRequest, registerRequest, logoutRequest } from "../api/auth.api";

/* ===== REGISTER ===== */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data, thunkAPI) => {
    try {
      const res = await registerRequest(data);

      // if backend returns token, save it
      if (res.token) localStorage.setItem("token", res.token);

      // return user object (support both res.user or res.data.user)
      return res.user || res.data?.user || res.data || res;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Register failed"
      );
    }
  }
);

/* ===== LOGIN ===== */
export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const res = await loginRequest(data);

    if (res.token) localStorage.setItem("token", res.token);

    return res.user || res.data?.user || res.data || res;
  } catch (err) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Login failed"
    );
  }
});

/* ===== LOGOUT ===== */
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await logoutRequest();
  return true;
});

/* ===== OPTIONAL LOAD USER =====
   Haddii aad rabto refresh, 2 doorasho:
   1) ku dar backend GET /users/me
   2) ama decode token (haddii token-ku user data ku wato)
   Hadda waxaan ka dhigay "safe": haddii token jiro, ha dhigin loading true.
*/
export const loadUser = createAsyncThunk("auth/loadUser", async (_, thunkAPI) => {
  try {
    // recommended: add backend GET /users/me then call it here
    return thunkAPI.rejectWithValue(null);
  } catch {
    return thunkAPI.rejectWithValue(null);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // LOAD USER
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { resetAuth, clearAuthError } = authSlice.actions;
export default authSlice.reducer;