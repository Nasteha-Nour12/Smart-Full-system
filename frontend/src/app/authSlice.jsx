import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginRequest, registerRequest, logoutRequest, meRequest } from "../api/auth.api";

const persistUser = (user) => {
  if (user) {
    localStorage.setItem("smart-ses-user", JSON.stringify(user));
  } else {
    localStorage.removeItem("smart-ses-user");
  }
};

/* ===== REGISTER ===== */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data, thunkAPI) => {
    try {
      const res = await registerRequest(data);

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

export const loadUser = createAsyncThunk("auth/loadUser", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("smart-ses-token") || localStorage.getItem("token");
    if (!token) {
      return thunkAPI.rejectWithValue(null);
    }
    const res = await meRequest();
    const user = res?.data || null;
    if (!user) return thunkAPI.rejectWithValue(null);
    return user;
  } catch {
    localStorage.removeItem("smart-ses-token");
    localStorage.removeItem("token");
    localStorage.removeItem("smart-ses-user");
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
      persistUser(null);
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
        state.user = action.payload || null;
        state.isAuthenticated = !!state.user;
        state.loading = false;
        persistUser(state.user);
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
        state.user = action.payload || null;
        state.isAuthenticated = !!state.user;
        state.loading = false;
        persistUser(state.user);
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
        state.user = action.payload || null;
        state.isAuthenticated = !!state.user;
        state.loading = false;
        persistUser(state.user);
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        persistUser(null);
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        persistUser(null);
      });
  },
});

export const { resetAuth, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
