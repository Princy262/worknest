import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import wakeServer from '../../utils/wakeServer';

// A sleeping free server shows up as "no answer" or a 502 / 503 / 504 gateway error.
const isServerAsleep = (error) => {
  const status = error.response?.status;
  return !error.response || (status >= 502 && status <= 504);
};

// Pulls a readable message out of a failed request.
const getMessage = (error, fallback) =>
  isServerAsleep(error)
    ? 'The server is waking up. Please wait a few seconds and try again.'
    : error.response.data?.message || fallback;

// "Who am I?" Runs when the app opens. Uses the login cookie.
// It first waits until the backend is awake, so a sleeping server does not look like "logged out".
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    await wakeServer();
    try {
      const { data } = await api.get('/auth/me');
      return data.user;
    } catch (error) {
      return rejectWithValue(getMessage(error, 'Not logged in'));
    }
  }
);

// Log in, then fetch the full profile so company, department and team have names.
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ identifier, password }, { rejectWithValue }) => {
    const awake = await wakeServer();
    if (!awake) {
      return rejectWithValue('The server is still starting. Please try again in a minute.');
    }

    try {
      await api.post('/auth/login', { identifier, password });
      const { data } = await api.get('/auth/me');
      return data.user;
    } catch (error) {
      return rejectWithValue(getMessage(error, 'Login failed. Please try again.'));
    }
  }
);

// Change password, then reload the user so mustChangePassword becomes false.
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      const { data } = await api.get('/auth/me');
      return data.user;
    } catch (error) {
      return rejectWithValue(getMessage(error, 'Could not change the password.'));
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Even if the request fails, we still clear the user on screen.
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null, // the logged-in person, or null
    initialized: false, // true once the first "who am I?" check has finished
    loading: false, // true while a login or password change is in progress
    error: null, // message to show on the form
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.initialized = true;
    });
    builder.addCase(fetchCurrentUser.rejected, (state) => {
      state.user = null;
      state.initialized = true;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.error = null;
    });

    // Login and change-password behave the same way, so they share one set of rules.
    for (const thunk of [loginUser, changePassword]) {
      builder.addCase(thunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      });
      builder.addCase(thunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
    }
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;